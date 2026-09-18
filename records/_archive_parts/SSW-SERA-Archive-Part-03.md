

---

## SOURCE 21
**Path:** `docs/design/SSW-SERA-DB17B-SERA-Activity-Evidence-Ledger-Audit-Reporting-and-Retention-Architecture.md`  
**Blob SHA:** `3ccae704226f84fee35a909c385cdd1d864ed8e8`

# SSW-SERA-DB17B: SERA Activity, Evidence Ledger, Audit Reporting & Retention Architecture

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB17B  
**Status:** Controlled Design Input / Pre-Freeze Closure  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA  

## 1. Purpose

This document defines how SERA action history, execution evidence, audit logs, and user-facing reports should be stored, protected, retrieved, and presented over time.

It separates two different persistence problems:

1. **SERA State**: information needed to recover who SERA is for the holder, including preferences, holder-approved memory, voice adaptation, aliases, and configuration.
2. **SERA Activity & Evidence**: records proving what SERA did, what the holder asked, what authority existed, what controls evaluated the action, what was executed, and what outcome occurred.

These two categories must not be merged into one backup object.

The governing principle is:

> SERA state restores continuity. SERA evidence establishes accountability.

## 2. Architectural Decision

SERA action history shall be maintained through a dedicated **SERA Activity & Evidence Ledger (SAEL)**.

The SAEL shall be:

- append-only for material action records;
- cryptographically integrity-protected;
- holder-associated but not dependent on a centralized account identity;
- queryable for holder reports and audits;
- separated from SERA conversational memory;
- privacy-minimized;
- capable of selective disclosure;
- portable across device changes;
- recoverable independently of local app storage;
- capable of retaining both successful and failed consequential actions;
- aligned with DB11 execution evidence architecture.

The authoritative evidence history shall not rely exclusively on device-local logs, generic cloud application logs, or blockchain transaction history.

## 3. What the Ledger Must Answer

For any material SERA-assisted or SERA-initiated action, the holder should be able to answer:

- What did I ask SERA to do?
- What did SERA understand?
- Did SERA only recommend something or actually execute something?
- Was the action initiated by me, by a mandate, or by an external event?
- Which device or runtime initiated it?
- What authority did SERA have at that moment?
- Which Trust Protocol checks were evaluated?
- What did REV decide?
- Was holder authentication required?
- What was signed?
- What network, counterparty, verifier, merchant, or service received the action?
- What was the final outcome?
- Which actions were blocked or failed?
- What fees were paid?
- Which actions were fully autonomous versus holder-approved?
- Which actions were performed from a wearable?
- Which actions involved credential disclosure?
- Which actions relied on external intelligence or risk signals?
- Which transaction reports can be exported for a selected period?

## 4. Activity Categories

The ledger should classify events into normalized activity classes.

### 4.1 Informational Assistance

Examples:

- balance query;
- transaction explanation;
- news summary;
- portfolio explanation;
- credential status query.

These may be stored at lower retention and detail levels unless the holder explicitly requests history.

### 4.2 Prepared Actions

Examples:

- transaction drafted;
- swap prepared;
- credential proof prepared;
- WalletConnect request interpreted;
- chain route recommended.

Prepared actions matter because they show SERA's assistance even when execution did not occur.

### 4.3 Holder-Approved Executions

Examples:

- payment sent after holder approval;
- swap executed after biometric approval;
- credential presented after confirmation;
- WalletConnect action approved.

### 4.4 Delegated / Autonomous Executions

Examples:

- recurring payment made under mandate;
- pre-authorized merchant payment;
- conditional transfer;
- bounded automated rebalance;
- scheduled agent action.

These require stronger evidence because the holder did not approve the individual action at execution time.

### 4.5 Security and Control Actions

Examples:

- SERA delegation created or revoked;
- device authorized or suspended;
- emergency lock initiated;
- wearable authority changed;
- concealed-detail preference changed;
- recovery event initiated;
- REV blocked an action;
- suspicious token warning overridden.

### 4.6 Identity and Credential Actions

Examples:

- proof requested;
- proof prepared;
- credential presented;
- selective disclosure performed;
- verifier acknowledgement received;
- credential revoked or refreshed.

## 5. Ledger Architecture

Recommended logical architecture:

```text
SERA / Wallet Runtime
        |
        v
Structured Activity Event
        |
        v
Evidence Normalizer
        |
        +--> User Activity Index
        |
        +--> Evidence Bundle Builder
        |
        v
Append-Only Evidence Ledger
        |
        +--> Encrypted Hot Store
        +--> Encrypted Archive Store
        +--> Integrity Anchor / Merkle Root
        +--> Optional encrypted portable archive
        |
        v
Audit & Reporting Service
        |
        +--> Holder Timeline
        +--> SERA-Assisted Transaction Report
        +--> Autonomous Action Report
        +--> Credential Activity Report
        +--> Security Activity Report
        +--> Export / Selective Disclosure
```

## 6. Storage Model

A hybrid storage model is preferred.

### 6.1 Local Device Store

Purpose:

- fast recent activity display;
- offline access to recent receipts;
- cached indexes;
- pending reconciliation records.

The device-local store is **not authoritative** because devices can be lost, reset, or replaced.

### 6.2 Protected Encrypted Ledger Store

A protected backend evidence store should provide:

- durable retention;
- indexed search;
- date and activity filters;
- encrypted storage;
- access control bound to the holder and SERA identities;
- audit-grade append behavior;
- integrity validation;
- recovery across devices.

This may use Soulverse-operated infrastructure, but the storage service must not become the authority source for the underlying action.

### 6.3 Content-Addressed Archive

Long-lived evidence bundles may additionally be encrypted and represented as content-addressed archive objects.

A possible design is:

```text
Evidence Bundle
      |
      v
Canonical Serialization
      |
      v
Encryption
      |
      v
Content Address / CID
      |
      +--> IPFS / content-addressed persistence
      +--> encrypted archival replica
```

This is particularly useful for:

- periodic audit archives;
- annual reports;
- immutable evidence packages;
- portable holder-controlled export;
- proof that an archived bundle has not changed.

However, the searchable working ledger should not depend on public IPFS traversal for routine query performance.

### 6.4 Integrity Anchoring

The architecture should periodically generate a Merkle root or equivalent digest over ledger entries.

The root may be:

- signed by the SERA evidence service;
- associated with the holder/SERA identity relationship;
- stored in a tamper-evident registry;
- optionally anchored externally where justified.

The goal is to prove that historical ledger entries were not silently modified.

## 7. DID Relationship

The ledger belongs to the holder's relationship with SERA, not to a generic Soulverse account.

Conceptually:

```text
Holder DID
   |
   +--> SERA DID
           |
           +--> State Manifest
           |
           +--> Evidence Ledger Descriptor
```

The Evidence Ledger Descriptor may identify:

- ledger schema version;
- authorized holder DID;
- SERA DID;
- active encryption profile;
- archive policy;
- latest integrity checkpoint;
- authorized retrieval endpoints;
- portability/export mechanism.

The DID document itself should not contain full activity history.

## 8. Canonical Activity Record

A normalized activity event should contain only structured facts required for retrieval and reconstruction.

Example:

```json
{
  "activity_id": "sera_act_...",
  "holder_did_ref": "did:soul:...",
  "sera_did_ref": "did:soul:agent:sera:...",
  "timestamp": "2026-09-17T20:00:00Z",
  "activity_class": "EXECUTION",
  "action_type": "SEND_ASSET",
  "origin": "VOICE",
  "authority_mode": "HOLDER_APPROVED",
  "device_ref": "device_...",
  "asset": "USDC",
  "amount": "500",
  "network": "polygon",
  "counterparty_ref": "contact_...",
  "risk_class": "R3",
  "trust_protocol_ref": "tp_...",
  "rev_ref": "rev_...",
  "authentication_ref": "auth_...",
  "execution_ref": "tx_...",
  "status": "CONFIRMED",
  "evidence_bundle_ref": "evb_..."
}
```

Sensitive fields may be encrypted separately from the indexing metadata.

## 9. Evidence Bundle Separation

The searchable activity record should not contain every forensic detail.

Instead:

```text
Activity Record
   |
   +--> searchable metadata
   |
   +--> protected Evidence Bundle
          |
          +--> intent evidence
          +--> interpretation evidence
          +--> authority evidence
          +--> risk evidence
          +--> Trust Protocol evidence
          +--> REV evidence
          +--> authentication evidence
          +--> signing evidence
          +--> execution evidence
          +--> post-state evidence
```

This keeps routine reporting efficient while preserving deeper audit reconstruction when required.

## 10. User-Facing Activity Center

The wallet should expose a dedicated **SERA Activity** or equivalent inspectable surface.

This should not be merely a blockchain transaction list.

Suggested filters:

- All activity;
- SERA assisted;
- SERA executed;
- autonomous / delegated;
- payments;
- swaps;
- credentials;
- WalletConnect;
- security;
- failed / blocked;
- wearables;
- voice initiated;
- date range;
- asset;
- network;
- counterparty.

Each activity item may expose:

- what happened;
- SERA's role;
- holder role;
- authority basis;
- amount / asset where relevant;
- counterparty;
- chain/service;
- status;
- fee;
- device;
- approval method;
- REV status;
- receipt;
- "Why this happened";
- "Show evidence";
- "Include in report".

## 11. SERA-Assisted Transaction Report

A holder should be able to request naturally:

> "SERA, show me every transaction you assisted with last quarter."

or:

> "Give me an audit report of every payment you executed autonomously this year."

The report service should query structured ledger records rather than asking the model to reconstruct history from conversational memory.

Possible report columns:

| Time | SERA Role | Action | Asset | Amount | Counterparty | Network | Authority | Approval | REV | Status | Reference |
|---|---|---|---|---:|---|---|---|---|---|---|---|

SERA Role may distinguish:

- Explained;
- Recommended;
- Prepared;
- Executed after approval;
- Executed under mandate;
- Blocked.

## 12. Audit Report Types

The system should support at least:

### 12.1 SERA Assistance Report

All material actions where SERA contributed to interpretation, recommendation, preparation, or execution.

### 12.2 SERA Execution Report

Only actions actually executed through SERA orchestration.

### 12.3 Autonomous Action Report

All actions executed under delegated authority without per-action approval.

### 12.4 Credential Disclosure Report

Shows when credentials or proofs were presented, to whom, what disclosure category was involved, and under what approval.

### 12.5 Security & Authority Report

Includes delegation creation, mandate changes, device changes, wearable authority, emergency actions, REV blocks, and suspicious-activity interventions.

### 12.6 Failed / Blocked Action Report

Useful for security review and dispute analysis.

### 12.7 Chain and Fee Report

Summarizes chain selection, fees, routes, and network outcomes for SERA-assisted transactions.

## 13. Report Generation Principles

Reports must be generated from structured ledger data.

SERA may:

- interpret the holder's reporting request;
- select filters;
- summarize findings;
- explain unusual entries;
- generate a human-readable narrative.

But SERA must not invent or reconstruct missing financial history from model memory.

The ledger remains authoritative.

## 14. Privacy and Concealed Detail

The DB11A concealed-detail control applies to activity history and reports.

Examples:

- activity list can hide amounts by default;
- counterparties can be masked;
- credential activity can show "identity proof shared" without exposing claims;
- reports can open in concealed mode;
- holder may reveal details per record;
- exported reports require explicit selection of detail level.

Potential export levels:

1. Summary only;
2. Financial details;
3. Counterparty details;
4. Credential disclosure details;
5. Full audit evidence.

Reveal remains distinct from approval or export authorization.

## 15. Retention Model

Retention should be activity-specific rather than one global period.

Suggested policy classes:

| Class | Examples | Default Direction |
|---|---|---|
| L0 | ephemeral informational requests | minimal / optional |
| L1 | prepared but unexecuted actions | short to medium |
| L2 | holder-approved executions | long-term |
| L3 | delegated/autonomous executions | long-term / stronger evidence |
| L4 | credential disclosures | policy-defined |
| L5 | security/authority changes | long-term |
| L6 | disputed/incidental/security event | extended / legal hold capable |

Exact time periods should remain configurable by jurisdiction, user policy, product obligations, and action type.

## 16. Holder-Controlled Deletion vs Audit Integrity

Not every record should have identical deletion semantics.

A useful distinction is:

### Personal Interaction History

Examples: low-risk SERA assistance and informational history.

May be user-deletable subject to product policy.

### Consequential Execution Evidence

Examples: financial execution, delegated action, credential disclosure, security-control changes.

Deletion may instead mean:

- remove from normal holder timeline;
- cryptographically tombstone personal index data where allowed;
- preserve legally or operationally necessary integrity records for the required retention window.

The product must clearly distinguish "hide/delete from my activity view" from "destroy all audit evidence." 

## 17. Export and Portability

The holder should be able to export records in structured and human-readable formats.

Potential formats:

- PDF audit report;
- CSV transaction/activity report;
- JSON structured evidence export;
- encrypted archive bundle;
- content-addressed archive with manifest.

An exported evidence package should carry:

- report scope;
- generation timestamp;
- holder DID reference;
- SERA DID reference;
- covered activity IDs;
- integrity hashes;
- optional verification instructions.

## 18. Selective Disclosure for Third Parties

The holder may need to share a subset with:

- accountant;
- auditor;
- enterprise administrator;
- regulator;
- merchant;
- counterparty;
- legal adviser.

The architecture should permit selective export without exposing unrelated SERA activity.

Example:

> Share all SERA-assisted USDC payments to Vendor X from January through March, including transaction references and authorization evidence, but exclude all other wallet activity.

The reporting engine should be capable of producing exactly that subset.

## 19. Retrieval Through SERA

SERA may serve as the natural-language interface to the ledger.

Examples:

- "What did you pay on my behalf this month?"
- "Which transactions did I approve from my watch?"
- "Show every action REV blocked last week."
- "How much did your route selection save me in network fees this quarter?"
- "Which credentials did I share with airlines this year?"
- "Export every SERA-assisted transaction for my accountant."

Flow:

```text
Holder Query
    |
    v
Intent Resolution
    |
    v
Ledger Query Plan
    |
    v
Permission / Privacy Check
    |
    v
Structured Ledger Query
    |
    v
Verified Result Set
    |
    +--> SERA Explanation
    +--> Report
    +--> Export
```

The LLM does not directly search raw unrestricted audit storage.

## 20. Access Control

Ledger retrieval should require scoped authorization.

Access actors may include:

- holder;
- SERA acting for holder;
- authorized device;
- reporting service;
- evidence service;
- explicitly authorized external recipient.

SERA should receive only the ledger fields necessary to answer the request through the Context Broker or dedicated audit-query broker.

