import type {ActionContract,AuthorityClass,RiskClass} from "@soulverse/contracts";
import {assertContract} from "@soulverse/schema-validation";

export interface TrustProtocolRequest{
 schema:"ssw.trust-protocol-request.v1";request_id:string;action_id:string;action_version:number;material_terms_hash:string;
 principal:{holder_did:string;sera_agent_did:string};
 runtime:{device_id:string;sera_runtime_id:string;eligibility_decision_ref:string};
 authority:{class:AuthorityClass;approval_ref:string|null;mandate_ref:string|null;mandate_evaluation_ref:string|null;mandate_terms_hash:string|null};
 risk:{class:RiskClass;reason_codes:string[]};
 policy:{decision_ref:string;policy_ref:string;policy_version:string};
 context_refs:string[];issued_at:string;expires_at:string;
}
export interface TrustProtocolDecision{
 schema:"ssw.trust-protocol-decision.v1";decision_id:string;request_id:string;action_id:string;action_version:number;material_terms_hash:string;
 status:"PASS"|"FAIL"|"UNAVAILABLE"|"EXPIRED";reason_codes:string[];
 principal:{holder_did:string;sera_agent_did:string};runtime:{device_id:string;sera_runtime_id:string};
 authority_class:AuthorityClass;risk_class:RiskClass;policy_version:string;service_identity:string;
 issued_at:string;expires_at:string;integrity:{decision_hash:string;signature_ref:string};
}
export interface TrustProtocolTransport{evaluate(request:TrustProtocolRequest):Promise<unknown>;}
export type TrustVerificationStatus="VERIFIED_PASS"|"VERIFIED_FAIL"|"UNAVAILABLE"|"EXPIRED"|"INVALID_BINDING"|"INVALID_PROVENANCE";
export interface TrustVerification{status:TrustVerificationStatus;reasonCodes:string[];decision:TrustProtocolDecision;}

export function buildTrustProtocolRequest(input:{
 action:ActionContract;materialTermsHash:string;requestId:string;eligibilityDecisionRef:string;
 authorityDecision:{status:string;decision_id:string};riskDecision:{final_class:RiskClass;reason_codes:string[];decision_id:string};
 policyDecision:{status:string;decision_id:string;policy_id:string};
 policyVersion:string;issuedAt:string;expiresAt:string;mandateEvaluation?:{decision_id:string;mandate_terms_hash:string;status:string};
 contextRefs?:string[];
}):TrustProtocolRequest{
 const a=assertContract("action-contract",input.action);
 if(!a.policy.device_eligible||!a.policy.runtime_eligible)throw new Error("Trust request requires eligible device and runtime.");
 if(input.authorityDecision.status!=="PASS"&&!(["A3","A4"].includes(a.authority.class)&&input.mandateEvaluation?.status==="PASS"))throw new Error("Trust request requires satisfied authority basis.");
 const req:TrustProtocolRequest={
  schema:"ssw.trust-protocol-request.v1",request_id:input.requestId,action_id:a.action_id,action_version:a.version,material_terms_hash:input.materialTermsHash,
  principal:{holder_did:a.principal.holder_did,sera_agent_did:a.principal.sera_agent_did},
  runtime:{device_id:a.principal.device_id,sera_runtime_id:a.principal.sera_runtime_id,eligibility_decision_ref:input.eligibilityDecisionRef},
  authority:{class:a.authority.class,approval_ref:a.approval.approval_id,mandate_ref:a.authority.mandate_id,mandate_evaluation_ref:input.mandateEvaluation?.decision_id??null,mandate_terms_hash:input.mandateEvaluation?.mandate_terms_hash??null},
  risk:{class:input.riskDecision.final_class,reason_codes:[...input.riskDecision.reason_codes]},
  policy:{decision_ref:input.policyDecision.decision_id,policy_ref:input.policyDecision.policy_id,policy_version:input.policyVersion},
  context_refs:[...(input.contextRefs??[])],issued_at:input.issuedAt,expires_at:input.expiresAt
 };
 return assertContract("trust-protocol-request",req) as TrustProtocolRequest;
}

