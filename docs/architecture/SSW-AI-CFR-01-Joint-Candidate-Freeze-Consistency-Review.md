# SSW-AI-CFR-01: Joint Candidate Freeze Consistency Review

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Review ID:** SSW-AI-CFR-01  
**Status:** Candidate Freeze Review  
**Date:** 2026-09-17  
**Reviewed Documents:** SSW-AI-01 and SSW-AI-02  
**Repository:** Kavithakanaparthi/SSW-SERA

---

## 1. Purpose

This review evaluates SSW-AI-01 and SSW-AI-02 as one architecture set before progression into canonical schemas, implementation specifications and formal promotion beyond Candidate Freeze.

The review checks for:

- contradictory definitions;
- duplicated responsibilities;
- missing handoffs;
- authority leakage;
- inconsistent trust or risk semantics;
- storage and evidence inconsistencies;
- identity/runtime ambiguity;
- degraded-mode conflicts;
- privacy-control conflicts;
- model-plane access to execution authority.

---

## 2. Review Outcome

**Overall result: CONDITIONALLY CONSISTENT**

The two documents are architecturally aligned in their principal security and product model.

No contradiction was found that gives SERA, a model runtime, a device, a cloud provider, external intelligence, conversational memory or a proactive alert independent execution authority.

One material semantic inconsistency must be corrected before promotion:

1. **Risk class meanings R0-R5 differ between SSW-AI-01 and SSW-AI-02.**

Three additional harmonization items should be closed:

2. clarify Trust Protocol / REV offline exception semantics;
3. remove ambiguity between persistent SERA DID naming and runtime-instance identity;
4. standardize authority-class labels while preserving current semantics.

These are controlled harmonization items. They do not invalidate the underlying architecture.

---

## 3. Areas Confirmed Consistent

### 3.1 Root authority

Both documents establish the holder as the root of authority.

SERA is an intelligent orchestration layer operating within explicit, bounded, revocable authority.

**Status: CONSISTENT**

---

### 3.2 Natural language and voice

Both documents establish that:

- natural language is not executable authority;
- voice is an input modality, not authorization;
- model confidence cannot substitute for authentication;
- ambiguity must block consequential execution when material terms are uncertain.

**Status: CONSISTENT**

---

### 3.3 Typed deterministic action boundary

Both documents require natural-language interpretation to be converted into deterministic typed objects before the execution control plane.

The model plane is prohibited from passing free-form natural-language commands directly to signing or execution.

**Status: CONSISTENT**

---

### 3.4 SERA identity, state and runtime separation

Both documents support:

- holder Soul ID as principal identity;
- persistent SERA `did:soul:agent` identity;
- separate device/runtime instances;
- per-runtime and per-device authority;
- separately revocable runtime instances.

**Status: CONSISTENT, WITH NAMING CLARIFICATION REQUIRED**

See H-03.

---

### 3.5 SERA portable state

Both documents preserve the DB17A rule that SERA portable state:

- restores holder-specific continuity;
- is encrypted;
- may use content-addressed storage;
- may use cloud replicas for availability;
- does not make the storage provider authoritative;
- excludes wallet private keys, seeds, unrestricted signing handles and privileged trust secrets.

**Status: CONSISTENT**

---

### 3.6 SERA Activity & Evidence Ledger

Both documents establish SAEL as distinct from conversational memory.

Audit reports are generated from structured evidence, not model recollection.

This supports retrieval of:

- SERA-assisted transactions;
- SERA-prepared actions;
- holder-approved actions;
- delegated actions;
- blocked actions;
- REV-denied actions;
- credential disclosures;
- WalletConnect activity;
- security and recovery events.

**Status: CONSISTENT**

---

### 3.7 Context Broker

Both documents place the Context Broker between wallet/identity/memory data and model runtimes.

Both require:

- classification;
- purpose restriction;
- minimization;
- redaction or transformation;
- approved context packaging.

D8 key material is outside model context.

**Status: CONSISTENT**

---

### 3.8 Device-scoped authority

Both documents use the same device trust states:

- UNREGISTERED;
- REGISTERED;
- ATTESTED;
- TRUSTED;
- LIMITED;
- SUSPENDED;
- REVOKED.

Both reject automatic authority inheritance through login, pairing or cross-device continuation.

**Status: CONSISTENT**

---

### 3.9 Concealed-detail presentation

Both documents preserve the following rules:

- sensitive details may remain concealed;
- per-instance reveal is permitted;
- reveal is not approval;
- high-risk actions may require authenticated reveal;
- concealment persists across device and lifecycle transitions;
- wearables use stricter presentation defaults.