## 21. Encryption

Recommended design:

- encryption at rest for all ledger data;
- holder-associated envelope encryption for sensitive evidence;
- field-level encryption for high-sensitivity values;
- separate keys for searchable metadata and protected evidence bodies;
- key rotation without rewriting historical meaning;
- no wallet private signing keys in ledger encryption services.

## 22. Ledger Versioning

Ledger schemas will evolve.

Every event should declare:

- schema version;
- evidence format version;
- policy version;
- originating application/runtime version where material.

Historical events must remain interpretable after application upgrades.

## 23. Cross-Device and Wearable Records

A single action may traverse several devices.

The ledger should preserve one logical activity lineage:

```text
act_123
  watch voice initiation
  -> phone handoff
  -> phone reveal
  -> biometric approval
  -> signer
  -> chain execution
  -> confirmation
```

This should appear as one transaction in normal user reporting with expandable sub-events.

## 24. Autonomous Action Evidence

Autonomous actions require enhanced records.

Every such record must include:

- mandate ID and version;
- mandate scope;
- remaining limit before action;
- amount consumed;
- trigger condition;
- counterparty match;
- asset/network match;
- Trust Protocol decision;
- REV decision;
- execution outcome;
- remaining mandate allowance after action.

This makes "What did SERA do by herself?" a provable query rather than a narrative guess.

## 25. Failed Actions and Security Events

The ledger must retain consequential failures, including:

- REV fail;
- suspicious recipient block;
- spam-token block;
- biometric failure;
- exceeded mandate;
- untrusted device;
- expired delegation;
- unsupported route;
- duplicate/replay attempt;
- uncertain network submission;
- recovery-mode restriction.

This gives the user a security history, not just a success history.

## 26. Relationship to Blockchain History

Blockchain history is an external evidence source, not the full SERA audit log.

A transaction hash can prove that a transaction occurred, but not:

- whether SERA recommended it;
- whether SERA prepared it;
- whether the holder approved it;
- which device was used;
- which mandate applied;
- why a chain was chosen;
- which REV decision existed;
- whether details were concealed or revealed before approval.

Therefore the SAEL must link to blockchain evidence rather than being replaced by it.

## 27. Relationship to SERA State Backup

The SERA portable state architecture and the SERA Activity & Evidence Ledger shall remain separate.

```text
SERA DID
   |
   +--> Portable State
   |      preferences
   |      voice adaptation
   |      memory
   |      personalization
   |
   +--> Activity & Evidence Ledger
          actions
          approvals
          mandates
          executions
          failures
          audit evidence
```

Recovering SERA state should not require downloading the entire historical audit ledger.

Likewise, deleting a SERA personalization memory should not erase consequential execution evidence.

## 28. Recommended Persistence Strategy

The recommended architecture is:

```text
Recent searchable ledger
        |
        v
Encrypted indexed backend
        |
        +--> periodic immutable evidence bundles
        |
        +--> integrity root / checkpoint
        |
        +--> encrypted content-addressed archive
                    |
                    +--> IPFS / durable pinning
                    +--> redundant encrypted archive copy
```

Cloud infrastructure provides query performance and availability.

Content-addressed archives provide portability and immutable integrity characteristics.

Neither storage layer creates execution authority.

## 29. Candidate Architecture Decision

The proposed pre-freeze decision is:

> SERA action history shall be maintained in a dedicated, append-only SERA Activity & Evidence Ledger associated with the holder DID and SERA DID relationship. The ledger shall store normalized searchable activity records separately from protected detailed evidence bundles. Recent and operational records may be maintained in encrypted indexed infrastructure for efficient retrieval, while periodic encrypted evidence archives may be content-addressed and redundantly persisted, including through IPFS-compatible storage. Ledger records shall support holder-controlled reporting, export, selective disclosure, integrity verification, cross-device reconstruction, and audit of holder-approved, delegated, autonomous, blocked, and failed SERA actions. SERA conversational memory shall not be treated as the authoritative source of action history.

## 30. Product Principle

> **SERA should remember enough to assist the holder, but she should prove what she did through evidence, not memory.**

## 31. Impact on Pre-Freeze Work

DB17B closes or materially advances the following architecture gaps:

- SERA audit-history persistence;
- holder retrieval of SERA-assisted transactions;
- autonomous-action accountability;
- cross-device activity reconstruction;
- long-term audit report generation;
- separation of AI memory and execution evidence;
- portable evidence archives;
- user-selective disclosure;
- concealed-detail behavior for historical records.

DB17B should be treated together with:

- DB08 Memory, Context Broker & Personalization;
- DB10 Delegated Authority;
- DB11 Execution Evidence;
- DB11A Concealed Detail;
- DB13 Runtime Control Plane;
- DB14 Runtime Sequences;
- DB15 Deployment Boundaries;
- DB17 Pre-Freeze Gap Review.

It should be incorporated into SSW-AI-01 and SSW-AI-02 before Candidate Freeze.


---

## SOURCE 22
**Path:** `docs/design/SSW-SERA-DB18-Pre-Freeze-Closure-Decisions-and-Candidate-Architecture-Baseline.md`  
**Blob SHA:** `864d498cd100104165d4486b125d884a18cd2469`

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


---

## SOURCE 23
**Path:** `docs/architecture/SSW-AI-01-Platform-Capability-and-Constraint-Architecture-Candidate-Freeze.md`  
**Blob SHA:** `30f448a41902933f52ceccd216a55c1678b8e2f1`

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


---

## SOURCE 24
**Path:** `docs/architecture/SSW-AI-02-SERA-Interaction-Intent-and-Authority-Architecture-Candidate-Freeze.md`  
**Blob SHA:** `c6efc604a4dc36e239e2a455e275224b63d90ac9`

# SSW-AI-02: SERA Interaction, Intent & Authority Architecture — Candidate Freeze

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-AI-02  
**Status:** Candidate Freeze  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA  
**Depends on:** SSW-AI-01; DB05; DB06; DB07; DB08; DB09; DB10; DB11; DB11A; DB12; DB13; DB14; DB15; DB16; DB17; DB17A; DB17B; DB18

---

## 1. Purpose

This document freezes the candidate interaction, intent, authority and execution-boundary architecture for SERA within Soul Super Wallet.

It defines how human language, voice, contextual assistance, proactive prompts, approvals, delegated authority, device trust, concealed-detail presentation and deterministic execution interact without allowing AI interpretation to become authority.

The governing principle is:

> SERA may interpret, explain, recommend, prepare and orchestrate. Authority is created only by the holder, a valid delegated mandate, and the deterministic control plane.

---

## 2. Scope

This specification covers:

- conversational and voice interaction;
- intent capture and normalization;
- ambiguity resolution;
- entity resolution;
- typed action contracts;
- contextual data minimization;
- risk classification;
- authority tiers;
- holder approval;
- delegated authority;
- device-specific authority;
- cross-device handoff;
- concealed-detail review;
- proactive prompts;
- credential presentation;
- payments and transaction preparation;
- WalletConnect and external service interaction;
- Trust Protocol and REV placement;
- signing isolation;
- execution evidence;
- failure and degraded-mode behavior.

It does not define model internals, chain-specific transaction formats, DID method cryptography, wallet key implementation, or final production API schemas.

---

## 3. Interaction Model

SERA is the primary interaction shell for the AI-first wallet, but not the only way to access wallet state.

The Phase 1 interaction model is:

**Ambient SERA + Conversational Shell + Adaptive Workspace + Inspectable Wallet State**

The holder can interact through:

1. text;
2. voice;
3. contextual action cards;
4. adaptive workspaces;
5. notifications and proactive prompts;
6. deterministic fallback wallet views;
7. device-native entry points permitted by the operating system.

There shall be no requirement that the holder converse with SERA to inspect assets, credentials, history, security state or pending actions.

---

## 4. SERA Identity in Interaction

SERA has a persistent `did:soul:agent` identity linked to the holder's Soul ID.

The SERA DID identifies the persistent agent relationship. It does not itself grant execution authority.

Runtime instances on different devices or environments are subordinate runtime identities associated with the SERA DID.

Examples:

- primary phone runtime;
- secondary phone runtime;
- tablet runtime;
- wearable runtime;
- protected cloud reasoning runtime.

Authority is evaluated per runtime instance, device state, action, context and mandate.

---

## 5. Intent Pipeline

Every consequential interaction shall pass through the following logical sequence:

```
Holder Input
   ↓
Capture
   ↓
Interpretation
   ↓
Intent Normalization
   ↓
Entity Resolution
   ↓
Context Resolution
   ↓
Typed Action Contract
   ↓
Capability Validation
   ↓
Authority Validation
   ↓
Risk Classification
   ↓
Trust Protocol
   ↓
REV
   ↓
Approval / Delegated Authority
   ↓
Authentication
   ↓
Signing
   ↓
Execution
   ↓
Evidence
```

The AI layer shall not directly invoke signing or execution.

---

## 6. Typed Intent Requirement

Natural language is never executable authority.

A natural-language request shall be transformed into a typed, deterministic intent object before it can enter the control plane.

A normalized intent shall minimally include:

- intent identifier;
- holder DID;
- SERA DID;
- runtime instance identifier;
- device identifier;
- intent type;
- action type;
- resolved entities;
- asset;
- amount where applicable;
- chain/network;
- counterparty;
- credential or claim scope where applicable;
- source modality;
- interpretation confidence;
- ambiguity indicators;
- requested authority mode;
- expiry;
- correlation identifier.

No execution-capable downstream service may rely on free-form natural language as its authoritative input.

---

## 7. Ambiguity Rule

The governing safety rule is:

> Ambiguity may inconvenience the holder. Ambiguity must never move money or disclose protected identity data.

If material ambiguity exists in any of the following, execution shall not proceed:

- amount;
- recipient;
- chain;
- asset;
- credential;
- claim scope;
- merchant;
- wallet;
- mandate;
- destination;
- fee-bearing route;
- action type.

SERA may resolve low-risk conversational ambiguity. Material execution ambiguity requires clarification or explicit holder review.

---

## 8. Voice Interaction

Voice is a first-class input modality, not an authorization mechanism.

Voice processing may include:

- transcription;
- holder-specific vocabulary adaptation;
- name and alias resolution;
- code-switching;
- number disambiguation;
- confidence scoring;
- context-aware interpretation.

Voice recognition or speaker recognition shall not replace required authentication.

For consequential actions, the system shall distinguish:

1. **voice command interpretation**;
2. **intent confirmation**;
3. **holder authorization**;
4. **cryptographic authentication/signing**.

These are separate events.

---

## 9. Voice Confidence Envelope

Voice-derived intents shall be evaluated using a confidence envelope that may include:

- acoustic confidence;
- holder adaptation confidence;
- vocabulary confidence;
- intent confidence;
- entity confidence;
- numeric confidence;
- contextual confidence;
- optional speaker confidence;
- environmental quality;
- action risk.

Numbers, recipients and asset identifiers receive elevated scrutiny.

Examples such as "15" versus "50" shall be treated as material ambiguity for value-bearing actions.

---

## 10. SERA Holder Voice Profile

The SERA Holder Voice Profile may contain:

- accent adaptation;
- pronunciation preferences;
- personal vocabulary;
- wallet aliases;
- recipient aliases;
- chain and token vocabulary;
- merchant aliases;
- correction history;
- code-switching preferences;
- historically ambiguous terms.

The profile is part of SERA's encrypted portable state, subject to the protections defined in DB17A.

Raw biometric audio is not portable SERA state by default.

---

## 11. Context Broker

SERA shall not receive unrestricted access to all wallet and identity data.

All context supplied to an AI runtime must pass through the Context Broker.

The Context Broker shall perform:

1. data classification;
2. purpose validation;
3. minimization;
4. redaction or transformation;
5. freshness evaluation;
6. source annotation;
7. approved context packaging.

The Context Broker may provide less information than the wallet itself possesses.

---

## 12. Data Classes

At minimum, the architecture recognizes:

- D0 Public;
- D1 General Personal;
- D2 Financial;
- D3 Identity;
- D4 Credential;
- D5 Behavioral;
- D6 Biometric;
- D7 Authorization;
- D8 Key Material.

AI model access becomes progressively more restricted as sensitivity increases.

D8 key material is never exposed to the model plane.

---

## 13. Authority Tiers

The candidate authority model is:

- **A0 Read / Explain**  
  No execution authority.

- **A1 Prepare / Retrieve**  
  SERA may prepare an action or retrieve permitted information.

- **A2 Explicit Approval Required**  
  SERA prepares; holder must explicitly approve.

- **A3 Bounded Delegation**  
  SERA may act within a holder-issued mandate with explicit constraints.

- **A4 Conditional Autonomous Execution**  
  SERA may execute only when predefined conditions and mandate boundaries are satisfied.

- **A5 Prohibited Autonomous Action**  
  The action requires direct holder involvement regardless of convenience.

SERA may never promote itself to a higher authority tier.

---

## 14. Mandates

Delegation is represented by a machine-enforceable mandate.

A mandate shall be bound to:

- mandate identifier;
- holder DID;
- SERA DID;
- permitted capabilities;
- permitted action types;
- asset scope;
- counterparty scope;
- chain/network scope;
- per-action value limits;
- cumulative value limits;
- time limits;
- frequency limits;
- contextual conditions;
- device/runtime restrictions;
- approval exceptions;
- expiry;
- revocation state;
- version;
- evidence requirements.

A mandate must be narrower than the holder's full wallet authority.

---

## 15. Device Trust

Authority is not inherited merely because the user is signed in.

Device trust states are:

- UNREGISTERED;
- REGISTERED;
- ATTESTED;
- TRUSTED;
- LIMITED;
- SUSPENDED;
- REVOKED.

An action's available authority is a function of:

```
Holder Identity
+ SERA Identity
+ Runtime Identity
+ Device Trust
+ Mandate
+ Context
+ Risk
+ Policy
+ Trust Protocol
+ REV
```

A wearable or secondary device shall not automatically inherit primary-phone authority.

---

## 16. Risk Classes

The runtime shall classify actions using at least the following conceptual scale:

- R0 Informational;
- R1 Low impact;
- R2 Moderate;
- R3 High;
- R4 Critical;
- R5 Prohibited or exceptional.

Risk may be influenced by:

- value;
- recipient novelty;
- chain;
- contract;
- asset;
- credential sensitivity;
- device state;
- location/context signals where permitted;
- unusual behavior;
- spam or scam indicators;
- Trust Protocol signals;
- REV state;
- automation;
- external intelligence confidence.

Risk classification may increase requirements. It may not weaken them.

---

## 17. Approval Architecture

Approval is a deterministic control-plane event.

