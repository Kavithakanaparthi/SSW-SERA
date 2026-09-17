# SSW-SERA-DB05
## Privacy, Trust, Authority & Risk Boundary Design

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB05  
**Status:** Drawing Board / Controlled Design Input  
**Phase:** Pre-architecture foundation  
**Repository:** Kavithakanaparthi/SSW-SERA  
**Date:** 2026-09-17

---

## 1. Purpose

This document defines the privacy, trust, authority and risk boundaries for the transformation of Soul Super Wallet into an AI-first wallet in which SERA becomes the primary interaction and orchestration layer.

The design objective is to ensure that SERA can become highly capable, conversational, proactive and cross-device without collapsing the distinction between:

- understanding,
- recommendation,
- preparation,
- delegated authority,
- user approval,
- cryptographic authorization,
- execution,
- and evidence.

The governing principle is:

> **SERA may interpret, reason, recommend and orchestrate. Consequential execution must remain bounded by explicit authority, deterministic validation, device trust, policy, REV and cryptographic controls.**

This document also incorporates the Phase 2 wearable requirement. Wearables are not treated as an afterthought. Their future presence constrains Phase 1 architecture from the beginning.

---

## 2. Core Boundary Model

Every consequential action shall be evaluated across six dimensions:

```text
HOLDER
  +
SERA INSTANCE
  +
DEVICE
  +
CAPABILITY
  +
CONTEXT
  +
RISK
  ↓
AUTHORITY DECISION
```

No single signal, including voice recognition, device possession, conversational context or AI confidence, is sufficient by itself to authorize a sensitive action.

### 2.1 Holder

Represents the human principal identified through Soul ID and associated wallet controls.

### 2.2 SERA Instance

Represents the holder-bound AI instance operating within the wallet ecosystem. The SERA instance may maintain preferences, context, learned language patterns, voice adaptation and permitted task state, but does not become the root of signing authority.

### 2.3 Device

Represents the phone, wearable or future endpoint from which an instruction is received or an approval is presented. Device trust is explicit and scoped.

### 2.4 Capability

Represents the operation requested, such as:

- read balance,
- retrieve credential,
- present proof,
- prepare transaction,
- send asset,
- swap,
- authorize recurring instruction,
- revoke access,
- lock wallet,
- connect to an external service,
- or execute a delegated task.

### 2.5 Context

Represents situational inputs including:

- conversation state,
- transaction history,
- previous counterparties,
- network state,
- chain conditions,
- device state,
- geospatial context where explicitly permitted,
- holder preferences,
- current session assurance,
- and relevant external intelligence.

### 2.6 Risk

Represents the consequence of error, abuse or compromise. Risk must influence required confidence, authentication and execution controls.

---

## 3. Fundamental Separation of Powers

The AI-first wallet shall preserve the following separation:

```text
PERCEIVE
   ↓
UNDERSTAND
   ↓
REASON
   ↓
PROPOSE
   ↓
CHECK AUTHORITY
   ↓
CHECK POLICY / TRUST / REV
   ↓
OBTAIN REQUIRED APPROVAL
   ↓
SIGN
   ↓
EXECUTE
   ↓
RECORD EVIDENCE
```

The model that interprets natural language must not directly hold or invoke signing keys.

The planner that determines a route must not directly bypass wallet policy.

The component that generates a recommendation must not infer that recommendation equals consent.

---

## 4. Data Classification for SERA

The wallet shall classify information before making it available to SERA or any external model.

| Class | Examples | Default SERA Access | External Model Exposure |
|---|---|---|---|
| D0 Public | chain metadata, public token info, public news | allowed | allowed subject to policy |
| D1 General Personal | preferences, aliases, UI choices | allowed | minimized |
| D2 Financial | balances, holdings, transaction history | contextual | minimized / redacted |
| D3 Identity | Soul ID metadata, issuer references | contextual | minimized |
| D4 Credential | VC claims, credential status, proof material | need-to-know | selective only |
| D5 Behavioral | voice profile, usage patterns, correction history | local-first | normally prohibited |
| D6 Biometric | face vectors, voice biometrics, biometric-derived signals | isolated | prohibited by default |
| D7 Authorization | delegated limits, approval state, policy gates | restricted | prohibited by default |
| D8 Key Material | private keys, seeds, signing secrets | never | never |

