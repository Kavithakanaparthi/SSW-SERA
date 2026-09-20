export type GateState="COMPLETE"|"BLOCKED"|"NOT_GATED";
export type ReleaseDecision=
 "REPOSITORY_BASELINE_PASS_PRODUCTION_BLOCKED"|
 "PILOT_CANDIDATE"|
 "PRODUCTION_RELEASE_CANDIDATE";

export interface GateSnapshot{
 contract:GateState;
 controlPlane:GateState;
 signing:GateState;
 execution:GateState;
 recovery:GateState;
 sael:GateState;
 security:GateState;
 mobile:GateState;
 infrastructure:GateState;
 pilot:GateState;
}

export interface PilotEvidence{
 controlledCohortDefined:boolean;
 cohortSize:number;
 rollbackReady:boolean;
 supportReady:boolean;
 telemetryReady:boolean;
 privacyReviewComplete:boolean;
 incidentResponseReady:boolean;
 transactionSuccessNonRegression:boolean;
 recoverabilityNonRegression:boolean;
 securityControlAccessNonRegression:boolean;
 unresolvedSeverity1Incidents:number;
}

export interface ReleaseReadinessInput{
 gates:GateSnapshot;
 openBlockers:string[];
 pilotEvidence:PilotEvidence;
 productionCandidateReleaseEvidence:boolean;
 manualFinalReleaseApproval:boolean;
 productionSigningRequested:boolean;
 productionAssetMovementRequested:boolean;
}

export interface ReleaseReadinessDecision{
 decision:ReleaseDecision;
 pilotReady:boolean;
 productionReleaseReady:boolean;
 productionSigningEnabled:false;
 productionAssetMovementEnabled:false;
 reasons:string[];
 blockingGates:string[];
}

const prePilotGates:(keyof GateSnapshot)[]=[
 "contract","controlPlane","signing","execution","recovery","sael","security","mobile","infrastructure"
];

export function evaluateReleaseReadiness(input:ReleaseReadinessInput):ReleaseReadinessDecision{
 const reasons:string[]=[];
 const blockingGates:string[]=[];

 for(const gate of prePilotGates){
  if(input.gates[gate]!=="COMPLETE"){
   blockingGates.push(gate);
   reasons.push("GATE_NOT_COMPLETE:"+gate);
  }
 }

 if(input.openBlockers.length>0)reasons.push("OPEN_BLOCKERS");

 const p=input.pilotEvidence;
 if(!p.controlledCohortDefined)reasons.push("PILOT_COHORT_REQUIRED");
 if(p.cohortSize<1)reasons.push("PILOT_COHORT_SIZE_INVALID");
 if(!p.rollbackReady)reasons.push("PILOT_ROLLBACK_REQUIRED");
 if(!p.supportReady)reasons.push("PILOT_SUPPORT_REQUIRED");
 if(!p.telemetryReady)reasons.push("PILOT_TELEMETRY_REQUIRED");
 if(!p.privacyReviewComplete)reasons.push("PILOT_PRIVACY_REVIEW_REQUIRED");
 if(!p.incidentResponseReady)reasons.push("PILOT_INCIDENT_RESPONSE_REQUIRED");
 if(!p.transactionSuccessNonRegression)reasons.push("PILOT_TRANSACTION_NON_REGRESSION_REQUIRED");
 if(!p.recoverabilityNonRegression)reasons.push("PILOT_RECOVERABILITY_NON_REGRESSION_REQUIRED");
 if(!p.securityControlAccessNonRegression)reasons.push("PILOT_SECURITY_ACCESS_NON_REGRESSION_REQUIRED");
 if(p.unresolvedSeverity1Incidents>0)reasons.push("PILOT_SEV1_INCIDENT_OPEN");

 const pilotReady=blockingGates.length===0&&input.openBlockers.length===0&&reasons.length===0;

 let productionReleaseReady=pilotReady&&
  input.gates.pilot==="COMPLETE"&&
  input.productionCandidateReleaseEvidence&&
  input.manualFinalReleaseApproval;

 if(input.gates.pilot!=="COMPLETE")reasons.push("PILOT_GATE_NOT_COMPLETE");
 if(!input.productionCandidateReleaseEvidence)reasons.push("PRODUCTION_CANDIDATE_RELEASE_EVIDENCE_REQUIRED");
 if(!input.manualFinalReleaseApproval)reasons.push("MANUAL_FINAL_RELEASE_APPROVAL_REQUIRED");

 if(input.productionSigningRequested)reasons.push("SIGNING_ENABLEMENT_REQUIRES_SEPARATE_ACTIVATION");
 if(input.productionAssetMovementRequested)reasons.push("ASSET_MOVEMENT_REQUIRES_SEPARATE_ACTIVATION");

 const decision:ReleaseDecision=productionReleaseReady?
  "PRODUCTION_RELEASE_CANDIDATE":
  pilotReady?"PILOT_CANDIDATE":"REPOSITORY_BASELINE_PASS_PRODUCTION_BLOCKED";

 return{
  decision,
  pilotReady,
  productionReleaseReady,
  productionSigningEnabled:false,
  productionAssetMovementEnabled:false,
  reasons:[...new Set(reasons)].sort(),
  blockingGates:[...new Set(blockingGates)].sort()
 };
}

export function assertNoImplicitActivation(decision:ReleaseReadinessDecision){
 if(decision.productionSigningEnabled!==false)throw new Error("IMPLICIT_SIGNING_ACTIVATION_PROHIBITED");
 if(decision.productionAssetMovementEnabled!==false)throw new Error("IMPLICIT_ASSET_MOVEMENT_PROHIBITED");
 return true;
}
