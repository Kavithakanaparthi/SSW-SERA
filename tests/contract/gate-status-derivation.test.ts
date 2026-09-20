import test from "node:test";
import assert from "node:assert/strict";
import {buildDefaultIntegrationRegistry} from "../../packages/service-host/src/integration-evidence-registry.js";
import {deriveGateStatus,deriveReleaseBlockerSummary} from "../../packages/service-host/src/gate-status-derivation.js";

function verifiedRegistry(){
 const r=buildDefaultIntegrationRegistry("2026-09-20T14:40:00Z");
 r.items=r.items.map(i=>({...i,status:"VERIFIED" as const,verifiedBy:"reviewer",verifiedAt:"2026-09-20T14:41:00Z"}));
 return r;
}

test("default registry keeps signing gate blocked",()=>{
 const r=buildDefaultIntegrationRegistry("2026-09-20T14:40:00Z");
 const g=deriveGateStatus(r,"Signing Gate");
 assert.equal(g.state,"BLOCKED");
 assert.deepEqual(g.unresolvedItems,["DEV-OPEN-001","DEV-OPEN-002","DEV-OPEN-003"]);
});

test("verified signing items complete signing gate",()=>{
 const r=verifiedRegistry();
 const g=deriveGateStatus(r,"Signing Gate");
 assert.equal(g.state,"COMPLETE");
 assert.equal(g.unresolvedItems.length,0);
});

test("waiver counts as satisfied but remains visible",()=>{
 const r=verifiedRegistry();
 const item=r.items.find(i=>i.id==="DEV-OPEN-004")!;
 item.status="WAIVED";
 item.verifiedBy="release-governance";
 const g=deriveGateStatus(r,"Execution Gate");
 assert.equal(g.state,"COMPLETE");
 assert.deepEqual(g.waivedItems,["DEV-OPEN-004"]);
});

test("disabled optional capabilities do not block pilot eligibility",()=>{
 const r=verifiedRegistry();
 const s=deriveReleaseBlockerSummary(r,{externalIntelligenceEnabled:false,credentialPresentationEnabled:false,soulIdLiveContextEnabled:false,svid4aiDelegationEnabled:false});
 assert.equal(s.capabilityBlockers.length,0);
 assert.equal(s.pilotEligible,true);
});

test("enabled external intelligence makes DEV-OPEN-007 applicable to release profile",()=>{
 const r=verifiedRegistry();
 const item=r.items.find(i=>i.id==="DEV-OPEN-007")!;
 item.status="OPEN";
 item.verifiedBy=null;
 item.verifiedAt=null;
 const s=deriveReleaseBlockerSummary(r,{externalIntelligenceEnabled:true,credentialPresentationEnabled:false,soulIdLiveContextEnabled:false,svid4aiDelegationEnabled:false});
 assert.deepEqual(s.capabilityBlockers,["DEV-OPEN-007"]);
 assert.equal(s.pilotEligible,false);
});

test("pilot gate and production release gate remain distinct",()=>{
 const r=verifiedRegistry();
 const item=r.items.find(i=>i.id==="DEV-OPEN-021")!;
 item.status="OPEN";
 item.verifiedBy=null;
 item.verifiedAt=null;
 const s=deriveReleaseBlockerSummary(r,{externalIntelligenceEnabled:false,credentialPresentationEnabled:false,soulIdLiveContextEnabled:false,svid4aiDelegationEnabled:false});
 assert.ok(s.gateBlockers.includes("Pilot Gate"));
 assert.ok(s.gateBlockers.includes("Production Release Gate"));
 assert.equal(s.pilotEligible,true);
 assert.equal(s.productionReleaseEligible,false);
});
