import fs from "node:fs";
import {pathToFileURL} from "node:url";

const gateMap={
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

const manifestKey={
 "Signing Gate":"signing",
 "Execution Gate":"execution",
 "Recovery Gate":"recovery",
 "SAEL Gate":"sael",
 "Mobile Integration Gate":"mobile",
 "Infrastructure Gate":"infrastructure",
 "Pilot Gate":"pilot",
 "Production Release Gate":"production_release"
};

function satisfied(item){
 return item&&(item.status==="VERIFIED"||item.status==="WAIVED");
}

export function deriveExpectedGateState(registry,gate){
 const byId=new Map(registry.items.map(i=>[i.id,i]));
 const unresolved=(gateMap[gate]??[]).filter(id=>!satisfied(byId.get(id)));
 return unresolved.length===0?"COMPLETE":"BLOCKED";
}

export function parseTrackerGateRows(markdown){
 const rows=new Map();
 for(const line of markdown.split("\n")){
  const m=line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*([^|]+?)\s*\|$/);
  if(!m)continue;
  rows.set(m[1].trim(),m[3].trim());
 }
 return rows;
}

function trackerCompatible(expected,status){
 const s=status.toUpperCase();
 if(expected==="COMPLETE")return s.includes("COMPLETE")&&!s.includes("BLOCKED")&&!s.includes("NOT GATED");
 if(s.includes("LIVE BLOCKED")||s.includes("BLOCKED")||s.includes("NOT GATED"))return true;
 return !/^COMPLETE\b/.test(s);
}

function manifestCompatible(expected,value){
 const v=String(value??"").toUpperCase();
 if(expected==="COMPLETE")return v==="COMPLETE";
 return v.includes("BLOCKED")||v.includes("REQUIRED")||v.includes("NOT_GATED");
}

export function verifyDrift({registry,trackerMarkdown,releaseManifest}){
 const errors=[];
 const rows=parseTrackerGateRows(trackerMarkdown);
 for(const gate of Object.keys(gateMap)){
  const expected=deriveExpectedGateState(registry,gate);
  const trackerStatus=rows.get(gate);
  if(trackerStatus&&!trackerCompatible(expected,trackerStatus)){
   errors.push(`TRACKER_GATE_DRIFT:${gate}:expected=${expected}:actual=${trackerStatus}`);
  }
  const key=manifestKey[gate];
  if(key){
   const actual=releaseManifest.gate_state?.[key];
   if(!manifestCompatible(expected,actual)){
    errors.push(`MANIFEST_GATE_DRIFT:${gate}:expected=${expected}:actual=${actual}`);
   }
  }
 }

 const open=registry.items.filter(i=>i.status!=="VERIFIED"&&i.status!=="WAIVED").map(i=>i.id).sort();
 const manifestOpen=[...(releaseManifest.open_integrations??[])].sort();
 if(JSON.stringify(open)!==JSON.stringify(manifestOpen)){
  errors.push("OPEN_INTEGRATION_LIST_DRIFT");
 }

 const hasReleaseBlockers=open.some(id=>id!=="DEV-OPEN-007"&&id!=="DEV-OPEN-008"&&id!=="DEV-OPEN-009"&&id!=="DEV-OPEN-010");
 if(hasReleaseBlockers){
  if(releaseManifest.pilot_candidate!==false)errors.push("PILOT_CANDIDATE_DRIFT");
  if(releaseManifest.production_release_candidate!==false)errors.push("PRODUCTION_RELEASE_CANDIDATE_DRIFT");
  if(releaseManifest.production_signing_enabled!==false)errors.push("PRODUCTION_SIGNING_DRIFT");
  if(releaseManifest.production_asset_movement_enabled!==false)errors.push("PRODUCTION_ASSET_MOVEMENT_DRIFT");
 }

 return{valid:errors.length===0,errors};
}

export function runDriftVerification(paths={
 registry:"docs/release/evidence/SSW-SERA-Live-Integration-Evidence-Registry.json",
 tracker:"docs/project/SSW-AI-PROJECT-BUILD-TRACKER.md",
 manifest:"docs/release/evidence/SSW-AI-REL-GATE-01-evidence-manifest.json"
}){
 const registry=JSON.parse(fs.readFileSync(paths.registry,"utf8"));
 const trackerMarkdown=fs.readFileSync(paths.tracker,"utf8");
 const releaseManifest=JSON.parse(fs.readFileSync(paths.manifest,"utf8"));
 const result=verifyDrift({registry,trackerMarkdown,releaseManifest});
 if(!result.valid){
  for(const e of result.errors)console.error(e);
  process.exitCode=1;
 }else{
  console.log("Release evidence/tracker drift check PASS");
 }
 return result;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 runDriftVerification();
}
