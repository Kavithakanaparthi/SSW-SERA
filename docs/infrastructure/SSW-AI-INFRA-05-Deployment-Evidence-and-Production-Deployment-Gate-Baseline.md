# SSW-AI-INFRA-05: Deployment Evidence & Production Deployment Gate Baseline

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-INFRA-05  
**Status:** Controlled Infrastructure Baseline — IN PROGRESS  
**Date:** 2026-09-20  
**Parent:** SSW-AI-INFRA-04  
**Normative Inputs:** DB15, PROD-08, INFRA-01 through INFRA-04

## 1. Purpose

INFRA-05 defines the evidence required to distinguish:

- a valid repository deployment manifest;
- a provider-specific infrastructure plan;
- a successful staging deployment;
- a production-deployment candidate.

These are not interchangeable states.

## 2. Governing Rule

`A VALID PLAN IS NOT A DEPLOYMENT. A DEPLOYMENT IS NOT A PRODUCTION RELEASE.`

## 3. Deployment Evidence Contract

The controlled baseline records:

- environment;
- commit SHA;
- manifest validity;
- provider binding state;
- provider plan generation;
- inline-secret verification;
- trust-zone/network verification;
- workload identity binding;
- observability binding;
- secret-provider binding;
- datastore encryption evidence;
- backup-policy evidence;
- staging deployment execution;
- health checks;
- rollback drill;
- drift check;
- open deployment blockers;
- production-candidate release evidence;
- dedicated security execution;
- manual deployment approval.

## 4. Gate Decisions

Canonical decisions:

- `REPOSITORY_BASELINE_PASS_PROVIDER_BINDING_BLOCKED`;
- `STAGING_DEPLOYMENT_PASS_PRODUCTION_BLOCKED`;
- `PRODUCTION_DEPLOYMENT_CANDIDATE`.

None of these decisions enables wallet signing or asset movement.

## 5. Staging Deployment Gate

A staging pass requires:

- valid deployment manifest;
- provider binding complete;
- provider plan generated;
- no inline secrets;
- trust-zone/network verification;
- workload identity bound;
- observability bound;
- secret provider bound;
- datastore encryption verified;
- backup policies verified;
- staging deployment executed;
- health checks passed;
- rollback drill executed;
- drift check passed;
- zero open deployment blockers.

A successful staging deployment still remains production blocked.

## 6. Production Deployment Candidate

A production deployment candidate requires all staging evidence plus:

- PRODUCTION_CANDIDATE release evidence from the release gate;
- dedicated staging security execution COMPLETE;
- manual deployment approval;
- zero deployment blockers.

This produces an infrastructure deployment candidate only.

Signing, execution, pilot and final release gates remain separate.

## 7. Inline Secret Rule

Provider plans/diffs must be checked for secret material.

The evidence package must prove that the deployment plan references secrets rather than embedding values.

## 8. Drift

A staging or production candidate requires drift validation.

Infrastructure drift must be reconciled before the deployment gate can close.

## 9. Rollback

Rollback must be demonstrated, not merely documented.

At minimum the staging environment must prove:

- prior known-good artifact/configuration restoration;
- service health recovery;
- no widening of service authority;
- secret namespace consistency;
- database/state handling consistent with the rollback plan.

## 10. Current Program State

The repository baseline is ready to evaluate provider-specific infrastructure.

The live Production Deployment Gate remains blocked by DEV-OPEN-019 and associated live infrastructure dependencies.

## 11. Next

After INFRA-05 closure, the Phase H repository baseline can be packaged into an Infrastructure Gate evidence package while provider-specific deployment remains developer-owned.