An approval shall reference the exact action contract being authorized.

The approval context must make material terms available for review.

If any material term changes after approval, the approval becomes invalid.

Material changes include:

- recipient;
- amount;
- asset;
- chain;
- route;
- fee;
- credential claim set;
- merchant;
- contract;
- mandate scope.

---

## 18. Concealed-Detail Presentation

Sensitive action details may be concealed by default or by holder preference.

Concealment may apply to:

- balances;
- amounts;
- recipients;
- addresses;
- merchants;
- credential claims;
- counterparties;
- transaction details;
- security alerts.

The holder may reveal details per instance.

Rules:

- reveal does not equal approval;
- approval does not imply future reveal;
- concealed details re-hide on timeout, lock, backgrounding, device change or policy;
- spoken output follows the same concealment policy;
- wearables use stricter defaults;
- high-risk actions may require authenticated reveal before approval is enabled.

The system must be capable of evidencing that material details were reviewable without duplicating protected data into the audit log.

---

## 19. Proactive Interaction

SERA may proactively surface information based on monitored signals.

Notification classes are:

- CRITICAL;
- ACTION REQUIRED;
- RELEVANT;
- INFORMATIONAL;
- LOW VALUE.

Proactivity may:

- create awareness;
- summarize;
- explain;
- prepare an action;
- suggest a next step.

Proactivity shall not create authority.

External news, social, chain or market data may inform recommendations but shall never independently authorize an action.

---

## 20. Multi-Chain Interaction

SERA may compare routes based on:

- asset availability;
- recipient compatibility;
- estimated fees;
- expected confirmation characteristics;
- bridge requirements;
- wallet policy;
- holder preferences;
- supported chains;
- risk;
- Trust Protocol/REV implications.

A chain or route change after review is a material change and requires revalidation.

The user shall not be silently switched to a materially different execution route.

---

## 21. Credential Presentation

Credential presentation follows the same authority principles as financial actions.

SERA may:

- identify relevant credentials;
- explain a request;
- prepare a selective disclosure;
- prepare a zero-knowledge proof;
- minimize claim disclosure.

SERA may not silently disclose protected credential claims.

The typed presentation contract must specify:

- verifier;
- credential type;
- requested claims;
- disclosed claims;
- proof mechanism;
- expiry;
- purpose;
- holder approval or mandate basis.

---

## 22. WalletConnect and External Requests

External dApps and services are treated as untrusted request sources until validated.

SERA may explain WalletConnect requests and contract interactions.

External content is data, not instruction.

Prompt injection or manipulative text from a website, message, transaction memo or dApp must not bypass the deterministic control plane.

---

## 23. Trust Protocol Placement

Trust Protocol evaluates identity, authority, delegation and policy signals.

Its outputs may inform:

- risk;
- route acceptance;
- counterparty assessment;
- device/runtime confidence;
- action eligibility.

Trust Protocol is not equivalent to holder approval.

---

## 24. REV Placement

REV is the final runtime pass/fail gate where required.

REV may consume inputs from:

- Trust Protocol;
- device trust;
- mandates;
- policy;
- risk;
- AURION where applicable;
- execution context.

If REV is mandatory and unavailable, the affected consequential action fails closed.

The holder may still inspect, prepare, save or cancel an action.

---

## 25. Authentication and Signing

Authentication and signing remain outside the AI plane.

SERA may request an authentication step.

SERA may not:

- access raw private keys;
- construct arbitrary signer commands outside the typed contract;
- bypass device security;
- reduce required authentication due to model confidence.

The signing gateway accepts only canonical, validated signing payloads.

---

## 26. Cross-Device Handoff

An interaction may begin on one device and continue on another.

Handoff shall preserve:

- intent ID;
- correlation ID;
- material terms hash;
- risk;
- authority context;
- evidence lineage;
- concealment state where applicable.

Authority is re-evaluated on the receiving device.

A handoff does not transfer the source device's authority.

---

## 27. Wearables

Wearables are Phase 2 product surfaces but Phase 1 architectural constraints.

Wearables may support:

- SERA interaction;
- notifications;
- selected asset views;
- selected credential presentations;
- low-risk approvals;
- emergency lock;
- transaction preparation;
- handoff.

High-risk execution may require escalation to a stronger device.

---

## 28. Degraded Interaction

If AI or voice services fail, the wallet remains usable through deterministic fallback interfaces.

Failures may reduce:

- convenience;
- personalization;
- recommendation quality;
- speed;
- automation.

Failures must not reduce:

- authority requirements;
- privacy;
- signing assurance;
- Trust Protocol requirements;
- REV requirements;
- evidence integrity.

---

## 29. Unknown Execution State

If submission status is uncertain, the system enters `EXECUTION_STATUS_UNKNOWN`.

In this state:

- duplicate submission is suppressed;
- the action is reconciled across available sources;
- nonce/sequence is inspected where relevant;
- the holder receives a privacy-safe status;
- re-execution requires deterministic proof that duplication will not occur.

---

## 30. Evidence

Every consequential interaction contributes to the SERA Activity & Evidence Ledger defined in DB17B.

Evidence shall capture, as appropriate:

- intent;
- normalized action;
- resolved entities;
- authority basis;
- mandate;
- risk;
- device;
- Trust Protocol result;
- REV result;
- approval;
- authentication;
- signing reference;
- execution result;
- failure state;
- recovery state;
- concealment/reveal events;
- resulting receipt.

Evidence is not conversational memory.

---

## 31. Audit Reporting

The holder may request reports such as:

- all SERA-assisted transactions;
- transactions prepared by SERA;
- transactions executed after approval;
- transactions executed under mandate;
- blocked actions;
- REV-denied actions;
- credential disclosures;
- WalletConnect actions;
- security events.

Reports shall query structured evidence, not reconstruct activity from model memory.

---

## 32. Interaction Memory

SERA interaction memory follows DB08 and DB17A.

Memory may influence:

- language;
- aliases;
- recommendations;
- workspace organization;
- notification preferences;
- concealment preferences.

Memory shall not create authority.

A remembered preference cannot replace a mandate or approval.

---

## 33. Model Neutrality

Interaction architecture is provider-neutral.

The model interface shall expose controlled functions such as:

- interpret;
- classify;
- summarize;
- plan;
- explain;
- extract entities;
- produce candidate actions.

It shall not expose direct signing, key access or unrestricted execution primitives.

---

## 34. Security Invariants

The following invariants are frozen at candidate level:

1. Natural language is not executable authority.
2. Voice is not authorization.
3. Memory is not authorization.
4. Proactivity is not authorization.
5. External content is not instruction.
6. Model confidence cannot lower security requirements.
7. A device cannot inherit another device's authority merely through session continuity.
8. Reveal and approval are separate events.
9. Route changes invalidate materially affected approvals.
10. AI failure cannot make the wallet unusable.
11. Trust Protocol and REV requirements cannot be bypassed through fallback.
12. Signing remains outside the model plane.
13. Delegation is explicit, bounded, revocable and evidencable.
14. SERA cannot enlarge a mandate.
15. Consequential actions must produce evidence.

---

## 35. Candidate Reference Flow: Explicit Payment

```
Holder: "Send Alex 50 USDC"
      ↓
SERA interprets intent
      ↓
Recipient candidates resolved
      ↓
Amount/asset/recipient confidence checked
      ↓
Typed payment intent created
      ↓
Route candidates evaluated
      ↓
Authority = A2
      ↓
Risk classification
      ↓
Trust Protocol
      ↓
REV
      ↓
Concealed or visible review sheet
      ↓
Holder reveals if required
      ↓
Holder approves exact material terms
      ↓
Authentication
      ↓
Signing gateway
      ↓
Execution router
      ↓
Chain adapter
      ↓
Result
      ↓
SAEL evidence + holder receipt
```

---

## 36. Candidate Reference Flow: Delegated Payment

```
Trigger / scheduled condition
      ↓
SERA identifies valid mandate
      ↓
Typed action generated
      ↓
Mandate scope checked
      ↓
Value / counterparty / chain / frequency limits checked
      ↓
Risk classification
      ↓
Trust Protocol
      ↓
REV
      ↓
If within delegated authority:
      authentication policy
      ↓
Signing gateway
      ↓
Execution
      ↓
SAEL evidence
      ↓
Holder notification
```

No mandate match results in preparation or escalation, not autonomous execution.

---

## 37. Candidate Reference Flow: Credential Request

```
Verifier request
      ↓
Request parsed
      ↓
Requested claims identified
      ↓
Credential candidates resolved
      ↓
Minimum disclosure prepared
      ↓
Risk/sensitivity classification
      ↓
Authority check
      ↓
Trust Protocol / REV if policy requires
      ↓
Holder review
      ↓
Proof generated
      ↓
Presentation transmitted
      ↓
SAEL evidence
```

---

## 38. Candidate Reference Flow: Proactive Alert

```
Signal received
      ↓
Source confidence assessed
      ↓
Relevance / urgency assessed
      ↓
Notification class assigned
      ↓
Privacy presentation policy applied
      ↓
Holder sees alert
      ↓
Optional action requested
      ↓
New typed intent created
      ↓
Normal authority pipeline begins
```

The alert itself never becomes execution authority.

---

## 39. Candidate Freeze Boundary

The following are frozen for SSW-AI-02 Candidate Freeze:

- SERA-first interaction model;
- typed intent architecture;
- ambiguity rule;
- voice separation from authorization;
- Context Broker role;
- authority tiers A0-A5;
- mandate model;
- device-scoped authority;
- risk classification;
- concealed-detail behavior;
- proactive interaction constraints;
- Trust Protocol placement;
- REV placement;
- signing isolation;
- cross-device re-evaluation;
- Phase 2 wearable constraint;
- degraded-mode safety;
- evidence requirement;
- audit-reporting basis;
- model-neutral interaction boundary.

Implementation details may evolve without reopening the candidate architecture if they preserve these invariants.

---

## 40. Exit Criteria

SSW-AI-02 may progress from Candidate Freeze when:

1. SSW-AI-01 and SSW-AI-02 are jointly reviewed for contradiction;
2. canonical typed intent schemas are specified;
3. mandate schema is specified;
4. device trust transition rules are specified;
5. conceal/reveal interaction rules are prototyped;
6. payment, credential and delegated-action flows pass threat-model review;
7. model tool boundaries are validated against signing isolation;
8. SAEL evidence requirements are mapped to runtime events;
9. degraded-mode interaction behavior is tested;
10. no unresolved architecture issue permits AI interpretation to become authority.

---

## 41. Candidate Freeze Statement

SSW-AI-02 establishes the candidate interaction and authority architecture for the SERA-first Soul Super Wallet.

The architecture is intentionally asymmetric:

**SERA is allowed to understand more than she is allowed to do.**

This asymmetry is a security property, not a limitation.

The holder remains the root of authority. SERA remains the intelligent orchestration layer operating within explicit, inspectable and revocable boundaries.


---

## SOURCE 25
**Path:** `docs/architecture/SSW-AI-CFR-01-Joint-Candidate-Freeze-Consistency-Review.md`  
**Blob SHA:** `33a9b946a5255a009553ef7dd60d4a91e3604e66`

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


---

## SOURCE 26
**Path:** `docs/architecture/SSW-AI-CF-A01-Candidate-Freeze-Harmonization-Amendment.md`  
**Blob SHA:** `d4dcfc5129fecefed3ad0645d691781cf453198a`

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


---

## SOURCE 27
**Path:** `docs/architecture/SSW-AI-CF-A02-Soul-ID-Anchored-Wallet-and-SERA-Continuity-Amendment.md`  
**Blob SHA:** `95bbc61907a4278ac5a7a6e58f0f1f2a39e66927`

# SSW-AI-CF-A02: Soul ID-Anchored Wallet & SERA Continuity Amendment

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Amendment ID:** SSW-AI-CF-A02  
**Status:** Adopted Controlled Harmonization  
**Date:** 2026-09-17  
**Supersedes conflicting device-centric wording in:** ISC-04, ISC-06, ATT-01, REC-01 and any earlier architecture text

## 1. Decision

Soul Super Wallet is **not device-bound**.

Wallet continuity is anchored to the holder's Soul ID.

The holder may recover the Soul ID on a new device through SoulScan facial-biometric recovery and establish Soul Super Wallet on that device without possession of the prior device.

## 2. Identity Hierarchy

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

The device is replaceable.

The Holder DID relationship is persistent.

## 3. SERA Binding

SERA's Agent DID is bound to and governed by the wallet owner's Holder DID.

A SERA Agent DID or SERA key set recovered independently is not sufficient for consequential wallet operation.

The control plane must verify:

1. current Soul Super Wallet context is established under Holder DID H;
2. SERA Agent DID S declares/is recorded as governed by H;
3. the wallet's authorized SERA relationship resolves to S;
4. the current SERA runtime represents S;
5. normal authority, policy, Trust Protocol, REV and signing controls pass.

Therefore:

```
SERA key possession
  ≠ Holder DID authority
  ≠ wallet signing authority
```

## 4. Device Role

Device identity and attestation are security signals for the current execution environment.

They may affect:

- runtime eligibility;
- session scope;
- authentication requirements;
- risk classification;
- signing policy;
- mandate eligibility;
- Trust Protocol;
- REV.

They do not determine:

- who owns Soul Super Wallet;
- whether the Holder DID exists;
- whether the holder can recover the wallet;
- who owns SERA.

## 5. Recovery Order

Canonical recovery order:

```
SoulScan facial-biometric recovery
  ↓
Holder Soul ID recovered
  ↓
Soul Super Wallet context established
  ↓
SERA Agent DID governance binding verified
  ↓
SERA portable state / keys restored
  ↓
Current runtime registered
  ↓
Current device/runtime assurance evaluated
  ↓
Scoped authority resumes under normal controls
```

## 6. Biometric Boundary

Facial biometrics recover or establish the holder's Soul ID recovery path.

Raw biometric material must not be treated as:

- a wallet private key;
- an SERA state-encryption key;
- a standing transaction approval;
- a mandate.

Biometric recovery establishes identity continuity. Consequential operations remain governed by the normal control plane.

## 7. Device Loss

Loss or compromise of one device may require:

- revoking that Device ID;
- revoking its Runtime IDs;
- revoking its sessions;
- rotating device-specific wrapping keys;
- reviewing recent evidence.

It does **not** revoke the Holder DID, Soul Super Wallet ownership, or SERA Agent DID solely because that device was lost.

## 8. Non-Transferability

SERA's Holder DID binding is non-transferable by default.

Recovery may restore the same SERA under the same Holder DID.

Moving SERA to another Holder DID is not normal recovery and requires a separate controlled migration or creation of a new SERA Agent DID.

