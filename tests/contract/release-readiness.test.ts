import test from "node:test";
import assert from "node:assert/strict";
import {assertNoImplicitActivation,evaluateReleaseReadiness} from "../../packages/service-host/src/release-readiness.js";

const completeGates={
 contract:"COMPLETE",controlPlane:"COMPLETE",signing:"COMPLETE",execution:"COMPLETE",recovery:"COMPLETE",
 sael:"COMPLETE",security:"COMPLETE",mobile:"COMPLETE",infrastructure:"COMPLETE",pilot:"BLOCKED"
} as const;

const pilot={
 controlledCohortDefined:true,cohortSize:25,rollbackReady:true,supportReady:true,telemetryReady:true,
 privacyReviewComplete:true,incidentResponseReady:true,transactionSuccessNonRegression:true,
 recoverabilityNonRegression:true,securityControlAccessNonRegression:true,unresolvedSeverity1Incidents:0
};

test("all pre-pilot gates and pilot evidence produce pilot candidate",()=>{
 const d=evaluateReleaseReadiness({
  gates:completeGates,openBlockers:[],pilotEvidence:pilot,
  productionCandidateReleaseEvidence:false,manualFinalReleaseApproval:false,
  productionSigningRequested:false,productionAssetMovementRequested:false
 });
 assert.equal(d.decision,"PILOT_CANDIDATE");
 assert.equal(d.pilotReady,true);
 assert.equal(d.productionReleaseReady,false);
 assert.equal(assertNoImplicitActivation(d),true);
});

test("open developer blockers prevent pilot candidacy",()=>{
 const d=evaluateReleaseReadiness({
  gates:completeGates,openBlockers:["DEV-OPEN-001"],pilotEvidence:pilot,
  productionCandidateReleaseEvidence:false,manualFinalReleaseApproval:false,
  productionSigningRequested:false,productionAssetMovementRequested:false
 });
 assert.equal(d.decision,"REPOSITORY_BASELINE_PASS_PRODUCTION_BLOCKED");
 assert.ok(d.reasons.includes("OPEN_BLOCKERS"));
});

test("blocked signing gate prevents pilot candidacy",()=>{
 const d=evaluateReleaseReadiness({
  gates:{...completeGates,signing:"BLOCKED"},openBlockers:[],pilotEvidence:pilot,
  productionCandidateReleaseEvidence:false,manualFinalReleaseApproval:false,
  productionSigningRequested:false,productionAssetMovementRequested:false
 });
 assert.equal(d.pilotReady,false);
 assert.ok(d.blockingGates.includes("signing"));
});

test("pilot readiness requires rollback support privacy and incident response",()=>{
 const d=evaluateReleaseReadiness({
  gates:completeGates,openBlockers:[],pilotEvidence:{...pilot,rollbackReady:false,supportReady:false,privacyReviewComplete:false,incidentResponseReady:false},
  productionCandidateReleaseEvidence:false,manualFinalReleaseApproval:false,
  productionSigningRequested:false,productionAssetMovementRequested:false
 });
 assert.equal(d.pilotReady,false);
 assert.ok(d.reasons.includes("PILOT_ROLLBACK_REQUIRED"));
 assert.ok(d.reasons.includes("PILOT_SUPPORT_REQUIRED"));
 assert.ok(d.reasons.includes("PILOT_PRIVACY_REVIEW_REQUIRED"));
 assert.ok(d.reasons.includes("PILOT_INCIDENT_RESPONSE_REQUIRED"));
});

test("production release candidate requires completed pilot gate release evidence and manual approval",()=>{
 const d=evaluateReleaseReadiness({
  gates:{...completeGates,pilot:"COMPLETE"},openBlockers:[],pilotEvidence:pilot,
  productionCandidateReleaseEvidence:true,manualFinalReleaseApproval:true,
  productionSigningRequested:false,productionAssetMovementRequested:false
 });
 assert.equal(d.decision,"PRODUCTION_RELEASE_CANDIDATE");
 assert.equal(d.productionReleaseReady,true);
 assert.equal(d.productionSigningEnabled,false);
 assert.equal(d.productionAssetMovementEnabled,false);
});

test("release candidacy never implicitly enables signing or asset movement",()=>{
 const d=evaluateReleaseReadiness({
  gates:{...completeGates,pilot:"COMPLETE"},openBlockers:[],pilotEvidence:pilot,
  productionCandidateReleaseEvidence:true,manualFinalReleaseApproval:true,
  productionSigningRequested:true,productionAssetMovementRequested:true
 });
 assert.equal(d.decision,"PRODUCTION_RELEASE_CANDIDATE");
 assert.equal(d.productionSigningEnabled,false);
 assert.equal(d.productionAssetMovementEnabled,false);
 assert.ok(d.reasons.includes("SIGNING_ENABLEMENT_REQUIRES_SEPARATE_ACTIVATION"));
 assert.ok(d.reasons.includes("ASSET_MOVEMENT_REQUIRES_SEPARATE_ACTIVATION"));
});
