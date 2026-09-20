import {randomUUID} from "node:crypto";
import {assertContract} from "@soulverse/schema-validation";

export type RouteRisk="LOW"|"MEDIUM"|"HIGH"|"BLOCKED";
export type HolderRoutePreference="NONE"|"LOWER_FEE"|"FASTER_SETTLEMENT"|"LOWER_RISK";
export interface RouteCandidate{
 route_id:string;chain_id:string;balance_atomic:string;recipient_compatible:boolean;fee_atomic:string;estimated_settlement_seconds:number;
 bridge_required:boolean;risk_level:RouteRisk;chain_available:boolean;asset_verified:boolean;provider_ref:string;
}
const riskRank:Record<RouteRisk,number>={LOW:0,MEDIUM:1,HIGH:2,BLOCKED:3};

function exclusions(c:RouteCandidate,amount:bigint,requested:string|null){
 const reasons:string[]=[];
 if(requested!==null&&c.chain_id!==requested)reasons.push("EXPLICIT_CHAIN_MISMATCH");
 if(!c.chain_available)reasons.push("CHAIN_UNAVAILABLE");
 if(!c.asset_verified)reasons.push("ASSET_NOT_VERIFIED");
 if(!c.recipient_compatible)reasons.push("RECIPIENT_CHAIN_INCOMPATIBLE");
 if(BigInt(c.balance_atomic)<amount)reasons.push("INSUFFICIENT_BALANCE");
 if(c.risk_level==="BLOCKED")reasons.push("ROUTE_RISK_BLOCKED");
 return reasons;
}
function compare(a:RouteCandidate,b:RouteCandidate,pref:HolderRoutePreference){
 const risk=riskRank[a.risk_level]-riskRank[b.risk_level];if(risk!==0)return risk;
 if(a.bridge_required!==b.bridge_required)return a.bridge_required?1:-1;
 if(pref==="LOWER_FEE"){const fee=BigInt(a.fee_atomic)-BigInt(b.fee_atomic);if(fee!==0n)return fee<0n?-1:1;}
 if(pref==="FASTER_SETTLEMENT"&&a.estimated_settlement_seconds!==b.estimated_settlement_seconds)return a.estimated_settlement_seconds-b.estimated_settlement_seconds;
 if(pref==="LOWER_RISK"){const r=riskRank[a.risk_level]-riskRank[b.risk_level];if(r!==0)return r;}
 const fee=BigInt(a.fee_atomic)-BigInt(b.fee_atomic);if(fee!==0n)return fee<0n?-1:1;
 if(a.estimated_settlement_seconds!==b.estimated_settlement_seconds)return a.estimated_settlement_seconds-b.estimated_settlement_seconds;
 return a.chain_id.localeCompare(b.chain_id)||a.route_id.localeCompare(b.route_id);
}
function basisFor(best:RouteCandidate,others:RouteCandidate[],pref:HolderRoutePreference){
 const basis:string[]=[];
 if(!best.bridge_required&&others.some(x=>x.bridge_required))basis.push("NO_BRIDGE_PREFERRED");
 if(pref==="LOWER_FEE")basis.push("HOLDER_PREFERS_LOWER_FEE");
 else if(pref==="FASTER_SETTLEMENT")basis.push("HOLDER_PREFERS_FASTER_SETTLEMENT");
 else if(pref==="LOWER_RISK")basis.push("HOLDER_PREFERS_LOWER_RISK");
 if(others.some(x=>BigInt(best.fee_atomic)<BigInt(x.fee_atomic)))basis.push("LOWER_FEE");
 if(others.some(x=>best.estimated_settlement_seconds<x.estimated_settlement_seconds))basis.push("FASTER_SETTLEMENT");
 if(others.some(x=>riskRank[best.risk_level]<riskRank[x.risk_level]))basis.push("LOWER_ROUTE_RISK");
 if(basis.length===0)basis.push("DETERMINISTIC_TIE_BREAK");
 return [...new Set(basis)];
}

export function evaluateRoute(requestInput:unknown,createdAt:string,routeDecisionId=randomUUID()){
 const request=assertContract("route-request",requestInput) as any;
 if(Date.parse(request.expires_at)<=Date.parse(createdAt))throw new Error("ROUTE_REQUEST_EXPIRED");
 const amount=BigInt(request.amount_atomic);const excluded:any[]=[];const eligible:RouteCandidate[]=[];
 for(const c of request.candidates as RouteCandidate[]){
  const reasons=exclusions(c,amount,request.requested_chain_id);
  if(reasons.length)excluded.push({route_id:c.route_id,reason_codes:reasons});else eligible.push(structuredClone(c));
 }
 eligible.sort((a,b)=>compare(a,b,request.holder_preference));
 const recommended=eligible[0]??null;const alternatives=eligible.slice(1);
 const materialChange=Boolean(recommended&&request.previously_reviewed_chain_id&&recommended.chain_id!==request.previously_reviewed_chain_id);
 return assertContract("route-decision",{
  schema:"ssw.route-decision.v1",route_decision_id:routeDecisionId,route_request_id:request.route_request_id,holder_did:request.holder_did,sera_agent_did:request.sera_agent_did,
  status:recommended?"RECOMMENDED":"NO_ELIGIBLE_ROUTE",recommended,alternatives,excluded,basis:recommended?basisFor(recommended,alternatives,request.holder_preference):["NO_ELIGIBLE_ROUTE"],
  material_change:materialChange,requires_fresh_review:materialChange,authority_effect:"NONE",created_at:createdAt
 });
}
