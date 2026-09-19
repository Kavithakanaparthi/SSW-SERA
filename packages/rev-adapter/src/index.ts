import type {ActionContract,RiskClass,AuthorityClass} from "@soulverse/contracts";
import {assertContract} from "@soulverse/schema-validation";
import type {TrustVerification} from "@soulverse/trust-adapter";

export interface RevRequest{
 schema:"ssw.rev-request.v1";request_id:string;action_id:string;action_version:number;material_terms_hash:string;
 authority_class:AuthorityClass;risk_class:RiskClass;policy_ref:string;policy_version:string;
 trust_protocol_decision_ref:string;device_eligibility_ref:string;runtime_ref:string;
 approval_ref:string|null;mandate_ref:string|null;mandate_evaluation_ref:string|null;aurion_ref:string|null;
 issued_at:string;expires_at:string;
}
export interface RevDecision{
 schema:"ssw.rev-decision.v1";decision_id:string;request_id:string;action_id:string;action_version:number;material_terms_hash:string;
 status:"PASS"|"FAIL"|"UNAVAILABLE"|"EXPIRED";reason_codes:string[];authority_class:AuthorityClass;risk_class:RiskClass;
 policy_version:string;trust_protocol_decision_ref:string;service_identity:string;single_use:boolean;
 issued_at:string;expires_at:string;integrity:{decision_hash:string;signature_ref:string};
}
export interface RevTransport{evaluate(request:RevRequest):Promise<unknown>;}
export type RevVerificationStatus="VERIFIED_PASS"|"VERIFIED_FAIL"|"UNAVAILABLE"|"EXPIRED"|"INVALID_BINDING"|"INVALID_PROVENANCE";
export interface RevVerification{status:RevVerificationStatus;reasonCodes:string[];decision:RevDecision;}

export function buildRevRequest(input:{
 action:ActionContract;materialTermsHash:string;requestId:string;trustVerification:TrustVerification;
 deviceEligibilityRef:string;riskDecision:{final_class:RiskClass};policyDecision:{policy_id:string};
 policyVersion:string;mandateEvaluationRef?:string|null;aurionRef?:string|null;issuedAt:string;expiresAt:string;
}):RevRequest{
 const a=assertContract("action-contract",input.action);
 if(a.trust.rev_required&&input.trustVerification.status!=="VERIFIED_PASS")throw new Error("REV request requires verified Trust Protocol PASS.");
 if(a.trust.trust_protocol_ref!==input.trustVerification.decision.decision_id)throw new Error("Action Contract Trust reference does not match verified Trust decision.");
 if(!a.policy.device_eligible||!a.policy.runtime_eligible)throw new Error("REV request requires eligible device and runtime.");
 const req:RevRequest={
  schema:"ssw.rev-request.v1",request_id:input.requestId,action_id:a.action_id,action_version:a.version,material_terms_hash:input.materialTermsHash,
  authority_class:a.authority.class,risk_class:input.riskDecision.final_class,policy_ref:input.policyDecision.policy_id,policy_version:input.policyVersion,
  trust_protocol_decision_ref:input.trustVerification.decision.decision_id,device_eligibility_ref:input.deviceEligibilityRef,runtime_ref:a.principal.sera_runtime_id,
  approval_ref:a.approval.approval_id,mandate_ref:a.authority.mandate_id,mandate_evaluation_ref:input.mandateEvaluationRef??null,aurion_ref:input.aurionRef??null,
  issued_at:input.issuedAt,expires_at:input.expiresAt
 };
 return assertContract("rev-request",req) as unknown as RevRequest;
}

export function verifyRevDecision(input:{request:RevRequest;decision:unknown;now:string;expectedServiceIdentity:string}):RevVerification{
 const req=assertContract("rev-request",input.request) as unknown as RevRequest;
 const d=assertContract("rev-decision",input.decision) as unknown as RevDecision;
 const reasons:string[]=[];
 if(d.service_identity!==input.expectedServiceIdentity)reasons.push("REV_SERVICE_IDENTITY_MISMATCH");
 const pairs:any[]=[
  [d.request_id,req.request_id,"REV_REQUEST_MISMATCH"],[d.action_id,req.action_id,"REV_ACTION_MISMATCH"],[d.action_version,req.action_version,"REV_ACTION_VERSION_MISMATCH"],
  [d.material_terms_hash,req.material_terms_hash,"REV_MATERIAL_TERMS_MISMATCH"],[d.authority_class,req.authority_class,"REV_AUTHORITY_MISMATCH"],
  [d.risk_class,req.risk_class,"REV_RISK_MISMATCH"],[d.policy_version,req.policy_version,"REV_POLICY_VERSION_MISMATCH"],
  [d.trust_protocol_decision_ref,req.trust_protocol_decision_ref,"REV_TRUST_DECISION_MISMATCH"]
 ];
 for(const [left,right,code] of pairs)if(left!==right)reasons.push(code);
 if(reasons.length)return{status:d.service_identity!==input.expectedServiceIdentity?"INVALID_PROVENANCE":"INVALID_BINDING",reasonCodes:reasons,decision:d};
 const now=Date.parse(input.now);
 if(d.status==="EXPIRED"||Date.parse(d.expires_at)<=now||Date.parse(req.expires_at)<=now)return{status:"EXPIRED",reasonCodes:["REV_DECISION_EXPIRED"],decision:d};
 if(d.status==="UNAVAILABLE")return{status:"UNAVAILABLE",reasonCodes:[...d.reason_codes,"REV_UNAVAILABLE"],decision:d};
 if(d.status==="FAIL")return{status:"VERIFIED_FAIL",reasonCodes:[...d.reason_codes],decision:d};
 return{status:"VERIFIED_PASS",reasonCodes:[...d.reason_codes],decision:d};
}

export async function evaluateRev(input:{transport:RevTransport;request:RevRequest;now:string;expectedServiceIdentity:string}):Promise<RevVerification>{
 const raw=await input.transport.evaluate(input.request);
 return verifyRevDecision({request:input.request,decision:raw,now:input.now,expectedServiceIdentity:input.expectedServiceIdentity});
}

export function applyVerifiedRevToAction(actionInput:ActionContract,verification:RevVerification):ActionContract{
 const action=assertContract("action-contract",actionInput);
 if(verification.status!=="VERIFIED_PASS")throw new Error("Only verified REV PASS may enrich Action Contract.");
 if(verification.decision.action_id!==action.action_id||verification.decision.action_version!==action.version)throw new Error("REV decision action mismatch.");
 const next=structuredClone(action);next.trust.rev_ref=verification.decision.decision_id;
 return assertContract("action-contract",next);
}
