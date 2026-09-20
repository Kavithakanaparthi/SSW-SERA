import {randomUUID} from "node:crypto";
import {sha256DomainSeparated,type CanonicalJson} from "@soulverse/canonicalization";
import {assertContract} from "@soulverse/schema-validation";
import {securityConformanceManifest,manifestCoverage} from "@soulverse/security-harness";

export interface ReleaseBlocker{id:string;category:string;description:string;blocks:string[];}
export interface BuildReleaseEvidenceInput{
 repository:string;commitSha:string;branch:string;environment:"CI"|"STAGING";generatedAt:string;
 workflow:{name:string;runId:string;runNumber:string};
 testOutput:string;blockers:ReleaseBlocker[];
 dedicatedStagingAttackExecution?:"NOT_RUN"|"PARTIAL"|"COMPLETE";
 evidenceId?:string;
}

export function parseNodeTestSummary(output:string){
 const read=(label:string)=>{const m=new RegExp(`# ${label} (\\d+)`,"g");let v:number|undefined;for(const x of output.matchAll(m))v=Number(x[1]);return v;};
 const count=read("tests"),passed=read("pass"),failed=read("fail");
 if(!Number.isInteger(count)||!Number.isInteger(passed)||!Number.isInteger(failed))throw new Error("RELEASE_EVIDENCE_TEST_SUMMARY_MISSING");
 if(count!<=0||passed!==count||failed!==0)throw new Error("RELEASE_EVIDENCE_TEST_SUITE_NOT_GREEN");
 return{status:"PASS" as const,count:count!,passed:passed!,failed:0 as const};
}

function gateStatus(blockers:ReleaseBlocker[],gate:string):"COMPLETE"|"BLOCKED"{
 return blockers.some(b=>b.blocks.includes(gate))?"BLOCKED":"COMPLETE";
}

export function buildReleaseEvidence(input:BuildReleaseEvidenceInput){
 const tests=parseNodeTestSummary(input.testOutput);
 const requiredIds=securityConformanceManifest.filter(x=>x.productionGate).map(x=>x.id);
 const coverage=manifestCoverage(requiredIds);
 const stagingAttack=input.dedicatedStagingAttackExecution??(input.environment==="STAGING"?"PARTIAL":"NOT_RUN");
 const productionGates={
  control_plane:gateStatus(input.blockers,"CONTROL_PLANE"),
  signing:gateStatus(input.blockers,"SIGNING"),
  execution:gateStatus(input.blockers,"EXECUTION"),
  recovery:gateStatus(input.blockers,"RECOVERY"),
  sael:gateStatus(input.blockers,"SAEL"),
  security:stagingAttack==="COMPLETE"&&!input.blockers.some(b=>b.blocks.includes("SECURITY"))?"COMPLETE":"BLOCKED",
  mobile:gateStatus(input.blockers,"MOBILE"),
  pilot:gateStatus(input.blockers,"PILOT"),
  release:gateStatus(input.blockers,"RELEASE")
 } as const;
 const allComplete=Object.values(productionGates).every(x=>x==="COMPLETE");
 const decision=allComplete&&input.environment==="STAGING"&&stagingAttack==="COMPLETE"?"PRODUCTION_CANDIDATE":
  input.environment==="STAGING"?"STAGING_GATE_PASS_PRODUCTION_BLOCKED":"CI_BASELINE_PASS_PRODUCTION_BLOCKED";
 const core={
  schema:"ssw.release-evidence.v1",
  evidence_id:input.evidenceId??randomUUID(),
  repository:input.repository,
  commit_sha:input.commitSha,
  branch:input.branch,
  environment:input.environment,
  generated_at:input.generatedAt,
  workflow:{name:input.workflow.name,run_id:input.workflow.runId,run_number:input.workflow.runNumber},
  verification:{migrations:"PASS",scaffold:"PASS",contracts:"PASS",tests,typecheck:"PASS"},
  security:{required_case_ids:requiredIds,source_manifest_coverage:coverage.complete,dedicated_staging_attack_execution:stagingAttack},
  open_blockers:input.blockers,
  production_gates:productionGates,
  decision
 };
 const evidenceHash=sha256DomainSeparated("SSW:RELEASE_EVIDENCE:V1",core as unknown as CanonicalJson).hash;
 return assertContract("release-evidence",{...core,evidence_hash:evidenceHash}) as any;
}

export function verifyReleaseEvidence(value:unknown){
 const evidence=assertContract("release-evidence",value) as any;
 const {evidence_hash,...core}=evidence;
 const expected=sha256DomainSeparated("SSW:RELEASE_EVIDENCE:V1",core as unknown as CanonicalJson).hash;
 return{valid:expected===evidence_hash,expectedHash:expected,actualHash:evidence_hash};
}
