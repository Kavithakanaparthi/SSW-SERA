# SSW-SERA-DB18: Pre-Freeze Closure Decisions & Candidate Architecture Baseline

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB18  
**Status:** Candidate Baseline / Pre-Freeze Closure  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA  

## 1. Purpose

This document closes the remaining architecture blockers identified in SSW-SERA-DB17 and establishes the candidate baseline that shall govern the drafting of SSW-AI-01 and SSW-AI-02.

DB18 incorporates the controlled decisions established in DB01 through DB17, together with DB17A and DB17B. It is not a replacement for those source documents. It is the pre-freeze decision layer that converts them into a coherent candidate architecture baseline.

The governing principle is:

> The architecture freeze shall preserve SERA as a DID-bound, holder-controlled orchestration agent whose reasoning, memory, authority, execution and evidence are separated into explicit trust domains.

## 2. Freeze Readiness Decision

The program is **ready to proceed to Candidate Freeze drafting** for:

- **SSW-AI-01: Platform Capability & Constraint Architecture**; and
- **SSW-AI-02: SERA Interaction, Intent & Authority Architecture**.

The eight blockers identified in DB17 are closed in this document at architecture level. Implementation details remain to be specified in subordinate technical specifications, but none of those implementation choices shall be permitted to violate the baseline decisions below.

## 3. Closure Decision 01: Minimum Guaranteed On-Device SERA Runtime

### Decision

Phase 1 shall guarantee an on-device SERA capability floor sufficient to preserve safe wallet operation when cloud AI services are unavailable.

The minimum local runtime shall support:

- holder session establishment;
- local wallet state inspection;
- balances and transaction history retrieval from locally available state;
- credential discovery and locally available presentation preparation;
- deterministic intent handling for approved high-frequency wallet commands;
- concealed-detail presentation controls;
- emergency lock, revoke and read-only controls;
- cached holder preferences required for presentation and safety;
- local voice-command handling where device capability permits;
- safe fallback from unsupported natural-language requests to deterministic UI actions;
- generation of structured action requests for later online execution where permitted.

The minimum local runtime is not required to perform full general-purpose reasoning, long-context synthesis, external-intelligence aggregation or advanced autonomous planning.

### Constraint

Cloud unavailability shall reduce convenience and intelligence, not remove the holder's ability to inspect, secure or safely operate core wallet functions.

## 4. Closure Decision 02: Cloud Runtime Responsibility Boundary

### Decision

Cloud SERA runtimes may perform:

- advanced natural-language understanding;
- long-context reasoning;
- multi-source intelligence synthesis;
- route comparison;
- complex planning;
- recommendation generation;
- background monitoring and notification preparation;
- policy-safe task decomposition.

Cloud SERA runtimes shall not possess:

- wallet private keys;
- seed phrases;
- unrestricted signing handles;
- raw biometric templates;
- unrestricted delegated authority merely by virtue of being SERA;
- authority to bypass Trust Protocol, REV, device policy or holder approval requirements.

Cloud runtime output must be transformed into typed, deterministic action objects before entering the execution control plane.

### Baseline Rule

> Cloud SERA may reason about an action. It does not become the authority that makes the action valid.

## 5. Closure Decision 03: Provider-Neutral Model Abstraction Contract

### Decision

SSW-SERA shall use a provider-neutral model abstraction layer.

No core wallet authority, memory, portability, evidence, mandate or execution contract may depend on a specific model provider.

The model abstraction contract shall normalize at minimum:

- input context packages;
- tool/capability descriptions;
- structured intent output;
- structured recommendation output;
- tool-call proposals;
- confidence metadata where available;
- safety/policy refusal states;
- latency and availability state;
- provider/model identity for evidence and debugging;
- local versus remote execution classification.

Provider-specific capabilities may be used behind adapters but may not redefine the canonical SERA intent or execution schemas.

### Consequence

