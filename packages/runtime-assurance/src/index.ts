import type { ActionContract } from "@soulverse/contracts";
import { assertContract } from "@soulverse/schema-validation";

export interface DeviceRecord {
 schema:"ssw.device-record.v1"; device_id:string; holder_did:string; sera_agent_did:string;
 device_type:"PHONE"|"TABLET"|"WEARABLE"|"DESKTOP"|"HARDWARE_CARD"|"OTHER";
 platform:string; state:"UNREGISTERED"|"REGISTERED"|"ATTESTED"|"TRUSTED"|"LIMITED"|"SUSPENDED"|"REVOKED";
 registered_at:string; last_attested_at:string|null; trust_expires_at:string|null; attestation_ref:string|null; risk_flags:string[];
}
export interface RuntimeRecord {
 schema:"ssw.runtime-record.v1"; runtime_id:string; sera_agent_did:string; device_id:string|null;
 runtime_class:"PRIMARY_PHONE"|"SECONDARY_PHONE"|"TABLET"|"DESKTOP"|"WEARABLE"|"PROTECTED_CLOUD_REASONING"|"RECOVERY_RUNTIME"|"TEST_OR_DEVELOPMENT";
 state:"UNREGISTERED"|"REGISTERED"|"ATTESTED"|"ELIGIBLE"|"LIMITED"|"SUSPENDED"|"REVOKED";
 registered_at:string; session_id:string|null; session_expires_at:string|null; attestation_ref:string|null;
}
export interface SessionEligibilityDecision {
 schema:"ssw.session-eligibility-decision.v1"; decision_id:string; action_id:string; device_id:string; runtime_id:string;
 status:"ELIGIBLE"|"LIMITED"|"INELIGIBLE"|"EXPIRED"|"SUSPENDED"|"REVOKED";
 device_state:DeviceRecord["state"]; runtime_state:RuntimeRecord["state"]; reason_codes:string[]; evaluated_at:string;
}

export function evaluateSessionEligibility(input:{
 action:ActionContract; device:DeviceRecord; runtime:RuntimeRecord; decisionId:string; evaluatedAt:string;
}):SessionEligibilityDecision{
 const action=assertContract("action-contract",input.action);
 const device=assertContract("device-record",input.device) as unknown as DeviceRecord;
 const runtime=assertContract("runtime-record",input.runtime) as unknown as RuntimeRecord;
 const reasons:string[]=[]; let status:SessionEligibilityDecision["status"]="ELIGIBLE";

 if(device.state==="REVOKED"||runtime.state==="REVOKED"){status="REVOKED"; reasons.push(device.state==="REVOKED"?"DEVICE_REVOKED":"RUNTIME_REVOKED");}
 else if(device.state==="SUSPENDED"||runtime.state==="SUSPENDED"){status="SUSPENDED"; reasons.push(device.state==="SUSPENDED"?"DEVICE_SUSPENDED":"RUNTIME_SUSPENDED");}
 else if(device.holder_did!==action.principal.holder_did){status="INELIGIBLE"; reasons.push("DEVICE_NOT_ELIGIBLE");}
 else if(device.sera_agent_did!==action.principal.sera_agent_did||runtime.sera_agent_did!==action.principal.sera_agent_did){status="INELIGIBLE"; reasons.push("RUNTIME_NOT_ELIGIBLE");}
 else if(device.device_id!==action.principal.device_id||runtime.device_id!==action.principal.device_id){status="INELIGIBLE"; reasons.push("DEVICE_NOT_ELIGIBLE");}
 else if(runtime.runtime_id!==action.principal.sera_runtime_id){status="INELIGIBLE"; reasons.push("RUNTIME_NOT_ELIGIBLE");}
 else if(!runtime.session_expires_at||Date.parse(runtime.session_expires_at)<=Date.parse(input.evaluatedAt)){status="EXPIRED"; reasons.push("SESSION_EXPIRED");}
 else if(runtime.runtime_class==="PROTECTED_CLOUD_REASONING"&&["R3","R4","R5"].includes(action.risk.class)){status="INELIGIBLE"; reasons.push("RUNTIME_NOT_ELIGIBLE");}
 else if(["R3","R4","R5"].includes(action.risk.class)&&(device.state!=="TRUSTED"||runtime.state!=="ELIGIBLE")){status="INELIGIBLE"; reasons.push(device.state!=="TRUSTED"?"DEVICE_TRUST_INSUFFICIENT":"RUNTIME_NOT_ELIGIBLE");}
 else if(device.state==="LIMITED"||runtime.state==="LIMITED"||device.device_type==="WEARABLE"){status="LIMITED"; reasons.push("DEVICE_TRUST_INSUFFICIENT");}
 else if(!["ATTESTED","TRUSTED"].includes(device.state)||!["ATTESTED","ELIGIBLE"].includes(runtime.state)){status="INELIGIBLE"; reasons.push("DEVICE_NOT_ELIGIBLE","RUNTIME_NOT_ELIGIBLE");}

 const d:SessionEligibilityDecision={schema:"ssw.session-eligibility-decision.v1",decision_id:input.decisionId,action_id:action.action_id,device_id:device.device_id,runtime_id:runtime.runtime_id,status,device_state:device.state,runtime_state:runtime.state,reason_codes:[...new Set(reasons)],evaluated_at:input.evaluatedAt};
 return assertContract("session-eligibility-decision",d) as unknown as SessionEligibilityDecision;
}

export function applyEligibilityToAction(actionInput:ActionContract, decision:SessionEligibilityDecision):ActionContract{
 const action=assertContract("action-contract",actionInput);
 const d=assertContract("session-eligibility-decision",decision) as unknown as SessionEligibilityDecision;
 if(d.action_id!==action.action_id)throw new Error("Eligibility decision action mismatch.");
 const next=structuredClone(action);
 next.policy.device_eligible=d.status==="ELIGIBLE";
 next.policy.runtime_eligible=d.status==="ELIGIBLE";
 return assertContract("action-contract",next);
}
