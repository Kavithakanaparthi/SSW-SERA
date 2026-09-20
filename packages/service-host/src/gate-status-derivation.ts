import type {IntegrationEvidenceRegistry,IntegrationEvidenceItem} from "./integration-evidence-registry.js";

export type DerivedGateName=
 "Signing Gate"|"Execution Gate"|"Recovery Gate"|"SAEL Gate"|"Mobile Integration Gate"|"Infrastructure Gate"|"Production Deployment Gate"|"Pilot Gate"|"Production Release Gate";

export type DerivedGateState="COMPLETE"|"BLOCKED"|"CONDITIONAL";

export interface DerivedGateStatus{
 gate:DerivedGateName;
 state:DerivedGateState;
 requiredItems:string[];
 unresolvedItems:string[];
 conditionalItems:string[];
 verifiedItems:string[];
 waivedItems:string[];
}

const gateRequirements:Record<DerivedGateName,string[]>={
 "Signing Gate":["DEV-OPEN-001","DEV-OPEN-002","DEV-OPEN-003"],
 "Execution Gate":["DEV-OPEN-004"],
 "Recovery Gate":["DEV-OPEN-002"],
 "SAEL Gate":["DEV-OPEN-005"],
 "Mobile Integration Gate":["DEV-OPEN-006","DEV-OPEN-011","DEV-OPEN-012","DEV-OPEN-013","DEV-OPEN-014","DEV-OPEN-015"],
 "Infrastructure Gate":["DEV-OPEN-016","DEV-OPEN-017","DEV-OPEN-018"],
 "Production Deployment Gate":["DEV-OPEN-019","DEV-OPEN-020"],
 "Pilot Gate":["DEV-OPEN-021"],
 "Production Release Gate":["DEV-OPEN-021"]
};

function satisfied(item:IntegrationEvidenceItem|undefined){
 return !!item&&(item.status==="VERIFIED"||item.status==="WAIVED");
}

export function deriveGateStatus(registry:IntegrationEvidenceRegistry,gate:DerivedGateName):DerivedGateStatus{
 const byId=new Map(registry.items.map(i=>[i.id,i] as const));
 const required=gateRequirements[gate];
 const unresolved:string[]=[];
 const conditional:string[]=[];
 const verified:string[]=[];
 const waived:string[]=[];
 for(const id of required){
  const item=byId.get(id);
  if(!item||!item.applicable){unresolved.push(id);continue;}
  if(item.criticality==="CONDITIONAL_BLOCKER"){
   conditional.push(id);
   if(!satisfied(item))continue;
  }
  if(item.status==="VERIFIED")verified.push(id);
  else if(item.status==="WAIVED")waived.push(id);
  else unresolved.push(id);
 }
 const state:DerivedGateState=unresolved.length>0?"BLOCKED":conditional.some(id=>!satisfied(byId.get(id)))?"CONDITIONAL":"COMPLETE";
 return{gate,state,requiredItems:[...required],unresolvedItems:unresolved.sort(),conditionalItems:conditional.sort(),verifiedItems:verified.sort(),waivedItems:waived.sort()};
}

export function deriveAllGateStatuses(registry:IntegrationEvidenceRegistry){
 const gates=Object.keys(gateRequirements) as DerivedGateName[];
 return gates.map(g=>deriveGateStatus(registry,g));
}

export interface CapabilityProfile{
 externalIntelligenceEnabled:boolean;
 credentialPresentationEnabled:boolean;
 soulIdLiveContextEnabled:boolean;
 svid4aiDelegationEnabled:boolean;
}

export function deriveConditionalCapabilityBlockers(registry:IntegrationEvidenceRegistry,profile:CapabilityProfile){
 const byId=new Map(registry.items.map(i=>[i.id,i] as const));
 const required:string[]=[];
 if(profile.externalIntelligenceEnabled)required.push("DEV-OPEN-007");
 if(profile.credentialPresentationEnabled)required.push("DEV-OPEN-008");
 if(profile.soulIdLiveContextEnabled)required.push("DEV-OPEN-009");
 if(profile.svid4aiDelegationEnabled)required.push("DEV-OPEN-010");
 return required.filter(id=>!satisfied(byId.get(id))).sort();
}

export function deriveReleaseBlockerSummary(registry:IntegrationEvidenceRegistry,profile:CapabilityProfile){
 const gateStatuses=deriveAllGateStatuses(registry);
 const gateBlockers=gateStatuses.filter(g=>g.state!=="COMPLETE").map(g=>g.gate);
 const capabilityBlockers=deriveConditionalCapabilityBlockers(registry,profile);
 return{
  gateStatuses,
  gateBlockers,
  capabilityBlockers,
  pilotEligible:gateBlockers.filter(g=>g!=="Pilot Gate"&&g!=="Production Release Gate").length===0&&capabilityBlockers.length===0,
  productionReleaseEligible:gateBlockers.length===0&&capabilityBlockers.length===0
 };
}
