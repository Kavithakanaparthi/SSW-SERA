# SSW-AI-01: Platform Capability & Constraint Architecture — Candidate Freeze

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-AI-01  
**Status:** Candidate Freeze  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA  
**Baseline Inputs:** SSW-SERA-DB01 through DB18, including DB04A, DB11A, DB17A and DB17B

## 1. Purpose

This document defines the candidate-freeze platform architecture for the AI-first evolution of Soul Super Wallet, with SERA as the primary interaction and orchestration layer while preserving deterministic wallet controls, holder authority, inspectable wallet state, cryptographic isolation, device-scoped trust, and recoverable operation under degraded conditions.

This specification establishes platform capabilities and non-negotiable constraints. It does not define detailed UX language, final API schemas, production deployment sizing, or implementation-specific technology choices unless necessary to preserve architectural invariants.

The governing principle is:

> SERA may understand, reason, recommend, prepare and orchestrate, but consequential execution remains bounded by holder authority, deterministic validation, device trust, policy, Trust Protocol, REV, authentication and isolated cryptographic signing.

## 2. Scope

SSW-AI-01 defines:

- the product/platform role of SERA;
- system trust boundaries;
- on-device versus cloud responsibility;
- identity and runtime separation;
- platform capability classes;
- authority classes and risk coupling;
- device trust and wearable constraints;
- model-provider abstraction;
- memory and context boundaries;
- SERA DID and portable-state architecture;
- activity/evidence architecture;
- external-intelligence boundaries;
- multi-chain capability constraints;
- concealed-detail presentation requirements;
- degraded-mode and offline behavior;
- signing and execution constraints;
- Phase 1 versus Phase 2 platform boundary;
- candidate-freeze invariants.

SSW-AI-02 will define the corresponding interaction, intent and authority architecture in greater detail.

## 3. Product Architecture Position

Soul Super Wallet evolves from a screen-coordinated wallet into a SERA-coordinated wallet.

Existing capabilities are preserved wherever technically and product-wise sound. The major change is who coordinates them.

Current pattern:

```text
Holder
  -> chooses screen
  -> selects feature
  -> supplies parameters
  -> chooses chain / route
  -> reviews result
  -> executes
```

Target pattern:

```text
Holder
  -> expresses intent
  -> SERA resolves context
  -> SERA prepares a valid action
  -> authority / risk / policy / REV gates evaluate
  -> holder approves where required
  -> isolated signer authorizes
  -> execution occurs
  -> evidence is recorded
```

SERA is therefore the primary interface and orchestration layer, not the root trust anchor, key custodian, or unrestricted transaction authority.

## 4. Candidate-Freeze System Model

The platform consists of the following conceptual layers:

```text
Holder Experience Layer
  SERA conversation / voice / adaptive workspace / alerts / wallet views

Intent & Context Layer
  Intent Engine
  Context Broker
  Holder Preferences
  Memory Retrieval
  Voice Adaptation
  External Intelligence Inputs

Orchestration Layer
  SERA Orchestrator
  Capability Registry
  Tool Registry
  Action Planner
  Route Resolver

Authority & Control Layer
  Holder Authority
  SERA Delegation
  Device Trust
  Risk Engine
  Policy Engine
  Trust Protocol
  REV

Presentation & Approval Layer
  Concealed Detail Controls
  Review Surfaces
  Cross-Device Handoff
  Authentication

Execution Security Layer
  Deterministic Validation
  Canonical Action Object
  Signing Boundary
  Replay / Idempotency Controls

Execution Layer
  Chain Adapters
  Credential Presentation
  WalletConnect / External Service Connectors
  Off-chain Integrations

Evidence & Recovery Layer
  SAEL Activity & Evidence Ledger
  Receipts
  Reconciliation
  Recovery / Degraded Mode
```

No single layer is permitted to combine unrestricted reasoning, authority, and signing capability.

## 5. SERA Identity Model

### 5.1 Holder identity

The human principal is identified through the holder's Soul ID:

```text
did:soul:<holder>
```

### 5.2 SERA agent identity

SERA has a persistent agent DID associated with and governed by the holder's Soul ID:

```text
did:soul:agent:<sera-instance-identity>
```

The SERA DID establishes persistent agent identity independent of device, runtime, model provider, cloud provider, storage provider or application installation.

### 5.3 SERA DID is not SERA runtime

The persistent SERA identity may have multiple authorized runtime instances:

```text
SERA DID
  +-- Primary Phone Runtime
  +-- Secondary Phone Runtime
  +-- Protected Cloud Reasoning Runtime
  +-- Apple Watch Runtime (Phase 2)
  +-- Wear OS Runtime (Phase 2)
```

Each runtime is separately registered, scoped and revocable.

A runtime does not inherit unrestricted authority simply because it resolves to the same SERA DID.

## 6. SERA Portable State Architecture

SERA identity, SERA state, and SERA evidence are separate architectural objects.

### 6.1 Portable state purpose

Portable state exists to restore holder-specific continuity, including appropriately classified:

- personalization;
- aliases;
- language preferences;
- voice adaptation;
- notification preferences;
- concealed-detail preferences;
- non-secret automation preferences;
- holder-approved long-term memory;
- wallet-context preferences.

### 6.2 State manifest

Portable state is referenced by a signed SERA State Manifest associated with the SERA DID and holder DID.

Conceptual form:

```json
{
  "type": "SERAStateManifest",
  "sera_did": "did:soul:agent:...",
  "holder_did": "did:soul:...",
  "state_version": 27,
  "previous_state_cid": "bafy...",
  "current_state_cid": "bafy...",
  "encryption_profile": "SSW-SERA-STATE-ENC-1",
  "schema_version": "1.0",
  "created_at": "...",
  "signature_ref": "..."
}
```

### 6.3 Persistence model

Portable SERA state uses a hybrid persistence model:

- encrypted local copy;
- encrypted content-addressed archive, including IPFS-compatible persistence where used;
- optional encrypted cloud replicas for availability and synchronization;
- redundant persistence permitted across trusted infrastructure.

Storage location does not establish SERA identity or authority.

### 6.4 Prohibited portable-state contents

Portable state must not contain:

- private wallet keys;
- seed phrases;
- unrestricted recovery secrets;
- raw device Secure Enclave / keystore key material;
- raw biometric templates;
- unrestricted signing handles;
- privileged Trust Protocol secrets;
- privileged REV secrets.

### 6.5 Recovery principle

> SERA is recovered through identity continuity, not through a conventional cloud account.

## 7. SERA Activity & Evidence Architecture

SERA conversational memory must not be treated as an audit source.

All material actions are recorded in the SERA Activity & Evidence Ledger (SAEL), a separate audit-grade domain.

SAEL supports:

- SERA-assisted transaction reporting;
- SERA-prepared actions;
- holder-approved actions;
- delegated autonomous actions;
- blocked or failed actions;
- REV outcomes;
- device and authentication evidence;
- credential presentation evidence;
- route and chain decisions;
- mandate usage;
- external-intelligence provenance when material;
- security and recovery events.

The holder must be able to request reports such as:

- SERA-assisted transactions for a selected period;
- autonomously executed actions;
- actions blocked by REV;
- transactions by asset, chain or counterparty;
- credential disclosures;
- accountant / audit exports.

SAEL uses structured ledger records, not model recollection, as the source of truth.

## 8. On-Device SERA Capability Floor

The platform must retain a minimum useful SERA experience when cloud reasoning is unavailable.

The Phase 1 on-device capability floor includes, subject to platform support and local implementation:

- invocation and core SERA shell;
- deterministic wallet navigation;
- local balance / asset views from available cache/state;
- holder-approved credential retrieval where local data is available;
- concealed-detail presentation controls;
- emergency controls;
- local preference application;
- basic intent routing for supported deterministic commands;
- review of locally available receipts / activity;
- safe handoff to deterministic wallet functions;
- clear degraded-mode indication.

On-device capability does not imply unrestricted local generative reasoning.

## 9. Cloud SERA Responsibility Boundary

Cloud reasoning may provide:

- advanced natural-language understanding;
- multi-step planning;
- contextual synthesis;
- external-intelligence summarization;
- non-secret personalization inference;
- recommendation generation;
- route comparison;
- long-running task coordination;
- complex conversational continuity.

Cloud reasoning must not receive or control:

- private keys;
- seed phrases;
- raw unrestricted signing capability;
- raw device-security secrets;
- unrestricted biometric material;
- authority solely by virtue of being the active model runtime.

Cloud output is advisory or preparatory until converted into deterministic typed objects and evaluated by the control plane.

## 10. Provider-Neutral Model Abstraction

SERA must not be architecturally coupled to a single model vendor.

The platform requires a model abstraction layer capable of routing tasks across:

- local models;
- Soulverse-hosted models;
- third-party cloud models;
- specialist models;
- future platform-native models.

The abstraction layer must standardize at least:

- task type;
- allowed context class;
- response schema;
- tool permissions;
- retention constraints;
- training-use policy;
- latency / availability metadata;
- cost policy where relevant;
- model capability requirements;
- failure fallback behavior.

Model selection must not modify holder authority.

## 11. Context Broker

All model-facing holder context passes through a Context Broker.

The canonical flow is:

```text
Wallet / Identity / Memory / External Data
        |
        v
Data Classification
        |
        v
Purpose Check
        |
        v
Minimum Necessary Selection
        |
        v
Redaction / Transformation
        |
        v
Approved Context Package
        |
        v
SERA / Model Runtime
```

The model must not receive unrestricted access to the wallet data plane.

## 12. Data Classification Baseline

The platform recognizes at least:

- **D0 Public:** chain metadata, public token data, public news;
- **D1 General Personal:** preferences, aliases, UI choices;
- **D2 Financial:** balances, holdings, transaction history;
- **D3 Identity:** Soul ID metadata, issuer references;
- **D4 Credential:** VC claims, credential status, proofs;
- **D5 Behavioral:** voice adaptation, usage patterns, corrections;
- **D6 Biometric:** derived biometric material;
- **D7 Authorization:** delegations, approval scope, policy gates;
- **D8 Key Material:** private keys, seeds, signing secrets.

D8 is never model context.

D6 and D7 are prohibited from general external-model exposure by default.

D2-D5 require minimization and purpose restriction.

## 13. Memory Classes

SERA memory is segmented:

- **M0 Ephemeral:** current reasoning / current utterance;
- **M1 Session:** active task context;
- **M2 Preferences:** display, chain and interaction preferences;
- **M3 Learned Holder Context:** aliases, pronunciation, recurring non-sensitive patterns;
- **M4 Sensitive Structured Context:** delegated authority, transaction-policy references, sensitive credential preferences.

M4 must be cryptographically protected and separated from general conversational memory.

Memory never creates authority.

## 14. Voice Capability Constraint

Voice is a first-class interaction channel but not a signing authority.

Voice may contribute to:

- intent interpretation;
- entity resolution;
- accessibility;
- personalization;
- context selection;
- low-risk navigation.

Voice alone must not authorize consequential transactions or sensitive disclosure.

High-risk voice-originated actions require risk-appropriate confirmation and authentication.

The uncertainty rule is:

> Ambiguity may delay an action. Ambiguity must not move money or disclose identity claims.

## 15. Authority Classes

The candidate baseline defines:

- **A0 Informational:** read / explain;
- **A1 Preparation:** retrieve, draft, prepare, stage;
- **A2 Explicit Approval Execution:** holder-approved send, swap, proof, external connection;
- **A3 Delegated Bounded Execution:** explicit mandate with limits and revocation;
- **A4 Conditional Autonomous Execution:** standing mandate with formal bounded conditions and continuous control checks;
- **A5 Prohibited Autonomous Authority:** unrestricted recovery changes, unlimited value authority, unrestricted identity-root changes, equivalent critical actions.

Repeated holder behavior must never be interpreted as implicit delegation.

## 16. Canonical Delegated Authority Object

Delegated autonomy requires a machine-enforceable mandate containing, at minimum:

```text
mandate_id
principal_did
agent_did
capability
asset_scope
chain_scope
counterparty_scope
per_action_limit
cumulative_limit
frequency
valid_from
valid_until
device_scope
conditions
revocation_state
policy_ref
```