### 4.1 Minimum Necessary Context

SERA should reason over the minimum information required for the task.

Example:

Instead of exposing an entire passport credential, provide:

```text
credential_type: passport
status: valid
requested_claim: nationality
issuer_status: trusted
```

### 4.2 Context Broker

A SERA Context Broker shall mediate access between wallet data and AI components.

```text
Wallet Data
   ↓
Classification
   ↓
Purpose Check
   ↓
Minimization
   ↓
Redaction / Transformation
   ↓
Approved Context Package
   ↓
SERA / Model
```

The Context Broker becomes a mandatory trust boundary.

---

## 5. AI Model Boundary

### 5.1 Models are untrusted for authority

Model output may inform decisions but is not itself authoritative.

### 5.2 Structured action intents

Natural language must be converted into deterministic, typed intents before execution.

Example:

```json
{
  "intent": "transfer_asset",
  "asset": "USDC",
  "amount": "500",
  "recipient": "did:soul:example",
  "network": "polygon",
  "confidence": 0.98
}
```

The action gateway validates each field independently.

### 5.3 No key access

LLM, speech model, planner and recommendation components must never receive:

- seed phrases,
- private keys,
- raw signing secrets,
- secure-element secrets,
- unrestricted signing handles.

---

## 6. Authority Classes

SERA shall operate under explicit authority classes.

### A0: Informational

Examples:
- answer wallet questions,
- summarize news,
- explain a transaction,
- show balances.

No execution authority.

### A1: Retrieval / Presentation Preparation

Examples:
- locate a credential,
- prepare a proof,
- prepare a receive request,
- prepare a transaction draft.

No irreversible execution.

### A2: Explicit-Approval Execution

Examples:
- send assets,
- swap assets,
- submit a credential proof,
- approve external connection.

Requires explicit holder authorization under the applicable policy.

### A3: Delegated Bounded Execution

Examples:
- recurring payment under a defined cap,
- pre-approved merchant payment,
- conditional transfer,
- scheduled task.

Must include scope, limit, expiry and revocation.

### A4: Conditional Autonomous Execution

Examples:
- rebalance within a bounded mandate,
- execute a permitted action when a threshold is met.

Requires a formal standing mandate, narrow scope, continuous policy checks and REV gating.

### A5: Prohibited Autonomous Authority

Certain actions should remain non-delegable unless a later controlled specification explicitly permits them.

Candidate examples:
- seed export,
- unrestricted wallet recovery changes,
- removal of all security controls,
- unlimited transaction authority,
- irreversible identity-root changes.

---

## 7. Delegated Authority Object

Delegated execution should be represented as a structured, revocable object.

```json
{
  "delegation_id": "...",
  "principal": "did:soul:holder",
  "agent": "did:soul:agent:sera",
  "capability": "pay_merchant",
  "asset": "USDC",
  "max_amount": "500",
  "counterparty_scope": ["merchant-id"],
  "frequency": "monthly",
  "valid_from": "...",
  "valid_until": "...",
  "device_scope": ["trusted-phone"],
  "revocable": true,
  "policy_ref": "..."
}
```

Delegation must never be inferred merely from repeated user behavior.

---

## 8. Device Trust Model

Devices are explicit participants in the authorization model.

### 8.1 Device classes

- Primary phone
- Secondary phone
- Apple Watch
- Wear OS watch
- Future wearable
- Web session
- Desktop session
- Hardware NFC extension

### 8.2 Device trust states

```text
UNREGISTERED
REGISTERED
ATTESTED
TRUSTED
LIMITED
SUSPENDED
REVOKED
```

### 8.3 Scope follows device

A trusted phone may support higher-risk authorization than a watch.

A wearable shall not automatically inherit the full authority of the paired phone.

Possible wearable scopes:

- view balances,
- receive alerts,
- answer low-risk prompts,
- present selected credentials,
- approve low-value actions,
- request transaction preparation,
- trigger emergency lock.