## 9. Normative Priority

If any prior specification implies that:

- a trusted old device is required to prove wallet ownership;
- wallet recovery requires possession of the old device;
- device registration establishes wallet ownership;
- SERA recovery is independently usable outside its Holder DID wallet context;

this amendment governs and that interpretation is rejected.

## 10. Controlled Statement

The wallet follows the person through Soul ID.

SERA follows the wallet owner through the Holder DID governance binding.

Devices come and go. Identity does not.


---

## SOURCE 28
**Path:** `docs/architecture/SSW-AI-VOICE-01-Holder-Voice-Adaptation-Understanding-and-Command-Safety-Architecture.md`  
**Blob SHA:** `9fcb52005dcfaaa5272910af4b5ffc2f4922fdb2`

# SSW-AI-VOICE-01
## Holder Voice Adaptation, Understanding & Command Safety Architecture

**Program:** Soul Super Wallet AI-First / SERA  
**Document ID:** SSW-AI-VOICE-01  
**Document Type:** Controlled Design Specification  
**Status:** Draft v0.1  
**Date:** 2026-09-16  
**Repository:** `Kavithakanaparthi/SSW-SERA`  
**Primary System:** Soul Super Wallet / SERA  

---

## 1. Purpose

This document defines the architecture for holder-specific voice understanding within the AI-first Soul Super Wallet.

SERA is intended to become the primary operating interface of the wallet. Voice is therefore not treated as an auxiliary dictation feature. It is a primary human-to-agent control path capable of initiating information retrieval, credential presentation, transaction preparation, delegated actions, monitoring instructions, and other wallet functions.

A speech-recognition error in a conversational application may be inconvenient. The same error in a financial, identity, credential, or delegated-authority system may result in an incorrect recipient, amount, asset, credential disclosure, instruction, or transaction.

The architecture defined here therefore treats holder voice understanding as part of the wallet's trust and transaction-safety boundary.

The governing principle is:

> **SERA may misunderstand a conversation. She must not silently convert uncertainty into authority.**

---

## 2. Design Objective

Each Soul Super Wallet instance SHALL maintain a holder-specific voice understanding profile that adapts to the way its holder actually speaks.

The system SHALL learn and account for, where permitted and technically appropriate:

- accent;
- pronunciation;
- recurrent mispronunciation;
- speech rhythm and pace;
- preferred vocabulary;
- names and aliases;
- wallet aliases;
- organizations and counterparties;
- token and protocol names;
- language preferences;
- multilingual speech;
- code-switching patterns;
- recurrent recognition ambiguities;
- holder corrections;
- domain-specific terminology;
- numerical-expression habits;
- contextual references.

The objective is not to force the holder to speak in a standardized way. The objective is for SERA to adapt to the holder while retaining explicit safety controls for consequential actions.

---

## 3. Architectural Position

The Holder Voice Adaptation Layer sits between raw speech capture and SERA's Intent Engine.

```text
Holder
  |
  v
Audio Capture
  |
  v
Audio Pre-Processing
  |
  v
Base Speech Recognition
  |
  +------------------------------+
  |                              |
  v                              v
Candidate Transcript        Acoustic Confidence
  |                              |
  +--------------+---------------+
                 |
                 v
      SERA Holder Voice Profile
                 |
     +-----------+-----------+
     |           |           |
     v           v           v
 Pronunciation  Personal    Correction /
 Adaptation     Language    Ambiguity Model
     |           |           |
     +-----------+-----------+
                 |
                 v
       Holder-Aware Interpretation
                 |
                 v
             Intent Engine
                 |
                 v
        Entity Resolution Engine
                 |
                 v
       Voice Confidence Envelope
                 |
                 v
         Command Safety Gate
                 |
          +------+------+ 
          |             |
          v             v
      Clarify       Continue
                        |
                        v
                 Authority Layer
                        |
                  Soul ID / SVID4AI
                        |
                  Trust Protocol
                        |
                       REV
                        |
                 Authorization
                        |
                     Execute
```

Voice recognition SHALL NOT directly invoke wallet execution.

---

## 4. Separation of Concerns

The architecture SHALL distinguish five separate questions:

1. **What sounds were recognized?**
2. **What words did the holder most likely mean?**
3. **What intent does the utterance express?**
4. **Is the intended action unambiguous and safe to prepare?**
5. **Is the holder or agent authorized to execute that action?**

These questions SHALL be processed independently enough that confidence in one does not automatically imply confidence in the others.

A high-confidence transcription SHALL NOT be treated as authorization.

A familiar voice SHALL NOT be treated as transaction approval.

An inferred intent SHALL NOT be treated as permission to execute.

---

## 5. SERA Holder Voice Profile (SHVP)

### 5.1 Definition

The **SERA Holder Voice Profile (SHVP)** is an encrypted, holder-controlled adaptation profile associated with a specific Soul Super Wallet identity context.

It is not a generic Soulverse speech model and is not intended to become a centralized biometric corpus.

### 5.2 Logical Components

```text
holder_voice_profile
 |
 +-- profile_metadata
 +-- supported_languages
 +-- accent_adaptation
 +-- pronunciation_dictionary
 +-- personal_vocabulary
 +-- entity_aliases
 +-- wallet_aliases
 +-- organization_aliases
 +-- token_and_protocol_terms
 +-- code_switch_patterns
 +-- recurrent_confusions
 +-- numeric_confusion_profile
 +-- correction_history
 +-- confidence_calibration
 +-- environment_adaptation
 +-- speaker_signal_preferences
 +-- privacy_and_retention_policy
 +-- model_version_metadata
```

### 5.3 Data Classification

The SHVP SHALL be treated as sensitive holder data.

Any derived speaker-identifying features that may constitute biometric information SHALL receive a higher protection classification than ordinary vocabulary or preference data.

Raw audio SHALL NOT automatically become part of the long-term SHVP.

---

## 6. Voice Enrollment

### 6.1 Enrollment Principle

Voice adaptation SHOULD begin during AI-first wallet onboarding but SHALL remain user-controlled.

SERA SHOULD offer a dedicated flow such as:

**Train SERA to understand me**

Enrollment SHALL explain:

- what is being learned;
- what remains on-device;
- whether any data leaves the device;
- whether raw audio is retained;
- how the holder can retrain or delete the profile;
- whether speaker-recognition features are enabled;
- what voice can and cannot authorize.

### 6.2 Enrollment Corpus

Training phrases SHOULD resemble real SERA use rather than generic speech-training text.

Representative categories SHALL include:

#### Wallet queries

- Show me my balance.
- What did I spend this week?
- Which wallet has the most USDC?

#### Financial commands

- Prepare fifty dollars for Jane.
- Send fifteen dollars.
- Do not send that yet.
- Move five hundred to treasury.

#### Identity and credentials

- Show my Soul ID.
- What credentials do I have?
- Present my travel credential.

#### Personal terminology

- names of frequently used contacts;
- business names;
- wallet aliases;
- family aliases;
- banks;
- merchants;
- digital assets;
- protocols;
- institutions;
- geographic names.

#### Safety-sensitive contrast phrases

Enrollment SHOULD intentionally include acoustically confusable values, including examples such as:

- fifteen / fifty;
- fourteen / forty;
- eighteen / eighty;
- one hundred / one thousand;
- point five / five;
- send / do not send;
- approve / do not approve.

The enrollment process SHALL NOT imply that training eliminates the need for transaction authorization.

---

## 7. Continuous Adaptation

### 7.1 Correction-Driven Learning

Holder corrections are high-value adaptation signals.

Example:

```text
SERA: "I heard $80 to Meera Patel."
Holder: "No. Mira Shah."

Result:
- current action remains blocked;
- entity correction is applied to the current interpretation;
- correction may update the holder's alias/pronunciation model;
- future confidence may improve;
- no payment occurs solely because a correction was learned.
```

### 7.2 Learning Sources

SHVP adaptation MAY use:

- explicit enrollment;
- explicit holder teaching;
- holder-confirmed corrections;
- repeated successful recognition patterns;
- user-approved contact aliases;
- user-approved wallet aliases;
- user-approved pronunciation mappings;
- locally observed language selection patterns.

SHVP adaptation SHALL NOT treat an unconfirmed model guess as ground truth.

### 7.3 Explicit Teaching

SERA SHALL provide a mechanism for deliberate vocabulary teaching.

Examples:

- "When I say ops, I mean my operating wallet."
- "When I say treasury, I mean Soulverse Treasury Wallet."
- "When I say Nani, I mean Narayani Rao."
- "I say USDC as U-S-D-C."

Such mappings SHALL be treated as linguistic/contextual mappings unless the holder separately establishes an authority or automation rule.

A linguistic alias SHALL NOT itself create transaction authority.

---

## 8. Multilingual and Code-Switched Speech

SERA SHALL be designed for multilingual holders from inception.

The holder SHOULD be able to configure multiple spoken languages rather than selecting a single permanent wallet language.

The architecture SHALL support, subject to platform and model capability:

- automatic language identification;
- user-specified language sets;
- code-switching within an utterance;
- personal vocabulary spanning multiple languages;
- language-specific pronunciation models;
- entity names that do not follow the surrounding sentence language.

Example:

```text
English + Telugu + financial entity vocabulary
        |
        v
Language segmentation
        |
        v
Holder voice adaptation
        |
        v
Unified intent representation
```

A mixed-language utterance SHALL NOT be normalized into an executable command until amounts, recipients, assets, actions, negation and authority-relevant elements are resolved with sufficient confidence.

---

## 9. Voice Confidence Envelope

### 9.1 Requirement

SERA SHALL NOT rely on one speech-recognition confidence score.

The system SHALL construct a **Voice Confidence Envelope (VCE)** from multiple signals.

### 9.2 Candidate Signals

| Signal | Purpose |
|---|---|
| Acoustic confidence | Confidence in recognized sounds |
| Transcript confidence | Confidence in candidate text |
| Holder adaptation confidence | Match to holder-specific speech history |
| Vocabulary confidence | Familiarity with words and phrases |
| Intent confidence | Confidence in requested operation |
| Entity confidence | Confidence in recipient, wallet, issuer, merchant or asset |
| Numeric confidence | Confidence in amount, quantity, date, rate and unit |
| Negation confidence | Confidence in words such as no, don't, cancel, stop |
| Context confidence | Consistency with conversation and wallet state |
| Speaker signal | Optional evidence that speech resembles enrolled holder |
| Environmental confidence | Noise, overlap, clipping, microphone quality |
| Action risk | Consequence if interpretation is wrong |

### 9.3 Decision Model

```text
Acoustic confidence
       +
Holder adaptation
       +
Intent confidence
       +
Entity confidence
       +
Numeric confidence
       +
Negation confidence
       +
Context confidence
       +
Action risk
       |
       v
Voice Confidence Envelope
       |
       +-----------------------------+
       |                             |
       v                             v
Sufficient for action class     Insufficient
       |                             |
       v                             v
Continue to authority gate      Clarify / display / repeat
```

Confidence thresholds SHALL be risk-sensitive.

The threshold for "show my ETH balance" MAY be substantially lower than the threshold for "send 12 ETH to Marcus."

---

## 10. Risk-Based Command Classes

### Class V0: Conversational / non-sensitive

Examples:

- Explain staking.
- What is USDC?

Voice interpretation can proceed with ordinary confidence thresholds.

### Class V1: Wallet read

Examples:

- What's my ETH balance?
- Show recent transactions.

Misrecognition has limited direct consequence, but privacy policy still applies.

### Class V2: Sensitive read / credential lookup

Examples:

- Show my passport credential.
- Tell me my account details.

Identity and privacy context become material.

### Class V3: Prepare-only action

Examples:

- Prepare $50 USDC for Jane.
- Draft a swap of 2 ETH.

SERA may prepare an action but SHALL NOT execute solely from voice recognition.

### Class V4: Transactional / disclosure action

Examples:

- Send $500.
- Present my credential.
- Share this claim.

High confidence plus independent authorization controls are required.

### Class V5: Delegated / standing authority

Examples:

- Pay AWS monthly if the bill is below $500.
- Keep $5,000 USDC in the operating wallet.

Voice may initiate policy creation, but the resulting mandate SHALL be rendered explicitly, authenticated, bounded, signed where appropriate, and recorded as authority separate from the spoken command.

---

## 11. Numeric Safety Architecture

Financial numbers SHALL receive specialized treatment.

### 11.1 Protected Fields

The following SHALL be treated as protected numeric entities:

- transaction amount;
- token quantity;
- fiat amount;
- decimal placement;
- percentage;
- interest/yield threshold;
- gas threshold;
- date/time;
- recurrence;
- spending limit;
- expiry;
- slippage;
- exchange rate;
- recipient account suffix where spoken.

### 11.2 Ambiguity Rules

SERA SHALL clarify rather than infer when acoustically plausible alternatives materially change the action.

Examples:

```text
15 vs 50
1,500 vs 15,000
0.5 ETH vs 5 ETH
14% vs 40%
```

### 11.3 Dual Rendering

For consequential actions SERA SHOULD render amounts in both words and numerical notation.

Example:

> Fifteen thousand dollars ($15,000)

### 11.4 No-Silent-Guess Rule

If materially different numeric candidates remain plausible after holder adaptation and contextual resolution, SERA SHALL request clarification.

---

## 12. Entity and Recipient Resolution

Names alone are insufficient identifiers for financial execution.

SERA SHALL resolve spoken names against a holder-specific entity graph that may include:

- Soul ID;
- verified contacts;
- wallet addresses;
- wallet aliases;
- prior counterparties;
- relationship attestations;
- organizations;
- credential subjects/issuers;
- merchant identifiers;
- payment destination metadata.

Example:

```text
"Send $100 to Mira"
        |
        v
Speech candidates
  Mira / Meera
        |
        v
Holder Entity Graph
        |
   +----+----+
   |         |
   v         v
Mira Shah  Meera Patel
   |         |
   +----+----+
        |
        v
Context + history + identity evidence
        |
        v
Entity confidence
   +----+----+
   |         |
 high       low
   |         |
prepare    clarify
```

The final authorization surface SHALL show the resolved counterparty identity and not merely the spoken alias.

---

## 13. Negation and Cancellation Safety

Negation SHALL be treated as a protected semantic class.

Words and phrases such as the following SHALL receive enhanced recognition and confirmation handling:

- no;
- don't;
- do not;
- stop;
- cancel;
- wait;
- not yet;
- never;
- abort;
- undo where supported.

A low-confidence negation SHALL bias the system toward stopping or clarifying, never toward execution.

If the system is uncertain whether the holder said "send" or "don't send," the safe state is **do not send**.

---

