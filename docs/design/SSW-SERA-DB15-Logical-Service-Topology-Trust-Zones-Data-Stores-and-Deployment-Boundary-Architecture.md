# SSW-SERA-DB15: Logical Service Topology, Trust Zones, Data Stores & Deployment Boundary Architecture

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB15  
**Status:** Controlled Design Board / Pre-Architecture  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

This document converts the runtime control-plane design into an implementation-oriented logical topology. It defines where major services execute, which trust zone owns each responsibility, what data each zone may hold, how information crosses boundaries, and where failures or compromises must be contained.

The governing principle is:

> SERA may coordinate across zones, but no single zone should possess enough authority, context, and key material to bypass the wallet's security model.

The architecture must preserve the separation between understanding, context, authority, policy, runtime control, signing, execution, evidence, and external intelligence.

## 2. Architectural Goals

The topology must support:

- an AI-first wallet experience without moving key material into AI infrastructure;
- local-first handling of sensitive holder context where practical;
- deterministic control between SERA reasoning and execution;
- explicit Trust Protocol and REV runtime gates;
- multi-chain execution and routing;
- credential retrieval and selective disclosure;
- bounded delegated authority;
- concealed-detail presentation controls;
- cross-device phone and wearable operation;
- offline and degraded modes;
- tamper-evident execution evidence;
- replaceable external AI and intelligence providers;
- failure containment between services;
- production deployment, observability, and incident isolation.

## 3. Top-Level Logical Topology

```text
+-------------------------------------------------------------+
| HOLDER DEVICES                                              |
|                                                             |
| Phone / Tablet                 Wearable                     |
| ----------------------------  ----------------------------  |
| SERA Experience               SERA Companion Surface        |
| Voice / Text / Tap            Alerts / Voice / Approval     |
| Local Context Cache           Scoped Local Context          |
| Local Policy Cache            Device Authority Cache        |
| Credential Wallet             Selected Credentials          |
| Secure Key Store              Device Credentials            |
| Concealed Detail UI           Concealed Detail UI           |
+---------------------------+---------------------------------+
                            |
                            | authenticated wallet channel
                            v
+-------------------------------------------------------------+
| WALLET CONTROL PLANE                                        |
|                                                             |
| Session & Device Trust   Intent / Capability Gateway        |
| Context Broker           Authority / Delegation Resolver    |
| Risk Engine              Policy Engine                      |
| Trust Protocol           REV Runtime Gate                   |
| Action State Machine     Idempotency / Replay Control       |
| Handoff Coordinator      Evidence Coordinator               |
+---------------------------+---------------------------------+
                            |
            +---------------+-------------------+
            |                                   |
            v                                   v
+---------------------------+      +---------------------------+
| INTELLIGENCE PLANE        |      | EXECUTION PLANE           |
|                           |      |                           |
| SERA Orchestrator         |      | Transaction Builder       |
| AI Model Adapters         |      | Credential Presenter      |
| Retrieval / Reasoning     |      | WalletConnect Gateway     |
| News / Market Intelligence|      | Multi-chain Router        |
| Entity Resolution         |      | External Service Adapter  |
+---------------------------+      +------------+--------------+
                                                |
                                                v
                                  +---------------------------+
                                  | SIGNING / KEY ZONE        |
                                  |                           |
                                  | Secure Enclave/Keystore   |
                                  | Signing Policy Adapter    |
                                  | Key References            |
                                  +------------+--------------+
                                               |
                                               v
+-------------------------------------------------------------+
| EXTERNAL NETWORKS & SERVICES                                |
| Blockchains | RPCs | DApps | Issuers | Verifiers | APIs     |
+-------------------------------------------------------------+
                            |
                            v
+-------------------------------------------------------------+
| EVIDENCE & ASSURANCE PLANE                                  |
| Evidence Store | Receipts | Audit | Reconciliation          |
+-------------------------------------------------------------+
```

## 4. Trust Zone Model

