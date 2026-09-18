# SSW-AI-IRR-02: Post-Closure Implementation Gate Review

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Review ID:** SSW-AI-IRR-02  
**Status:** Controlled Implementation Gate  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

This review determines whether the SERA-first Soul Super Wallet architecture is sufficiently specified to proceed from architecture and machine-contract definition into repository scaffolding and concrete service implementation.

This review supersedes the open-gap assessment in SSW-AI-IRR-01 where later specifications have closed those items.

## 2. Gate Decision

**GO FOR REPOSITORY SCAFFOLDING AND CONCRETE IMPLEMENTATION**

The architecture, machine schemas, internal API contracts, offline authority profile, deterministic mandate language, attestation profile, recovery profile and counterparty identity profile are now sufficiently defined to begin implementation.

This is not a production-release approval.

It is approval to begin coding against the controlled architecture.

## 3. Core Architecture Baseline

The implementation baseline now includes:

- SSW-AI-01 Platform Capability and Constraint Architecture
- SSW-AI-02 SERA Interaction, Intent and Authority Architecture
- SSW-AI-CF-A01 Candidate Freeze Harmonization Amendment
- SSW-AI-CF-A02 Soul ID-Anchored Wallet & SERA Continuity Amendment
- SCH-01 through SCH-05
- TM-01
- ISC-01 through ISC-06
- API-01
- API-02
- POL-01
- POL-02
- ATT-01
- REC-01
- ID-01

## 4. Canonical Identity Model

The controlling hierarchy is:

```
Holder Soul ID
  ↓ controls / recovers
Soul Super Wallet
  ↓ governs
SERA Agent DID
  ↓ represented by
SERA Runtime
  ↓ executes within
Current Device / Environment
```

Soul Super Wallet is identity-bound, not device-bound.

The Holder Soul ID is the continuity root.

SoulScan facial-biometric recovery restores the Holder Soul ID wallet context on a replacement device.

Device and runtime trust affect execution assurance, not ownership.

## 5. SERA Identity Rule

SERA's Agent DID is subordinate to the Holder DID.

Consequential operation requires the control plane to verify:

- recovered/current Holder DID wallet context;
- valid Holder DID to SERA Agent DID governance binding;
- current runtime representation of that SERA DID;
- authority class;
- risk class;
- policy;
- approval or mandate;
- Trust Protocol;
- REV;
- signing boundary.

SERA key possession alone is not authority.

## 6. Original IRR-01 Gap Closure

### SG-01 Canonical JSON Serialization

**CLOSED**

Closed by ISC-02.

### SG-02 Signing-Gateway Verification

**CLOSED**

Closed by ISC-02.

### SG-03 Runtime Integrity

**CLOSED AT SPECIFICATION LEVEL**

ISC-04 defines runtime identity, sessions and eligibility.

ATT-01 defines concrete attestation profiles and platform-neutral evidence semantics.

### SG-04 Offline Policy Package

**CLOSED**

Closed by POL-01.

Offline consequential operation requires a pre-existing signed, bounded Offline Authorization Package.

### SG-05 Deterministic Condition Language

**CLOSED**

Closed by POL-02.

A4 conditions use DMCL, not natural-language execution logic.

### SG-06 SAEL Write Durability

**CLOSED**

Closed by ISC-05.

### SG-07 Trust Protocol / REV Binding

**CLOSED**

Closed by ISC-03.

### SG-08 Recovery Authorization

**CLOSED AT SPECIFICATION LEVEL**

ISC-06 defines recovery state and authority re-establishment.

REC-01 defines Holder recovery proof and SERA state key-wrapping semantics.

CF-A02 clarifies that Soul ID facial-biometric recovery is the wallet continuity root.

### SG-09 Counterparty Identity

**CLOSED**

Closed by ID-01.

### SG-10 Platform Attestation

**CLOSED AT SPECIFICATION LEVEL**

Closed by ATT-01.

## 7. Machine Contract Readiness

The repository now contains machine-readable contracts for:

- common identifiers and enums;
- Action Contract;
- Delegated Authority Mandate;
- Offline Authorization Package;
- Deterministic Mandate Condition Language;
- Attestation Evidence;
- Recovery Proof;
- Wrapped SERA State Key;
- Counterparty Resolution;
- Internal OpenAPI surface.

These are sufficient to begin generating:

- validators;
- typed models;
- service stubs;
- SDK contracts;
- conformance fixtures.

## 8. Implementation Guardrails

The following remain hard no-go conditions during coding:

1. model output may not be sent directly to signer;
2. free-form text may not become A4 execution conditions;
3. signer may not trust caller-supplied approval claims without independent validation;
4. SERA Agent DID possession may not substitute for Holder DID wallet context;
5. device identity may not be treated as wallet ownership;
6. offline execution may not occur outside a valid OAP;
7. Trust/REV decisions may not be reused after material-term changes;
8. counterparty aliases may not become authority identifiers;
9. SAEL may not be implemented as overwriteable mutable history;
10. recovery may not restore old sessions or revoked devices;
11. biometric recovery may not be interpreted as standing transaction approval;
12. cloud reasoning runtime may not receive unrestricted signing authority.