**Status: CONSISTENT**

---

### 3.10 Trust Protocol and REV

Both documents place Trust Protocol and REV after deterministic action construction and authority/risk evaluation, before signing and execution.

Both prohibit the AI layer from overriding these controls.

**Status: CONSISTENT, WITH DEGRADED-MODE CLARIFICATION REQUIRED**

See H-02.

---

### 3.11 Signing isolation

Both documents maintain signing outside the model plane.

Signing receives canonical validated payloads, not natural-language instructions.

The model has no access to:

- private keys;
- seed phrases;
- raw signing capability;
- unrestricted signer commands.

**Status: CONSISTENT**

---

### 3.12 Proactivity

Both documents establish:

> Proactivity may create awareness or prepare action. It does not create authority.

External intelligence is advisory or risk-signalling input only.

**Status: CONSISTENT**

---

### 3.13 Multi-chain route changes

Both documents require route changes to be treated as material changes when they affect execution terms.

A materially changed chain or route must be revalidated and, where applicable, re-approved.

**Status: CONSISTENT**

---

### 3.14 Wearables

Both documents treat wearables as:

- Phase 2 product surfaces;
- Phase 1 architectural constraints.

Neither allows a wearable to inherit unrestricted primary-phone authority.

**Status: CONSISTENT**

---

### 3.15 Degraded mode

Both documents require degraded operation to reduce convenience or capability before reducing security.

AI or voice failure must not make the wallet unusable.

Fallback paths must not weaken authority, privacy, signing assurance, Trust Protocol, REV or evidence requirements.

**Status: CONSISTENT**

---

## 4. Material Harmonization Item

### H-01: Risk class definitions differ

**Severity:** MATERIAL  
**Promotion blocker:** YES

SSW-AI-01 defines the risk scale approximately as:

- R0 Public informational
- R1 Personal/read-only
- R2 Reversible/preparatory
- R3 Moderate consequential action
- R4 High-risk transfer/sensitive disclosure/unusual action
- R5 Critical recovery/identity-root/broad delegation

SSW-AI-02 defines:

- R0 Informational
- R1 Low impact
- R2 Moderate
- R3 High
- R4 Critical
- R5 Prohibited or exceptional

These scales are directionally similar but not semantically identical.

The mismatch could cause:

- inconsistent policy mapping;
- approval-rule divergence;
- device-trust differences;
- mandate enforcement inconsistencies;
- test-suite ambiguity;
- incorrect REV policy selection.

### Required closure

Adopt one canonical risk model across the architecture set.

### Recommended canonical model

- **R0 Informational / Public**  
  No material holder impact.

- **R1 Personal Read-Only / Low Impact**  
  Holder-specific but non-consequential.

- **R2 Preparatory / Reversible**  
  Drafting, staging, simulation or easily reversible activity.

- **R3 Consequential**  
  Value movement, meaningful disclosure or external commitment requiring ordinary strong controls.

- **R4 High / Critical Consequence**  
  High-value, sensitive, unusual, high-privilege or materially elevated-risk action.

- **R5 Restricted / Exceptional**  
  Identity-root changes, recovery-root actions, broad delegation, unrestricted authority changes, or actions that may be prohibited from autonomous execution.

This model preserves the meaning of both documents while establishing one scale.

---

## 5. Required Clarifications

### H-02: Trust Protocol / REV degraded availability

**Severity:** MODERATE  
**Promotion blocker:** YES, semantic clarification only

SSW-AI-01 states that an action requiring Trust Protocol or REV fails closed **unless a separately defined explicit offline policy authorizes a narrow alternative path**.

SSW-AI-02 states that if REV is mandatory and unavailable, the affected action fails closed.

These are compatible only if the offline policy determines in advance that a particular path does not require live REV at that moment and supplies an independently valid bounded assurance mechanism.

### Required wording

The architecture should state:

> If live Trust Protocol or REV evaluation is mandatory for the specific action under current policy, unavailability fails closed. An offline path is permitted only where an explicit pre-existing policy defines a bounded offline authorization mechanism before the outage. AI reasoning may not create, infer or extend such an exception.

---

### H-03: SERA DID versus runtime-instance naming

**Severity:** MODERATE  
**Promotion blocker:** YES, terminology clarification

SSW-AI-01 uses the conceptual pattern:

`did:soul:agent:<sera-instance-identity>`

while also correctly stating that the SERA DID is persistent and distinct from runtime instances.

