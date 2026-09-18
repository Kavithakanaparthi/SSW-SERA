# SSW-AI-IRR-01: Implementation Readiness Review

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Review ID:** SSW-AI-IRR-01  
**Status:** Controlled Implementation Readiness Review  
**Date:** 2026-09-17  
**Reviewed:** SSW-AI-ISC-01 through SSW-AI-ISC-06  
**Repository:** Kavithakanaparthi/SSW-SERA

---

## 1. Purpose

This review evaluates whether the SERA-first Soul Super Wallet architecture has progressed far enough from Candidate Freeze and schema design into implementation-ready service contracts.

The review checks:

- service-boundary consistency;
- state ownership;
- authority containment;
- signing isolation;
- Trust Protocol / REV binding;
- runtime/device trust;
- evidence durability;
- recovery safety;
- threat-model gap ownership;
- missing contracts that still block concrete API and code implementation.

---

## 2. Review Disposition

**Result: READY FOR CONCRETE IMPLEMENTATION DESIGN, WITH PRE-CODE SECURITY CONDITIONS**

No architectural contradiction was found across ISC-01 through ISC-06 that requires reopening Candidate Freeze.

The core control path is now coherent:

```
Holder / Trigger
   ↓
SERA Interaction
   ↓
Context + Intent
   ↓
Action Contract
   ↓
Authority
   ↓
Risk
   ↓
Device / Runtime
   ↓
Mandate / Approval
   ↓
Policy
   ↓
Trust Protocol
   ↓
REV
   ↓
Authentication
   ↓
Canonical Signing
   ↓
Execution
   ↓
SAEL Evidence
```

Recovery, runtime registration and evidence durability remain outside the model authority boundary.

---

## 3. Service Boundary Review

### ISC-01

**Status: PASS**

Service ownership is explicit.

The following separations are preserved:

- Orchestrator cannot sign.
- Authority Engine cannot execute.
- Risk Engine cannot grant authority.
- Approval Service cannot sign.
- Mandate Service cannot bypass REV.
- Execution Router cannot mutate signed payload.
- SAEL cannot create authority.
- SERA State Service cannot restore signing authority.

No privilege-collapse issue was identified.

---

## 4. Canonicalization and Signing Review

### ISC-02

**Status: PASS**

The signing boundary now binds:

- action ID;
- action version;
- material terms hash;
- action contract hash;
- holder DID;
- SERA Agent DID;
- Runtime ID;
- Device ID;
- authority basis;
- policy;
- Trust Protocol;
- REV;
- payload hash;
- replay state.

The threat-model gaps for deterministic canonicalization and signer verification are structurally closed.

### Remaining implementation choice

The production canonicalization profile must be fixed to one exact byte-level standard and library set.

Recommended baseline remains RFC 8785-compatible JSON canonicalization with versioned domain-separated SHA-256 hashing.

---

## 5. Trust Protocol / REV Review

### ISC-03

**Status: PASS**

Trust Protocol and REV decisions are correctly bound to exact execution context.

A PASS cannot be treated as a reusable trust badge.

Invalidation is defined for:

- material-term change;
- action-version change;
- risk elevation;
- policy change;
- device-state change;
- runtime change;
- approval invalidation;
- mandate change;
- AURION invalidation;
- decision expiry.

This closes the stale-PASS threat class.

---

## 6. Runtime, Device and Session Review

### ISC-04

**Status: PASS WITH PLATFORM PROFILE REQUIRED**

The distinction among:

- SERA Agent DID;
- Device ID;
- Runtime ID;
- Session ID

is consistent.

Runtime sessions are correctly treated as scoped operational credentials rather than delegated authority.

Cloud reasoning runtimes remain outside signing authority.

Wearable runtimes remain constrained.

### Remaining implementation requirement

Platform-specific attestation profiles are still required for:

- iOS;
- Android;
- wearables;
- protected cloud runtime.

This is an implementation blocker for production trust enforcement, not an architecture blocker.

---

## 7. SAEL Readiness Review

### ISC-05

**Status: PASS**

SAEL now has operational contracts for:

