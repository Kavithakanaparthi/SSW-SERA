import test from "node:test";
import assert from "node:assert/strict";
import {deriveExpectedGateState,parseTrackerGateRows,verifyDrift} from "../../scripts/verify-release-evidence-drift.mjs";

function registry(){
 return {items:Array.from({length:21},(_,i)=>({id:`DEV-OPEN-${String(i+1).padStart(3,"0")}`,status:"OPEN",applicable:true}))};
}

function manifest(){
 return {
  gate_state:{signing:"BLOCKED",execution:"BLOCKED",recovery:"BLOCKED",sael:"BLOCKED",mobile:"REPOSITORY_PASS_LIVE_BLOCKED",infrastructure:"REPOSITORY_PASS_LIVE_BLOCKED",pilot:"BLOCKED",production_release:"BLOCKED"},
  open_integrations:Array.from({length:21},(_,i)=>`DEV-OPEN-${String(i+1).padStart(3,"0")}`),
  pilot_candidate:false,production_release_candidate:false,production_signing_enabled:false,production_asset_movement_enabled:false
 };
}

const tracker=`
| Gate | Requirement | Status |
|---|---|---|
| Signing Gate | signer | NOT GATED |
| Execution Gate | execution | NOT GATED |
| Recovery Gate | recovery | NOT GATED |
| SAEL Gate | evidence | NOT GATED |
| Mobile Integration Gate | mobile | REPOSITORY BASELINE COMPLETE — LIVE BLOCKED |
| Pilot Gate | pilot | NOT GATED |
| Production Release Gate | release | NOT GATED |
`;

test("parses tracker gate rows",()=>{
 const rows=parseTrackerGateRows(tracker);
 assert.equal(rows.get("Signing Gate"),"NOT GATED");
});

test("open mapped items derive blocked gate",()=>{
 assert.equal(deriveExpectedGateState(registry(),"Signing Gate"),"BLOCKED");
});

test("current blocked tracker and manifest remain compatible",()=>{
 const r=verifyDrift({registry:registry(),trackerMarkdown:tracker,releaseManifest:manifest()});
 assert.equal(r.valid,true,r.errors.join(","));
});

test("tracker cannot claim COMPLETE while signing evidence is open",()=>{
 const bad=tracker.replace("NOT GATED","COMPLETE");
 const r=verifyDrift({registry:registry(),trackerMarkdown:bad,releaseManifest:manifest()});
 assert.equal(r.valid,false);
 assert.ok(r.errors.some(e=>e.startsWith("TRACKER_GATE_DRIFT:Signing Gate")));
});

test("release manifest open integration list must match registry",()=>{
 const m=manifest();
 m.open_integrations=m.open_integrations.filter(x=>x!=="DEV-OPEN-004");
 const r=verifyDrift({registry:registry(),trackerMarkdown:tracker,releaseManifest:m});
 assert.equal(r.valid,false);
 assert.ok(r.errors.includes("OPEN_INTEGRATION_LIST_DRIFT"));
});

test("verified mapped items require manifest to advance from BLOCKED",()=>{
 const r=registry();
 for(const id of ["DEV-OPEN-001","DEV-OPEN-002","DEV-OPEN-003"]){
  r.items.find(x=>x.id===id).status="VERIFIED";
 }
 const result=verifyDrift({registry:r,trackerMarkdown:tracker,releaseManifest:manifest()});
 assert.equal(result.valid,false);
 assert.ok(result.errors.some(e=>e.startsWith("MANIFEST_GATE_DRIFT:Signing Gate")));
});