The reference architecture defines eight logical trust zones.

### Z0: Holder Interaction Zone

Contains the user-facing wallet experience.

Typical components:

- SERA conversational shell;
- adaptive workspace;
- voice and text input;
- approval surfaces;
- concealed-detail controls;
- device-specific notifications;
- transaction and credential inspection views.

Trust assumptions:

- holder-controlled device;
- potentially exposed to screen observation, malicious apps, device theft, and notification leakage;
- must never display more sensitive data than the presentation policy permits.

Z0 may request action but cannot directly authorize sensitive execution without passing the required control path.

### Z1: Device Security & Key Zone

Contains device-local cryptographic and security primitives.

Typical components:

- secure enclave / hardware-backed keystore;
- biometric authentication interface;
- wallet signing key references;
- device registration credential;
- protected local credential keys;
- encrypted local authorization cache where permitted.

Critical rule:

> Generative AI components never receive private key material or unrestricted signing handles from Z1.

Z1 exposes narrow signing and assertion interfaces only.

### Z2: Wallet Control Plane Zone

The most important deterministic server-side control zone.

Contains:

- session manager;
- device trust registry;
- intent action gateway;
- capability registry;
- tool registry;
- Context Broker;
- authority resolver;
- delegation evaluator;
- risk engine;
- policy engine;
- Trust Protocol;
- REV;
- action state machine;
- idempotency service;
- replay prevention;
- cross-device handoff coordinator;
- runtime evidence coordinator.

Z2 is the enforcement bridge between reasoning and execution.

A request from SERA becomes executable only after Z2 converts it into validated deterministic control objects.

### Z3: SERA Intelligence Zone

Contains probabilistic or AI-mediated functions.

Typical components:

- SERA orchestrator;
- language model adapters;
- intent interpretation assistance;
- task planning;
- recommendation engine;
- natural language generation;
- source synthesis;
- entity disambiguation;
- voice-language adaptation services where cloud processing is permitted.

Z3 is explicitly non-authoritative.

It may:

- understand;
- infer;
- rank;
- explain;
- recommend;
- prepare.

It may not:

- sign;
- create authority;
- expand a delegation;
- bypass REV;
- alter deterministic policy outcomes.

### Z4: Execution Adapter Zone

Contains deterministic adapters that translate validated action objects into external requests.

Examples:

- transaction builders;
- chain RPC adapters;
- token transfer adapters;
- swap adapters;
- WalletConnect adapters;
- OpenID4VC / VP adapters;
- credential proof presentation;
- merchant APIs;
- payment APIs;
- travel or service APIs;
- future AP2/AP3 compatible adapters.

Z4 receives only approved structured action objects.

### Z5: External Intelligence Zone

Contains information providers that may be inaccurate, stale, manipulated, or unavailable.

Examples:

- news APIs;
- LinkedIn APIs;
- market data;
- chain analytics;
- token intelligence;
- spam-token intelligence;
- issuer registries;
- fraud sources;
- counterparty metadata;
- public web or API data.

Z5 is always treated as untrusted input.

External content may influence context and risk, but cannot independently confer authority.

### Z6: Evidence & Assurance Zone

Stores execution evidence and integrity records.

Typical components:

- append-only action event store;
- evidence graph service;
- user receipt service;
- integrity hashes;
- signed REV decision records;
- audit records;
- reconciliation records;
- dispute evidence;
- policy/version references;
- retention and legal-hold controls.

Z6 must not become a duplicate repository for secrets.

### Z7: Operations & Administration Zone

Contains operational tooling separated from holder execution paths.

Examples:

- observability;
- service health;
- deployment controls;
- configuration management;
- policy publishing;
- incident response tooling;
- feature flags;
- runtime metrics;
- security monitoring.

Administrative access must never directly create or approve holder transactions.

## 5. Service Inventory

### 5.1 Device Services

Reference services include:

- `sera-ui-runtime`
- `voice-capture-adapter`
- `holder-context-local`
- `concealed-detail-controller`
- `device-auth-adapter`
- `wallet-key-adapter`
- `credential-local-store`
- `device-policy-cache`
- `handoff-client`
- `local-degraded-runtime`

### 5.2 Control Plane Services

Reference services include:

- `wallet-session-service`
- `device-trust-service`
- `intent-gateway`
- `capability-registry`
- `tool-registry`
- `context-broker`
- `authority-service`
- `delegation-service`
- `risk-service`
- `policy-service`
- `trust-protocol-service`
- `rev-service`
- `action-orchestrator`
- `idempotency-service`
- `reconciliation-service`
- `handoff-service`
- `evidence-coordinator`

These names are logical service roles, not mandatory microservice boundaries.

Some may be combined operationally during Phase 1 while preserving logical separation in code and interfaces.

### 5.3 Intelligence Services

Possible services:

- `sera-agent-runtime`
- `model-router`
- `intent-assist-service`
- `entity-resolution-service`
- `recommendation-service`
- `knowledge-retrieval-service`
- `holder-personalization-service`
- `news-intelligence-service`
- `chain-intelligence-service`

### 5.4 Execution Services

Possible services:

- `transaction-builder`
- `chain-route-service`
- `rpc-gateway`
- `credential-presentation-service`
- `walletconnect-gateway`
- `external-service-gateway`
- `execution-status-service`

## 6. Data Store Architecture

No single database should contain the complete holder identity, behavioral model, authorization state, keys, and transaction history in one unrestricted domain.

### 6.1 Local Holder Store

Stores on-device:

- encrypted wallet state;
- holder preferences;
- short-term SERA session state;
- voice adaptation profile where supported;
- local aliases;
- device policy cache;
- selected credentials;
- concealed-detail preferences;
- offline-required metadata.

Never store unencrypted seeds or sensitive raw biometric material in a general app database.

### 6.2 Device Registry Store

Stores:

- device identifier;
- holder relationship;
- device class;
- device trust status;
- attestation references;
- capability scope;
- registration date;
- revocation state;
- wearable pairing relationship.

### 6.3 Authority & Delegation Store

Stores structured authorization objects:

- delegation IDs;
- principal;
- agent;
- permitted capabilities;
- asset scope;
- value limits;
- frequency limits;
- counterparty constraints;
- time bounds;
- device scope;
- policy references;
- current status;
- cumulative usage.

This store is security-sensitive and must not be merged into ordinary conversational memory.

### 6.4 Policy Store

Stores versioned deterministic control policies.

Examples:

- risk-to-authentication mappings;
- wearable execution limits;
- concealed-detail rules;
- supported-chain policy;
- token-risk policies;
- credential-disclosure policy;
- REV rules;
- degraded-mode policy;
- jurisdiction-specific rules where applicable.

Policy changes must be versioned and auditable.

### 6.5 Context Metadata Store

Stores holder-relevant metadata that is safe for controlled server-side retrieval.

Examples:

- aliases;
- preferred chains;
- non-secret interaction preferences;
- recipient metadata references;
- personalization metadata;
- notification settings;
- model context retrieval indexes.

Sensitive values should remain referenced rather than copied where possible.

### 6.6 Evidence Store

Stores append-only structured action evidence.

Requirements:

- tamper-evident;
- canonical serialization;
- integrity hashes;
- retention policies;
- selective retrieval;
- encryption;
- legal hold where applicable;
- holder-accessible receipt projection.

### 6.7 Intelligence Cache

Stores temporary external data and derived intelligence.

Examples:

- news articles;
- market snapshots;
- token metadata;
- spam signals;
- RPC health;
- chain fee estimates;
- issuer metadata.

External intelligence must carry:

- source;
- retrieval time;
- freshness;
- confidence/trust score;
- expiry.

## 7. Key Material Placement

Private signing keys must remain within approved cryptographic boundaries.