High-risk actions may require handoff to the primary phone or stronger authentication.

---

## 9. Wearable Phase 2 Boundary Requirements

Phase 1 must implement foundations that allow Phase 2 wearables without redesigning the trust model.

Required Phase 1 abstractions:

1. device-neutral intent objects,
2. device-specific authority scopes,
3. portable SERA session state,
4. portable notification/action schemas,
5. cross-device task continuation,
6. cryptographically bound device registration,
7. per-device revocation,
8. per-device capability policy,
9. wearable-safe credential presentation flows,
10. phone handoff for high-risk actions.

A wearable should be treated as another trusted endpoint, not a mirrored miniature phone.

---

## 10. Voice Boundary

Voice is a user-interface signal, not sufficient authorization by itself.

### 10.1 Voice understanding

Voice may contribute to:

- intent recognition,
- entity resolution,
- conversational continuity,
- holder adaptation,
- accessibility.

### 10.2 Voice identity

Speaker verification may contribute as an additional trust signal but must not be treated as sole authorization for consequential actions.

### 10.3 Uncertainty rule

> **Ambiguity may delay an action. Ambiguity must not move money or disclose identity claims.**

### 10.4 High-risk voice command

```text
Voice Command
   ↓
Speech Interpretation
   ↓
Intent + Entity Extraction
   ↓
Confidence Envelope
   ↓
Risk Classification
   ↓
If sufficient: prepare action
If insufficient: clarify
   ↓
REV / Policy
   ↓
Required Authentication
   ↓
Sign / Execute
```

---

## 11. Risk Classification

A preliminary action-risk model shall classify operations from R0 to R5.

| Risk | Description | Example |
|---|---|---|
| R0 | informational | show public news |
| R1 | personal/read-only | show balance |
| R2 | reversible/preparatory | prepare transfer |
| R3 | moderate consequence | low-value send, selected proof |
| R4 | high consequence | large transfer, new counterparty, sensitive disclosure |
| R5 | critical/systemic | recovery changes, broad delegation, identity-root changes |

Required confidence and authorization rise with risk.

---

## 12. Risk-Adaptive Confirmation

The same AI confidence must produce different outcomes depending on risk.

Example:

```text
92% confidence + R1
→ proceed

92% confidence + R4
→ explicit clarification / confirmation
```

Inputs may include:

- speech confidence,
- intent confidence,
- entity confidence,
- amount confidence,
- device trust,
- holder session assurance,
- counterparty familiarity,
- chain risk,
- spam/scam signals,
- transaction size,
- unusual behavior,
- delegation scope,
- external threat intelligence.

---

## 13. Multi-Chain Risk Boundary

SERA may recommend a chain but must not silently treat network choice as cosmetic.

Network selection may affect:

- fee,
- finality,
- bridge exposure,
- token contract legitimacy,
- counterparty compatibility,
- asset representation,
- policy compliance,
- security assumptions.

Chain selection must therefore produce a structured route object and pass deterministic validation.

Example:

```json
{
  "asset": "USDC",
  "source_chain": "ethereum",
  "target_chain": "polygon",
  "route_type": "direct",
  "fee_estimate": "...",
  "recipient_supported": true,
  "risk_flags": [],
  "route_confidence": 0.97
}
```

---

## 14. Spam Token and Malicious Asset Boundary

Existing spam-token filtering shall evolve from UI suppression into a SERA risk signal.

SERA should not:

- recommend interacting with a suspicious asset,
- include known spam assets in portfolio reasoning without clear labeling,
- propose swaps involving flagged contracts without elevated review.

Spam and malicious-token signals may feed Trust Protocol and REV but shall remain explainable and overridable only under appropriately strict policy.

---

## 15. External Intelligence Boundary

News, LinkedIn and other external APIs may enrich context but must not directly create execution authority.

External content may be:

- stale,
- incorrect,
- manipulated,
- adversarial,
- incomplete.

Therefore:

```text
External Information
   ↓
Source Validation
   ↓
Contextual Intelligence
   ↓
Recommendation

NOT

External Information
   ↓
Automatic Transaction
```

Any execution based on external intelligence must pass policy, authority and risk gates.