## 14. Voice and Authorization Boundary

Voice recognition SHALL be separated from transaction authorization.

```text
Voice utterance
      |
      v
Interpretation
      |
      v
Intent resolution
      |
      v
Command safety
      |
      v
Transaction / disclosure preparation
      |
      v
Trust Protocol / REV evaluation
      |
      v
Required holder authorization
      |
      v
Cryptographic signature / approved execution
```

Voice SHALL NOT substitute for cryptographic authorization merely because speaker-recognition confidence is high.

Speaker recognition MAY be an input to Trust Protocol or REV where explicitly designed, but SHALL be treated as a signal rather than a sole root of authority for high-consequence operations.

---

## 15. Speaker Recognition and Anti-Spoofing

### 15.1 Optional Speaker Signal

The architecture MAY support holder-speaker matching as an optional assurance signal.

It SHALL be independently configurable from speech transcription.

### 15.2 Threats

The threat model SHALL include:

- replayed recordings;
- synthetic/deepfake speech;
- voice cloning;
- speaker imitation;
- loudspeaker injection;
- media playback near the device;
- coerced speech;
- overlapping speakers;
- compromised microphone path;
- malicious remote audio sessions.

### 15.3 Safety Position

Speaker recognition alone SHALL NOT authorize irreversible high-risk actions.

Future liveness or anti-spoofing mechanisms MAY increase assurance but SHALL remain only one part of the authorization model.

---

## 16. Privacy Architecture

### 16.1 Governing Rule

**Raw holder voice recordings are not a Soulverse data asset.**

### 16.2 Default Processing Model

```text
Raw audio
   |
   v
On-device processing where available
   |
   +--> transient recognition features
   |
   +--> holder adaptation updates
   |
   v
Encrypted SHVP

Raw audio
   |
   +--> discarded by default after required processing
```

### 16.3 Cloud Processing

If cloud processing is used, the system SHALL disclose at minimum:

- provider;
- data categories transmitted;
- purpose;
- retention behavior;
- training/use policy;
- jurisdiction where required;
- available local alternative where applicable.

No wallet seed, private key, signing secret, or equivalent cryptographic secret SHALL be transmitted to a speech or language model.

### 16.4 Credential Minimization

Raw credential contents SHOULD NOT be included in model context where a minimized claim representation is sufficient.

---

## 17. Storage and Portability

The holder SHOULD be able to preserve years of voice adaptation across device replacement without creating a centralized biometric repository.

### 17.1 Portable Data

Potentially portable encrypted profile data MAY include:

- vocabulary;
- aliases;
- pronunciation mappings;
- language preferences;
- correction patterns;
- non-biometric confidence calibration;
- wallet-specific terminology.

### 17.2 Restricted Data

Biometric speaker embeddings, raw voice recordings, and similar high-sensitivity artifacts SHALL use stricter policy and MAY be device-bound depending on security requirements and platform capabilities.

### 17.3 Recovery

Restoration of SHVP data SHALL be bound to authenticated Soul Super Wallet recovery and SHALL NOT rely on public identifiers alone.

---

## 18. Platform Implementation Profile: iOS

The iOS implementation SHALL evaluate and, where appropriate, use current Apple speech capabilities including:

- Speech framework;
- `SpeechAnalyzer` / `SpeechTranscriber` where supported;
- on-device transcription where supported;
- locale-specific recognition;
- custom vocabulary;
- contextual strings;
- custom language-model facilities;
- custom pronunciations;
- audio-session controls;
- microphone permissions;
- App Intents integration for permitted actions.

The architecture SHALL not assume that every device/locale exposes identical model customization.

Capability detection and graceful fallback SHALL be required.

Voice processing SHALL respect iOS background-execution rules. Persistent cloud-side agent tasks SHALL not depend on indefinite microphone or app-process execution.

---

## 19. Platform Implementation Profile: Android

The Android implementation SHALL evaluate and, where appropriate, use current Android speech capabilities including:

- `SpeechRecognizer`;
- on-device speech recognition where available;
- recognition alternatives;
- language detection;
- model availability/download checks;
- microphone permissions;
- audio-focus handling;
- foreground/background execution restrictions;
- Bubble/widget/notification entry surfaces for SERA.

The architecture SHALL not depend on AccessibilityService for generalized autonomous execution.

Voice commands that lead to external services SHOULD be fulfilled through supported APIs, intents, protocols, deep links, or agent interfaces rather than simulated human taps.

---

## 20. SERA Intent Pipeline

A voice utterance SHALL be converted into a structured internal intent before an action is prepared.

Example:

```json
{
  "intent": "transfer.prepare",
  "source": "voice",
  "asset": "USDC",
  "amount": "50.00",
  "recipient_candidate": "did:soul:example",
  "recipient_alias_heard": "Mira",
  "confidence": {
    "acoustic": 0.97,
    "amount": 0.99,
    "recipient": 0.91,
    "intent": 0.98,
    "negation": 0.99
  },
  "risk_class": "V3",
  "authorization_state": "not_authorized"
}
```

The transcript SHALL NOT itself be treated as an executable command.

---

## 21. Command Safety Gate

The Command Safety Gate determines whether SERA may:

- answer;
- display;
- retrieve;
- prepare;
- ask for clarification;
- request authorization;
- deny execution;
- invoke Trust Protocol / REV;
- pass an authorized operation to the wallet execution layer.

### 21.1 Example Policy

```text
IF risk = V0 or V1
AND intent confidence >= threshold
THEN continue

IF protected numeric ambiguity = true
THEN clarify

IF recipient ambiguity = true
THEN clarify

IF negation ambiguity = true
THEN stop and clarify

IF risk >= V4
THEN require independent authorization

IF delegated action requested
THEN create explicit mandate proposal
AND require holder approval before mandate activation
```

Actual thresholds SHALL be determined through validation and security testing rather than fixed by this draft.

---

## 22. Trust Protocol, REV and SVID4AI Integration

Voice understanding SHALL terminate at the intent/command boundary and hand structured requests to the existing authority architecture.

### 22.1 Soul ID

Identifies the holder context and wallet relationship.

### 22.2 SVID4AI

Represents SERA/agent identity, delegation and permitted scope where the agent acts on the holder's behalf.

### 22.3 Trust Protocol

Evaluates relevant identity, authority, delegation and policy inputs.

### 22.4 REV

Produces the runtime allow/disallow decision for covered actions.

### 22.5 AURION

May provide continuous attestation inputs where applicable to longer-duration or higher-assurance agent activity.

Voice confidence MAY become an input to runtime policy but SHALL NOT replace authority evidence.

---

## 23. Interaction Rules

SERA SHALL follow these interaction principles:

1. Do not hide material uncertainty.
2. Do not guess a protected numeric field.
3. Do not guess among multiple material recipients.
4. Treat uncertain negation as a stop condition.
5. Prefer clarification to silent substitution.
6. Render consequential actions before authorization.
7. Use holder-friendly names while retaining canonical identifiers underneath.
8. Learn only from confirmed corrections.
9. Allow the holder to inspect and edit learned aliases.
10. Allow the holder to disable continuous adaptation.
11. Keep voice understanding and voice authorization conceptually separate.
12. Never expose private keys or equivalent secrets to speech/AI providers.

---

## 24. Validation and Adversarial Testing

Production readiness SHALL require a dedicated voice validation program.

### 24.1 Required Test Dimensions

- multiple English accents;
- non-native English speech;
- multilingual speech;
- code-switching;
- fast speech;
- slow speech;
- quiet speech;
- emotional speech;
- background conversation;
- traffic/noise;
- Bluetooth headsets;
- speakerphone;
- poor microphones;
- interrupted utterances;
- corrections mid-command;
- numerically confusable phrases;
- similar recipient names;
- token names;
- wallet aliases;
- negation;
- replay attacks;
- synthetic voice attempts;
- recordings from another device.

### 24.2 Safety Test Principle

False execution is more severe than false rejection.

The evaluation program SHALL track at minimum:

- word error rate;
- protected-field error rate;
- amount error rate;
- recipient-resolution error rate;
- negation error rate;
- false execution rate;
- clarification rate;
- false clarification rate;
- holder-correction recovery rate;
- speaker-spoof acceptance rate where speaker recognition is used;
- end-to-end transaction intent accuracy.

Word error rate alone SHALL NOT be accepted as the primary production safety metric.

---

## 25. Accessibility

Voice-first SHALL not mean voice-only.

Every consequential voice action SHALL have an equivalent visual/text pathway.

The system SHALL support users who:

- cannot speak consistently;
- use assistive communication;
- have speech impairments;
- experience temporary voice changes;
- speak in noisy environments;
- prefer text for sensitive transactions.

SERA SHOULD learn a holder's stable speech differences without characterizing them as errors that the holder must correct.

---

## 26. Failure Modes

The system SHALL explicitly handle at least the following states:

| Failure | Required behavior |
|---|---|
| Low acoustic confidence | Ask for repetition or switch modality |
| Ambiguous amount | Ask for explicit amount clarification |
| Ambiguous recipient | Present candidates / ask holder |
| Ambiguous asset | Ask which asset |
| Uncertain negation | Stop and clarify |
| Multiple speakers | Refuse high-risk execution until resolved |
| Speaker mismatch | Elevate authorization requirement / deny according to policy |
| No network | Use permitted local capability; never simulate success |
| STT provider unavailable | Fall back or ask for text input |
| Profile unavailable | Use base recognition with stricter thresholds |
| Model update changes behavior | Recalibrate confidence; preserve safety defaults |
| Deepfake suspicion | Block high-risk voice-only flow and require stronger authentication |

---

## 27. Audit and Evidence

For consequential actions, the system SHALL maintain appropriate evidence of:

- interpreted intent;
- resolved canonical entities;
- amount and asset;
- confidence outcome;
- clarification events;
- authority evaluation;
- authorization method;
- REV outcome where used;
- execution result.

Raw audio SHALL NOT be required as the default audit artifact.

Audit evidence SHOULD preserve structured intent and decision metadata rather than unnecessary biometric content.

---

## 28. Security Boundaries

The voice subsystem SHALL NOT have direct access to:

- seed phrases;
- private keys;
- raw signing keys;
- secure-element secrets;
- unrestricted credential stores;
- unrestricted execution functions.

The voice subsystem SHALL produce structured requests to downstream, policy-controlled interfaces.

Execution SHALL remain under wallet and authority-layer control.

---

## 29. Initial API Boundaries

The following logical interfaces are proposed for later formal API definition:

```text
VoiceCapture.start()
VoiceCapture.stop()
SpeechRecognition.transcribe()
HolderVoiceProfile.adapt()
HolderVoiceProfile.teachAlias()
HolderVoiceProfile.removeAlias()
HolderVoiceProfile.getLanguages()
HolderVoiceProfile.setLanguages()
VoiceConfidence.evaluate()
IntentEngine.resolve()
EntityResolver.resolve()
CommandSafety.evaluate()
Authorization.prepare()
TrustProtocol.evaluate()
REV.evaluate()
WalletExecution.submit()
```

These names are conceptual and not yet frozen production APIs.

---

## 30. Initial Data Objects

The detailed schemas will be specified later, but the design anticipates at minimum:

- `VoiceSession`
- `TranscriptCandidate`
- `HolderVoiceProfile`
- `PronunciationEntry`
- `AliasEntry`
- `CorrectionEvent`
- `LanguageProfile`
- `VoiceConfidenceEnvelope`
- `ProtectedFieldConfidence`
- `ResolvedIntent`
- `ResolvedEntity`
- `CommandSafetyDecision`
- `VoiceRiskClass`
- `AuthorizationRequirement`
- `VoiceAuditEvidence`

---

## 31. Production Acceptance Criteria

SSW-AI-VOICE-01 cannot be considered production-ready until:

1. holder enrollment works on supported iOS and Android targets;
2. local/on-device capability is used where required by the final privacy profile;
3. holder vocabulary and pronunciation mappings are persisted securely;
4. learned mappings can be reviewed and removed;
5. correction-driven adaptation is bounded to confirmed corrections;
6. multilingual profile support is implemented for target launch languages;
7. protected numeric recognition has dedicated validation;
8. recipient/entity resolution is cryptographically bound before authorization;
9. uncertain negation defaults to no execution;
10. V4/V5 actions require independent authorization according to policy;
11. voice does not expose cryptographic secrets to AI/STT providers;
12. cloud processing disclosures and consent are implemented where applicable;
13. profile recovery rules are implemented;
14. raw-audio retention defaults are enforced;
15. replay and synthetic-voice tests are part of security validation;
16. false execution metrics meet an approved production threshold;
17. Trust Protocol/REV integration is tested for relevant risk classes;
18. audit evidence records interpreted intent and safety decisions;
19. accessibility alternatives exist for every consequential action;
20. platform-store privacy and permission declarations match actual behavior.

---

## 32. Open Design Questions

The following items remain intentionally open for the next design phase:

1. Which speech engine(s) will serve as the primary recognizer on each platform?
2. Which adaptations can be performed entirely on-device at launch?
3. Will Soulverse operate its own holder adaptation model, use provider personalization, or use a hybrid architecture?
4. Which SHVP elements may sync across devices?
5. Should speaker verification be enabled by default or opt-in?
6. How will speaker embeddings be stored and recovered, if used?
7. What launch languages receive full holder adaptation?
8. How should code-switching be modeled across local and cloud recognition?
9. What quantitative thresholds define V0-V5 confidence policies?
10. Which operations are always visually rendered before authorization regardless of confidence?
11. How will hearing/speech accessibility testing be incorporated into certification?
12. How will model-version drift be detected and recalibrated?

---

## 33. Follow-On Specifications

This document is the foundation for the following anticipated specifications:

- **SSW-AI-VOICE-02:** Voice Enrollment, Adaptation & Personal Language Profile Specification
- **SSW-AI-VOICE-03:** Voice Confidence, Protected-Field & Command Safety Policy
- **SSW-AI-VOICE-04:** Speaker Assurance, Replay & Synthetic Voice Defense Profile
- **SSW-AI-VOICE-05:** Multilingual & Code-Switching Architecture
- **SSW-AI-VOICE-06:** Voice Privacy, Storage, Portability & Recovery Profile
- **SSW-AI-VOICE-07:** iOS Voice Implementation Profile
- **SSW-AI-VOICE-08:** Android Voice Implementation Profile
- **SSW-AI-VOICE-09:** Voice Validation, Adversarial Testing & Certification Matrix

---

## 34. Controlled Decision Summary

The following decisions are established by this design baseline:

**D-VOICE-001**  
SERA voice understanding is a core wallet control surface, not an optional dictation feature.

**D-VOICE-002**  
Each wallet instance will support a holder-specific voice adaptation profile.