## 9. Implementation Priority

The recommended implementation sequence is:

1. repository scaffold;
2. common contracts package;
3. canonicalization and hashing package;
4. typed error package;
5. schema validation package;
6. action/intent contracts;
7. authority service;
8. risk service;
9. policy service;
10. device/runtime registry;
11. mandate service;
12. DMCL evaluator;
13. Trust Protocol adapter;
14. REV adapter;
15. approval service;
16. signing gateway;
17. execution router;
18. SAEL ingestion/query service;
19. recovery service;
20. counterparty resolver;
21. integration tests;
22. security/conformance tests.

## 10. Initial Repository Structure

Recommended structure:

```
contracts/
  enums/
  json-schema/
  openapi/

packages/
  canonicalization/
  identifiers/
  typed-errors/
  schema-validation/
  policy-evaluator/
  dmcl/
  evidence-client/

services/
  orchestrator/
  context/
  authority/
  risk/
  policy/
  device/
  runtime/
  mandate/
  trust/
  rev/
  approval/
  signing/
  execution/
  sael/
  recovery/
  counterparty/

tests/
  contract/
  conformance/
  security/
  integration/
  recovery/
```

## 11. First Code Milestone

The first executable milestone should prove the control path without real asset movement:

```
Intent Fixture
  ↓
Action Contract
  ↓
Authority
  ↓
Risk
  ↓
Policy
  ↓
Device / Runtime
  ↓
Mandate / Approval
  ↓
Trust Protocol Stub
  ↓
REV Stub
  ↓
Signing Gateway Dry Run
  ↓
Execution Stub
  ↓
SAEL Evidence
```

No production signing keys are required for this milestone.

## 12. Mock / Stub Policy

The following may initially be stubbed:

- Trust Protocol external endpoint;
- REV external endpoint;
- chain execution adapter;
- biometric recovery provider integration;
- external DID resolver;
- platform attestation provider.

Stubs must preserve the real interface contract and reason codes.

They may not bypass control-plane ordering.

## 13. Build Acceptance Criteria

The first build is accepted when:

- schemas compile;
- OpenAPI validates;
- typed models generate;
- an Action Contract traverses the control path;
- A2 blocks without approval;
- A3/A4 block without mandate;
- A4 rejects natural-language conditions;
- DMCL evaluates deterministically;
- changed material terms invalidate prior approval;
- invalid device/runtime blocks privileged path;
- SERA DID under wrong Holder DID fails;
- counterparty ambiguity blocks execution;
- offline action fails without valid OAP;
- signer dry-run verifies all bindings;
- SAEL records full action lineage;
- recovery test restores SERA state without restoring old authority.

## 14. Security Test Minimum

Before any real signing integration:

- replay tests;
- idempotency tests;
- hash mutation tests;
- approval substitution tests;
- mandate scope bypass tests;
- stale Trust/REV tests;
- stale attestation tests;
- alias poisoning tests;
- SERA-to-wrong-holder binding tests;
- recovery rollback tests;
- OAP replay tests;
- DMCL stale-signal tests.

## 15. Production Decisions Still Deferred

These are implementation selections, not architecture blockers:

- exact canonical JSON library;
- exact service framework;
- exact database technology;
- exact message/event transport;
- exact secret manager/HSM;
- exact workload identity deployment;
- exact Apple/Android adapter implementation;
- exact cryptographic algorithms/profile;
- exact deployment topology;
- observability stack.

These should be selected during implementation design without reopening architecture unless a selection conflicts with the established invariants.

## 16. Gate Result by Layer

| Layer | Status |
|---|---|
| Product architecture | GO |
| Identity model | GO |
| Authority model | GO |
| Risk model | GO |
| Mandate model | GO |
| A4 condition model | GO |
| Trust/REV binding | GO |
| Device/runtime model | GO |
| Recovery model | GO |
| Counterparty identity | GO |
| Offline authorization | GO |
| Evidence/audit | GO |
| Machine schema baseline | GO |
| Internal API baseline | GO |
| Production deployment | NOT YET GATED |
| Production signing | NOT YET GATED |

## 17. Next Controlled Artifact

The next artifact is:

**SSW-AI-IMP-01: Repository Scaffold, Package Boundaries & Build Bootstrap**

IMP-01 should create the actual project directories, package manifests, schema-validation harness, base service skeletons and contract tests.

## 18. Controlled Statement

The architecture is no longer waiting for another conceptual layer.

The next meaningful risk is implementation drift.

From this point, the safest way to advance the product is to make the code conform to the contracts already defined.
