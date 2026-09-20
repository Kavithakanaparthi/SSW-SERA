import {randomUUID} from "node:crypto";
import {buildPaymentSendAction} from "@soulverse/action-contract-builder";
import {createApprovalRecord,createReviewRecord,applyApprovalToAction,type AuthenticationEvidence} from "@soulverse/approval-runtime";
import {evaluateAuthority,evaluateRisk,evaluatePolicy} from "@soulverse/control-decisions";
import {evaluateSessionEligibility,applyEligibilityToAction,type DeviceRecord,type RuntimeRecord} from "@soulverse/runtime-assurance";
import {buildTrustProtocolRequest,evaluateTrustProtocol,applyVerifiedTrustToAction,type TrustProtocolTransport} from "@soulverse/trust-adapter";
import {buildRevRequest,evaluateRev,applyVerifiedRevToAction,type RevTransport} from "@soulverse/rev-adapter";
import {buildSigningRequest} from "@soulverse/signing-gateway";
import {PostgresPersistence} from "@soulverse/persistence-postgres";
import {sha256DomainSeparated,type CanonicalJson} from "@soulverse/canonicalization";
import {assertContract} from "@soulverse/schema-validation";

export type OrchestrationState="AWAITING_APPROVAL"|"CONTROL_EVALUATION"|"TRUST_EVALUATION"|"REV_EVALUATION"|"READY_TO_SIGN"|"BLOCKED"|"EXPIRED"|"CANCELLED"|"FAILED";
export interface OrchestrationRecord{
 schema:"ssw.orchestration-record.v1";orchestration_id:string;record_version:number;action_id:string;intent_id:string;holder_did:string;sera_agent_did:string;
 state:OrchestrationState;material_terms_hash:string;action_contract:any;review_record:any|null;approval_record:any|null;
 control_refs:{authority_decision_id:string|null;risk_decision_id:string|null;policy_decision_id:string|null;eligibility_decision_id:string|null;trust_decision_id:string|null;rev_decision_id:string|null};
 signing_request:any|null;reason_codes:string[];created_at:string;updated_at:string;expires_at:string;
}
export class OrchestrationError extends Error{constructor(public readonly code:string){super(code);}}

const RECORD_HASH_DOMAIN="SSW:ORCHESTRATION_RECORD:V1";
const stateRank:Record<OrchestrationState,number>={
 AWAITING_APPROVAL:1,CONTROL_EVALUATION:2,TRUST_EVALUATION:3,REV_EVALUATION:4,READY_TO_SIGN:5,BLOCKED:99,EXPIRED:99,CANCELLED:99,FAILED:99
};

export class PostgresOrchestrationStore{
 constructor(private readonly db:PostgresPersistence){}
 async load(orchestrationId:string):Promise<{record:OrchestrationRecord;storageVersion:number}|null>{
  const row=await this.db.session().getRecord({ownerService:"orchestrator",recordType:"action-orchestration",recordId:orchestrationId});
  if(!row)return null;
  const record=assertContract("orchestration-record",row.state) as unknown as OrchestrationRecord;
  if(record.record_version!==Number(row.version))throw new OrchestrationError("ORCHESTRATION_STORAGE_VERSION_MISMATCH");
  return{record,storageVersion:Number(row.version)};
 }
 async persist(input:{record:OrchestrationRecord;expectedStorageVersion:number|null;previousState:string|null}){
  const record=assertContract("orchestration-record",input.record) as unknown as OrchestrationRecord;
  const stateHash=sha256DomainSeparated(RECORD_HASH_DOMAIN,record as unknown as CanonicalJson).hash;
  return await this.db.transaction(async session=>{
   const storageVersion=await session.saveRecord({
    ownerService:"orchestrator",recordType:"action-orchestration",recordId:record.orchestration_id,status:record.state,state:record,stateHash,
    expiresAt:record.expires_at,expectedVersion:input.expectedStorageVersion
   });
   await session.enqueueOutbox({
    eventId:randomUUID(),ownerService:"orchestrator",topic:"ACTION.ORCHESTRATION_STATE_CHANGED",partitionKey:record.holder_did,
    payload:{orchestration_id:record.orchestration_id,action_id:record.action_id,previous_state:input.previousState,state:record.state,record_version:record.record_version,reason_codes:record.reason_codes}
   });
   return storageVersion;
  });
 }
}

function emptyRefs():OrchestrationRecord["control_refs"]{
 return{authority_decision_id:null,risk_decision_id:null,policy_decision_id:null,eligibility_decision_id:null,trust_decision_id:null,rev_decision_id:null};
}
function nextRecord(record:OrchestrationRecord,state:OrchestrationState,now:string,patch:Partial<OrchestrationRecord>={}):OrchestrationRecord{
 return assertContract("orchestration-record",{...record,...patch,state,record_version:record.record_version+1,updated_at:now}) as unknown as OrchestrationRecord;
}
async function transition(store:PostgresOrchestrationStore,loaded:{record:OrchestrationRecord;storageVersion:number},state:OrchestrationState,now:string,patch:Partial<OrchestrationRecord>={}){
 const next=nextRecord(loaded.record,state,now,patch);const version=await store.persist({record:next,expectedStorageVersion:loaded.storageVersion,previousState:loaded.record.state});
 return{record:next,storageVersion:version};
}
async function block(store:PostgresOrchestrationStore,loaded:{record:OrchestrationRecord;storageVersion:number},now:string,reasons:string[]){
 return await transition(store,loaded,"BLOCKED",now,{reason_codes:[...new Set(reasons)]});
}