---

## 16. Trust Protocol and REV Placement

Trust Protocol evaluates whether the relevant identity, authority, delegation and policy relationships are acceptable.

REV acts as the runtime pass/fail decision point before consequential execution.

Target sequence:

```text
Holder Intent
   ↓
SERA Interpretation
   ↓
Action Proposal
   ↓
Deterministic Validation
   ↓
Trust Protocol
   ↓
REV
   ↓
Required Holder / Device Authentication
   ↓
Signing Boundary
   ↓
Execution
   ↓
Evidence
```

AURION may later contribute continuous attestation signals into REV for applicable flows.

---

## 17. Signing Boundary

The signing subsystem shall be isolated from the generative AI layer.

The signing boundary accepts only validated transaction or proof objects.

It must reject free-form natural-language execution requests.

### 17.1 Signing object characteristics

- canonical serialization,
- explicit network,
- explicit asset,
- explicit amount,
- explicit recipient,
- policy decision reference,
- REV result reference,
- authorization freshness,
- nonce / replay protections,
- evidence linkage.

---

## 18. Privacy-by-Default Rules

1. Local processing is preferred for sensitive context where feasible.
2. Raw voice recordings are not a Soulverse data asset by default.
3. Raw biometric material must not be exposed to general AI models.
4. External model calls receive minimized context.
5. User data must not be repurposed for model training without explicit consent.
6. Credential disclosure is claim-selective where possible.
7. Session memory and long-term memory are separate.
8. Holder-controlled deletion and reset paths are required.
9. Sensitive context should have retention limits.
10. Logs must avoid secret material.

---

## 19. Memory Boundary

SERA needs memory, but not all information should become durable memory.

### Memory classes

**M0 Ephemeral**
- current utterance,
- temporary reasoning context.

**M1 Session**
- current task,
- current chain selection,
- temporary entities.

**M2 Preference**
- preferred chains,
- display preferences,
- voice preferences.

**M3 Learned Holder Context**
- aliases,
- pronunciation adaptations,
- recurring non-sensitive behavioral patterns.

**M4 Sensitive Structured Context**
- delegated authority,
- transaction policies,
- credential preferences.

M4 must be cryptographically protected and governed separately from general conversational memory.

---

## 20. Prompt Injection and Adversarial Content

SERA will consume untrusted external data such as:

- token metadata,
- dApp content,
- websites,
- news,
- merchant responses,
- messages,
- credential metadata.

External content must be treated as data, not instruction.

The orchestration layer shall isolate:

```text
USER AUTHORITY
from
MODEL INSTRUCTIONS
from
EXTERNAL CONTENT
```

No content source may silently elevate its own privileges.

---

## 21. Explainability Requirement

For consequential actions, SERA should be able to explain:

- what she understood,
- what she proposes,
- which asset,
- which chain,
- which counterparty,
- which authority applies,
- what risk signals were considered,
- whether REV allowed the action,
- what requires user approval,
- what was ultimately executed.

This explanation must not reveal protected security internals.

---

## 22. Emergency Controls

The architecture should include holder-invoked emergency actions such as:

- lock wallet execution,
- revoke SERA delegations,
- suspend a device,
- revoke wearable authority,
- disable external integrations,
- freeze selected execution capabilities,
- switch SERA into read-only mode.

These controls should remain available even when AI services are degraded.

---

## 23. Offline and Degraded Modes

SERA should degrade safely.

### If cloud AI is unavailable

Allow:
- local wallet views,
- deterministic wallet operations,
- local credential access where supported,
- emergency controls.

Restrict:
- advanced reasoning,
- unsupported natural-language automation,
- external intelligence synthesis.

### If Trust Protocol / REV is unavailable

Consequential actions requiring those controls should fail closed unless a specific offline policy has been explicitly defined.

---

## 24. Audit and Evidence Model

Each consequential action should produce evidence sufficient to reconstruct:

- initiating device,
- SERA instance,
- holder session,
- interpreted intent,
- normalized action object,
- authority basis,
- policy version,
- REV decision,
- authentication method,
- signing event,
- execution result,
- final receipt.

