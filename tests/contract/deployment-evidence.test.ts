import test from "node:test";
import assert from "node:assert/strict";
import {buildDeploymentEvidence,canCloseProductionDeploymentGate} from "../../packages/service-host/src/deployment-evidence.js";
import {buildReferenceDeploymentManifest} from "../../packages/service-host/src/deployment-manifest.js";
import {productionSafeDefaults} from "../../packages/service-host/src/environment-controls.js";

const manifest=buildReferenceDeploymentManifest("staging",productionSafeDefaults("staging"));
const base={
 environment:"staging" as const,commitSha:"a".repeat(40),manifest,
 providerBindingComplete:true,providerPlanGenerated:true,providerPlanNoInlineSecrets:true,
 trustZoneNetworkMapVerified:true,workloadIdentityBound:true,observabilityBound:true,secretProviderBound:true,
 datastoreEncryptionVerified:true,backupPoliciesVerified:true,stagingDeploymentExecuted:true,
 healthChecksPassed:true,rollbackExecuted:true,driftCheckPassed:true,openDeploymentBlockers:[],
 productionCandidateReleaseEvidence:false,dedicatedSecurityExecutionComplete:false,manualDeploymentApproval:false
};

test("complete staging evidence passes staging deployment gate but remains production blocked",()=>{
 const e=buildDeploymentEvidence(base);
 assert.equal(e.decision,"STAGING_DEPLOYMENT_PASS_PRODUCTION_BLOCKED");
 assert.equal(e.productionSigningEnabled,false);
 assert.equal(e.productionAssetMovementEnabled,false);
});

test("provider binding absence keeps repository baseline blocked from live deployment",()=>{
 const e=buildDeploymentEvidence({...base,providerBindingComplete:false});
 assert.equal(e.decision,"REPOSITORY_BASELINE_PASS_PROVIDER_BINDING_BLOCKED");
 assert.ok(e.reasons.includes("PROVIDER_BINDING_REQUIRED"));
});

test("staging requires rollback drill and drift check",()=>{
 const e=buildDeploymentEvidence({...base,rollbackExecuted:false,driftCheckPassed:false});
 assert.equal(e.decision,"REPOSITORY_BASELINE_PASS_PROVIDER_BINDING_BLOCKED");
 assert.ok(e.reasons.includes("ROLLBACK_DRILL_REQUIRED"));
 assert.ok(e.reasons.includes("DRIFT_CHECK_REQUIRED"));
});

test("inline secret verification is mandatory",()=>{
 const e=buildDeploymentEvidence({...base,providerPlanNoInlineSecrets:false});
 assert.ok(e.reasons.includes("INLINE_SECRET_CHECK_REQUIRED"));
});

test("production deployment candidate requires release evidence security execution and manual approval",()=>{
 const productionManifest=buildReferenceDeploymentManifest("production",productionSafeDefaults("production"));
 const e=buildDeploymentEvidence({...base,environment:"production",manifest:productionManifest});
 assert.equal(e.decision,"REPOSITORY_BASELINE_PASS_PROVIDER_BINDING_BLOCKED");
 assert.ok(e.reasons.includes("PRODUCTION_CANDIDATE_RELEASE_EVIDENCE_REQUIRED"));
 assert.ok(e.reasons.includes("DEDICATED_SECURITY_EXECUTION_REQUIRED"));
 assert.ok(e.reasons.includes("MANUAL_DEPLOYMENT_APPROVAL_REQUIRED"));
});

test("fully evidenced production deployment can become candidate but does not enable signing",()=>{
 const productionManifest=buildReferenceDeploymentManifest("production",productionSafeDefaults("production"));
 const e=buildDeploymentEvidence({
  ...base,environment:"production",manifest:productionManifest,
  productionCandidateReleaseEvidence:true,dedicatedSecurityExecutionComplete:true,manualDeploymentApproval:true
 });
 assert.equal(e.decision,"PRODUCTION_DEPLOYMENT_CANDIDATE");
 assert.equal(canCloseProductionDeploymentGate(e),true);
 assert.equal(e.productionSigningEnabled,false);
 assert.equal(e.productionAssetMovementEnabled,false);
});

test("open deployment blockers prevent gate closure",()=>{
 const productionManifest=buildReferenceDeploymentManifest("production",productionSafeDefaults("production"));
 const e=buildDeploymentEvidence({
  ...base,environment:"production",manifest:productionManifest,
  productionCandidateReleaseEvidence:true,dedicatedSecurityExecutionComplete:true,manualDeploymentApproval:true,
  openDeploymentBlockers:["DEV-OPEN-019"]
 });
 assert.equal(canCloseProductionDeploymentGate(e),false);
});
