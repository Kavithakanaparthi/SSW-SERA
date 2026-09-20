import type {DeploymentEnvironment} from "./environment-controls.js";
import type {DeploymentManifest} from "./deployment-manifest.js";
import {validateDeploymentManifest} from "./deployment-manifest.js";

export type DeploymentGateDecision=
 "REPOSITORY_BASELINE_PASS_PROVIDER_BINDING_BLOCKED"|
 "STAGING_DEPLOYMENT_PASS_PRODUCTION_BLOCKED"|
 "PRODUCTION_DEPLOYMENT_CANDIDATE";

export interface DeploymentEvidenceInput{
 environment:DeploymentEnvironment;
 commitSha:string;
 manifest:DeploymentManifest;
 providerBindingComplete:boolean;
 providerPlanGenerated:boolean;
 providerPlanNoInlineSecrets:boolean;
 trustZoneNetworkMapVerified:boolean;
 workloadIdentityBound:boolean;
 observabilityBound:boolean;
 secretProviderBound:boolean;
 datastoreEncryptionVerified:boolean;
 backupPoliciesVerified:boolean;
 stagingDeploymentExecuted:boolean;
 healthChecksPassed:boolean;
 rollbackExecuted:boolean;
 driftCheckPassed:boolean;
 openDeploymentBlockers:string[];
 productionCandidateReleaseEvidence:boolean;
 dedicatedSecurityExecutionComplete:boolean;
 manualDeploymentApproval:boolean;
}

export interface DeploymentEvidence{
 schema:"ssw.deployment-evidence.v1";
 environment:DeploymentEnvironment;
 commitSha:string;
 manifestValid:boolean;
 controls:{
  providerBindingComplete:boolean;
  providerPlanGenerated:boolean;
  providerPlanNoInlineSecrets:boolean;
  trustZoneNetworkMapVerified:boolean;
  workloadIdentityBound:boolean;
  observabilityBound:boolean;
  secretProviderBound:boolean;
  datastoreEncryptionVerified:boolean;
  backupPoliciesVerified:boolean;
  stagingDeploymentExecuted:boolean;
  healthChecksPassed:boolean;
  rollbackExecuted:boolean;
  driftCheckPassed:boolean;
 };
 openDeploymentBlockers:string[];
 decision:DeploymentGateDecision;
 productionSigningEnabled:false;
 productionAssetMovementEnabled:false;
 reasons:string[];
}

