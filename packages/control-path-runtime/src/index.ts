import {buildPaymentSendAction} from "@soulverse/action-contract-builder";
import {createReviewRecord,createApprovalRecord,applyApprovalToAction,type AuthenticationEvidence} from "@soulverse/approval-runtime";
import {evaluateAuthority,evaluateRisk,evaluatePolicy} from "@soulverse/control-decisions";
import {evaluateSessionEligibility,applyEligibilityToAction,type DeviceRecord,type RuntimeRecord} from "@soulverse/runtime-assurance";
import {buildTrustProtocolRequest,evaluateTrustProtocol,applyVerifiedTrustToAction,type TrustProtocolTransport} from "@soulverse/trust-adapter";
import {buildRevRequest,evaluateRev,applyVerifiedRevToAction,type RevTransport} from "@soulverse/rev-adapter";
import {buildSigningRequest,dryRunVerifySigning,InMemoryReplayStore} from "@soulverse/signing-gateway";
import {buildExecutionRequest,simulateEvmExecution} from "@soulverse/execution-router";
import {InMemorySaelStore} from "@soulverse/sael-runtime";

export interface A2DryRunIds{
 actionId:string;saelCorrelationId:string;reviewId:string;approvalId:string;authorityDecisionId:string;riskDecisionId:string;policyDecisionId:string;
 eligibilityDecisionId:string;trustRequestId:string;revRequestId:string;signingRequestId:string;executionRequestId:string;saelEventId:string;
}
export async function runA2PaymentDryRun(input:{
 resolvedIntent:unknown;authentication:AuthenticationEvidence;device:DeviceRecord;runtime:RuntimeRecord;trustTransport:TrustProtocolTransport;revTransport:RevTransport;
 ids:A2DryRunIds;now:string;policyVersion:string;expectedTrustServiceIdentity:string;expectedRevServiceIdentity:string;payloadBody:Record<string,unknown>;
}){
 const built=buildPaymentSendAction(input.resolvedIntent,{actionId:input.ids.actionId,saelCorrelationId:input.ids.saelCorrelationId,idempotencyKey:"control-path-idem",replayToken:"control-path-replay",createdAt:input.now,expiresAt:new Date(Date.parse(input.now)+15*60_000).toISOString()});
 if(built.status!=="BUILT")throw new Error("CONTROL_PATH_AMBIGUITY_BLOCK");
 let action=built.actionContract;
 const review=createReviewRecord({action,materialTermsHash:built.materialTermsHash,reviewId:input.ids.reviewId,presentationRef:"presentation:control-path",reviewedAt:input.now});
 const approval=createApprovalRecord({action,materialTermsHash:built.materialTermsHash,review,authentication:input.authentication,approvalId:input.ids.approvalId,approvedAt:input.now,expiresAt:new Date(Date.parse(input.now)+10*60_000).toISOString(),approvalHash:"sha256:"+"a".repeat(64),approvalSignatureRef:"sig:approval:control-path"});
 action=applyApprovalToAction(action,approval,review);
 const authority=evaluateAuthority({action,materialTermsHash:built.materialTermsHash,decisionId:input.ids.authorityDecisionId,evaluatedAt:input.now});
 if(authority.status!=="PASS")throw new Error("CONTROL_PATH_AUTHORITY_BLOCK");
 const risk=evaluateRisk({action,materialTermsHash:built.materialTermsHash,decisionId:input.ids.riskDecisionId,evaluatedAt:input.now});
 const eligibility=evaluateSessionEligibility({action,device:input.device,runtime:input.runtime,decisionId:input.ids.eligibilityDecisionId,evaluatedAt:input.now});
 if(eligibility.status!=="ELIGIBLE")throw new Error("CONTROL_PATH_RUNTIME_BLOCK");
 action=applyEligibilityToAction(action,eligibility);
 const policy=evaluatePolicy({action,materialTermsHash:built.materialTermsHash,authorityDecision:authority,riskDecision:risk,decisionId:input.ids.policyDecisionId,evaluatedAt:input.now});
 if(!["REQUIRE_TRUST_REV","ALLOW_CONTINUE"].includes(policy.status))throw new Error("CONTROL_PATH_POLICY_BLOCK");
 const trustRequest=buildTrustProtocolRequest({action,materialTermsHash:built.materialTermsHash,requestId:input.ids.trustRequestId,eligibilityDecisionRef:eligibility.decision_id,authorityDecision:authority,riskDecision:risk,policyDecision:policy,policyVersion:input.policyVersion,issuedAt:input.now,expiresAt:new Date(Date.parse(input.now)+5*60_000).toISOString()});
 const trust=await evaluateTrustProtocol({transport:input.trustTransport,request:trustRequest,now:input.now,expectedServiceIdentity:input.expectedTrustServiceIdentity});
 if(trust.status!=="VERIFIED_PASS")throw new Error("CONTROL_PATH_TRUST_BLOCK");
 action=applyVerifiedTrustToAction(action,trust);
 const revRequest=buildRevRequest({action,materialTermsHash:built.materialTermsHash,requestId:input.ids.revRequestId,trustVerification:trust,deviceEligibilityRef:eligibility.decision_id,riskDecision:risk,policyDecision:policy,policyVersion:input.policyVersion,issuedAt:input.now,expiresAt:new Date(Date.parse(input.now)+3*60_000).toISOString()});
 const rev=await evaluateRev({transport:input.revTransport,request:revRequest,now:input.now,expectedServiceIdentity:input.expectedRevServiceIdentity});
 if(rev.status!=="VERIFIED_PASS")throw new Error("CONTROL_PATH_REV_BLOCK");
 action=applyVerifiedRevToAction(action,rev);
 const signingRequest=buildSigningRequest({action,materialTermsHash:built.materialTermsHash,signingRequestId:input.ids.signingRequestId,deviceTrustRef:eligibility.decision_id,policyRef:policy.policy_id,payloadRef:"payload:control-path",payloadBody:input.payloadBody,requestedKeyClass:"HOLDER_EVM_ACCOUNT",issuedAt:input.now,expiresAt:new Date(Date.parse(input.now)+2*60_000).toISOString()});
 const signing=dryRunVerifySigning({request:signingRequest,action,materialTermsHash:built.materialTermsHash,callerIdentity:"service:orchestrator",allowedCallerIdentities:["service:orchestrator"],approval,trustDecision:trust.decision,revDecision:rev.decision,policyVersion:input.policyVersion,riskClass:risk.final_class,expectedTrustServiceIdentity:input.expectedTrustServiceIdentity,expectedRevServiceIdentity:input.expectedRevServiceIdentity,now:input.now,replayStore:new InMemoryReplayStore()});
 if(signing.status!=="DRY_RUN_ACCEPTED")throw new Error("CONTROL_PATH_SIGNING_BLOCK");
 const executionRequest=buildExecutionRequest({action,executionRequestId:input.ids.executionRequestId,payloadHash:signing.payload_hash,signedPayloadRef:null,signedPayloadHash:null,chainId:String((input.payloadBody as any).chain_id),issuedAt:input.now,expiresAt:new Date(Date.parse(input.now)+2*60_000).toISOString()});
 const execution=simulateEvmExecution({request:executionRequest,action,payloadBody:input.payloadBody,observedAt:input.now});
 if(execution.status!=="SIMULATED")throw new Error("CONTROL_PATH_EXECUTION_SIMULATION_BLOCK");
 const sael=new InMemorySaelStore({"orchestrator":["ACTION."]});
 const evidence=sael.ingest({producerId:"orchestrator",idempotencyKey:"control-path-evidence",recordedAt:input.now,event:{schema:"ssw.sael-event.v1",event_id:input.ids.saelEventId,stream_id:action.principal.holder_did,event_type:"ACTION.CONTROL_PATH_DRY_RUN_COMPLETED",event_version:1,occurred_at:input.now,correlation:{action_id:action.action_id,sael_correlation_id:action.evidence.sael_correlation_id},principal:{holder_did:action.principal.holder_did,sera_agent_did:action.principal.sera_agent_did},origin:{service:"orchestrator"},classification:{risk:risk.final_class,authority:action.authority.class},payload:{signing_status:signing.status,execution_status:execution.status},privacy:{level:"L1"},previous_event_hash:null}});
 return{status:"DRY_RUN_COMPLETE" as const,action,materialTermsHash:built.materialTermsHash,authority,risk,eligibility,policy,trust:trust.status,rev:rev.status,signing,execution,evidence};
}