Preferred Phase 1 model:

- holder transaction keys remain device-controlled where the current Soul Super Wallet design permits;
- server-side services receive only public-key references, unsigned payloads, signed assertions, or signatures;
- SERA model infrastructure has no key access;
- runtime control services cannot export key material;
- key rotation, recovery, and wallet-root operations use separate high-assurance workflows.

If future institutional or autonomous wallet variants require HSM-backed signing, those become separate signer trust domains rather than extensions of the AI service.

## 8. Context Boundary

The Context Broker is the mandatory bridge between raw data sources and SERA context.

```text
Source Data
   |
   v
Classification
   |
   v
Purpose Check
   |
   v
Holder Permission / Policy
   |
   v
Minimization
   |
   v
Redaction / Transformation
   |
   v
Context Package
   |
   v
SERA
```

No model adapter should directly query unrestricted wallet databases.

## 9. Concealed-Detail Boundary

DB11A becomes a topology-level presentation requirement.

The concealed-detail controller resides primarily on-device, with server-generated presentation metadata indicating sensitivity.

Example presentation object:

```json
{
  "presentation_id": "pres_...",
  "sensitivity": "financial_sensitive",
  "default_visibility": "concealed",
  "reveal_requires_auth": true,
  "approval_requires_reveal": true,
  "auto_rehide_seconds": 30,
  "allow_wearable_detail": false
}
```

The raw transaction object should not be replicated into notification infrastructure merely to support a lock-screen alert.

Notifications may instead contain:

```json
{
  "title": "Action requires your attention",
  "detail_state": "concealed",
  "action_ref": "action_123"
}
```

The holder can reveal details after opening a trusted surface.

## 10. Multi-Device Topology

A holder may have:

- primary phone;
- secondary phone;
- Apple Watch;
- Wear OS watch;
- future hardware NFC companion;
- desktop/web surface.

Each device has:

- independent registration;
- independent trust state;
- independent capability scope;
- revocation state;
- presentation policy;
- synchronization state.

The wallet does not assume that devices share equal authority.

## 11. Wearable Deployment Boundary

Wearables remain Phase 2 launch surfaces but Phase 1 architectural constraints.

Wearables should normally contain:

- presentation shell;
- narrow SERA interaction client;
- notification receiver;
- low-risk approval interface;
- selected credential presentation support;
- scoped device credential;
- emergency lock control;
- minimal local state.

Wearables should not contain:

- unrestricted wallet state;
- unrestricted delegation store;
- full transaction history cache;
- root recovery secrets;
- unrestricted signing authority unless specifically designed later.

## 12. Execution Boundary

A structured action must cross the following logical boundary before external execution:

```text
SERA Proposal
   |
   v
Intent Gateway
   |
   v
Capability Validation
   |
   v
Authority Validation
   |
   v
Risk + Policy
   |
   v
Trust Protocol
   |
   v
REV
   |
   v
Required Holder Authentication
   |
   v
Canonical Execution Object
   |
   v
Signer
   |
   v
Execution Adapter
```

The execution adapter must reject free-form natural-language requests.

## 13. API Boundary Categories

All APIs should be categorized by trust level.

### Internal Deterministic Control APIs

Examples:

- action validation;
- authority resolution;
- policy evaluation;
- REV decision;
- signing request.

Requirements:

- authenticated service identity;
- schema validation;
- versioned contracts;
- request IDs;
- idempotency;
- structured reason codes.

### Intelligence APIs

Examples:

- language models;
- news synthesis;
- entity resolution;
- recommendation.

Requirements:

- minimized context;
- no key material;
- no unrestricted data access;
- no direct execution privileges.

### External Execution APIs

Examples:

- chain RPC;
- DEX/router;
- verifier;
- issuer;
- merchant;
- travel provider.

Requirements:

- provider isolation;
- timeouts;
- retries governed by idempotency policy;
- execution evidence;
- reconciliation.