- producer authentication;
- namespace authorization;
- canonical event hashing;
- idempotent ingestion;
- durability levels;
- evidence reservations;
- checkpoints;
- archives;
- disclosure-bound queries;
- durable queues;
- integrity-failure response.

The evidence path is sufficiently defined to proceed to storage and API design.

### Remaining engineering choice

Concrete database, event-stream, checkpoint and archive technologies remain open.

These may be selected without reopening architecture provided the append-only and tamper-evidence properties remain intact.

---

## 8. Recovery Review

### ISC-06

**Status: PASS WITH RECOVERY-PROOF PROFILE REQUIRED**

The recovery design preserves the key invariant:

> State restore does not restore authority.

Recovery correctly separates:

- identity restoration;
- portable state restoration;
- Device ID registration;
- Runtime ID registration;
- trust re-establishment;
- mandate revalidation;
- signing re-establishment.

Revoked devices and runtimes remain terminal.

Expired and revoked mandates do not reactivate.

Old approvals and Trust/REV decisions do not survive recovery by default.

### Remaining implementation requirement

A concrete holder-recovery proof profile and encryption key-wrapping profile are still required.

---

## 9. Threat Model Gap Closure Status

The SG items from SSW-AI-TM-01 now stand as follows:

| Gap | Description | Status |
|---|---|---|
| SG-01 | Canonical JSON serialization | CLOSED by ISC-02 |
| SG-02 | Signing-gateway verification | CLOSED by ISC-02 |
| SG-03 | Runtime integrity profile | ARCHITECTURALLY CLOSED by ISC-04, platform profile pending |
| SG-04 | Offline policy package | OPEN |
| SG-05 | Deterministic condition language | OPEN |
| SG-06 | SAEL write durability | CLOSED by ISC-05 |
| SG-07 | Trust/REV binding | CLOSED by ISC-03 |
| SG-08 | Recovery authorization | ARCHITECTURALLY CLOSED by ISC-06, concrete proof profile pending |
| SG-09 | Counterparty identity binding | STRUCTURALLY CLOSED, schema refinement pending |
| SG-10 | Platform attestation | OPEN IMPLEMENTATION PROFILE |

---

## 10. Remaining Pre-Code Security Specifications

Five specifications should be completed before production code is considered security-complete.

### PC-01 Offline Authorization Package

Must define:

- signed offline policy object;
- permitted A/R classes;
- devices;
- value limits;
- counterparties;
- chains;
- freshness;
- replay controls;
- reconciliation;
- cryptographic provenance.

### PC-02 Deterministic Condition Expression Language

Needed for A4 mandate conditions.

Must be:

- deterministic;
- bounded;
- machine-evaluable;
- non-ambiguous;
- versioned;
- safe against unbounded execution.

### PC-03 Platform Attestation Profiles

Separate profiles for:

- iOS;
- Android;
- wearables;
- protected cloud runtime.

### PC-04 Recovery Proof & Key-Wrapping Profile

Must define:

- holder recovery proof;
- recovery authentication;
- state decryption key access;
- key rotation;
- device migration;
- lost-device scenarios.

### PC-05 Counterparty Canonical Identity Profile

Must define stable resolution and provenance for:

- DIDs;
- wallet addresses;
- merchants;
- organizations;
- contacts/aliases.

Aliases must never be the authority-bearing identifier.

---

## 11. Machine-Readable Artifact Gap

The current contracts are semantically detailed but are primarily normative Markdown specifications.

Before implementation teams begin independently coding services, the following machine-readable artifacts should be generated:

1. JSON Schema for all canonical objects.
2. OpenAPI contracts for internal APIs.
3. enum and reason-code registry.
4. action-type registry.
5. event-type registry.
6. policy schema.
7. mandate condition schema.
8. service identity and authorization matrix.
9. compatibility/version registry.

This is the bridge from architecture to code.

---

## 12. Recommended Repository Structure

The implementation phase should introduce a structure similar to:

```
contracts/
  json-schema/
  openapi/
  enums/
  events/
  policies/

services/
  sera-orchestrator/
  context-broker/
  authority-engine/
  risk-engine/
  policy-engine/
  device-trust/
  mandate-service/
  trust-adapter/
  rev-adapter/
  approval-service/
  signing-gateway/
  execution-router/
  sael/
  runtime-registry/
  recovery/

packages/
  canonicalization/
  typed-errors/
  identifiers/
  policy-evaluator/
  evidence-client/

tests/
  contract/
  security/
  conformance/
  integration/
  recovery/
```

The exact programming language and deployment model remain implementation decisions.

---

## 13. API Readiness

The architecture is ready to generate actual API contracts for:

- Action Contract service;
- Authority Engine;
- Risk Engine;
- Device Trust;
- Mandate Service;
- Trust Protocol adapter;
- REV adapter;
- Approval Service;
- Signing Gateway;
- Execution Router;
- SAEL;
- Runtime Registry;
- Recovery Service.

No remaining architecture question blocks these API definitions.

---

## 14. Data Store Readiness

Authoritative state ownership is clear enough to begin data modeling.

Expected authoritative stores include:

- Action / workflow state;
- mandate store;
- device trust store;
- runtime registry;
- approval store;
- execution state;
- SAEL append store;
- SERA state-manifest metadata;
- policy registry.

Private signing keys remain outside ordinary application data stores.

---

## 15. Deployment Readiness

Trust zones are clear enough to begin deployment topology design.

At minimum, deployment must preserve:

- SERA/model zone separation from signer;
- signer isolation;
- SAEL write-path isolation;
- control-plane service authentication;
- external adapter isolation;
- production/non-production separation;
- recovery-service restrictions.

---

## 16. Test Readiness

A strong conformance suite can now be built from existing specifications.

Initial mandatory test families:

- action-contract schema tests;
- material-term hashing tests;
- mandate boundary tests;
- device-state transition tests;
- session-scope tests;
- stale Trust/REV rejection;
- signing substitution tests;
- replay/idempotency tests;
- concealed-detail tests;
- SAEL integrity tests;
- recovery rollback tests;
- cross-device handoff tests.

---

## 17. No-Go Conditions

Implementation shall not be considered production-ready if any of the following remain true:

1. free-form model output can reach signer;
2. signer does not independently validate terms hash;
3. mandate conditions are interpreted by generative AI at execution time;
4. Trust/REV PASS can be reused across material changes;
5. device/runtime/session state is not independently validated;
6. SAEL evidence can be silently overwritten;
7. revoked devices can reactivate through recovery;
8. offline execution lacks signed bounded policy;
9. production runtime attestation is absent;
10. recovery decryption/authentication is weaker than the authority being restored.

---

## 18. Implementation Gate

**Gate decision: PROCEED TO CONCRETE API, SCHEMA, REPOSITORY AND DEPLOYMENT DESIGN**

Conditions:

- PC-01 through PC-05 remain mandatory tracked security work;
- machine-readable schemas must become authoritative for service implementation;
- conformance tests must be built alongside contracts rather than after implementation.

---

## 19. Recommended Next Sequence

The next build sequence should be:

1. **SSW-AI-API-01: Canonical JSON Schema & Enum Registry**
2. **SSW-AI-API-02: Internal OpenAPI Contract Set**
3. **SSW-AI-POL-01: Offline Authorization Package Specification**
4. **SSW-AI-POL-02: Deterministic Mandate Condition Language**
5. **SSW-AI-ATT-01: Device & Runtime Attestation Profiles**
6. **SSW-AI-REC-01: Holder Recovery Proof & Key-Wrapping Profile**
7. **SSW-AI-ID-01: Counterparty Canonical Identity Resolution Profile**
8. repository scaffold;
9. deployment topology;
10. contract and security test harness.

---

## 20. Controlled Statement

The SERA architecture has crossed an important boundary.

We are no longer deciding what the system should fundamentally be.

We now have enough control-plane definition to begin expressing the architecture as machine contracts, services, schemas and tests.

The next risk is not architectural ambiguity.

It is implementation drift.

From this point forward, the machine-readable contracts and conformance tests must become the guardrails that keep the implementation faithful to the architecture.