Sensitive natural-language content should not automatically be stored verbatim when structured evidence is sufficient.

---

## 25. Preliminary Trust Boundary Diagram

```text
┌───────────────────────────────────────────────┐
│                  HOLDER                        │
└──────────────────────┬────────────────────────┘
                       │ voice / text / touch
                       ▼
┌───────────────────────────────────────────────┐
│                 DEVICE                        │
│  phone / watch / future wearable              │
│  device trust + local authentication           │
└──────────────────────┬────────────────────────┘
                       ▼
┌───────────────────────────────────────────────┐
│                 SERA                          │
│ understand • reason • recommend • orchestrate │
└──────────────────────┬────────────────────────┘
                       ▼
┌───────────────────────────────────────────────┐
│            CONTEXT & POLICY GATE               │
│ classification • minimization • validation     │
└──────────────────────┬────────────────────────┘
                       ▼
┌───────────────────────────────────────────────┐
│         TRUST PROTOCOL / REV                   │
│ identity • authority • delegation • policy     │
└──────────────────────┬────────────────────────┘
                       ▼
┌───────────────────────────────────────────────┐
│        AUTHENTICATION / SIGNING BOUNDARY       │
│ deterministic • key-isolated • explicit        │
└──────────────────────┬────────────────────────┘
                       ▼
┌───────────────────────────────────────────────┐
│                EXECUTION                       │
│ chain • credential • external service          │
└──────────────────────┬────────────────────────┘
                       ▼
                 Evidence / Receipt
```

---

## 26. Controlled Working Decisions

**DB05-D01** — SERA is not a signing authority merely because it is the primary interface.

**DB05-D02** — AI output shall never be treated as sufficient authorization for a consequential action.

**DB05-D03** — Key material remains outside the model context and planning layer.

**DB05-D04** — External intelligence may inform recommendations but cannot directly create transaction authority.

**DB05-D05** — Voice is an interpretation channel, not a standalone signing method.

**DB05-D06** — Delegated authority must be explicit, scoped, expiring and revocable.

**DB05-D07** — Device authority is explicit and per-device; wearables do not inherit unrestricted phone authority.

**DB05-D08** — Risk level determines required confidence, confirmation and authentication.

**DB05-D09** — Context available to models must be minimized before model access.

**DB05-D10** — Trust Protocol and REV remain in the execution path for actions that require them.

**DB05-D11** — Consequential execution must use deterministic typed objects, never free-form natural-language commands.

**DB05-D12** — SERA must fail safely under ambiguity, degraded connectivity or unavailable policy services.

**DB05-D13** — The system shall distinguish conversation memory from sensitive authorization memory.

**DB05-D14** — Wearable support is a Phase 2 launch objective but a Phase 1 trust-architecture requirement.

**DB05-D15** — Every consequential action must be inspectable and evidentiary after execution.

---

## 27. Architecture Inputs Produced by DB05

DB05 feeds directly into:

- SSW-AI-01 Platform Capability & Constraint Architecture
- SSW-AI-02 SERA Interaction, Intent & Authority Architecture
- SSW-AI-VOICE-01 Holder Voice Adaptation Architecture
- SSW-AI-VOICE-02 Voice Enrollment & Personal Language Profile
- future Device Trust & Wearable Authority specification
- future Context Broker specification
- future Delegation Object specification
- future Risk & Confirmation policy specification
- future REV binding specification

---

## 28. Next Recommended Drawing-Board Artifact

The next drawing-board artifact should be:

### **SSW-SERA-DB06: End-to-End User Journeys, Agent Actions & Cross-Device Interaction Flows**

DB06 should combine the experience models from DB03, technical feasibility from DB04, wearable foundations from DB04A and trust boundaries from DB05 into concrete journeys such as:

- ask and inspect,
- send payment,
- multi-chain route selection,
- credential presentation,
- suspicious-token warning,
- proactive news/risk alert,
- delegated recurring payment,
- voice correction,
- phone-to-watch handoff,
- wearable approval,
- emergency lock,
- offline/degraded mode.

This will allow the program to test whether the architecture remains coherent when used by a real holder from beginning to end.