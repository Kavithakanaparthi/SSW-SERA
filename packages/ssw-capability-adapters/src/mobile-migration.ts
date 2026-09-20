import type {MigrationStage} from "./mobile-shell.js";
export type ReleaseStep="R0"|"R1"|"R2"|"R3"|"R4"|"R5"|"R6";
export type RollbackMode="NONE"|"READ_ONLY_SERA"|"DISABLE_SERA_FIRST"|"DISABLE_PROACTIVE"|"DISABLE_VOICE"|"DISABLE_DELEGATION"|"CONVENTIONAL_WALLET";

export interface MigrationEvidence{
 functionalParity:boolean;
 intentAccuracy:boolean;
 transactionSafety:boolean;
 privacy:boolean;
 trustRevBinding:boolean;
 recovery:boolean;
 evidence:boolean;
 accessibility:boolean;
 performance:boolean;
 supportability:boolean;
 m2TransactionSuccessNonRegression:boolean;
 m2RecoverabilityNonRegression:boolean;
 m2ComprehensionNonRegression:boolean;
 m2SecurityAccessNonRegression:boolean;
 m2SupportabilityNonRegression:boolean;
}

export interface RolloutInput{
 currentStage:MigrationStage;
 requestedStage:MigrationStage;
 releaseStep:ReleaseStep;
 cohortPercent:number;
 explicitOptIn:boolean;
 productionSigningEnabled:boolean;
 evidence:MigrationEvidence;
 seraAvailable:boolean;
 fallbackSuccessRate:number;
 crashFreeSessionRate:number;
 transactionSuccessRate:number;
 baselineTransactionSuccessRate:number;
 unresolvedCriticalIncidents:number;
}

export interface RolloutDecision{
 allowed:boolean;
 effectiveStage:MigrationStage;
 maxCohortPercent:number;
 requiredRollbackMode:RollbackMode;
 seraPrimaryHomeAllowed:boolean;
 delegatedExecutionAllowed:boolean;
 reasons:string[];
}

const stageRank:Record<MigrationStage,number>={M0:0,M1:1,M2:2,M3:3,M4:4};

function allReleaseGates(e:MigrationEvidence){
 return e.functionalParity&&e.intentAccuracy&&e.transactionSafety&&e.privacy&&e.trustRevBinding&&e.recovery&&e.evidence&&e.accessibility&&e.performance&&e.supportability;
}
function m2Evidence(e:MigrationEvidence){
 return e.m2TransactionSuccessNonRegression&&e.m2RecoverabilityNonRegression&&e.m2ComprehensionNonRegression&&e.m2SecurityAccessNonRegression&&e.m2SupportabilityNonRegression;
}

export function decideRollout(input:RolloutInput):RolloutDecision{
 const reasons:string[]=[];
 if(stageRank[input.requestedStage]>stageRank[input.currentStage]+1)reasons.push("STAGE_SKIP_PROHIBITED");
 if(input.cohortPercent<0||input.cohortPercent>100)reasons.push("INVALID_COHORT");
 if(input.unresolvedCriticalIncidents>0)reasons.push("CRITICAL_INCIDENT_OPEN");
 if(input.crashFreeSessionRate<0.99)reasons.push("CRASH_FREE_RATE_BELOW_THRESHOLD");
 if(input.fallbackSuccessRate<0.995)reasons.push("FALLBACK_SUCCESS_BELOW_THRESHOLD");
 if(input.transactionSuccessRate+0.002<input.baselineTransactionSuccessRate)reasons.push("TRANSACTION_SUCCESS_REGRESSION");

 if(input.requestedStage==="M3"){
  if(!m2Evidence(input.evidence))reasons.push("M2_NON_REGRESSION_EVIDENCE_REQUIRED");
  if(!allReleaseGates(input.evidence))reasons.push("RELEASE_GATES_REQUIRED_FOR_M3");
  if(input.releaseStep==="R3"&&!input.explicitOptIn)reasons.push("SERA_FIRST_REQUIRES_OPT_IN_BEFORE_R5");
 }
 if(input.requestedStage==="M4"){
  if(!allReleaseGates(input.evidence))reasons.push("RELEASE_GATES_REQUIRED_FOR_M4");
  if(!input.productionSigningEnabled)reasons.push("PRODUCTION_SIGNING_REQUIRED_FOR_DELEGATION");
  if(input.releaseStep!=="R6")reasons.push("DELEGATION_REQUIRES_R6");
 }

 const rollbackCritical=reasons.includes("CRITICAL_INCIDENT_OPEN")||reasons.includes("FALLBACK_SUCCESS_BELOW_THRESHOLD")||reasons.includes("TRANSACTION_SUCCESS_REGRESSION");
 const rollbackReliability=reasons.includes("CRASH_FREE_RATE_BELOW_THRESHOLD");
 let rollback:RollbackMode="NONE";
 if(rollbackCritical)rollback="CONVENTIONAL_WALLET";
 else if(rollbackReliability)rollback="DISABLE_SERA_FIRST";

 const allowed=reasons.length===0;
 const maxCohort=input.requestedStage==="M1"?100:input.requestedStage==="M2"?25:input.requestedStage==="M3"?(input.releaseStep==="R5"?100:10):5;

 if(input.cohortPercent>maxCohort)reasons.push("COHORT_EXCEEDS_STAGE_LIMIT");

 const finalAllowed=reasons.length===0;
 const primary=finalAllowed&&input.requestedStage==="M3"&&(input.explicitOptIn||input.releaseStep==="R5");
 const delegated=finalAllowed&&input.requestedStage==="M4"&&input.productionSigningEnabled;

 return{
  allowed:finalAllowed,
  effectiveStage:finalAllowed?input.requestedStage:input.currentStage,
  maxCohortPercent:maxCohort,
  requiredRollbackMode:rollback,
  seraPrimaryHomeAllowed:primary,
  delegatedExecutionAllowed:delegated,
  reasons:[...new Set(reasons)].sort()
 };
}

export interface RollbackInput{
 seraUnavailable:boolean;
 controlPlaneUnavailable:boolean;
 signerUnavailable:boolean;
 externalProviderFailure:boolean;
 privacyIncident:boolean;
 criticalIncident:boolean;
 transactionRegression:boolean;
 fallbackFailure:boolean;
}

export function decideRollback(input:RollbackInput):RollbackMode{
 if(input.criticalIncident||input.privacyIncident||input.transactionRegression||input.fallbackFailure)return"CONVENTIONAL_WALLET";
 if(input.seraUnavailable)return"CONVENTIONAL_WALLET";
 if(input.controlPlaneUnavailable)return"READ_ONLY_SERA";
 if(input.signerUnavailable)return"DISABLE_DELEGATION";
 if(input.externalProviderFailure)return"DISABLE_PROACTIVE";
 return"NONE";
}