SERA cannot expand, reinterpret or self-renew a mandate beyond explicitly permitted semantics.

## 17. Risk Classes

The platform uses risk-adaptive controls:

- **R0:** public informational;
- **R1:** personal/read-only;
- **R2:** reversible/preparatory;
- **R3:** moderate consequential action;
- **R4:** high-risk value transfer / sensitive disclosure / unusual action;
- **R5:** critical recovery, identity-root, broad delegation or equivalent action.

The same model confidence can produce different execution requirements depending on risk class.

## 18. Device Trust Model

Canonical device trust states are:

```text
UNREGISTERED
REGISTERED
ATTESTED
TRUSTED
LIMITED
SUSPENDED
REVOKED
```

Authority follows explicit device scope.

A paired or authenticated device does not automatically inherit the authority of the primary phone.

Device trust may affect:

- review visibility;
- concealed-detail reveal rules;
- approval eligibility;
- credential presentation;
- delegated action scope;
- cross-device handoff;
- emergency lock / revocation actions.

## 19. Wearables

Wearables are a Phase 2 product surface and a Phase 1 architectural constraint.

Phase 1 must therefore preserve abstractions for:

- device-neutral intents;
- per-device authority;
- portable SERA state;
- notifications;
- approval requests;
- credential presentation;
- cross-device task continuation;
- device registration / revocation;
- high-risk phone handoff.

Wearables do not inherit unrestricted primary-phone authority.

## 20. Concealed Detail Presentation

Concealed-detail mode is a Phase 1 core privacy feature.

A holder may receive an alert or approval request without exposing sensitive details on screen or by voice.

Sensitive fields may include:

- amount;
- balance;
- recipient;
- merchant;
- asset;
- chain;
- wallet address;
- credential claim;
- verifier;
- transaction memo;
- security detail.

The holder may reveal information per instance.

The platform may automatically re-conceal on:

- timeout;
- screen lock;
- app backgrounding;
- device transition;
- wearable sleep;
- policy trigger.

Critical invariant:

> Reveal is not approval.

For high-risk actions, policy may require authenticated reveal before final approval so the holder has a meaningful opportunity to review material transaction terms.

## 21. Multi-Chain Capability

SERA may reason about chain selection using structured inputs including:

- asset availability;
- balances;
- recipient compatibility;
- fees;
- route type;
- expected settlement characteristics;
- bridge exposure;
- token legitimacy;
- network health;
- policy;
- holder preference;
- counterparty context.

SERA produces a typed route object.

The deterministic control plane validates the route independently before signing or execution.

Chain recommendation does not equal authority to transact.

## 22. Spam and Suspicious-Asset Intelligence

Existing spam-token filtering becomes a control-plane risk signal rather than only a UI filter.

SERA must not silently treat suspicious assets as legitimate portfolio inputs.

Spam / risk signals may influence:

- recommendation suppression;
- warning severity;
- transaction review;
- risk class;
- Trust Protocol inputs;
- REV inputs.

Historical evidence must not be rewritten when later classifications change.

## 23. External Intelligence

News, LinkedIn, market data and other external sources may enrich SERA context.

External data is untrusted input and may be stale, manipulated, adversarial, incomplete or wrong.

The architecture therefore requires:

```text
External Source
  -> Source Validation
  -> Context / Intelligence
  -> Recommendation / Risk Signal
```

not:

```text
External Source
  -> Automatic Transaction Authority
```

External content is data, never instruction.

## 24. Trust Protocol and REV

Trust Protocol evaluates the relevant combination of:

- identity;
- authority;
- delegation;
- policy;
- trust state.

REV provides the final runtime allow / deny decision where the execution path requires it.

Reference path:

```text
Holder Intent / Trigger
  -> SERA Interpretation
  -> Deterministic Action Object
  -> Authority Resolution
  -> Risk Classification
  -> Trust Protocol
  -> REV
  -> Required Holder / Device Authentication
  -> Signing Boundary
  -> Execution
  -> Evidence
```

### 24.1 Degraded behavior

