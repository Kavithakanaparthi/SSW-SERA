# SSW-AI-IMP-01: Repository Scaffold, Package Boundaries & Build Bootstrap

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-IMP-01  
**Status:** Controlled Implementation Baseline  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA  
**Parent Gate:** SSW-AI-IRR-02

## 1. Purpose

IMP-01 turns the approved architecture into an implementation workspace without changing the architecture or introducing production signing.

The repository is structured around four rules:

1. machine contracts remain authoritative under `contracts/`;
2. reusable deterministic logic lives under `packages/`;
3. state-owning or trust-bound runtime components live under `services/`;
4. cross-boundary behavior is exercised under `tests/`.

## 2. Bootstrap Technology Choice

The scaffold uses a Node.js + TypeScript workspace for the control plane and service-contract implementation baseline. This is an implementation choice, not a change to the mobile wallet architecture.

The mobile iOS/Android application remains an external consumer of the control-plane contracts and is not made dependent on this repository layout.

## 3. Existing Authoritative Contracts

IMP-01 reuses, and does not duplicate, the existing:

- `contracts/enums/`
- `contracts/json-schema/`
- `contracts/openapi/`

These remain upstream of generated types, validators, service handlers and test fixtures.

## 4. Shared Package Boundaries

| Package | Responsibility | Must not own |
|---|---|---|
| contracts | paths/types for controlled machine contracts | runtime authority |
| canonicalization | deterministic payload preparation interface | signing keys |
| identifiers | typed identifiers and parsing helpers | identity proof |
| typed-errors | stable internal error vocabulary | policy decisions |
| schema-validation | machine-contract validation boundary | business authority |
| policy-evaluator | policy evaluation interfaces and pure decisions | execution |
| dmcl | deterministic mandate-condition evaluation boundary | generative interpretation |
| evidence-client | SAEL write/query client boundary | mutable audit history |

## 5. Service Boundaries

The scaffold creates independent service roots for:

- orchestrator
- context
- authority
- risk
- policy
- device
- runtime
- mandate
- trust
- rev
- approval
- signing
- execution
- sael
- recovery
- counterparty

Each service owns its state and decisions only within the boundary established by ISC-01 through ISC-06.

## 6. Hard Dependency Direction

```text
experience / adapters
        ↓
orchestrator
        ↓
control-plane services
        ↓
signing / execution / evidence

shared packages may be imported by services
services must not import UI code
model output must not import or call signing directly
```

## 7. Bootstrap Control Path

`npm run bootstrap` executes a zero-value dry-run path:

```text
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
Approval / Mandate
  ↓
Trust Stub
  ↓
REV Stub
  ↓
Signing Dry Run
  ↓
Execution Stub
  ↓
SAEL Evidence
```

The script performs no signing and no network execution.

## 8. No-Go Invariants Encoded in Scaffold

- no private keys or seeds in repository code;
- no model-to-signer call path;
- signing service defaults to dry-run only;
- execution service defaults to stub only;
- Trust and REV are explicit adapter boundaries;
- A4 condition evaluation is assigned to DMCL, not model text;
- SAEL is a separate service boundary;
- recovery is separate from current runtime/session authority;
- Holder DID and SERA Agent DID remain distinct identity fields.

## 9. Test Lanes

`tests/` reserves independent lanes for:

- contract
- conformance
- security
- integration
- recovery

Initial bootstrap tests prove repository structure and the safe dry-run ordering. Later artifacts add the substantive tests listed in IRR-02.

## 10. Build Commands

```bash
npm install
npm run verify:scaffold
npm run verify:contracts
npm run bootstrap
npm test
npm run typecheck
```

## 11. Acceptance Criteria

IMP-01 is complete when:

1. the workspace root is bootstrapped;
2. controlled contracts remain in place;
3. shared package boundaries exist;
4. all service boundaries exist as importable TypeScript modules;
5. dry-run control path executes without signing or network movement;
6. contract/scaffold tests can run independently;
7. code organization makes prohibited direct paths visible and reviewable.

## 12. Deferred to IMP-02+

IMP-01 does not select or implement:

- production databases;
- message/event transport;
- service framework;
- HSM/KMS;
- production canonical JSON library;
- real Trust Protocol endpoint;
- real REV endpoint;
- chain broadcast adapters;
- mobile platform attestation adapters;
- deployment topology.

Those decisions remain controlled follow-on implementation work.

## 13. Next Controlled Artifact

**SSW-AI-IMP-02: Common Contracts, Generated Types & Schema Validation Runtime**

IMP-02 should convert the existing JSON Schema/OpenAPI baseline into generated TypeScript models and a production validation harness, then bind the first Action Contract fixture to those generated types.