**D-VOICE-003**  
SERA will adapt to holder accent, pronunciation, personal vocabulary, aliases, languages and confirmed correction patterns where technically supported.

**D-VOICE-004**  
Voice recognition and transaction authorization are separate security functions.

**D-VOICE-005**  
Consequential commands are governed by a risk-sensitive Voice Confidence Envelope rather than a single STT confidence score.

**D-VOICE-006**  
Protected numeric ambiguity, recipient ambiguity and negation ambiguity must resolve safely before execution.

**D-VOICE-007**  
Raw holder audio is not a Soulverse data asset and is not retained by default.

**D-VOICE-008**  
Holder corrections may train the profile only when the correction is confirmed.

**D-VOICE-009**  
Speaker recognition, if implemented, is an assurance signal and not the sole root of authority for high-risk operations.

**D-VOICE-010**  
Voice commands flow through SERA intent resolution, command safety, Trust Protocol/REV where applicable, authorization, and wallet execution.

**D-VOICE-011**  
Voice-first does not mean voice-only; equivalent accessible interaction paths are required.

**D-VOICE-012**  
Production validation will prioritize false execution and protected-field error rates over generic word error rate.

---

## 35. Status

**Current state:** Architecture baseline drafted.  
**Next controlled step:** SSW-AI-VOICE-02, Voice Enrollment, Adaptation & Personal Language Profile Specification.  

This document remains subject to controlled revision as platform capabilities, threat models, privacy requirements and implementation choices are validated.


---

## SOURCE 29
**Path:** `docs/schemas/SSW-AI-SCH-01-Canonical-Typed-Intent-and-Action-Contract-Schema.md`  
**Blob SHA:** `4f877fc87ba2505c2fbd502723239dd92fc87e3b`

# SSW-AI-SCH-01: Canonical Typed Intent & Action Contract Schema

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-SCH-01  
**Status:** Controlled Draft  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-01, SSW-AI-02, SSW-AI-CF-A01  
**Repository:** Kavithakanaparthi/SSW-SERA

---

## 1. Purpose

This specification defines the canonical machine-readable schema for transforming holder language, voice, proactive prompts, external requests and delegated triggers into deterministic action contracts.

The schema exists to preserve the architecture invariant:

> Natural language may express intent. Only a typed, validated action contract may enter the execution control plane.

This specification governs the semantic contract between SERA interpretation and deterministic wallet execution.

---

## 2. Design Goals

The schema shall:

- separate interpretation from authority;
- preserve holder, SERA, runtime and device identity;
- support A0-A5 authority classes;
- support R0-R5 risk classes;
- bind material transaction terms;
- support explicit approval and delegated mandate paths;
- support payments, swaps, credentials, WalletConnect and non-financial actions;
- preserve ambiguity and confidence information;
- carry Trust Protocol and REV references;
- support conceal/reveal presentation state;
- support idempotency, replay prevention and expiration;
- support cross-device continuation;
- support SAEL evidence correlation;
- prevent direct execution from free-form model output.

---

## 3. Canonical Object Hierarchy

The control plane shall distinguish:

```
Raw Input
   ↓
Intent Envelope
   ↓
Resolved Intent
   ↓
Action Contract
   ↓
Validated Action Contract
   ↓
Approval / Mandate Binding
   ↓
Canonical Signing Payload
   ↓
Execution Request
   ↓
Execution Result
   ↓
SAEL Evidence
```

Each stage is immutable once superseded and receives its own identifier or version.

---

## 4. Canonical Intent Envelope

The Intent Envelope captures the source request before execution semantics are finalized.

### 4.1 Required fields

```json
{
  "schema": "ssw.intent-envelope.v1",
  "intent_id": "uuid",
  "correlation_id": "uuid",
  "created_at": "RFC3339",
  "expires_at": "RFC3339|null",
  "holder_did": "did:soul:...",
  "sera_agent_did": "did:soul:agent:...",
  "sera_runtime_id": "sera-runtime:...",
  "device_id": "device:...",
  "source": {
    "modality": "text|voice|notification|external_request|scheduled_trigger|system_event",
    "channel": "wallet|widget|wearable|voice|walletconnect|api|other",
    "raw_input_ref": "opaque-ref|null"
  },
  "interpretation": {
    "intent_type": "string",
    "confidence": 0.0,
    "ambiguity": true,
    "ambiguity_reasons": []
  }
}
```

### 4.2 Rules

- `raw_input_ref` may reference protected source material but shall not embed unrestricted sensitive content.
- The envelope is not executable.
- Confidence values do not confer authority.
- `ambiguity=true` prevents promotion to execution where material terms remain unresolved.

---

## 5. Resolved Intent Object

The Resolved Intent represents SERA's structured interpretation after entity resolution and context minimization.

### 5.1 Required fields

```json
{
  "schema": "ssw.resolved-intent.v1",
  "intent_id": "uuid",
  "correlation_id": "uuid",
  "intent_type": "payment.send",
  "holder_did": "did:soul:...",
  "sera_agent_did": "did:soul:agent:...",
  "sera_runtime_id": "sera-runtime:...",
  "device_id": "device:...",
  "entities": {},
  "context_refs": [],
  "authority_requested": "A2",
  "risk_preliminary": "R3",
  "confidence": {
    "overall": 0.99,
    "material_terms": {
      "recipient": 0.99,
      "amount": 1.0,
      "asset": 1.0,
      "chain": 0.95
    }
  },
  "ambiguity": {
    "material": false,
    "items": []
  },
  "created_at": "RFC3339",
  "expires_at": "RFC3339"
}
```

### 5.2 Rules

A Resolved Intent may contain recommendations and inferred preferences, but inferred values shall be marked as such.

Every material entity must carry one of:

- `explicit`;
- `resolved`;
- `defaulted_by_policy`;
- `inferred_non_material`.

Material terms shall not rely on unmarked inference.

---

## 6. Canonical Action Contract

The Action Contract is the first execution-capable object.

### 6.1 Core structure

```json
{
  "schema": "ssw.action-contract.v1",
  "action_id": "uuid",
  "intent_id": "uuid",
  "correlation_id": "uuid",
  "action_type": "payment.send",
  "version": 1,
  "created_at": "RFC3339",
  "expires_at": "RFC3339",

  "principal": {
    "holder_did": "did:soul:...",
    "sera_agent_did": "did:soul:agent:...",
    "sera_runtime_id": "sera-runtime:...",
    "device_id": "device:..."
  },

  "authority": {
    "class": "A2",
    "mandate_id": null,
    "approval_required": true
  },

  "risk": {
    "class": "R3",
    "reasons": []
  },

  "material_terms": {},

  "policy": {
    "policy_refs": [],
    "device_eligible": false,
    "runtime_eligible": false
  },

  "trust": {
    "trust_protocol_required": true,
    "trust_protocol_ref": null,
    "rev_required": true,
    "rev_ref": null
  },

  "presentation": {
    "concealed": true,
    "reveal_required": true,
    "authenticated_reveal_required": false,
    "review_hash": null
  },

  "approval": {
    "status": "NOT_REQUIRED|REQUIRED|PENDING|APPROVED|REJECTED|EXPIRED|INVALIDATED",
    "approval_id": null,
    "approved_terms_hash": null
  },

  "execution": {
    "idempotency_key": "string",
    "replay_token": "string",
    "status": "NOT_READY"
  },

  "evidence": {
    "sael_correlation_id": "uuid"
  }
}
```

---

## 7. Material Terms

Material terms are action-type-specific and determine what the holder or mandate is authorizing.

A change to any material term invalidates prior approval unless the governing mandate explicitly allows the change.

### 7.1 Payment example

```json
{
  "asset": {
    "asset_id": "USDC",
    "contract_address": "0x...",
    "decimals": 6
  },
  "amount": {
    "atomic": "50000000",
    "display": "50"
  },
  "recipient": {
    "resolved_id": "contact:alex",
    "address": "0x...",
    "resolution_source": "holder_alias"
  },
  "network": {
    "chain_id": "137",
    "network": "polygon"
  },
  "route": {
    "route_id": "route-uuid",
    "bridge_required": false,
    "fee_estimate": "..."
  }
}
```

### 7.2 Credential presentation example

```json
{
  "verifier": {
    "did": "did:example:verifier",
    "domain": "example.com"
  },
  "credential_type": "AgeCredential",
  "requested_claims": ["age_over_18"],
  "disclosed_claims": ["age_over_18"],
  "proof_mechanism": "zkp",
  "purpose": "age_verification",
  "presentation_expiry": "RFC3339"
}
```

---

## 8. Canonical Authority Binding

Authority shall be represented explicitly.

### 8.1 A0

```json
{
  "class": "A0",
  "approval_required": false,
  "mandate_id": null
}
```

### 8.2 A2

```json
{
  "class": "A2",
  "approval_required": true,
  "mandate_id": null
}
```

### 8.3 A3/A4

```json
{
  "class": "A3",
  "approval_required": false,
  "mandate_id": "mandate-uuid"
}
```

A3/A4 contracts shall not proceed until the mandate is validated against the exact material terms.

---

## 9. Canonical Risk Binding

The Action Contract shall contain one canonical risk class:

- R0 Informational / Public
- R1 Personal Read-Only / Low Impact
- R2 Preparatory / Reversible
- R3 Consequential
- R4 High / Critical Consequence
- R5 Restricted / Exceptional

The contract shall also carry structured `risk.reasons`.

Example:

```json
{
  "class": "R4",
  "reasons": [
    "HIGH_VALUE",
    "NEW_COUNTERPARTY",
    "UNUSUAL_CHAIN"
  ]
}
```

Risk may increase control requirements but shall never create authority.

---

## 10. Ambiguity Constraints

The following material fields must not remain ambiguous when promotion to execution is attempted:

- action type;
- recipient;
- amount;
- asset;
- chain;
- route where fee-bearing or bridge-bearing;
- credential;
- claim scope;
- verifier;
- merchant;
- contract;
- mandate;
- destination.

If any material field is unresolved:

```
contract.execution.status = BLOCKED_AMBIGUITY
```

SERA must return to clarification or review.

---

## 11. Entity Resolution Metadata

Resolved entities shall include provenance.

Example:

```json
{
  "recipient": {
    "value": "0x123...",
    "display_name": "Alex",
    "source": "holder_alias",
    "resolution_confidence": 0.99,
    "source_ref": "alias:alex-primary"
  }
}
```

Entity provenance must be preserved for SAEL evidence.

---

## 12. Device and Runtime Eligibility

Before approval or delegated execution:

```json
{
  "policy": {
    "device_eligible": true,
    "runtime_eligible": true,
    "device_trust_state": "TRUSTED",
    "runtime_state": "ACTIVE"
  }
}
```

A receiving device in a cross-device handoff must re-evaluate these fields.

---

## 13. Trust Protocol Binding

When required:

```json
{
  "trust_protocol_required": true,
  "trust_protocol_ref": "tp-eval-uuid",
  "trust_protocol_status": "PASS"
}
```

Allowed values:

- NOT_REQUIRED
- PENDING
- PASS
- FAIL
- UNAVAILABLE
- EXPIRED

A required result of FAIL, UNAVAILABLE or EXPIRED blocks promotion unless a valid pre-existing offline policy applies.

---

## 14. REV Binding

When required:

```json
{
  "rev_required": true,
  "rev_ref": "rev-decision-uuid",
  "rev_status": "PASS"
}
```

Allowed values:

- NOT_REQUIRED
- PENDING
- PASS
- FAIL
- UNAVAILABLE
- EXPIRED

REV PASS does not replace holder approval when A2 applies.

---

## 15. Concealed Detail State

The Action Contract shall track presentation state separately from authority.

```json
{
  "presentation": {
    "concealed": true,
    "fields_concealed": [
      "amount",
      "recipient",
      "balance"
    ],
    "reveal_required": true,
    "authenticated_reveal_required": true,
    "revealed_at": null,
    "reconceal_at": null
  }
}
```

Invariant:

```
REVEALED != APPROVED
```

---

## 16. Approval Object

Approval shall bind to the exact material terms hash.

```json
{
  "approval_id": "uuid",
  "action_id": "uuid",
  "holder_did": "did:soul:...",
  "device_id": "device:...",
  "approved_terms_hash": "sha256:...",
  "approved_at": "RFC3339",
  "expires_at": "RFC3339",
  "authentication_ref": "auth-uuid"
}
```

Any material change invalidates the approval.

---

## 17. Terms Hash

The control plane shall compute a canonical hash over the normalized material terms.

Conceptual:

```
terms_hash =
  HASH(
    canonical_json(
      action_type,
      material_terms,
      chain,
      route,
      policy-relevant execution fields
    )
  )
```

Canonical serialization must be deterministic.

---

## 18. Canonical Signing Payload

The signer shall never receive free-form model output.

Example:

```json
{
  "schema": "ssw.signing-payload.v1",
  "action_id": "uuid",
  "terms_hash": "sha256:...",
  "holder_did": "did:soul:...",
  "device_id": "device:...",
  "chain_id": "137",
  "nonce": "123",
  "to": "0x...",
  "value": "0",
  "data": "0x...",
  "policy_decision_ref": "policy-uuid",
  "trust_protocol_ref": "tp-eval-uuid",
  "rev_ref": "rev-decision-uuid",
  "approval_ref": "approval-uuid",
  "mandate_ref": null,
  "expires_at": "RFC3339"
}
```

Signer validation shall confirm the payload matches the approved or delegated Action Contract.

---

## 19. Execution Request

```json
{
  "schema": "ssw.execution-request.v1",
  "execution_request_id": "uuid",
  "action_id": "uuid",
  "idempotency_key": "string",
  "signed_payload_ref": "signed-payload-uuid",
  "adapter": "evm",
  "submitted_at": null,
  "status": "READY"
}
```

Allowed execution states include:

- NOT_READY
- READY
- SUBMITTING
- SUBMITTED
- CONFIRMED
- FAILED
- EXECUTION_STATUS_UNKNOWN
- CANCELLED
- BLOCKED

---

## 20. Idempotency and Replay

Every consequential execution must include:

- `action_id`;
- `execution_request_id`;
- `idempotency_key`;
- replay token or nonce;
- expiry;
- consumed-authorization state.

A timeout must never automatically generate a second execution request.

---

## 21. Cross-Device Handoff Object

```json
{
  "schema": "ssw.handoff.v1",
  "handoff_id": "uuid",
  "action_id": "uuid",
  "source_device_id": "device:...",
  "target_device_id": "device:...",
  "terms_hash": "sha256:...",
  "risk_class": "R4",
  "authority_class": "A2",
  "concealment_state": "CONCEALED",
  "expires_at": "RFC3339"
}
```