export interface PreparePaymentIds{orchestrationId:string;actionId:string;saelCorrelationId:string;reviewId:string;}
export async function prepareA2Payment(input:{
 store:PostgresOrchestrationStore;resolvedIntent:unknown;ids:PreparePaymentIds;idempotencyKey:string;replayToken:string;
 presentationRef:string;now:string;expiresAt:string;
}){
 if(await input.store.load(input.ids.orchestrationId))throw new OrchestrationError("ORCHESTRATION_ALREADY_EXISTS");
 const built=buildPaymentSendAction(input.resolvedIntent,{actionId:input.ids.actionId,saelCorrelationId:input.ids.saelCorrelationId,idempotencyKey:input.idempotencyKey,replayToken:input.replayToken,createdAt:input.now,expiresAt:input.expiresAt});
 if(built.status!=="BUILT")throw new OrchestrationError("ORCHESTRATION_INTENT_AMBIGUOUS");
 const action=built.actionContract;
 const review=createReviewRecord({action,materialTermsHash:built.materialTermsHash,reviewId:input.ids.reviewId,presentationRef:input.presentationRef,reviewedAt:input.now});
 const record=assertContract("orchestration-record",{
  schema:"ssw.orchestration-record.v1",orchestration_id:input.ids.orchestrationId,record_version:1,action_id:action.action_id,intent_id:action.intent_id,
  holder_did:action.principal.holder_did,sera_agent_did:action.principal.sera_agent_did,state:"AWAITING_APPROVAL",material_terms_hash:built.materialTermsHash,
  action_contract:action,review_record:review,approval_record:null,control_refs:emptyRefs(),signing_request:null,reason_codes:[],
  created_at:input.now,updated_at:input.now,expires_at:input.expiresAt
 }) as unknown as OrchestrationRecord;
 const storageVersion=await input.store.persist({record,expectedStorageVersion:null,previousState:null});
 return{record,storageVersion};
}