export function buildDeploymentEvidence(input:DeploymentEvidenceInput):DeploymentEvidence{
 const reasons:string[]=[];
 const mv=validateDeploymentManifest(input.manifest);
 if(!mv.valid)reasons.push(...mv.errors.map(e=>"MANIFEST_"+e));
 if(input.manifest.environment!==input.environment)reasons.push("ENVIRONMENT_MANIFEST_MISMATCH");
 if(!input.providerPlanGenerated)reasons.push("PROVIDER_PLAN_REQUIRED");
 if(!input.providerPlanNoInlineSecrets)reasons.push("INLINE_SECRET_CHECK_REQUIRED");
 if(!input.trustZoneNetworkMapVerified)reasons.push("TRUST_ZONE_NETWORK_VERIFICATION_REQUIRED");
 if(!input.workloadIdentityBound)reasons.push("WORKLOAD_IDENTITY_BINDING_REQUIRED");
 if(!input.observabilityBound)reasons.push("OBSERVABILITY_BINDING_REQUIRED");
 if(!input.secretProviderBound)reasons.push("SECRET_PROVIDER_BINDING_REQUIRED");
 if(!input.datastoreEncryptionVerified)reasons.push("DATASTORE_ENCRYPTION_EVIDENCE_REQUIRED");
 if(!input.backupPoliciesVerified)reasons.push("BACKUP_POLICY_EVIDENCE_REQUIRED");
 if(input.openDeploymentBlockers.length>0)reasons.push("OPEN_DEPLOYMENT_BLOCKERS");

 let decision:DeploymentGateDecision="REPOSITORY_BASELINE_PASS_PROVIDER_BINDING_BLOCKED";

 if(input.environment==="staging"){
  if(!input.providerBindingComplete)reasons.push("PROVIDER_BINDING_REQUIRED");
  if(!input.stagingDeploymentExecuted)reasons.push("STAGING_DEPLOYMENT_REQUIRED");
  if(!input.healthChecksPassed)reasons.push("HEALTH_CHECKS_REQUIRED");
  if(!input.rollbackExecuted)reasons.push("ROLLBACK_DRILL_REQUIRED");
  if(!input.driftCheckPassed)reasons.push("DRIFT_CHECK_REQUIRED");

  const stagingReady=reasons.length===0;
  decision=stagingReady?"STAGING_DEPLOYMENT_PASS_PRODUCTION_BLOCKED":"REPOSITORY_BASELINE_PASS_PROVIDER_BINDING_BLOCKED";
 }

 if(input.environment==="production"){
  if(!input.providerBindingComplete)reasons.push("PROVIDER_BINDING_REQUIRED");
  if(!input.stagingDeploymentExecuted)reasons.push("STAGING_DEPLOYMENT_REQUIRED");
  if(!input.healthChecksPassed)reasons.push("HEALTH_CHECKS_REQUIRED");
  if(!input.rollbackExecuted)reasons.push("ROLLBACK_DRILL_REQUIRED");
  if(!input.driftCheckPassed)reasons.push("DRIFT_CHECK_REQUIRED");
  if(!input.productionCandidateReleaseEvidence)reasons.push("PRODUCTION_CANDIDATE_RELEASE_EVIDENCE_REQUIRED");
  if(!input.dedicatedSecurityExecutionComplete)reasons.push("DEDICATED_SECURITY_EXECUTION_REQUIRED");
  if(!input.manualDeploymentApproval)reasons.push("MANUAL_DEPLOYMENT_APPROVAL_REQUIRED");

  const productionReady=reasons.length===0;
  decision=productionReady?"PRODUCTION_DEPLOYMENT_CANDIDATE":"REPOSITORY_BASELINE_PASS_PROVIDER_BINDING_BLOCKED";
 }

 return{
  schema:"ssw.deployment-evidence.v1",
  environment:input.environment,
  commitSha:input.commitSha,
  manifestValid:mv.valid,
  controls:{
   providerBindingComplete:input.providerBindingComplete,
   providerPlanGenerated:input.providerPlanGenerated,
   providerPlanNoInlineSecrets:input.providerPlanNoInlineSecrets,
   trustZoneNetworkMapVerified:input.trustZoneNetworkMapVerified,
   workloadIdentityBound:input.workloadIdentityBound,
   observabilityBound:input.observabilityBound,
   secretProviderBound:input.secretProviderBound,
   datastoreEncryptionVerified:input.datastoreEncryptionVerified,
   backupPoliciesVerified:input.backupPoliciesVerified,
   stagingDeploymentExecuted:input.stagingDeploymentExecuted,
   healthChecksPassed:input.healthChecksPassed,
   rollbackExecuted:input.rollbackExecuted,
   driftCheckPassed:input.driftCheckPassed
  },
  openDeploymentBlockers:[...input.openDeploymentBlockers].sort(),
  decision,
  productionSigningEnabled:false,
  productionAssetMovementEnabled:false,
  reasons:[...new Set(reasons)].sort()
 };
}

export function canCloseProductionDeploymentGate(evidence:DeploymentEvidence){
 return evidence.decision==="PRODUCTION_DEPLOYMENT_CANDIDATE"&&
  evidence.openDeploymentBlockers.length===0&&
  evidence.productionSigningEnabled===false&&
  evidence.productionAssetMovementEnabled===false;
}
