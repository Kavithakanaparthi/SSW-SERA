# SSW-AI-CF-A01: Candidate Freeze Harmonization Amendment

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Amendment ID:** SSW-AI-CF-A01  
**Status:** Adopted Candidate Freeze Harmonization  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-01, SSW-AI-02, SSW-AI-CFR-01  
**Repository:** Kavithakanaparthi/SSW-SERA

---

## 1. Purpose

This amendment resolves the terminology and taxonomy harmonization items identified in SSW-AI-CFR-01.

It does not redesign SSW-AI-01 or SSW-AI-02. It establishes canonical meanings that govern interpretation of both Candidate Freeze documents and all subsequent schemas, specifications, tests and implementation contracts.

Where wording in SSW-AI-01 or SSW-AI-02 differs from this amendment, this amendment governs.

---

## 2. Canonical Risk Classes

The architecture adopts the following R0-R5 model.

### R0 — Informational / Public

Characteristics:

- no material holder impact;
- public or non-sensitive information;
- no value movement;
- no protected disclosure;
- no external commitment.

Examples:

- public token metadata;
- general news summary;
- public chain status;
- educational explanation.

Typical control posture:

- no consequential authorization;
- ordinary privacy and provenance controls.

---

### R1 — Personal Read-Only / Low Impact

Characteristics:

- holder-specific;
- read-only;
- low consequence;
- no external state change.

Examples:

- balance viewing;
- local transaction-history review;
- notification preferences;
- non-sensitive personalization retrieval.

Typical control posture:

- authenticated session as required;
- concealed-detail policy may apply.

---

### R2 — Preparatory / Reversible

Characteristics:

- draft, simulation, preparation, staging or reversible action;
- no final external commitment;
- no irreversible value movement.

Examples:

- prepare a transaction;
- compare routes;
- draft a credential presentation;
- stage a WalletConnect request for review;
- save an unsigned action.

Typical control posture:

- authority may remain A1;
- deterministic validation required before later promotion.

---

### R3 — Consequential

Characteristics:

- causes external state change;
- moves value;
- discloses protected information;
- creates a meaningful commitment.

Examples:

- ordinary send;
- ordinary swap;
- approved credential presentation;
- approved WalletConnect transaction;
- bounded transaction under an A2 flow.

Typical control posture:

- strong deterministic validation;
- Trust Protocol and REV where policy requires;
- explicit approval or valid delegated authority;
- authentication and signing;
- evidence emission.

---

### R4 — High / Critical Consequence

Characteristics:

- high value;
- unusually sensitive;
- unusual counterparty or route;
- elevated privilege;
- significant credential disclosure;
- materially abnormal behavior;
- elevated fraud or compromise indicators.

Examples:

- large value transfer;
- unusual contract interaction;
- highly sensitive credential disclosure;
- elevated-risk bridge route;
- high-impact delegated action.

Typical control posture:

- stronger authentication;
- authenticated reveal where required;
- stricter device requirements;
- mandatory Trust Protocol / REV where applicable;
- reduced or prohibited delegated execution depending on policy.

---

### R5 — Restricted / Exceptional

Characteristics:

- identity-root changes;
- recovery-root changes;
- broad delegation;
- unrestricted authority changes;
- actions prohibited from autonomous execution;
- exceptional security operations.

Examples:

- changing root recovery relationships;
- granting unlimited delegation;
- replacing primary trust anchors;
- identity-root mutation;
- removing critical security controls.

Typical control posture:

- direct holder involvement;
- highest assurance device and authentication;
- no autonomous execution unless a future architecture explicitly defines a separately governed exception;
- full evidence.

---

## 3. Canonical Authority Classes

The architecture adopts the following A0-A5 names and semantics.

### A0 — Informational

SERA may:

- read;
- explain;
- summarize;
- inspect permitted information.

SERA may not create an execution-capable external commitment.

---

### A1 — Prepare / Retrieve

SERA may:

- retrieve permitted information;
- draft;
- calculate;
- compare;
- stage;
- prepare a deterministic action object.

No consequential execution authority exists.

---

### A2 — Explicit Approval

SERA may prepare a consequential action.

