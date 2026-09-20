import test from "node:test";
import assert from "node:assert/strict";
import {decideRollback,decideRollout} from "../../packages/ssw-capability-adapters/src/mobile-migration.js";

const evidence={
 functionalParity:true,intentAccuracy:true,transactionSafety:true,privacy:true,trustRevBinding:true,recovery:true,evidence:true,accessibility:true,performance:true,supportability:true,
 m2TransactionSuccessNonRegression:true,m2RecoverabilityNonRegression:true,m2ComprehensionNonRegression:true,m2SecurityAccessNonRegression:true,m2SupportabilityNonRegression:true
};

test("M3 requires all release gates and M2 non-regression evidence",()=>{
 const d=decideRollout({currentStage:"M2",requestedStage:"M3",releaseStep:"R4",cohortPercent:10,explicitOptIn:true,productionSigningEnabled:false,evidence,seraAvailable:true,fallbackSuccessRate:.999,crashFreeSessionRate:.999,transactionSuccessRate:.99,baselineTransactionSuccessRate:.99,unresolvedCriticalIncidents:0});
 assert.equal(d.allowed,true);
 assert.equal(d.seraPrimaryHomeAllowed,true);
});

test("M3 is blocked when M2 recoverability regresses",()=>{
 const d=decideRollout({currentStage:"M2",requestedStage:"M3",releaseStep:"R4",cohortPercent:10,explicitOptIn:true,productionSigningEnabled:false,evidence:{...evidence,m2RecoverabilityNonRegression:false},seraAvailable:true,fallbackSuccessRate:.999,crashFreeSessionRate:.999,transactionSuccessRate:.99,baselineTransactionSuccessRate:.99,unresolvedCriticalIncidents:0});
 assert.equal(d.allowed,false);
 assert.ok(d.reasons.includes("M2_NON_REGRESSION_EVIDENCE_REQUIRED"));
});

test("M4 delegation requires production signing and R6",()=>{
 const d=decideRollout({currentStage:"M3",requestedStage:"M4",releaseStep:"R5",cohortPercent:5,explicitOptIn:true,productionSigningEnabled:false,evidence,seraAvailable:true,fallbackSuccessRate:.999,crashFreeSessionRate:.999,transactionSuccessRate:.99,baselineTransactionSuccessRate:.99,unresolvedCriticalIncidents:0});
 assert.equal(d.allowed,false);
 assert.ok(d.reasons.includes("PRODUCTION_SIGNING_REQUIRED_FOR_DELEGATION"));
 assert.ok(d.reasons.includes("DELEGATION_REQUIRES_R6"));
});

test("stage skipping is prohibited",()=>{
 const d=decideRollout({currentStage:"M1",requestedStage:"M3",releaseStep:"R4",cohortPercent:5,explicitOptIn:true,productionSigningEnabled:false,evidence,seraAvailable:true,fallbackSuccessRate:.999,crashFreeSessionRate:.999,transactionSuccessRate:.99,baselineTransactionSuccessRate:.99,unresolvedCriticalIncidents:0});
 assert.equal(d.allowed,false);
 assert.ok(d.reasons.includes("STAGE_SKIP_PROHIBITED"));
});

test("transaction regression forces conventional-wallet rollback",()=>{
 const d=decideRollout({currentStage:"M2",requestedStage:"M3",releaseStep:"R4",cohortPercent:10,explicitOptIn:true,productionSigningEnabled:false,evidence,seraAvailable:true,fallbackSuccessRate:.999,crashFreeSessionRate:.999,transactionSuccessRate:.96,baselineTransactionSuccessRate:.99,unresolvedCriticalIncidents:0});
 assert.equal(d.allowed,false);
 assert.equal(d.requiredRollbackMode,"CONVENTIONAL_WALLET");
});

test("control-plane outage degrades to read-only SERA",()=>{
 assert.equal(decideRollback({seraUnavailable:false,controlPlaneUnavailable:true,signerUnavailable:false,externalProviderFailure:false,privacyIncident:false,criticalIncident:false,transactionRegression:false,fallbackFailure:false}),"READ_ONLY_SERA");
});

test("signer outage disables delegation without forcing full SERA shutdown",()=>{
 assert.equal(decideRollback({seraUnavailable:false,controlPlaneUnavailable:false,signerUnavailable:true,externalProviderFailure:false,privacyIncident:false,criticalIncident:false,transactionRegression:false,fallbackFailure:false}),"DISABLE_DELEGATION");
});

test("privacy incident forces conventional wallet",()=>{
 assert.equal(decideRollback({seraUnavailable:false,controlPlaneUnavailable:false,signerUnavailable:false,externalProviderFailure:false,privacyIncident:true,criticalIncident:false,transactionRegression:false,fallbackFailure:false}),"CONVENTIONAL_WALLET");
});