SERA identity and holder continuity remain stable even if the model provider, model version or runtime location changes.

## 6. Closure Decision 04: Trust Protocol / REV Degraded-Availability Behavior

### Decision

Trust Protocol and REV are control-plane dependencies for consequential operations where policy requires them.

If either service is unavailable:

- informational and read-only operations may continue where safe;
- locally authorized low-risk deterministic actions may continue only if an explicit offline policy permits them;
- actions requiring current Trust Protocol or REV evaluation shall fail closed;
- delegated or autonomous execution shall not silently downgrade to direct execution;
- previously issued PASS decisions shall not be reused beyond their validity/freshness window;
- the holder shall receive a clear degraded-mode status without disclosure of sensitive internal details;
- deferred actions may be prepared but shall not be executed until required controls are restored.

### Architecture Principle

> Missing control infrastructure is not implied permission.

## 7. Closure Decision 05: Canonical Delegated-Authority Mandate Schema

### Decision

All delegated SERA authority shall be represented by a canonical machine-enforceable mandate object.

Minimum mandate fields shall include:

```json
{
  "mandate_id": "...",
  "principal_did": "did:soul:holder:...",
  "agent_did": "did:soul:agent:sera:...",
  "capability": "...",
  "asset_scope": ["..."],
  "counterparty_scope": ["..."],
  "chain_scope": ["..."],
  "per_action_limit": "...",
  "cumulative_limit": "...",
  "frequency_limit": "...",
  "valid_from": "...",
  "valid_until": "...",
  "device_scope": ["..."],
  "condition_set": ["..."],
  "policy_ref": "...",
  "revocable": true,
  "version": 1
}
```

Mandates shall be explicit, versioned, revocable and inspectable. Repeated holder behavior shall never create a mandate by inference.

SERA shall not alter, broaden or renew her own mandate without explicit holder-authorized process.

## 8. Closure Decision 06: Canonical Device-Trust State Semantics

### Decision

All SERA-capable devices and runtimes shall use the following canonical trust states:

- `UNREGISTERED`
- `REGISTERED`
- `ATTESTED`
- `TRUSTED`
- `LIMITED`
- `SUSPENDED`
- `REVOKED`

Device trust and device authority are related but distinct.

A trusted device may still have limited authority. A wearable, for example, may be `TRUSTED` while being authorized only for balance viewing, alerts, selected credential presentation, low-value approvals, task initiation and emergency lock.

No secondary device or wearable automatically inherits the authority of the primary phone.

Cloud SERA runtimes are runtime identities, not holder-trusted signing devices, unless a future architecture explicitly defines otherwise.

## 9. Closure Decision 07: Default Concealed-Detail Policy

### Decision

Concealed-detail presentation is a Phase 1 core privacy control.

Default behavior shall be context-sensitive:

- lock-screen alerts: conceal sensitive financial and identity details by default;
- wearable alerts: stricter concealment by default;
- in-app alerts: follow holder preference and current session assurance;
- high-risk approvals: may require authenticated reveal before final authorization;
- spoken output: sensitive values shall not be spoken unless allowed by holder preference and current context;
- per-instance reveal shall be supported without changing the global preference;
- revealed information shall automatically re-conceal on screen lock, app backgrounding, session expiry, device change or policy-defined timeout.

### Critical Rule

> Reveal is not approval.

The presentation layer shall preserve a clear separation between viewing sensitive detail and authorizing the underlying action.

## 10. Closure Decision 08: SERA Memory Recovery and Portability

### Decision

SERA identity, SERA state and SERA evidence are separate architectural objects.

### 10.1 SERA Identity

SERA shall possess a persistent `did:soul:agent` identity linked to and governed by the holder's Soul ID.

Conceptually:

```text
Holder
  did:soul:holder
        |
        | controls / delegates
        v
SERA
  did:soul:agent:sera
```

The SERA DID is independent of device, model provider, runtime provider and storage provider.