The token `instance-identity` can be misread as a device/runtime identity.

### Required closure

Use terminology that clearly separates:

- **SERA Agent DID:** persistent agent identity;
- **SERA Runtime ID:** one device/environment execution instance;
- **Device ID:** registered physical/logical device identity.

Recommended conceptual notation:

```
Holder DID
did:soul:<holder>

SERA Agent DID
did:soul:agent:<sera>

Runtime ID
sera-runtime:<runtime-id>

Device ID
device:<device-id>
```

The exact runtime/device URI formats remain implementation-specific unless separately standardized.

---

### H-04: Authority-class naming

**Severity:** LOW  
**Promotion blocker:** NO, but should be normalized

SSW-AI-01 and SSW-AI-02 use slightly different labels for A0-A5 while preserving essentially the same semantics.

Recommended canonical names:

- A0 Informational
- A1 Prepare / Retrieve
- A2 Explicit Approval
- A3 Bounded Delegation
- A4 Conditional Autonomous Execution
- A5 Prohibited Autonomous Authority

This naming should be used consistently in schemas, tests and future specifications.

---

## 6. Missing Handoff Checks

The following handoffs were reviewed and found present:

| Boundary | Result |
|---|---|
| Human input → model interpretation | Present |
| Model interpretation → typed intent | Present |
| Typed intent → capability validation | Present |
| Capability → authority | Present |
| Authority → risk | Present |
| Risk → Trust Protocol | Present |
| Trust Protocol → REV | Present |
| REV → approval/delegation | Present |
| Approval → authentication | Present |
| Authentication → signing | Present |
| Signing → execution | Present |
| Execution → evidence | Present |
| Cross-device handoff → re-evaluation | Present |
| Proactive alert → new typed intent | Present |
| SERA memory → non-authoritative personalization | Present |
| SERA portable state → recovery | Present |
| Execution history → SAEL | Present |
| SAEL → holder audit report | Present |

No missing critical control-plane handoff was identified.

---

## 7. Authority Leak Review

No architectural path was found that permits any of the following to become independent authority:

- natural-language interpretation;
- model confidence;
- conversational memory;
- voice recognition;
- behavioral familiarity;
- proactive alerts;
- news;
- LinkedIn data;
- market data;
- cloud runtime status;
- device pairing alone;
- wearable possession alone;
- prior repeated holder behavior;
- SERA DID possession alone.

**Result: PASS**

---

## 8. Storage and Audit Separation Review

The architecture correctly separates:

### Identity
Persistent SERA DID linked to holder Soul ID.

### Portable state
Encrypted holder-specific SERA continuity data.

### Runtime state
Per-device/per-environment execution state.

### Evidence
SAEL structured action and audit history.

### Key material
Isolated cryptographic trust domain.

No architecture statement requires these domains to collapse into a single cloud account or data store.

**Result: PASS**

---

## 9. Candidate Freeze Status

The joint architecture may remain at **Candidate Freeze** while H-01 through H-03 are normalized.

Promotion beyond Candidate Freeze should not occur until:

1. H-01 canonical risk classes are adopted;
2. H-02 degraded Trust Protocol/REV semantics are adopted;
3. H-03 persistent SERA DID versus runtime identity terminology is adopted.

H-04 should be normalized at the same time for consistency.

---

## 10. Recommended Next Controlled Action

Before beginning schema work, create a short controlled harmonization amendment:

**SSW-AI-CF-A01: Candidate Freeze Harmonization Amendment**

It should formally adopt:

1. canonical R0-R5 definitions;
2. canonical A0-A5 names;
3. canonical SERA Agent DID / Runtime ID / Device ID terminology;
4. canonical Trust Protocol / REV offline exception rule.

Once adopted, the next specification sequence should be:

1. canonical typed intent schema;
2. delegated mandate schema;
3. device trust transition specification;
4. conceal/reveal interaction specification;
5. SAEL runtime event and report schema;
6. threat model and abuse-case review;
7. implementation service contracts.

---

## 11. Review Conclusion

SSW-AI-01 and SSW-AI-02 form a coherent architecture set.

The central trust boundary survives joint review:

> SERA may interpret and orchestrate, but no model output becomes authority until deterministic controls establish that the holder, device, mandate, policy, Trust Protocol and REV state permit the requested action.

The remaining issues are taxonomy and terminology harmonization, not architectural redesign.

**Review disposition: CONDITIONALLY PASS, HARMONIZATION REQUIRED BEFORE PROMOTION.**