If an action requires Trust Protocol or REV and the required control service is unavailable, the action fails closed unless a separately defined explicit offline policy authorizes a narrow alternative path.

The AI layer must never create its own fallback authorization.

## 25. Signing Boundary

The signing boundary is isolated from generative AI and general orchestration.

It accepts only canonical validated objects.

A signing request must include, as applicable:

- asset;
- amount;
- recipient;
- network;
- chain ID;
- policy decision reference;
- REV reference;
- authorization freshness;
- nonce / replay controls;
- evidence linkage.

It must reject free-form natural-language execution requests.

## 26. Execution Safety

All consequential execution paths require:

- deterministic schemas;
- canonical serialization;
- idempotency controls;
- replay protection;
- status tracking;
- uncertain-result handling;
- reconciliation;
- evidence emission.

The system must never interpret a timeout as proof that an external action did not occur.

## 27. Failure and Degraded Modes

The wallet must degrade by reducing authority before reducing safety.

Failure conditions include:

- AI runtime unavailable;
- network unavailable;
- stale wallet data;
- RPC failure;
- chain outage;
- external API outage;
- Trust Protocol unavailable;
- REV unavailable;
- authentication failure;
- signing failure;
- wearable disconnect;
- cross-device state divergence;
- uncertain transaction submission.

Where cloud AI is unavailable, deterministic wallet functions and emergency controls remain available where technically possible.

Where required control-plane decisions are unavailable, consequential execution fails closed.

## 28. Emergency Controls

The platform must support recovery paths independent of advanced AI availability, including:

- read-only mode;
- suspend SERA delegations;
- revoke a device;
- revoke wearable authority;
- disable external integrations;
- freeze selected execution capability;
- lock wallet execution;
- inspect recent activity / receipts where locally available.

Emergency operations must not depend on unrestricted cloud reasoning.

## 29. Evidence and Explainability

Every material action must produce enough structured evidence to reconstruct:

- what initiated the action;
- what SERA interpreted;
- what context materially influenced it;
- what authority existed;
- what risk class applied;
- what Trust Protocol evaluated;
- what REV decided;
- what authentication occurred;
- what was signed;
- what was executed;
- what result was observed;
- what post-action state changed.

Explainability uses structured facts and reason codes, not hidden model reasoning.

## 30. Platform Trust Zones

The logical deployment architecture separates at least:

1. Holder interaction zone;
2. Device security and key zone;
3. Wallet control-plane zone;
4. SERA intelligence zone;
5. Execution adapter zone;
6. External intelligence zone;
7. Evidence / assurance zone;
8. Operations / administration zone.

No single zone may possess unrestricted AI context, authority state, execution capability and signing secrets together.

## 31. Phase 1 Candidate Scope

Phase 1 core includes:

- SERA-first wallet shell;
- text and supported voice interaction;
- balances / portfolio inspection;
- send / receive / swap orchestration around existing wallet functions;
- multi-chain route assistance;
- credential retrieval / proof preparation;
- WalletConnect mediation where supported;
- Context Broker;
- capability / tool registry;
- risk engine;
- device trust;
- Trust Protocol / REV binding where required;
- deterministic approval / signing boundary;
- concealed-detail mode;
- SAEL evidence ledger;
- SERA DID identity;
- encrypted portable SERA state foundation;
- emergency controls;
- degraded-mode behavior;
- migration path to SERA-first default.

## 32. Phase 1 Feature-Flagged / Controlled Rollout

The following may exist behind controlled rollout gates depending on implementation readiness:

- advanced proactive intelligence;
- higher-order memory personalization;
- delegated bounded automation;
- selected long-running agent tasks;
- autonomous conditional actions under formal mandates;
- advanced external-intelligence correlations;
- advanced cross-device state continuation.

Feature gating must not bypass architectural controls.

## 33. Phase 2 Product Surface

Phase 2 includes wearable product launch capabilities such as:

- Apple Watch interaction surfaces;
- Wear OS interaction surfaces;
- wearable credential presentation;
- low-risk approvals within explicit wearable authority;
- phone-to-watch and watch-to-phone continuation;
- wearable emergency lock;
- wearable SERA interaction.