### 10.2 Portable SERA State

Holder-specific SERA state shall be stored as encrypted, versioned, portable state objects referenced through signed SERA state manifests.

Portable state may include:

- preferences;
- approved aliases;
- personalization;
- language settings;
- voice adaptation profile;
- holder-approved memory;
- notification settings;
- concealed-detail preferences;
- non-secret automation preferences;
- wallet-context preferences.

Portable state shall not include:

- private keys;
- seed phrases;
- raw recovery secrets;
- biometric templates;
- unrestricted signing handles;
- device secure-element keys;
- privileged Trust Protocol or REV secrets.

### 10.3 Persistence

Encrypted content-addressed storage such as IPFS may be used for portable integrity and decentralized recovery, with redundant pinning and/or encrypted cloud replicas for availability.

No cloud provider, IPFS provider or pinning provider becomes the authoritative identity or authority source for SERA.

The authoritative continuity chain is:

```text
Holder DID
   -> SERA DID
      -> signed state manifest
         -> encrypted versioned state object(s)
```

### 10.4 Recovery Principle

> SERA is recovered through identity, not through an account.

## 11. SERA Activity & Evidence Ledger Baseline

DB17B is incorporated into the candidate baseline.

SERA's portable state shall not be used as the authoritative record of what SERA did.

A separate **SERA Activity & Evidence Ledger (SAEL)** shall support:

- user activity history;
- SERA-assisted transaction reporting;
- autonomous-action reporting;
- blocked-action history;
- approval history;
- mandate usage history;
- audit reporting;
- dispute reconstruction;
- integrity verification;
- selective export.

SAEL shall distinguish at minimum:

- `EXPLAINED`
- `RECOMMENDED`
- `PREPARED`
- `EXECUTED_AFTER_APPROVAL`
- `EXECUTED_UNDER_MANDATE`
- `BLOCKED`
- `FAILED`

### Storage Baseline

SAEL may use a hybrid persistence model:

1. encrypted indexed storage for search and reporting;
2. local device cache for recent history and offline receipts;
3. encrypted content-addressed archival bundles for long-term integrity and portability;
4. periodic integrity checkpoints or equivalent tamper-evident digests.

Conversation memory shall never be the source of truth for audit reports.

## 12. Candidate Architecture Baseline

The following principles are now candidate-frozen for SSW-AI-01 and SSW-AI-02:

### 12.1 Experience

- SERA is the primary interaction and orchestration layer.
- Conventional wallet state remains inspectable and directly accessible.
- No separate AI tab is required as the principal interaction model.
- Voice is first-class but not an authorization primitive.
- Concealed-detail mode is a core privacy capability.

### 12.2 Identity

- Holder identity is rooted in Soul ID.
- SERA has her own `did:soul:agent` identity linked to the holder.
- Runtime instances are subordinate to SERA identity and individually scoped.

### 12.3 Reasoning and Execution

- AI output is never sufficient authorization.
- Free-form language must become deterministic typed intent/action objects before execution.
- SERA remains outside the signing boundary.
- Trust Protocol and REV remain in the consequential execution path where required.

### 12.4 Authority

- Delegation is explicit, scoped, expiring and revocable.
- Device authority is scoped per device.
- Wearables are Phase 2 product surfaces but Phase 1 architecture constraints.
- Autonomous actions exist only inside valid mandates and current runtime policy.

### 12.5 Memory and State

- Conversation memory, sensitive authorization state, portable SERA state and execution evidence are separate stores/domains.
- SERA portable state is encrypted, versioned and recoverable through DID continuity.
- Storage providers do not become identity providers.

### 12.6 Evidence

- Consequential actions emit reconstructable evidence.
- SAEL is the source of truth for SERA action reporting and audit retrieval.
- Auditability must not become surveillance; evidence remains minimized and selectively disclosable.

### 12.7 Resilience