export interface ResumeControlIds{
 approvalId:string;authorityDecisionId:string;riskDecisionId:string;policyDecisionId:string;eligibilityDecisionId:string;
 trustRequestId:string;revRequestId:string;signingRequestId:string;
}
export async function resumeA2Payment(input:{
 store:PostgresOrchestrationStore;orchestrationId:string;authentication?:AuthenticationEvidence;approvalHash?:string;approvalSignatureRef?:string;
 ids:ResumeControlIds;device:DeviceRecord;runtime:RuntimeRecord;trustTransport:TrustProtocolTransport;revTransport:RevTransport;
 policyVersion:string;expectedTrustServiceIdentity:string;expectedRevServiceIdentity:string;payloadBody:Record<string,unknown>;now:string;
}){
 let loaded=await input.store.load(input.orchestrationId);if(!loaded)throw new OrchestrationError("ORCHESTRATION_NOT_FOUND");
 if(loaded.record.state==="READY_TO_SIGN")return loaded;
 if(["BLOCKED","EXPIRED","CANCELLED","FAILED"].includes(loaded.record.state))throw new OrchestrationError("ORCHESTRATION_TERMINAL");
 if(Date.parse(loaded.record.expires_at)<=Date.parse(input.now)){
  return await transition(input.store,loaded,"EXPIRED",input.now,{reason_codes:["ACTION_EXPIRED"]});
 }

 let action=loaded.record.action_contract as any;
 if(!loaded.record.approval_record){
  if(!input.authentication||!input.approvalHash||!input.approvalSignatureRef)throw new OrchestrationError("APPROVAL_EVIDENCE_REQUIRED");
  const approval=createApprovalRecord({
   action,materialTermsHash:loaded.record.material_terms_hash,review:loaded.record.review_record,authentication:input.authentication,
   approvalId:input.ids.approvalId,approvedAt:input.now,expiresAt:new Date(Math.min(Date.parse(loaded.record.expires_at),Date.parse(input.now)+10*60_000)).toISOString(),
   approvalHash:input.approvalHash,approvalSignatureRef:input.approvalSignatureRef
  });
  action=applyApprovalToAction(action,approval,loaded.record.review_record);
  loaded=await transition(input.store,loaded,"CONTROL_EVALUATION",input.now,{action_contract:action,approval_record:approval,reason_codes:[]});
 }else{
  action=loaded.record.action_contract;
  if(stateRank[loaded.record.state]<stateRank.CONTROL_EVALUATION)loaded=await transition(input.store,loaded,"CONTROL_EVALUATION",input.now);
 }

 const authority=evaluateAuthority({action,materialTermsHash:loaded.record.material_terms_hash,decisionId:input.ids.authorityDecisionId,evaluatedAt:input.now});
 if(authority.status!=="PASS")return await block(input.store,loaded,input.now,["AUTHORITY_BLOCKED",...authority.reason_codes]);
 const risk=evaluateRisk({action,materialTermsHash:loaded.record.material_terms_hash,decisionId:input.ids.riskDecisionId,evaluatedAt:input.now});
 const eligibility=evaluateSessionEligibility({action,device:input.device,runtime:input.runtime,decisionId:input.ids.eligibilityDecisionId,evaluatedAt:input.now});
 if(eligibility.status!=="ELIGIBLE")return await block(input.store,loaded,input.now,["RUNTIME_NOT_ELIGIBLE",...eligibility.reason_codes]);
 action=applyEligibilityToAction(action,eligibility);
 const policy=evaluatePolicy({action,materialTermsHash:loaded.record.material_terms_hash,authorityDecision:authority,riskDecision:risk,decisionId:input.ids.policyDecisionId,evaluatedAt:input.now});
 if(!["REQUIRE_TRUST_REV","ALLOW_CONTINUE"].includes(policy.status))return await block(input.store,loaded,input.now,["POLICY_BLOCKED",...policy.reason_codes]);

 const refs={...loaded.record.control_refs,authority_decision_id:authority.decision_id,risk_decision_id:risk.decision_id,policy_decision_id:policy.decision_id,eligibility_decision_id:eligibility.decision_id};
 if(stateRank[loaded.record.state]<stateRank.TRUST_EVALUATION)loaded=await transition(input.store,loaded,"TRUST_EVALUATION",input.now,{action_contract:action,control_refs:refs});
 else loaded={record:{...loaded.record,action_contract:action,control_refs:refs},storageVersion:loaded.storageVersion};

 const trustRequest=buildTrustProtocolRequest({
  action,materialTermsHash:loaded.record.material_terms_hash,requestId:input.ids.trustRequestId,eligibilityDecisionRef:eligibility.decision_id,
  authorityDecision:authority,riskDecision:risk,policyDecision:policy,policyVersion:input.policyVersion,issuedAt:input.now,
  expiresAt:new Date(Math.min(Date.parse(loaded.record.expires_at),Date.parse(input.now)+5*60_000)).toISOString()
 });
 const trust=await evaluateTrustProtocol({transport:input.trustTransport,request:trustRequest,now:input.now,expectedServiceIdentity:input.expectedTrustServiceIdentity});
 if(trust.status!=="VERIFIED_PASS")return await block(input.store,loaded,input.now,["TRUST_BLOCKED",...trust.reasonCodes]);
 action=applyVerifiedTrustToAction(action,trust);
 const trustRefs={...refs,trust_decision_id:trust.decision.decision_id};
 if(stateRank[loaded.record.state]<stateRank.REV_EVALUATION)loaded=await transition(input.store,loaded,"REV_EVALUATION",input.now,{action_contract:action,control_refs:trustRefs});
 else loaded={record:{...loaded.record,action_contract:action,control_refs:trustRefs},storageVersion:loaded.storageVersion};

 const revRequest=buildRevRequest({
  action,materialTermsHash:loaded.record.material_terms_hash,requestId:input.ids.revRequestId,trustVerification:trust,
  deviceEligibilityRef:eligibility.decision_id,riskDecision:risk,policyDecision:policy,policyVersion:input.policyVersion,
  issuedAt:input.now,expiresAt:new Date(Math.min(Date.parse(loaded.record.expires_at),Date.parse(input.now)+3*60_000)).toISOString()
 });
 const rev=await evaluateRev({transport:input.revTransport,request:revRequest,now:input.now,expectedServiceIdentity:input.expectedRevServiceIdentity});
 if(rev.status!=="VERIFIED_PASS")return await block(input.store,loaded,input.now,["REV_BLOCKED",...rev.reasonCodes]);
 action=applyVerifiedRevToAction(action,rev);

 const signingRequest=buildSigningRequest({
  action,materialTermsHash:loaded.record.material_terms_hash,signingRequestId:input.ids.signingRequestId,deviceTrustRef:eligibility.decision_id,
  policyRef:policy.policy_id,payloadRef:"payload:orchestrator",payloadBody:input.payloadBody,requestedKeyClass:"HOLDER_EVM_ACCOUNT",
  issuedAt:input.now,expiresAt:new Date(Math.min(Date.parse(loaded.record.expires_at),Date.parse(input.now)+2*60_000)).toISOString()
 });
 const finalRefs={...trustRefs,rev_decision_id:rev.decision.decision_id};
 return await transition(input.store,loaded,"READY_TO_SIGN",input.now,{action_contract:action,control_refs:finalRefs,signing_request:signingRequest,reason_codes:[]});
}