Phase 2 uses the Phase 1 device-neutral authority and state abstractions rather than creating a parallel architecture.

## 34. Migration from Existing Soul Super Wallet

The migration sequence is:

```text
Existing Wallet + Existing SERA
      |
      v
Enhanced SERA Assistant
      |
      v
SERA as Primary Coordinator
      |
      v
SERA-First Default Experience
      |
      v
Controlled Delegated Automation
      |
      v
Wearable Expansion
```

Existing deterministic wallet screens remain inspectable and available during migration.

The platform must support rollback from SERA-first interaction to conventional wallet navigation without invalidating wallet state, credentials, balances or key access.

## 35. Candidate-Freeze Invariants

The following invariants are frozen at candidate level:

1. SERA is the primary interface and orchestrator, not the root authority.
2. AI output never constitutes sufficient execution authorization.
3. Private keys and seed material never enter model context.
4. SERA has a persistent `did:soul:agent` identity linked to the holder's Soul ID.
5. SERA identity, runtime, portable state and activity evidence are separate architectural domains.
6. Portable SERA state is encrypted, versioned and holder-controlled.
7. Storage providers do not define SERA identity or authority.
8. SERA evidence is derived from SAEL, not conversational memory.
9. Delegated autonomy requires explicit, machine-enforceable mandates.
10. Device authority is explicit and scoped per device.
11. Wearables do not inherit unrestricted phone authority.
12. Voice is an interpretation channel, not a standalone signing method.
13. Consequential execution uses deterministic typed objects.
14. Trust Protocol and REV remain in the execution path where required.
15. Required Trust Protocol / REV outages fail closed absent explicit narrow offline policy.
16. The signing boundary remains isolated from generative AI.
17. Concealed-detail mode is a Phase 1 privacy capability.
18. Reveal and approval are separate states.
19. External intelligence may inform but never create authority.
20. Model providers are replaceable behind a provider-neutral abstraction.
21. The wallet retains a minimum deterministic on-device capability floor.
22. Cross-device continuity never overrides device-scoped authority.
23. Failure modes reduce capability before relaxing trust controls.
24. Every material execution produces reconstructable evidence.
25. Existing wallet capabilities are preserved unless explicitly deprecated through controlled migration.

## 36. Dependencies on Subsequent Specifications

This document is normative input to:

- **SSW-AI-02:** SERA Interaction, Intent & Authority Architecture;
- **SSW-AI-VOICE-01:** Holder Voice Adaptation, Understanding & Command Safety Architecture;
- **SSW-AI-VOICE-02:** Voice Enrollment, Adaptation & Personal Language Profile Specification;
- future Device Trust & Wearable Authority Specification;
- future Context Broker Specification;
- future Delegated Authority Object Specification;
- future Risk & Confirmation Policy Specification;
- future REV Binding Specification;
- future SERA State Manifest & Recovery Specification;
- future SAEL Schema & Audit Reporting Specification.

## 37. Candidate Freeze Status

The architecture is considered ready for Candidate Freeze at the platform-capability level.

Items intentionally left for subordinate specifications include:

- exact model-vendor selection;
- precise cloud topology and autoscaling;
- cryptographic profile selection for all portable-state objects;
- exact SAEL physical storage technology;
- exact retention durations by jurisdiction;
- detailed wearable UI behavior;
- final voice-model implementation;
- detailed API payload schemas;
- provider-specific RPC / chain-adapter configuration;
- final policy thresholds and risk scoring constants.

These implementation decisions may evolve without reopening SSW-AI-01 provided they do not violate the candidate-freeze invariants.

## 38. Freeze Gate

SSW-AI-01 may advance from Candidate Freeze to Controlled Architecture Freeze after:

1. SSW-AI-02 is drafted and cross-checked against this baseline;
2. no contradiction is found between interaction/authority flows and the platform invariants;
3. SERA DID, portable-state, SAEL, concealed-detail and degraded-mode requirements remain intact;
4. implementation planning confirms that the existing Soul Super Wallet can migrate without breaking current deterministic wallet access.

Until then, changes to Sections 5 through 35 require an explicit architecture decision record rather than silent modification.
