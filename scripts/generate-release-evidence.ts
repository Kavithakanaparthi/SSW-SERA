import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {buildReleaseEvidence,verifyReleaseEvidence} from "../packages/release-evidence/src/index.js";

async function main(){
 const testOutput=await readFile(resolve(".artifacts/test-output.log"),"utf8");
 const blockerConfig=JSON.parse(await readFile(resolve("config/release-blockers.v1.json"),"utf8"));
 const environment=(process.env.RELEASE_EVIDENCE_ENVIRONMENT??"CI") as "CI"|"STAGING";
 if(environment!=="CI"&&environment!=="STAGING")throw new Error("RELEASE_EVIDENCE_ENVIRONMENT_INVALID");
 const evidence=buildReleaseEvidence({
  repository:process.env.GITHUB_REPOSITORY??"Kavithakanaparthi/SSW-SERA",
  commitSha:process.env.GITHUB_SHA??"0".repeat(40),
  branch:(process.env.GITHUB_REF_NAME??"local").replace(/^refs\/heads\//,""),
  environment,
  generatedAt:new Date().toISOString(),
  workflow:{name:process.env.GITHUB_WORKFLOW??"local",runId:process.env.GITHUB_RUN_ID??"local",runNumber:process.env.GITHUB_RUN_NUMBER??"0"},
  testOutput,
  blockers:blockerConfig.blockers,
  dedicatedStagingAttackExecution:(process.env.STAGING_ATTACK_EXECUTION??undefined) as any
 });
 const verification=verifyReleaseEvidence(evidence);if(!verification.valid)throw new Error("RELEASE_EVIDENCE_HASH_INVALID");
 await mkdir(resolve(".artifacts"),{recursive:true});
 await writeFile(resolve(".artifacts/release-evidence.json"),JSON.stringify(evidence,null,2)+"\n","utf8");
 console.log(JSON.stringify({decision:evidence.decision,evidence_hash:evidence.evidence_hash,open_blockers:evidence.open_blockers.length,tests:evidence.verification.tests.count}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