## 14. Network Segmentation

Recommended production segmentation:

```text
Public/API Edge
    |
    v
Wallet API Gateway
    |
    +----> Intelligence Services Network
    |
    +----> Control Plane Network
                  |
                  +----> Policy / Trust / REV
                  |
                  +----> Execution Adapter Network
                               |
                               +----> External Networks

Evidence Network <---- append-only events from control/execution

Administrative Network ---- isolated operational access
```

Signer infrastructure should be isolated further where server-side signing is ever introduced.

## 15. Service Identity

Each internal service requires a machine identity.

Preferred properties:

- short-lived credentials;
- mutual service authentication;
- explicit service authorization;
- rotation;
- revocation;
- minimal network reachability;
- auditable service-to-service calls.

No service should authenticate solely by network location.

## 16. Secret Management

Application secrets include:

- API credentials;
- provider tokens;
- database credentials;
- service certificates;
- webhook secrets;
- encryption keys.

Secrets should use a controlled secret-management system and must never be stored in source repositories or model prompts.

Wallet signing keys remain outside ordinary secret-management stores unless a dedicated HSM custody architecture explicitly requires otherwise.

## 17. External Provider Isolation

External providers should be accessed through adapter services rather than directly from SERA.

```text
SERA
  |
  v
Controlled Tool Contract
  |
  v
Provider Adapter
  |
  v
External Provider
```

This allows:

- provider substitution;
- response validation;
- rate limiting;
- data minimization;
- redaction;
- evidence capture;
- provider-specific failure isolation.

## 18. Model Provider Abstraction

The architecture must not hardwire SERA's product identity to one AI provider.

A model router should support:

- local models where available;
- platform models;
- approved cloud models;
- task-specific models;
- fallback models.

Routing decisions consider:

- data sensitivity;
- task type;
- latency;
- cost;
- availability;
- privacy policy;
- holder preference where applicable.

## 19. Failure Domains

Each of the following should be treated as a separate failure domain:

- phone client;
- wearable client;
- AI/model provider;
- Context Broker;
- Trust Protocol;
- REV;
- policy service;
- chain RPC;
- execution adapter;
- external API;
- evidence store;
- notification provider;
- cross-device synchronization.

Failure in one domain should not silently mutate authority in another.

## 20. Degraded Deployment Modes

### AI unavailable

Retain:

- wallet inspection;
- deterministic send/receive interfaces;
- credentials;
- emergency controls;
- stored policies;
- receipt access.

Disable or reduce:

- advanced conversation;
- autonomous planning;
- external intelligence synthesis.

### Control Plane unavailable

Consequential actions requiring server-side Trust Protocol or REV fail closed unless a predefined offline policy explicitly authorizes them.

### External intelligence unavailable

Continue core wallet functionality without treating absence of intelligence as evidence of safety.

### Evidence service unavailable

Execution policy determines whether the action may proceed. High-risk operations should normally require durable evidence availability or a local signed evidence buffer with later reconciliation.

## 21. Event Architecture

Important state changes should produce immutable events.

Example event classes:

- `intent.received`
- `intent.normalized`
- `authority.resolved`
- `risk.classified`
- `trust.evaluated`
- `rev.decided`
- `presentation.concealed`
- `presentation.revealed`
- `holder.approved`
- `signing.completed`
- `execution.submitted`
- `execution.confirmed`
- `execution.uncertain`
- `delegation.revoked`
- `device.revoked`
- `reconciliation.completed`

Events support evidence, state recovery, analytics, and incident reconstruction.

## 22. Logging Boundary

Operational logs must not casually contain:

- seed phrases;
- private keys;
- raw credentials;
- full identity documents;
- biometric data;
- full SERA prompts containing unrestricted wallet context;
- sensitive transaction details where metadata is sufficient.

Structured logging should use IDs and references.

## 23. Data Encryption

At minimum:

- encrypted device storage;
- encrypted database storage;
- TLS for network transport;
- separate encryption domains for highly sensitive stores;
- key rotation;
- backup encryption;
- encrypted evidence archives.

Sensitive holder data should have stricter key-management boundaries than generic telemetry.

## 24. Backup and Recovery

Backend stores require distinct recovery policies.

Examples:

- device registry: recoverable and auditable;
- authority store: point-in-time recovery and append-only change history;
- policy store: immutable version history;
- evidence store: tamper-evident backups;
- intelligence cache: disposable/rebuildable;
- conversational cache: short-lived and disposable where possible.

Wallet key recovery remains governed by the wallet's dedicated recovery design, not ordinary server backups.

## 25. Data Residency and Jurisdiction

The topology should permit future regional deployment.

Service and store placement should be configurable for:

- jurisdiction-specific privacy requirements;
- enterprise deployments;
- sovereign deployments;
- regional data residency;
- regulatory evidence retention.

The architecture should avoid unnecessary coupling that forces all holder data into one region.

## 26. Deployment Shapes

### Phase 1 Reference Deployment

A pragmatic initial deployment may combine logical services while preserving interface separation.

Example:

```text
Mobile Apps
    |
API Gateway
    |
Wallet Core Application Cluster
    |-- Context / Authority / Risk / Policy
    |-- Trust Protocol / REV
    |-- Action Orchestration
    |
SERA Intelligence Cluster
    |
Execution Adapter Cluster
    |
Evidence Store
```

### Future Scaled Deployment

Services can separate by risk and load:

- control plane;
- Trust Protocol;
- REV;
- intelligence;
- external adapters;
- evidence;
- notifications;
- device synchronization.

## 27. Zero-Trust Direction

Long-term architecture should assume:

- no implicit trust from network position;
- explicit service identity;
- least privilege;
- short-lived credentials;
- fine-grained authorization;
- device posture checks;
- continuous attestation where AURION applies;
- complete auditability of privileged operations.

## 28. AURION Placement

AURION may provide continuous attestation inputs into runtime policy and REV.

Reference path:

```text
Device / Session / Service Signals
       |
       v
AURION
       |
       v
Attestation State
       |
       v
Trust Protocol / REV
```

AURION does not replace device registration, authentication, policy, or REV. It enriches assurance.

## 29. Threat Containment Examples

### Model compromise

Impact should be limited to interpretation/recommendation quality. It must not grant signing access or bypass REV.

### External news API compromise

May inject false context. Source-validation, risk weighting, and authority separation prevent direct execution.

### Wearable theft

Device can be revoked independently. Wearable scope limits exposure.

### Notification interception

Concealed-detail policy prevents sensitive transaction details from appearing by default.

### RPC compromise

Multi-source validation, chain-state verification, risk controls, and reconciliation reduce impact.

### Control service compromise

Service identities, segmented privileges, signed decisions, and evidence enable containment and detection. High-value control components require stronger hardening.

## 30. Preliminary Data Ownership Matrix

| Data | Primary Owner | Preferred Location | AI Access |
|---|---|---|---|
| Private keys | Holder / wallet | Secure device zone | Never |
| Seed/recovery secret | Holder | Dedicated recovery boundary | Never |
| Raw biometric | Holder/device | Secure local processing | Never by default |
| Voice adaptation profile | Holder | Local-first | Minimized/controlled |
| Wallet balances | Holder | Wallet + chain-derived | Contextual/minimized |
| Credentials | Holder | Wallet credential store | Claim-selective only |
| Delegated authority | Holder | Protected authority store | Structured scope only |
| Policy | Wallet platform | Control plane | Read-only structured |
| SERA session context | Holder/session | Ephemeral/local or controlled | Yes, minimized |
| News/market data | External provider | Intelligence cache | Yes |
| Execution evidence | Holder/platform | Evidence zone | Limited structured access |
| Concealment preference | Holder | Device + preference store | Presentation only |

## 31. Preliminary Service-to-Zone Matrix

