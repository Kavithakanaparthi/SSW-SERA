import test from "node:test";
import assert from "node:assert/strict";
import {assertEnvironmentIsolation,decideEnvironmentPromotion,productionSafeDefaults,validateEnvironmentProfile} from "../../packages/service-host/src/environment-controls.js";

test("safe defaults keep production signing and asset movement disabled",()=>{
 for(const env of ["development","test","staging","production"] as const){
  const p=productionSafeDefaults(env);
  assert.equal(p.allowProductionSigning,false);
  assert.equal(p.allowProductionAssetMovement,false);
 }
});

test("staging and production require workload identity observability and release evidence",()=>{
 for(const env of ["staging","production"] as const){
  const p=productionSafeDefaults(env);
  assert.equal(p.requireWorkloadIdentity,true);
  assert.equal(p.requireSanitizedObservability,true);
  assert.equal(p.requireReleaseEvidence,true);
  assert.equal(validateEnvironmentProfile(p).valid,true);
 }
});

test("production rejects synthetic data",()=>{
 const p={...productionSafeDefaults("production"),allowSyntheticData:true};
 const v=validateEnvironmentProfile(p);
 assert.equal(v.valid,false);
 assert.ok(v.errors.includes("PRODUCTION_SYNTHETIC_DATA_PROHIBITED"));
});

test("environment namespaces must not collide",()=>{
 const dev=productionSafeDefaults("development");
 const testEnv={...productionSafeDefaults("test"),databaseNamespace:dev.databaseNamespace};
 assert.throws(()=>assertEnvironmentIsolation([dev,testEnv]),/ENVIRONMENT_NAMESPACE_COLLISION:databaseNamespace/);
});

test("promotion must be sequential",()=>{
 const d=decideEnvironmentPromotion({
  from:"development",to:"staging",commitSha:"a".repeat(40),releaseEvidenceDecision:"CI_BASELINE_PASS_PRODUCTION_BLOCKED",
  testsGreen:true,typecheckGreen:true,contractsGreen:true,migrationsGreen:true,openReleaseBlockers:12,
  dedicatedSecurityExecution:"NOT_RUN",rollbackPlanPresent:true,workloadIdentityReady:true,observabilityReady:true,secretsReady:true
 });
 assert.equal(d.allowed,false);
 assert.ok(d.reasons.includes("SEQUENTIAL_PROMOTION_REQUIRED"));
});

test("test to staging requires platform controls but may remain production blocked",()=>{
 const d=decideEnvironmentPromotion({
  from:"test",to:"staging",commitSha:"a".repeat(40),releaseEvidenceDecision:"CI_BASELINE_PASS_PRODUCTION_BLOCKED",
  testsGreen:true,typecheckGreen:true,contractsGreen:true,migrationsGreen:true,openReleaseBlockers:12,
  dedicatedSecurityExecution:"NOT_RUN",rollbackPlanPresent:true,workloadIdentityReady:true,observabilityReady:true,secretsReady:true
 });
 assert.equal(d.allowed,true);
 assert.equal(d.productionSigningEnabled,false);
 assert.equal(d.productionAssetMovementEnabled,false);
});

test("production promotion requires production-candidate evidence and zero blockers",()=>{
 const d=decideEnvironmentPromotion({
  from:"staging",to:"production",commitSha:"a".repeat(40),releaseEvidenceDecision:"STAGING_GATE_PASS_PRODUCTION_BLOCKED",
  testsGreen:true,typecheckGreen:true,contractsGreen:true,migrationsGreen:true,openReleaseBlockers:1,
  dedicatedSecurityExecution:"COMPLETE",rollbackPlanPresent:true,workloadIdentityReady:true,observabilityReady:true,secretsReady:true
 });
 assert.equal(d.allowed,false);
 assert.ok(d.reasons.includes("PRODUCTION_CANDIDATE_EVIDENCE_REQUIRED"));
 assert.ok(d.reasons.includes("OPEN_RELEASE_BLOCKERS"));
});

test("even an allowed production promotion does not itself enable signing or asset movement",()=>{
 const d=decideEnvironmentPromotion({
  from:"staging",to:"production",commitSha:"a".repeat(40),releaseEvidenceDecision:"PRODUCTION_CANDIDATE",
  testsGreen:true,typecheckGreen:true,contractsGreen:true,migrationsGreen:true,openReleaseBlockers:0,
  dedicatedSecurityExecution:"COMPLETE",rollbackPlanPresent:true,workloadIdentityReady:true,observabilityReady:true,secretsReady:true
 });
 assert.equal(d.allowed,true);
 assert.equal(d.requiresManualReleaseApproval,true);
 assert.equal(d.productionSigningEnabled,false);
 assert.equal(d.productionAssetMovementEnabled,false);
});
