# SSW-AI-INFRA-03: Environment Separation & Promotion Controls

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-INFRA-03  
**Status:** Controlled Infrastructure Baseline — IN PROGRESS  
**Date:** 2026-09-20  
**Parent:** SSW-AI-INFRA-02  
**Normative Inputs:** SSW-SERA-DB15, SSW-AI-PROD-08

## 1. Purpose

INFRA-03 defines machine-enforced separation between development, test, staging and production environments.

The governing rule is:

`PROMOTION MOVES VERIFIED SOFTWARE; IT DOES NOT MOVE TRUST, SECRETS OR AUTHORITY BY ACCIDENT.`

## 2. Environments

Controlled environments:

- development;
- test;
- staging;
- production.

Promotion is sequential only:

`development -> test -> staging -> production`

Stage skipping is prohibited.

## 3. Environment Isolation

Every environment receives distinct:

- database namespace;
- secret namespace;
- workload trust domain;
- telemetry namespace.

Namespace reuse across environments fails closed.

Provider credentials, workload identities and database credentials are environment-specific.

## 4. Signing and Asset Movement

Repository defaults keep:

- production signing disabled;
- production asset movement disabled.

Environment promotion does not itself enable either capability.

Those remain separately controlled by signing, execution, pilot and release gates.

## 5. Development and Test

Development and test may use:

- synthetic fixtures;
- mocks;
- emulators;
- non-production provider endpoints.

They may not use production signing or production asset movement.

## 6. Staging

Staging requires:

- green tests;
- green contracts;
- green migrations;
- green typecheck;
- rollback plan;
- workload identity;
- sanitized observability;
- controlled secret binding.

CI evidence may be sufficient to promote a tested build into staging even while production blockers remain open.

Staging must not be represented as production approval.

## 7. Production Promotion

Production promotion requires:

- sequential staging origin;
- `PRODUCTION_CANDIDATE` release evidence;
- zero release blockers;
- dedicated staging security execution COMPLETE;
- workload identity ready;
- observability ready;
- secrets ready;
- rollback plan;
- manual release approval.

Even then, the promotion decision does not independently enable wallet signing or asset movement.

## 8. Synthetic Data

Production rejects synthetic/test data mode.

Test fixtures and production holder state must never share a namespace.

## 9. Workload Identity

Staging and production require controlled workload identity.

Each environment uses a distinct trust domain so a development/test workload credential cannot authenticate as a staging/production service merely by network reachability.

## 10. Observability

Staging and production require the INFRA-02 sanitized observability contract.

Telemetry namespaces remain environment-specific.

## 11. Secret Management

INFRA-03 defines separation semantics only.

Actual production secret-provider binding remains developer/platform-owned.

Secrets are never copied from one environment merely because an application build is promoted.

## 12. Promotion Evidence

Every promotion should record:

- source environment;
- target environment;
- commit SHA;
- release evidence reference;
- test/contract/migration/typecheck status;
- blocker count;
- security execution state;
- rollback plan reference;
- workload/observability/secrets readiness;
- approver for production.

## 13. Rollback

Rollback must be possible without sharing state backwards across trust boundaries.

Production rollback uses production-safe prior artifacts/configuration.

Production state is never copied into development/test as a rollback mechanism.

## 14. Next

After INFRA-03 closure, Phase H should package these infrastructure baselines into reproducible infrastructure-as-code and deployment manifests.