Execution requires explicit holder approval tied to the exact material terms, followed by required authentication and signing.

---

### A3 — Bounded Delegation

SERA may execute within a valid holder-issued mandate with explicit constraints.

The mandate must be machine-enforceable, revocable, scoped and evidencable.

---

### A4 — Conditional Autonomous Execution

SERA may execute without a per-action approval only when all predefined mandate conditions, policy conditions, device conditions, risk requirements, Trust Protocol checks and REV requirements are satisfied.

A4 does not permit SERA to expand its own mandate.

---

### A5 — Prohibited Autonomous Authority

The action requires direct holder participation and may not be executed solely under autonomous SERA authority.

This class includes identity-root, recovery-root, broad delegation or equivalent critical actions unless a future controlled architecture explicitly reclassifies a narrowly defined case.

---

## 4. Canonical Identity and Runtime Terminology

The architecture distinguishes three separate concepts.

### 4.1 Holder DID

The human principal:

```
did:soul:<holder>
```

This is the root human identity for the wallet relationship.

---

### 4.2 SERA Agent DID

The persistent SERA identity:

```
did:soul:agent:<sera>
```

The SERA Agent DID:

- is persistent across devices;
- is independent of model provider;
- is independent of storage provider;
- is independent of a specific runtime;
- is linked to and governed by the holder's Soul ID;
- does not itself confer unrestricted execution authority.

The term **SERA Agent DID** shall be used consistently in future specifications.

---

### 4.3 SERA Runtime ID

A SERA runtime is one execution environment associated with the SERA Agent DID.

Conceptual notation:

```
sera-runtime:<runtime-id>
```

Examples:

- primary-phone runtime;
- secondary-phone runtime;
- tablet runtime;
- protected-cloud reasoning runtime;
- wearable runtime.

A runtime is separately registered, scoped, attestable and revocable.

A runtime does not inherit unrestricted authority solely because it belongs to the same SERA Agent DID.

---

### 4.4 Device ID

A device identity is distinct from the SERA Runtime ID.

Conceptual notation:

```
device:<device-id>
```

A device may host one or more runtime components, but device trust and runtime identity remain separate policy inputs.

The final URI or identifier format for Runtime ID and Device ID remains implementation-specific unless standardized in a later controlled specification.

---

## 5. Canonical Trust Protocol / REV Degraded-Availability Rule

The architecture adopts the following rule:

> If live Trust Protocol or REV evaluation is mandatory for the specific action under the currently applicable policy, unavailability fails closed.

A narrow offline or degraded path is permitted only where all of the following are true:

1. the offline authorization mechanism was defined before the outage;
2. the mechanism is explicit and machine-enforceable;
3. the permitted action scope is bounded;
4. the assurance basis is independently valid without live evaluation;
5. expiry and freshness rules are defined;
6. replay and duplication controls exist;
7. reconciliation is mandatory when connectivity returns;
8. evidence is recorded;
9. the AI layer cannot create, infer, widen or renew the exception.

Therefore:

```
Required live Trust Protocol / REV unavailable
    -> FAIL CLOSED
```

unless:

```
Pre-existing bounded offline policy
    + valid offline assurance
    + valid scope
    + freshness
    + replay protection
    + evidence
    -> permitted narrow offline path
```

The phrase "offline fallback" shall never mean that SERA or a model is allowed to substitute its own judgment for Trust Protocol or REV.

---

## 6. Canonical Interaction Between Risk and Authority

Risk class and authority class are independent dimensions.

Examples:

- R1 + A0: view low-impact personal information;
- R2 + A1: prepare a transaction;
- R3 + A2: explicitly approved send;
- R3 + A3: delegated recurring payment within limits;
- R4 + A2: high-risk transaction requiring explicit approval;
- R4 + A3: only if mandate and policy explicitly permit;
- R5 + A5: critical action requiring direct holder participation.

Risk may increase control requirements.

Risk must not silently elevate authority.

Authority must not silently reduce risk.

---

## 7. Canonical Action Evaluation Order

For consequential actions, the canonical control order is:

```
Input / Trigger
   ↓
Interpretation
   ↓
Typed Intent
   ↓
Entity Resolution
   ↓
Context Broker
   ↓
Capability Validation
   ↓
Authority Class
   ↓
Risk Class
   ↓
Device / Runtime Eligibility
   ↓
Mandate Validation if applicable
   ↓
Policy Evaluation
   ↓
Trust Protocol
   ↓
REV
   ↓
Required Review / Approval
   ↓
Authentication
   ↓
Canonical Signing Payload
   ↓
Signing
   ↓
Execution
   ↓
Evidence / SAEL
```

No model output may bypass this sequence for an execution-capable action.

---

## 8. Canonical Terminology for Concealed Detail

The following terms are standardized:

- **Concealed Detail:** sensitive information hidden from immediate presentation.
- **Reveal:** holder action that exposes concealed information for the current instance.
- **Authenticated Reveal:** reveal requiring authentication due to sensitivity or risk.
- **Approval:** holder authorization of exact material action terms.
- **Re-conceal:** automatic or manual return to concealed presentation.

Invariant:

> Reveal is not approval.

A revealed transaction still requires the authority path applicable to its A-class and R-class.

---

## 9. Canonical SAEL Relationship

The SERA Activity & Evidence Ledger is the authoritative source for audit-grade action history.

SAEL shall remain separate from:

- conversational memory;
- portable SERA personalization state;
- model context;
- key material;
- device secrets.

SAEL records may reference:

- Holder DID;
- SERA Agent DID;
- Runtime ID;
- Device ID;
- intent ID;
- mandate ID;
- authority class;
- risk class;
- Trust Protocol result;
- REV result;
- approval evidence;
- execution result;
- recovery result.

Reports must be produced from structured evidence, not reconstructed from SERA memory.

---

## 10. Effect on SSW-AI-01

SSW-AI-01 remains valid at Candidate Freeze.

The following interpretations are amended by this document:

1. its R0-R5 definitions are replaced by Section 2 of this amendment;
2. its A0-A5 labels are normalized to Section 3;
3. its persistent SERA identity is termed **SERA Agent DID**;
4. runtime identities are termed **SERA Runtime IDs**;
5. its degraded Trust Protocol/REV exception language is governed by Section 5.

No other SSW-AI-01 architecture principle is changed.

---

## 11. Effect on SSW-AI-02

SSW-AI-02 remains valid at Candidate Freeze.

The following interpretations are amended by this document:

1. its R0-R5 definitions are replaced by Section 2;
2. its A0-A5 labels are normalized to Section 3;
3. SERA DID references are interpreted as SERA Agent DID where persistent identity is intended;
4. runtime identity is separate from SERA Agent DID and Device ID;
5. Trust Protocol/REV degraded behavior follows Section 5.

No other SSW-AI-02 architecture principle is changed.

---

## 12. Candidate Freeze Harmonization Result

The four consistency items identified by SSW-AI-CFR-01 are now closed:

- **H-01 Risk taxonomy:** CLOSED
- **H-02 Trust Protocol / REV degraded semantics:** CLOSED
- **H-03 SERA DID / runtime terminology:** CLOSED
- **H-04 Authority-class naming:** CLOSED

The Candidate Freeze architecture set is now semantically harmonized for schema work.

---

## 13. Next Controlled Specification Sequence

The next workstream should proceed in this order:

1. **SSW-AI-SCH-01: Canonical Typed Intent & Action Contract Schema**
2. **SSW-AI-SCH-02: Delegated Authority Mandate Schema**
3. **SSW-AI-SCH-03: Device Trust State & Transition Specification**
4. **SSW-AI-SCH-04: Concealed Detail / Reveal / Approval Interaction Specification**
5. **SSW-AI-SCH-05: SAEL Runtime Event, Evidence & Audit Report Schema**
6. threat model and abuse-case review;
7. implementation service contracts.

---

## 14. Amendment Statement

This amendment is normative for the SSW-SERA Candidate Freeze architecture.

It exists to prevent semantic drift from becoming implementation drift.

The architecture now uses one risk language, one authority language, one SERA identity/runtime vocabulary, and one degraded Trust Protocol/REV rule across all subsequent specifications.
