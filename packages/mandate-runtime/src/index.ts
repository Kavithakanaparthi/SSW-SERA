import type {ActionContract,Mandate,RiskClass} from "@soulverse/contracts";
import {assertContract} from "@soulverse/schema-validation";
import {evaluateDmcl,type DmclContext,type DmclDecision} from "@soulverse/dmcl";
const riskRank:Record<RiskClass,number>={R0:0,R1:1,R2:2,R3:3,R4:4,R5:5};

export interface MandateEvaluationDecision{
 schema:"ssw.mandate-evaluation-decision.v1";decision_id:string;action_id:string;action_version:number;mandate_id:string;mandate_version:number;
 material_terms_hash:string;mandate_terms_hash:string;status:"PASS"|"OUT_OF_SCOPE"|"LIMIT_EXCEEDED"|"CONDITION_FALSE"|"CONDITION_INDETERMINATE"|"INACTIVE"|"EXPIRED"|"IDENTITY_MISMATCH"|"DEVICE_RUNTIME_MISMATCH"|"RISK_EXCEEDED"|"FAIL";
 condition_results:DmclDecision[];reason_codes:string[];evaluated_at:string;
}
function paymentTerms(action:ActionContract){
 const t=action.material_terms as any;return{assetId:t?.asset?.asset_id,amountAtomic:t?.amount?.atomic,chainId:t?.network?.chain_id,counterpartyId:t?.counterparty?.canonical_id};
}
function includesObject(list:any[],predicate:(v:any)=>boolean):boolean{return Array.isArray(list)&&list.some(predicate);}
export function evaluateMandate(input:{
 action:ActionContract; mandate:Mandate; materialTermsHash:string; decisionId:string; evaluatedAt:string;
 deviceState:string; runtimeClass:string; dmclContext?:DmclContext;
}):MandateEvaluationDecision{
 const action=assertContract("action-contract",input.action);
 const mandate=assertContract("mandate",input.mandate) as Mandate;
 const reasons:string[]=[];const conditionResults:DmclDecision[]=[];
 let status:MandateEvaluationDecision["status"]="PASS";
 const fail=(s:MandateEvaluationDecision["status"],r:string)=>{status=s;reasons.push(r);};

 if(mandate.principal.holder_did!==action.principal.holder_did||mandate.principal.sera_agent_did!==action.principal.sera_agent_did)fail("IDENTITY_MISMATCH","MANDATE_PRINCIPAL_MISMATCH");
 else if(mandate.revocation.status!=="ACTIVE")fail("INACTIVE","MANDATE_NOT_ACTIVE");
 else if(Date.parse(input.evaluatedAt)>Date.parse(mandate.valid_until)){fail("EXPIRED","MANDATE_EXPIRED");}
 else if(Date.parse(input.evaluatedAt)<Date.parse(mandate.valid_from)){fail("INACTIVE","MANDATE_NOT_ACTIVE");}
 else if(action.authority.class!=="A3"&&action.authority.class!=="A4")fail("FAIL","ACTION_NOT_IN_SCOPE");
 else if(mandate.authority.class!==action.authority.class)fail("OUT_OF_SCOPE","MANDATE_AUTHORITY_CLASS_MISMATCH");
 else if(!mandate.scope.action_types.includes(action.action_type))fail("OUT_OF_SCOPE","ACTION_NOT_IN_SCOPE");
 else {
  const p=paymentTerms(action);
  if(action.action_type==="payment.send"){
   if(!p.assetId||!includesObject(mandate.scope.assets,(v)=>v.asset_id===p.assetId))fail("OUT_OF_SCOPE","ASSET_NOT_IN_SCOPE");
   else if(!p.chainId||!includesObject(mandate.scope.chains,(v)=>v.chain_id===p.chainId||v.network===p.chainId))fail("OUT_OF_SCOPE","CHAIN_NOT_IN_SCOPE");
   else if(!p.counterpartyId||!includesObject(mandate.scope.counterparties,(v)=>v.value===p.counterpartyId||v.canonical_id===p.counterpartyId))fail("OUT_OF_SCOPE","COUNTERPARTY_NOT_IN_SCOPE");
   else{
    const lim=(mandate.limits as any)?.per_action?.[p.assetId]?.max_atomic;
    if(lim!==undefined&&p.amountAtomic!==undefined&&BigInt(String(p.amountAtomic))>BigInt(String(lim)))fail("LIMIT_EXCEEDED","PER_ACTION_LIMIT_EXCEEDED");
   }
  }
 }
 if(status==="PASS"&&riskRank[action.risk.class]>riskRank[mandate.risk.max_class])fail("RISK_EXCEEDED","RISK_CEILING_EXCEEDED");
 if(status==="PASS"&&action.risk.reasons.some((r)=>mandate.risk.prohibited_reasons.includes(r)))fail("RISK_EXCEEDED","PROHIBITED_RISK_REASON");
 if(status==="PASS"&&mandate.device_policy.allowed_device_ids.length&& !mandate.device_policy.allowed_device_ids.includes(action.principal.device_id))fail("DEVICE_RUNTIME_MISMATCH","DEVICE_NOT_ELIGIBLE");
 if(status==="PASS"&&mandate.device_policy.allowed_runtime_ids.length&& !mandate.device_policy.allowed_runtime_ids.includes(action.principal.sera_runtime_id))fail("DEVICE_RUNTIME_MISMATCH","RUNTIME_NOT_ELIGIBLE");
 if(status==="PASS"&&mandate.device_policy.allowed_device_states.length&&!mandate.device_policy.allowed_device_states.includes(input.deviceState as any))fail("DEVICE_RUNTIME_MISMATCH","DEVICE_TRUST_INSUFFICIENT");
 if(status==="PASS"&&input.runtimeClass==="PROTECTED_CLOUD_REASONING"&&!mandate.device_policy.cloud_execution_allowed)fail("DEVICE_RUNTIME_MISMATCH","CLOUD_EXECUTION_NOT_ALLOWED");
 if(status==="PASS"&&input.runtimeClass==="WEARABLE"&&!mandate.device_policy.wearable_execution_allowed)fail("DEVICE_RUNTIME_MISMATCH","WEARABLE_EXECUTION_NOT_ALLOWED");

 if(status==="PASS"&&action.authority.class==="A4"&&mandate.conditions.length===0)fail("CONDITION_INDETERMINATE","A4_CONDITION_REQUIRED");
 if(status==="PASS"&&mandate.conditions.length){
  const ctx:DmclContext=input.dmclContext??{action:{...paymentTerms(action),risk_class:action.risk.class,action_type:action.action_type},mandate:{id:mandate.mandate_id,version:mandate.version},evaluation:{now:input.evaluatedAt}};
  for(const expression of mandate.conditions){
   const valid=assertContract("dmcl-expression",expression);
   const r=evaluateDmcl(valid,ctx);conditionResults.push(r);
   if(r==="FALSE"){status="CONDITION_FALSE";reasons.push("DMCL_CONDITION_FALSE");break;}
   if(r==="INDETERMINATE"){status="CONDITION_INDETERMINATE";reasons.push("DMCL_CONDITION_INDETERMINATE");break;}
  }
 }
 const decision:MandateEvaluationDecision={schema:"ssw.mandate-evaluation-decision.v1",decision_id:input.decisionId,action_id:action.action_id,action_version:action.version,mandate_id:mandate.mandate_id,mandate_version:mandate.version,material_terms_hash:input.materialTermsHash,mandate_terms_hash:mandate.integrity.mandate_terms_hash,status,condition_results:conditionResults,reason_codes:[...new Set(reasons)],evaluated_at:input.evaluatedAt};
 return assertContract("mandate-evaluation-decision",decision) as MandateEvaluationDecision;
}