- Core wallet safety survives AI degradation.
- Missing control infrastructure does not create authority.
- Uncertain transaction outcomes are reconciled before retry.
- Emergency lock/revoke controls remain available independently of advanced AI.

## 13. Candidate Freeze Invariants

The following invariants shall not be violated by SSW-AI-01, SSW-AI-02 or subordinate specifications without an explicit architecture change record:

1. SERA does not hold unrestricted wallet signing authority.
2. AI output does not authorize consequential execution.
3. Holder DID and SERA DID remain distinct identities.
4. Runtime identity does not equal SERA identity.
5. SERA portable state does not contain wallet private keys or seed phrases.
6. SERA evidence is not reconstructed from conversational memory.
7. Device trust does not imply unrestricted device authority.
8. Wearable authority is independently scoped.
9. Reveal and Approve are distinct actions.
10. Delegated authority is explicit and machine-enforceable.
11. Trust Protocol/REV outages fail closed where their current decision is required.
12. External intelligence may influence recommendation and risk but does not independently create execution authority.
13. Cloud AI may reason but cannot bypass the control plane.
14. Storage provider availability never becomes the source of SERA identity or authority.
15. Every consequential autonomous action must be attributable to a valid mandate and evidence chain.

## 14. Items Deferred Beyond Architecture Freeze

The following remain implementation or subordinate-specification questions and do not block SSW-AI-01 or SSW-AI-02:

- exact local model family and model size;
- specific cloud model providers;
- exact IPFS pinning/storage vendors;
- exact database engine for SAEL indexing;
- exact retention periods by jurisdiction;
- exact cryptographic envelope format for SERA portable state;
- exact Merkle/checkpoint implementation for long-term evidence;
- device-attestation vendor mechanisms;
- wearable platform-specific interaction details;
- detailed UX motion, copy and visual design;
- production SLO values and operational thresholds.

These must conform to the candidate baseline above.

## 15. Architecture Freeze Gate

The program may proceed to draft SSW-AI-01 and SSW-AI-02 as Candidate Freeze documents if the following conditions are maintained:

- no unresolved decision contradicts DB18;
- DB17A and DB17B are treated as normative source inputs;
- any newly discovered contradiction is recorded before freeze rather than silently resolved in implementation;
- product UX and engineering artifacts reference the same canonical identity, authority and evidence model.

## 16. Next Controlled Deliverables

The immediate next controlled deliverables are:

1. **SSW-AI-01: Platform Capability & Constraint Architecture — Candidate Freeze**
2. **SSW-AI-02: SERA Interaction, Intent & Authority Architecture — Candidate Freeze**

Subsequent specifications should include:

- SERA DID and State Manifest schema;
- SERA portable-state encryption and recovery profile;
- SAEL schema and reporting contract;
- Delegated Authority Mandate schema;
- Device Trust and Runtime Identity specification;
- Context Broker contract;
- REV binding specification;
- Voice Enrollment, Adaptation & Personal Language Profile specification;
- Wearable Authority and Handoff specification.

## 17. Candidate Baseline Statement

The architecture candidate baseline is therefore:

> Soul Super Wallet shall evolve into a SERA-first, DID-bound, multi-device wallet experience in which SERA acts as the holder's persistent intelligent orchestration agent while identity, memory, authority, execution, signing and evidence remain separated into explicit trust domains. SERA shall possess her own DID linked to the holder's Soul ID, maintain encrypted portable state recoverable through identity continuity, operate through scoped runtime instances, and produce an independent audit-grade activity and evidence record for consequential actions. AI reasoning may improve understanding, planning and coordination, but execution remains governed by deterministic contracts, explicit authority, device trust, policy, Trust Protocol, REV, holder authentication where required, isolated signing and reconstructable evidence.

This baseline is approved for conversion into SSW-AI-01 and SSW-AI-02 Candidate Freeze architecture documents.