| Service | Zone | Consequential Authority |
|---|---|---|
| SERA UI | Z0 | No |
| Local signer | Z1 | Executes approved signatures only |
| Intent Gateway | Z2 | Validation only |
| Authority Service | Z2 | Resolves existing authority |
| Trust Protocol | Z2 | Trust evaluation |
| REV | Z2 | Runtime pass/fail |
| SERA Agent Runtime | Z3 | No |
| Model Router | Z3 | No |
| Transaction Builder | Z4 | No independent authority |
| Chain Adapter | Z4 | Executes approved object |
| News API | Z5 | No |
| Evidence Store | Z6 | No |
| Operations Console | Z7 | No holder transaction authority |

## 32. Architectural Invariants

The following are now proposed as non-negotiable invariants:

1. AI infrastructure never holds unrestricted signing authority.
2. Private keys never enter SERA context.
3. Natural language never crosses directly into a signer or chain adapter.
4. The Context Broker mediates model access to sensitive wallet context.
5. Trust Protocol and REV sit outside the model zone.
6. Delegated authority is held in a protected structured store, not conversational memory.
7. Concealed-detail policy applies across phone, wearable, notifications, and voice.
8. External intelligence is always treated as untrusted input.
9. Wearables receive device-scoped authority, never implicit full-wallet authority.
10. Evidence is generated across trust boundaries without copying secrets.
11. Every external execution uses a deterministic canonical action object.
12. Failure in an intelligence component cannot grant additional authority.
13. Administrative tooling cannot directly approve or originate holder transactions.
14. Service identity and least privilege are required across production zones.
15. Sensitive execution remains reconstructable through evidence and receipts.

## 33. Open Design Questions

The following should be resolved during controlled architecture freeze and implementation planning:

- exact local-versus-cloud split for SERA reasoning on iOS and Android;
- whether Phase 1 Trust Protocol and REV deploy as independent services or modules within a hardened control-plane service;
- database technologies for authority, policy, context, and evidence stores;
- how much holder context can be synchronized encrypted across devices;
- exact recovery mechanism for SERA personalization after wallet restoration;
- secure wearable session establishment and revocation;
- whether evidence requires a Merkle structure from Phase 1 or later hardening;
- regional deployment requirements for enterprise and sovereign customers;
- provider strategy for RPC redundancy and chain validation;
- HSM requirements if any server-managed signing use case is introduced later.

## 34. Relationship to Prior Documents

DB15 operationalizes:

- DB03 adaptive AI-first experience;
- DB04 technical feasibility;
- DB04A wearable foundation;
- DB05 trust and risk boundaries;
- DB06 user journeys;
- DB07 intent/capability/tool contracts;
- DB08 memory and Context Broker;
- DB09 proactive intelligence;
- DB10 delegated authority;
- DB11 execution evidence;
- DB11A concealed-detail control;
- DB12 resilience and degraded mode;
- DB13 runtime control plane;
- DB14 state machines and API boundaries.

## 35. Design Board Decision

The working topology for the SSW-SERA architecture is:

```text
Holder Devices
   |
   v
Wallet Control Plane
   |
   +---- SERA Intelligence Plane
   |
   +---- Trust / Policy / REV
   |
   +---- Signing Boundary
   |
   +---- Execution Adapters
   |
   v
External Networks & Services

All consequential paths emit evidence into a separate assurance plane.
```

This structure is sufficiently defined to proceed from drawing-board exploration toward controlled system architecture.

## 36. Recommended Next Artifact

The next design artifact should be:

**SSW-SERA-DB16: Phase 1 Product Scope, MVP Boundary, Migration Strategy & Release Sequencing**

DB16 should determine which capabilities enter the first AI-first SSW release, which remain behind feature flags, which require backend prerequisites, which belong to Phase 2 wearables, and how the current production Soul Super Wallet transitions to the SERA-first experience without breaking existing wallet functionality.