The receiving device shall re-evaluate:

- device trust;
- runtime eligibility;
- authentication;
- Trust Protocol/REV freshness;
- approval freshness.

---

## 22. Proactive Alert to Action Conversion

A proactive alert is not an Action Contract.

It may create an Intent Envelope only after the holder elects to act or a valid mandate trigger applies.

```
Signal
 -> Alert
 -> Holder Action / Mandate Trigger
 -> Intent Envelope
 -> Normal pipeline
```

---

## 23. WalletConnect and External Requests

External requests shall be wrapped as untrusted source intents.

Example:

```json
{
  "source": {
    "modality": "external_request",
    "channel": "walletconnect",
    "request_origin": "example-dapp.com",
    "request_ref": "wc-request-uuid"
  }
}
```

External payloads shall never become signing payloads without normalization, policy evaluation and holder/mandate authority.

---

## 24. Credential Actions

Credential actions use the same Action Contract framework.

Canonical action types should include at least:

- `credential.inspect`;
- `credential.prepare_presentation`;
- `credential.present`;
- `credential.verify_request`;
- `credential.revoke_request` where applicable.

Sensitive claim disclosure typically falls into R3 or R4 depending on context.

---

## 25. Payment and Asset Action Types

Initial canonical action families should include:

- `payment.send`;
- `payment.receive_request`;
- `asset.swap`;
- `asset.bridge`;
- `asset.approve_contract`;
- `walletconnect.request`;
- `walletconnect.execute`;
- `security.lock_wallet`;
- `security.revoke_device`;
- `security.revoke_mandate`.

Each family receives a type-specific material-terms schema.

---

## 26. Validation Status

Each Action Contract shall carry a deterministic validation state.

Allowed states:

- DRAFT
- NORMALIZED
- CONTEXT_RESOLVED
- VALIDATED
- BLOCKED_AMBIGUITY
- BLOCKED_POLICY
- BLOCKED_TRUST
- BLOCKED_REV
- AWAITING_REVEAL
- AWAITING_APPROVAL
- AWAITING_AUTHENTICATION
- READY_TO_SIGN
- SIGNED
- READY_TO_EXECUTE
- EXECUTING
- CONFIRMED
- FAILED
- EXECUTION_STATUS_UNKNOWN
- CANCELLED
- EXPIRED

---

## 27. Immutability and Versioning

An Action Contract is append-versioned.

If a material term changes:

```
action_id remains stable
version increments
prior approval becomes invalid
new terms_hash is generated
new policy/trust/rev checks may be required
```

Prior versions remain available for audit evidence.

---

## 28. SAEL Correlation

Every action shall link to SAEL through:

- `correlation_id`;
- `action_id`;
- `intent_id`;
- `execution_request_id` where applicable;
- `approval_id` where applicable;
- `mandate_id` where applicable.

SAEL shall record state transitions rather than only final outcomes.

---

## 29. Privacy Constraints

The schema shall minimize duplication of sensitive data.

Where practical, Action Contracts may contain references instead of raw values for:

- credentials;
- biometric-derived state;
- sensitive documents;
- private identity claims;
- external intelligence documents.

Key material and seed phrases are prohibited.

---

## 30. Error Semantics

Errors shall be typed.

Examples:

- AMBIGUOUS_RECIPIENT
- AMBIGUOUS_AMOUNT
- UNSUPPORTED_CHAIN
- DEVICE_NOT_ELIGIBLE
- MANDATE_SCOPE_EXCEEDED
- TRUST_PROTOCOL_FAILED
- REV_FAILED
- REV_UNAVAILABLE
- APPROVAL_EXPIRED
- TERMS_CHANGED
- AUTHENTICATION_FAILED
- SIGNER_REJECTED
- EXECUTION_UNKNOWN
- EXTERNAL_PROVIDER_UNAVAILABLE

Free-form model-generated error strings shall not drive control-plane behavior.

---

## 31. Example: Explicit Payment Contract

```json
{
  "schema": "ssw.action-contract.v1",
  "action_id": "8a22...",
  "intent_id": "09bd...",
  "correlation_id": "a712...",
  "action_type": "payment.send",
  "version": 1,
  "principal": {
    "holder_did": "did:soul:kavitha",
    "sera_agent_did": "did:soul:agent:sera",
    "sera_runtime_id": "sera-runtime:iphone-primary",
    "device_id": "device:iphone-primary"
  },
  "authority": {
    "class": "A2",
    "approval_required": true,
    "mandate_id": null
  },
  "risk": {
    "class": "R3",
    "reasons": ["VALUE_TRANSFER"]
  },
  "material_terms": {
    "asset": "USDC",
    "amount_atomic": "50000000",
    "recipient": "0xabc...",
    "chain_id": "137",
    "route_id": "route-01"
  },
  "trust": {
    "trust_protocol_required": true,
    "trust_protocol_ref": "tp-01",
    "rev_required": true,
    "rev_ref": "rev-01"
  },
  "presentation": {
    "concealed": true,
    "reveal_required": true
  },
  "approval": {
    "status": "PENDING"
  },
  "execution": {
    "idempotency_key": "idem-01",
    "status": "NOT_READY"
  },
  "evidence": {
    "sael_correlation_id": "sael-01"
  }
}
```

---

## 32. Example: Delegated Payment Contract

```json
{
  "schema": "ssw.action-contract.v1",
  "action_type": "payment.send",
  "authority": {
    "class": "A3",
    "approval_required": false,
    "mandate_id": "mandate-monthly-supplier-01"
  },
  "risk": {
    "class": "R3",
    "reasons": ["DELEGATED_VALUE_TRANSFER"]
  },
  "policy": {
    "device_eligible": true,
    "runtime_eligible": true
  },
  "trust": {
    "trust_protocol_required": true,
    "rev_required": true
  }
}
```

The action remains blocked until the referenced mandate passes SCH-02 validation.

---

## 33. Promotion Rules

An Action Contract may move to READY_TO_SIGN only if:

1. material ambiguity is absent;
2. action schema is valid;
3. capability is supported;
4. authority class is valid;
5. risk classification is complete;
6. device and runtime are eligible;
7. mandate is valid where A3/A4 applies;
8. policy checks pass;
9. Trust Protocol requirements pass;
10. REV requirements pass;
11. reveal requirements are satisfied;
12. approval requirements are satisfied;
13. authentication requirements are satisfied;
14. contract has not expired;
15. material terms have not changed.

---

## 34. Candidate Security Invariants

1. No raw language object is executable.
2. No model confidence value confers authority.
3. No memory value substitutes for mandate or approval.
4. No external request bypasses normalization.
5. No route change preserves an approval unless policy explicitly proves material terms unchanged.
6. No signer accepts unvalidated free-form input.
7. No timeout implies failed execution.
8. No cross-device handoff transfers source-device authority.
9. No concealed-detail reveal counts as approval.
10. Every consequential action is evidence-correlated.

---

## 35. Open Implementation Items

The following remain for downstream specifications:

- canonical JSON Schema files;
- field-level enum registry;
- cryptographic canonicalization method;
- precise hash algorithm profile;
- mandate schema;
- device-state transition schema;
- approval/authentication freshness windows;
- chain-specific signing payload schemas;
- credential-specific presentation schemas;
- SAEL event schema;
- migration/version compatibility rules.

---

## 36. Exit Criteria

SSW-AI-SCH-01 is ready to advance when:

1. SCH-02 mandate schema is aligned;
2. device trust state transitions are specified;
3. action families are enumerated;
4. canonical serialization is selected;
5. JSON Schema definitions are generated;
6. example contracts pass validation;
7. signing gateway rejects non-canonical objects;
8. SAEL correlation fields are mapped.

---

## 37. Controlled Statement

This specification establishes the canonical contract boundary between SERA interpretation and deterministic Soul Super Wallet execution.

The model may propose.

The control plane must decide.

Only the canonical Action Contract may cross that boundary.


---

## SOURCE 30
**Path:** `docs/schemas/SSW-AI-SCH-02-Delegated-Authority-Mandate-Schema.md`  
**Blob SHA:** `cf35b1ccf49dee7486e3eb1dde950e8ca39f86eb`

# SSW-AI-SCH-02: Delegated Authority Mandate Schema

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-SCH-02  
**Status:** Controlled Draft  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-01, SSW-AI-02, SSW-AI-CF-A01, SSW-AI-SCH-01  
**Repository:** Kavithakanaparthi/SSW-SERA

---

## 1. Purpose

This specification defines the canonical machine-enforceable mandate object that permits SERA to perform A3 Bounded Delegation and A4 Conditional Autonomous Execution actions.

The mandate is the holder-issued authority artifact that constrains what SERA may do without per-action approval.

The governing rule is:

> Delegation is explicit, bounded, revocable, machine-enforceable and evidencable. SERA may exercise a mandate. SERA may not enlarge, reinterpret or self-renew it.

---

## 2. Scope

This specification defines:

- mandate identity;
- holder and SERA binding;
- authority class;
- capability and action scope;
- asset scope;
- counterparty scope;
- chain/network scope;
- value limits;
- frequency and cumulative limits;
- temporal validity;
- device and runtime restrictions;
- contextual conditions;
- risk ceilings;
- Trust Protocol and REV requirements;
- approval exceptions;
- authentication requirements;
- revocation;
- versioning;
- usage counters;
- concurrency;
- replay protection;
- evidence and SAEL linkage;
- suspension and recovery behavior.

It does not define chain-specific transaction serialization, signer cryptography or final legal terms of user consent.

---

## 3. Mandate Lifecycle

A mandate moves through the following logical lifecycle:

```
DRAFT
  ↓
REVIEWED
  ↓
AUTHORIZED
  ↓
ACTIVE
  ↓
SUSPENDED
  ↓
ACTIVE
  ↓
EXPIRED / REVOKED / EXHAUSTED / TERMINATED
```

A mandate may never return from REVOKED, EXPIRED, EXHAUSTED or TERMINATED to ACTIVE without creation of a new mandate version or replacement mandate.

---

## 4. Canonical Mandate Object

```json
{
  "schema": "ssw.mandate.v1",
  "mandate_id": "uuid",
  "version": 1,
  "created_at": "RFC3339",
  "valid_from": "RFC3339",
  "valid_until": "RFC3339",

  "principal": {
    "holder_did": "did:soul:...",
    "sera_agent_did": "did:soul:agent:..."
  },

  "authority": {
    "class": "A3",
    "delegation_type": "bounded|conditional",
    "self_renewal_allowed": false
  },

  "scope": {
    "capabilities": [],
    "action_types": [],
    "assets": [],
    "chains": [],
    "counterparties": [],
    "contracts": []
  },

  "limits": {
    "per_action": {},
    "cumulative": {},
    "frequency": {}
  },

  "conditions": [],

  "risk": {
    "max_class": "R3",
    "prohibited_reasons": []
  },

  "device_policy": {
    "allowed_device_ids": [],
    "allowed_device_states": ["TRUSTED"],
    "allowed_runtime_ids": [],
    "cloud_execution_allowed": false,
    "wearable_execution_allowed": false
  },

  "trust": {
    "trust_protocol_required": true,
    "rev_required": true,
    "aurion_required": false
  },

  "authentication": {
    "creation_auth_ref": "auth-uuid",
    "per_action_auth_required": false,
    "step_up_rules": []
  },

  "presentation": {
    "holder_notification_required": true,
    "concealed_detail_policy": "inherit"
  },

  "revocation": {
    "status": "ACTIVE",
    "revoked_at": null,
    "revocation_reason": null
  },

  "usage": {
    "action_count": 0,
    "cumulative_values": {},
    "last_used_at": null
  },

  "evidence": {
    "sael_correlation_id": "uuid",
    "creation_evidence_ref": "sael-event-uuid"
  },

  "integrity": {
    "mandate_terms_hash": "sha256:...",
    "holder_signature_ref": "signature-ref"
  }
}
```

---

## 5. Principal Binding

Every mandate shall bind both:

- the holder DID;
- the SERA Agent DID.

A mandate issued to one SERA Agent DID shall not be transferable to another SERA Agent DID without explicit holder action.

Runtime identities and devices are additional constraints, not replacements for the principal binding.

---

## 6. Authority Class

Mandates support only:

- A3 Bounded Delegation;
- A4 Conditional Autonomous Execution.

A0, A1 and A2 do not require a delegation mandate.

A5 actions shall not be authorized through this schema unless a future controlled architecture explicitly creates a narrowly governed exception.

---

## 7. Capability Scope

The mandate shall enumerate permitted capabilities.

Examples:

- `payment.send`;
- `asset.swap`;
- `credential.present`;
- `walletconnect.execute`;
- `security.low_risk_control`;
- `notification.respond`.

A capability not listed is denied.

Wildcard capability grants are prohibited by default.

---

## 8. Action Type Scope

The mandate may constrain exact action types within a broader capability.

Example:

```json
{
  "capabilities": ["payment"],
  "action_types": ["payment.send"]
}
```

The absence of an action type does not imply permission to use every action in the capability family unless policy explicitly defines such semantics.

---

## 9. Asset Scope

Asset restrictions may use:

- symbolic asset IDs;
- chain-specific contract addresses;
- asset classes;
- issuer IDs;
- allowlists.

Example:

```json
{
  "assets": [
    {
      "asset_id": "USDC",
      "chain_id": "137",
      "contract_address": "0x..."
    }
  ]
}
```

If an asset is not in scope, the mandate fails validation.

---

## 10. Chain and Network Scope

Allowed execution networks must be explicit where the action is chain-dependent.

Example:

```json
{
  "chains": [
    {
      "chain_id": "137",
      "network": "polygon"
    }
  ]
}
```

A route change to a different chain invalidates mandate applicability unless that chain is also within scope.

---

## 11. Counterparty Scope

Counterparty rules may include:

- exact wallet address;
- verified DID;
- merchant identifier;
- organization DID;
- holder-defined alias bound to a stable identifier;
- counterparty allowlist.

Example:

```json
{
  "counterparties": [
    {
      "type": "did",
      "value": "did:soul:vendor"
    }
  ]
}
```

Human-readable aliases alone shall not be sufficient authority unless resolved to a stable canonical counterparty identity.

---

## 12. Contract Scope

Smart-contract interaction mandates may restrict:

- contract address;
- method selector;
- protocol identifier;
- maximum approval amount;
- token allowance behavior.

Example:

```json
{
  "contracts": [
    {
      "chain_id": "1",
      "address": "0x...",
      "allowed_methods": ["0xa9059cbb"]
    }
  ]
}
```

Unlimited token approvals are prohibited unless separately and explicitly authorized.

---