export function verifyTrustProtocolDecision(input:{request:TrustProtocolRequest;decision:unknown;now:string;expectedServiceIdentity:string}):TrustVerification{
 const req=assertContract("trust-protocol-request",input.request) as TrustProtocolRequest;
 const d=assertContract("trust-protocol-decision",input.decision) as TrustProtocolDecision;
 const reasons:string[]=[];
 if(d.service_identity!==input.expectedServiceIdentity)reasons.push("TRUST_SERVICE_IDENTITY_MISMATCH");
 const pairs:[[unknown,unknown,string]]|any=[
  [d.request_id,req.request_id,"TRUST_REQUEST_MISMATCH"],[d.action_id,req.action_id,"TRUST_ACTION_MISMATCH"],[d.action_version,req.action_version,"TRUST_ACTION_VERSION_MISMATCH"],
  [d.material_terms_hash,req.material_terms_hash,"TRUST_MATERIAL_TERMS_MISMATCH"],[d.principal.holder_did,req.principal.holder_did,"TRUST_HOLDER_MISMATCH"],
  [d.principal.sera_agent_did,req.principal.sera_agent_did,"TRUST_SERA_MISMATCH"],[d.runtime.device_id,req.runtime.device_id,"TRUST_DEVICE_MISMATCH"],
  [d.runtime.sera_runtime_id,req.runtime.sera_runtime_id,"TRUST_RUNTIME_MISMATCH"],[d.authority_class,req.authority.class,"TRUST_AUTHORITY_MISMATCH"],
  [d.risk_class,req.risk.class,"TRUST_RISK_MISMATCH"],[d.policy_version,req.policy.policy_version,"TRUST_POLICY_VERSION_MISMATCH"]
 ];
 for(const [left,right,code] of pairs)if(left!==right)reasons.push(code);
 if(reasons.length)return{status:d.service_identity!==input.expectedServiceIdentity?"INVALID_PROVENANCE":"INVALID_BINDING",reasonCodes:reasons,decision:d};
 const now=Date.parse(input.now);
 if(d.status==="EXPIRED"||Date.parse(d.expires_at)<=now||Date.parse(req.expires_at)<=now)return{status:"EXPIRED",reasonCodes:["TRUST_DECISION_EXPIRED"],decision:d};
 if(d.status==="UNAVAILABLE")return{status:"UNAVAILABLE",reasonCodes:[...d.reason_codes,"TRUST_PROTOCOL_UNAVAILABLE"],decision:d};
 if(d.status==="FAIL")return{status:"VERIFIED_FAIL",reasonCodes:[...d.reason_codes],decision:d};
 return{status:"VERIFIED_PASS",reasonCodes:[...d.reason_codes],decision:d};
}

export async function evaluateTrustProtocol(input:{
 transport:TrustProtocolTransport;request:TrustProtocolRequest;now:string;expectedServiceIdentity:string;
}):Promise<TrustVerification>{
 const raw=await input.transport.evaluate(input.request);
 return verifyTrustProtocolDecision({request:input.request,decision:raw,now:input.now,expectedServiceIdentity:input.expectedServiceIdentity});
}

export function applyVerifiedTrustToAction(actionInput:ActionContract,verification:TrustVerification):ActionContract{
 const action=assertContract("action-contract",actionInput);
 if(verification.status!=="VERIFIED_PASS")throw new Error("Only verified Trust PASS may enrich Action Contract.");
 if(verification.decision.action_id!==action.action_id||verification.decision.action_version!==action.version)throw new Error("Trust decision action mismatch.");
 const next=structuredClone(action);next.trust.trust_protocol_ref=verification.decision.decision_id;
 return assertContract("action-contract",next);
}
