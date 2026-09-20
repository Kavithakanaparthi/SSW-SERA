# SSW-AI-PROD-08: Staging Security Gate & Release Evidence

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-PROD-08  
**Status:** Controlled Productionization Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-PROD-07

## 1. Purpose

PROD-08 establishes a machine-readable release-evidence gate that prevents a green repository build from being confused with production approval.

The governing rule is:

> Passing CI proves the tested repository baseline. It does not erase unresolved production dependencies.

## 2. Release Evidence Contract

Every qualifying CI/staging run can generate:

`ssw.release-evidence.v1`

The record binds:

- repository;
- commit SHA;
- branch;
- environment;
- workflow run identity;
- migration/scaffold/contract/test/typecheck results;
- executed test counts;
- security-manifest coverage;
- staging attack-execution state;
- open developer/infrastructure blockers;
- production-gate statuses;
- release decision;
- evidence hash.

## 3. Decisions

Canonical release-evidence decisions:

- CI_BASELINE_PASS_PRODUCTION_BLOCKED
- STAGING_GATE_PASS_PRODUCTION_BLOCKED
- PRODUCTION_CANDIDATE

The current SSW-SERA program remains blocked from production by open developer integrations and unclosed production gates.

## 4. Security Manifest

The controlled IMP-16 security manifest remains the minimum required attack/control inventory.

PROD-08 records:

- required security case IDs;
- source-manifest coverage;
- whether a dedicated deployed-staging attack execution has run.

A source-level test suite is not represented as a deployed-staging penetration/security exercise.

## 5. Blocker Registry

Machine-readable release blockers are maintained in:

`config/release-blockers.v1.json`

This includes developer handoff items and remaining infrastructure/product gates.

A blocker may be removed only when its completion evidence is recorded.

## 6. CI Evidence

Normal pushes/pull requests generate CI evidence.

The same workflow may be manually dispatched in STAGING mode after a staging environment exists.

## 7. Artifact Handling

Release evidence is uploaded as a GitHub Actions artifact.

The workflow remains read-only.

No release-evidence step may modify repository contents or enable signing/execution.

## 8. Production Candidate Rule

A run may be labeled PRODUCTION_CANDIDATE only when:

- environment is STAGING;
- repository verification is fully green;
- dedicated staging attack execution is COMPLETE;
- no release blocker remains;
- all production gate statuses are COMPLETE.

PROD-08 does not itself authorize production.

## 9. Next Program Direction

After PROD-08, infrastructure/product work continues against the explicit blockers and Phase E/F implementation plan.

Production signing, production asset movement, pilot and final release remain separately gated.