## 13. Per-Action Value Limits

Example:

```json
{
  "per_action": {
    "USDC": {
      "max_atomic": "100000000"
    }
  }
}
```

The control plane shall compare the action's exact atomic amount against the mandate limit.

Display-formatted values are not authoritative for limit enforcement.

---

## 14. Cumulative Limits

Cumulative limits may be defined by:

- mandate lifetime;
- calendar day;
- rolling 24 hours;
- calendar week;
- rolling 7 days;
- calendar month;
- custom policy window.

Example:

```json
{
  "cumulative": {
    "USDC": {
      "window": "calendar_month",
      "max_atomic": "1000000000"
    }
  }
}
```

Usage counters must be transactionally safe and resistant to concurrent overspend.

---

## 15. Frequency Limits

Example:

```json
{
  "frequency": {
    "max_actions": 4,
    "window": "calendar_month",
    "min_interval_seconds": 86400
  }
}
```

A mandate may combine count, interval and cumulative-value limits.

---

## 16. Temporal Validity

Every mandate shall include:

- `valid_from`;
- `valid_until`.

Open-ended mandates are prohibited by default.

Long-duration mandates may require periodic holder re-affirmation under policy.

---

## 17. Conditions

A4 mandates require explicit conditions.

Conditions must be deterministic and machine-evaluable.

Examples:

- invoice verified;
- amount below threshold;
- merchant identity matches allowlist;
- execution date matches schedule;
- balance remains above reserve floor;
- exchange rate within range;
- credential still valid;
- counterparty trust score above threshold;
- device still trusted;
- AURION attestation valid.

Example:

```json
{
  "conditions": [
    {
      "type": "schedule",
      "operator": "matches",
      "value": "monthly:day=1"
    },
    {
      "type": "counterparty",
      "operator": "equals",
      "value": "did:soul:vendor"
    }
  ]
}
```

Free-form natural-language conditions are not executable.

---

## 18. Risk Ceiling

Every mandate shall specify a maximum risk class.

Example:

```json
{
  "risk": {
    "max_class": "R3",
    "prohibited_reasons": [
      "NEW_COUNTERPARTY",
      "SUSPICIOUS_CONTRACT",
      "DEVICE_ANOMALY"
    ]
  }
}
```

If the action risk exceeds the mandate ceiling, delegated execution is denied.

The action may be escalated to A2 explicit approval where policy permits.

---

## 19. Device Policy

Mandates may restrict:

- specific devices;
- device trust states;
- specific runtime IDs;
- environment type.

Example:

```json
{
  "allowed_device_ids": ["device:iphone-primary"],
  "allowed_device_states": ["TRUSTED"],
  "allowed_runtime_ids": ["sera-runtime:iphone-primary"]
}
```

If the permitted device becomes SUSPENDED or REVOKED, the mandate cannot execute through that device.

---

## 20. Cloud Runtime Constraint

Cloud reasoning may assist mandate evaluation, but cloud runtime participation does not itself create execution authority.

If `cloud_execution_allowed=false`, the cloud runtime may prepare or coordinate but final execution must occur through an eligible trusted execution path.

Even where cloud execution coordination is allowed, signing remains within the isolated signing boundary.

---

## 21. Wearable Constraint

Mandates may explicitly permit wearable-originated actions.

The default is:

```
wearable_execution_allowed = false
```

A wearable may still:

- notify;
- prepare;
- request handoff;
- perform explicitly permitted low-risk controls.

Higher-risk actions must escalate when policy requires.

---

## 22. Trust Protocol

Mandate validation may require a fresh Trust Protocol evaluation.

Example:

```json
{
  "trust_protocol_required": true
}
```

The Trust Protocol evaluation may include:

- holder identity;
- SERA Agent DID;
- device trust;
- mandate validity;
- counterparty identity;
- policy;
- contextual trust state.

A Trust Protocol PASS does not enlarge the mandate.

---

## 23. REV

REV remains the final runtime pass/fail gate where required.

Example:

```json
{
  "rev_required": true
}
```

A mandate never overrides REV FAIL.

If live REV is required and unavailable, the action fails closed unless a pre-existing bounded offline policy explicitly permits the path under SSW-AI-CF-A01.

---

## 24. AURION

A mandate may require AURION continuous attestation for:

- long-running actions;
- repeated activity;
- multi-tap or multi-stage execution;
- extended session authority;
- wearable participation;
- elevated-risk autonomous operation.

Example:

```json
{
  "aurion_required": true
}
```

If required attestation becomes invalid, execution must pause or fail according to policy.

---

## 25. Authentication

Mandate creation always requires strong holder authentication appropriate to the mandate risk.

A mandate may additionally require:

- per-action authentication;
- periodic reauthentication;
- step-up authentication above thresholds;
- reauthentication after device change;
- reauthentication after risk elevation.

Example:

```json
{
  "step_up_rules": [
    {
      "condition": "amount_atomic > 50000000",
      "requirement": "biometric_or_equivalent"
    }
  ]
}
```

The final expression language for step-up rules must be deterministic.

---

## 26. Holder Notification

Mandates should default to holder notification after delegated execution.

Notification policy may specify:

- immediate;
- batched;
- daily digest;
- exception-only.

Critical or unusual events may override batching.

Concealed-detail presentation applies to notifications.

---

## 27. Mandate Creation Evidence

Mandate creation must produce SAEL evidence containing:

- holder DID;
- SERA Agent DID;
- mandate ID;
- terms hash;
- authority class;
- scope summary;
- limits;
- validity period;
- device/runtime restrictions;
- authentication reference;
- creation timestamp.

Sensitive details may be referenced rather than duplicated.

---

## 28. Mandate Terms Hash

The mandate's normalized material terms must be canonically hashed.

Conceptual:

```
mandate_terms_hash =
  HASH(
    canonical_json(
      principal,
      authority,
      scope,
      limits,
      conditions,
      risk,
      device_policy,
      trust,
      authentication,
      validity
    )
  )
```

Any material mandate change creates a new version and new hash.

---

## 29. Holder Signature

A mandate shall require holder authorization bound to the exact mandate terms hash.

The mandate is not ACTIVE until holder authorization is valid.

The holder signature reference belongs to the mandate evidence chain.

---

## 30. Versioning

Material mandate changes require version increment.

Examples of material changes:

- adding an asset;
- adding a counterparty;
- increasing a limit;
- extending expiry;
- allowing an additional chain;
- relaxing device restrictions;
- raising the risk ceiling;
- enabling wearable execution;
- removing per-action authentication;
- disabling REV requirement.

A material change invalidates prior authorization for the changed terms.

---

## 31. Non-Material Changes

The following may be non-material if policy explicitly defines them:

- adding display labels;
- changing local UI text;
- updating non-authoritative description;
- rotating internal storage references without changing scope.

Non-material classification must never be model-decided ad hoc.

---

## 32. Revocation

Revocation states:

- ACTIVE
- SUSPENDED
- REVOKED
- EXPIRED
- EXHAUSTED
- TERMINATED

Revocation can be initiated by:

- holder;
- security policy;
- device compromise;
- recovery process;
- Trust Protocol;
- REV;
- administrative security controls where permitted.

SERA may request revocation but may not silently revoke or restore holder authority unless policy explicitly defines that capability.

---

## 33. Emergency Revocation

The wallet shall provide deterministic emergency controls to:

- revoke all SERA mandates;
- revoke one mandate;
- suspend delegated execution;
- revoke a device;
- disable wearable execution;
- disable voice-originated execution;
- pause SERA autonomous action.

Emergency controls should require minimal dependency availability.

---

## 34. Usage Counters

Mandate usage counters must update atomically with execution reservation.

A safe sequence is:

```
Validate mandate
  ↓
Reserve allowance
  ↓
Create execution request
  ↓
Execute
  ↓
Finalize usage
```

If execution is uncertain, reserved allowance remains protected until reconciliation.

---

## 35. Concurrency Safety

Concurrent actions using the same mandate must not independently observe the same remaining allowance and overspend the limit.

Implementation must use transaction-safe reservation or equivalent concurrency control.

---

## 36. Unknown Execution State

If an action enters `EXECUTION_STATUS_UNKNOWN`:

- the mandate allowance reservation remains active;
- duplicate execution is suppressed;
- reconciliation is required;
- the same authorization cannot be reused until state is resolved.

---

## 37. Mandate Exhaustion

A mandate becomes EXHAUSTED when:

- cumulative value limit is reached;
- action-count limit is reached;
- a one-time mandate is consumed.

EXHAUSTED mandates cannot execute further actions.

---

## 38. Mandate Expiry

At `valid_until`, the mandate becomes EXPIRED.

No new execution may begin under an expired mandate.

An execution already submitted before expiry proceeds to reconciliation under its existing evidence chain.

---

## 39. Mandate Suspension

SUSPENDED mandates retain historical evidence but cannot authorize new action.

Suspension may be temporary.

Reactivation must be policy-controlled and evidencable.

---

## 40. Action Contract Binding

An A3/A4 Action Contract must reference:

```json
{
  "authority": {
    "class": "A3",
    "mandate_id": "mandate-uuid",
    "mandate_version": 3,
    "mandate_terms_hash": "sha256:..."
  }
}
```

The control plane shall confirm that:

- mandate is ACTIVE;
- version matches;
- hash matches;
- action scope matches;
- limits remain available;
- risk is within ceiling;
- device/runtime eligibility passes;
- conditions pass;
- Trust Protocol/REV requirements pass.

---

## 41. Mandate Evaluation Result

The mandate validator shall return a typed result.

```json
{
  "schema": "ssw.mandate-evaluation.v1",
  "evaluation_id": "uuid",
  "mandate_id": "uuid",
  "action_id": "uuid",
  "status": "PASS|FAIL|PENDING",
  "reasons": [],
  "remaining_limits": {},
  "evaluated_at": "RFC3339",
  "expires_at": "RFC3339"
}
```

Free-form explanations may accompany the result but do not control execution.

---

## 42. Canonical Failure Reasons

Examples:

- MANDATE_NOT_ACTIVE
- MANDATE_EXPIRED
- MANDATE_REVOKED
- MANDATE_EXHAUSTED
- ACTION_NOT_IN_SCOPE
- ASSET_NOT_ALLOWED
- CHAIN_NOT_ALLOWED
- COUNTERPARTY_NOT_ALLOWED
- CONTRACT_NOT_ALLOWED
- PER_ACTION_LIMIT_EXCEEDED
- CUMULATIVE_LIMIT_EXCEEDED
- FREQUENCY_LIMIT_EXCEEDED
- CONDITION_NOT_MET
- RISK_CEILING_EXCEEDED
- DEVICE_NOT_ALLOWED
- RUNTIME_NOT_ALLOWED
- DEVICE_TRUST_INSUFFICIENT
- TRUST_PROTOCOL_FAILED
- REV_FAILED
- AURION_INVALID
- AUTHENTICATION_REQUIRED
- MANDATE_TERMS_MISMATCH

---

## 43. Example: Monthly Supplier Mandate

```json
{
  "schema": "ssw.mandate.v1",
  "mandate_id": "supplier-01",
  "version": 1,
  "valid_from": "2026-10-01T00:00:00Z",
  "valid_until": "2027-10-01T00:00:00Z",
  "principal": {
    "holder_did": "did:soul:holder",
    "sera_agent_did": "did:soul:agent:sera"
  },
  "authority": {
    "class": "A3",
    "delegation_type": "bounded",
    "self_renewal_allowed": false
  },
  "scope": {
    "capabilities": ["payment"],
    "action_types": ["payment.send"],
    "assets": [
      {
        "asset_id": "USDC",
        "chain_id": "137"
      }
    ],
    "chains": [
      {
        "chain_id": "137",
        "network": "polygon"
      }
    ],
    "counterparties": [
      {
        "type": "did",
        "value": "did:soul:vendor"
      }
    ]
  },
  "limits": {
    "per_action": {
      "USDC": {
        "max_atomic": "100000000"
      }
    },
    "cumulative": {
      "USDC": {
        "window": "calendar_month",
        "max_atomic": "100000000"
      }
    },
    "frequency": {
      "max_actions": 1,
      "window": "calendar_month"
    }
  },
  "risk": {
    "max_class": "R3"
  },
  "device_policy": {
    "allowed_device_states": ["TRUSTED"]
  },
  "trust": {
    "trust_protocol_required": true,
    "rev_required": true
  }
}
```

---

## 44. Example: Conditional Autonomous Refill

An A4 example may permit a bounded refill only when a balance condition is met.

```json
{
  "authority": {
    "class": "A4",
    "delegation_type": "conditional"
  },
  "conditions": [
    {
      "type": "balance_below",
      "asset_id": "USDC",
      "threshold_atomic": "20000000"
    }
  ],
  "limits": {
    "per_action": {
      "USDC": {
        "max_atomic": "50000000"
      }
    }
  },
  "risk": {
    "max_class": "R3"
  }
}
```

The control plane must still validate every condition, device state, policy, Trust Protocol and REV requirement at execution time.

---

## 45. Security Invariants

1. SERA cannot create its own mandate.
2. SERA cannot enlarge scope.
3. SERA cannot raise limits.
4. SERA cannot extend expiry.
5. SERA cannot increase risk ceiling.
6. SERA cannot remove Trust Protocol or REV requirements.
7. SERA cannot silently add devices or runtimes.
8. SERA cannot self-renew authority.
9. A mandate does not override device trust.
10. A mandate does not override REV FAIL.
11. A mandate does not permit A5 autonomous execution.
12. Usage counters must be concurrency-safe.
13. Unknown execution state reserves authority until reconciled.
14. Every material mandate event is SAEL-evidenced.

---

## 46. Open Implementation Items

Downstream work must define:

- JSON Schema files;
- deterministic condition expression language;
- numeric and currency normalization;
- atomic counter update semantics;
- mandate storage model;
- mandate lookup indexes;
- holder signature profile;
- recovery interaction;
- cross-device mandate synchronization;
- multi-device race handling;
- offline mandate verification format;
- SAEL mandate event types.

---

## 47. Exit Criteria

SSW-AI-SCH-02 is ready to advance when:

1. SCH-01 Action Contract binding is validated;
2. device trust transition rules are specified;
3. condition expression language is chosen;
4. counter reservation strategy is defined;
5. SAEL mandate events are specified;
6. revocation and emergency controls are threat-modeled;
7. example mandates pass machine validation;
8. A3 and A4 flows pass abuse-case review.

---

## 48. Controlled Statement

This specification defines the only valid source of SERA delegated execution authority.

A mandate is not a suggestion, preference or remembered habit.

It is a bounded cryptographic and policy object issued by the holder and enforced by the control plane.
