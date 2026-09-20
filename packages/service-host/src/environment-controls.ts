export type DeploymentEnvironment="development"|"test"|"staging"|"production";

export interface EnvironmentProfile{
 environment:DeploymentEnvironment;
 allowProductionSigning:boolean;
 allowProductionAssetMovement:boolean;
 allowLiveProviders:boolean;
 allowSyntheticData:boolean;
 requireWorkloadIdentity:boolean;
 requireSanitizedObservability:boolean;
 requireReleaseEvidence:boolean;
 requireDedicatedSecurityExecution:boolean;
 databaseNamespace:string;
 secretNamespace:string;
 workloadTrustDomain:string;
 telemetryNamespace:string;
}

export interface PromotionInput{
 from:DeploymentEnvironment;
 to:DeploymentEnvironment;
 commitSha:string;
 releaseEvidenceDecision:"CI_BASELINE_PASS_PRODUCTION_BLOCKED"|"STAGING_GATE_PASS_PRODUCTION_BLOCKED"|"PRODUCTION_CANDIDATE";
 testsGreen:boolean;
 typecheckGreen:boolean;
 contractsGreen:boolean;
 migrationsGreen:boolean;
 openReleaseBlockers:number;
 dedicatedSecurityExecution:"NOT_RUN"|"PARTIAL"|"COMPLETE";
 rollbackPlanPresent:boolean;
 workloadIdentityReady:boolean;
 observabilityReady:boolean;
 secretsReady:boolean;
}

export interface PromotionDecision{
 allowed:boolean;
 reasons:string[];
 requiresManualReleaseApproval:boolean;
 productionAssetMovementEnabled:false;
 productionSigningEnabled:false;
}

const rank:Record<DeploymentEnvironment,number>={development:0,test:1,staging:2,production:3};

export function validateEnvironmentProfile(profile:EnvironmentProfile){
 const errors:string[]=[];
 if(!profile.databaseNamespace.trim())errors.push("DATABASE_NAMESPACE_REQUIRED");
 if(!profile.secretNamespace.trim())errors.push("SECRET_NAMESPACE_REQUIRED");
 if(!profile.workloadTrustDomain.trim())errors.push("WORKLOAD_TRUST_DOMAIN_REQUIRED");
 if(!profile.telemetryNamespace.trim())errors.push("TELEMETRY_NAMESPACE_REQUIRED");

 if(profile.environment!=="production"&&profile.allowProductionSigning)errors.push("NON_PRODUCTION_SIGNING_PROHIBITED");
 if(profile.environment!=="production"&&profile.allowProductionAssetMovement)errors.push("NON_PRODUCTION_ASSET_MOVEMENT_PROHIBITED");
 if(profile.environment==="production"&&profile.allowSyntheticData)errors.push("PRODUCTION_SYNTHETIC_DATA_PROHIBITED");
 if((profile.environment==="staging"||profile.environment==="production")&&!profile.requireWorkloadIdentity)errors.push("WORKLOAD_IDENTITY_REQUIRED");
 if((profile.environment==="staging"||profile.environment==="production")&&!profile.requireSanitizedObservability)errors.push("SANITIZED_OBSERVABILITY_REQUIRED");
 if((profile.environment==="staging"||profile.environment==="production")&&!profile.requireReleaseEvidence)errors.push("RELEASE_EVIDENCE_REQUIRED");

 return{valid:errors.length===0,errors};
}

export function decideEnvironmentPromotion(input:PromotionInput):PromotionDecision{
 const reasons:string[]=[];
 if(rank[input.to]!==rank[input.from]+1)reasons.push("SEQUENTIAL_PROMOTION_REQUIRED");
 if(!input.testsGreen)reasons.push("TESTS_NOT_GREEN");
 if(!input.typecheckGreen)reasons.push("TYPECHECK_NOT_GREEN");
 if(!input.contractsGreen)reasons.push("CONTRACTS_NOT_GREEN");
 if(!input.migrationsGreen)reasons.push("MIGRATIONS_NOT_GREEN");
 if(!input.rollbackPlanPresent)reasons.push("ROLLBACK_PLAN_REQUIRED");

 if(input.to==="staging"){
  if(input.releaseEvidenceDecision==="CI_BASELINE_PASS_PRODUCTION_BLOCKED"){
   // CI evidence is sufficient to enter staging, but not to leave it.
  }
  if(!input.workloadIdentityReady)reasons.push("WORKLOAD_IDENTITY_REQUIRED");
  if(!input.observabilityReady)reasons.push("OBSERVABILITY_REQUIRED");
  if(!input.secretsReady)reasons.push("SECRETS_REQUIRED");
 }

 if(input.to==="production"){
  if(input.releaseEvidenceDecision!=="PRODUCTION_CANDIDATE")reasons.push("PRODUCTION_CANDIDATE_EVIDENCE_REQUIRED");
  if(input.openReleaseBlockers!==0)reasons.push("OPEN_RELEASE_BLOCKERS");
  if(input.dedicatedSecurityExecution!=="COMPLETE")reasons.push("DEDICATED_SECURITY_EXECUTION_REQUIRED");
  if(!input.workloadIdentityReady)reasons.push("WORKLOAD_IDENTITY_REQUIRED");
  if(!input.observabilityReady)reasons.push("OBSERVABILITY_REQUIRED");
  if(!input.secretsReady)reasons.push("SECRETS_REQUIRED");
 }

 return{
  allowed:reasons.length===0,
  reasons:[...new Set(reasons)].sort(),
  requiresManualReleaseApproval:input.to==="production",
  productionAssetMovementEnabled:false,
  productionSigningEnabled:false
 };
}

export function assertEnvironmentIsolation(profiles:readonly EnvironmentProfile[]){
 const seen=new Map<string,DeploymentEnvironment>();
 const fields:(keyof Pick<EnvironmentProfile,"databaseNamespace"|"secretNamespace"|"telemetryNamespace">)[]=["databaseNamespace","secretNamespace","telemetryNamespace"];
 for(const p of profiles){
  const v=validateEnvironmentProfile(p);
  if(!v.valid)throw new Error("ENVIRONMENT_PROFILE_INVALID:"+v.errors.join(","));
  for(const field of fields){
   const key=String(p[field]);
   const prev=seen.get(field+":"+key);
   if(prev&&prev!==p.environment)throw new Error("ENVIRONMENT_NAMESPACE_COLLISION:"+field);
   seen.set(field+":"+key,p.environment);
  }
 }
 return true;
}

export function productionSafeDefaults(environment:DeploymentEnvironment):EnvironmentProfile{
 const production=environment==="production";
 const controlled=environment==="staging"||production;
 return{
  environment,
  allowProductionSigning:false,
  allowProductionAssetMovement:false,
  allowLiveProviders:controlled,
  allowSyntheticData:!production,
  requireWorkloadIdentity:controlled,
  requireSanitizedObservability:controlled,
  requireReleaseEvidence:controlled,
  requireDedicatedSecurityExecution:production,
  databaseNamespace:`ssw_sera_${environment}`,
  secretNamespace:`ssw-sera/${environment}`,
  workloadTrustDomain:`${environment}.ssw.soulverse.internal`,
  telemetryNamespace:`ssw-sera-${environment}`
 };
}
