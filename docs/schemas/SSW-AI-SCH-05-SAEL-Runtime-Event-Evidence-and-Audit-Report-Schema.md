# SSW-AI-SCH-05: SAEL Runtime Event, Evidence & Audit Report Schema

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-SCH-05  
**Status:** Controlled Draft  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-01, SSW-AI-02, SSW-AI-CF-A01, SSW-AI-SCH-01 through SSW-AI-SCH-04  
**Repository:** Kavithakanaparthi/SSW-SERA

---

## 1. Purpose

This specification defines the canonical schema for the **SERA Activity & Evidence Ledger (SAEL)**.

SAEL is the audit-grade evidence domain for consequential SERA activity. It records what happened, under whose authority, on which device/runtime, through which control decisions, with which result, and with enough integrity information to reconstruct a reliable action history.

The governing rule is:

> SERA state restores continuity. SAEL establishes accountability.

Conversational memory is never the audit source of truth.

---

## 2. Scope

This specification defines:

- SAEL event envelopes;
- event identities and correlation;
- event classes;
- action lineage;
- authority evidence;
- device/runtime evidence;
- Trust Protocol and REV evidence;
- approval and mandate evidence;
- conceal/reveal evidence;
- signing and execution evidence;
- failure and reconciliation evidence;
- security and recovery events;
- storage and integrity requirements;
- append-only semantics;
- report generation;
- disclosure levels;
- retention;
- export;
- integrity checkpoints;
- privacy constraints;
- holder-facing audit queries.

It does not define a final database engine, distributed ledger product, storage vendor or cryptographic library.

---

## 3. SAEL Design Principles

SAEL shall be:

- append-only;
- tamper-evident;
- structured;
- queryable;
- privacy-minimized;
- correlated across services;
- independent from conversational memory;
- independent from SERA portable personalization state;
- suitable for holder audit and machine verification;
- capable of reconstructing execution lineage.

---

## 4. Evidence Domains

SAEL records evidence across the following domains:

1. **Intent Evidence**
2. **Interpretation Evidence**
3. **Authority Evidence**
4. **Risk Evidence**
5. **Device / Runtime Evidence**
6. **Trust Protocol Evidence**
7. **REV Evidence**
8. **Presentation / Reveal Evidence**
9. **Approval Evidence**
10. **Mandate Evidence**
11. **Authentication Evidence**
12. **Signing Evidence**
13. **Execution Evidence**
14. **Reconciliation Evidence**
15. **Credential Presentation Evidence**
16. **Security Evidence**
17. **Recovery Evidence**
18. **Administrative / Policy Evidence**

---

## 5. Canonical SAEL Event Envelope

Every SAEL record shall conform to a common envelope.

```json
{
  "schema": "ssw.sael-event.v1",
  "event_id": "uuid",
  "event_type": "ACTION.INTENT_CREATED",
  "event_version": 1,
  "occurred_at": "RFC3339",
  "recorded_at": "RFC3339",

  "correlation": {
    "correlation_id": "uuid",
    "intent_id": "uuid|null",
    "action_id": "uuid|null",
    "execution_request_id": "uuid|null",
    "approval_id": "uuid|null",
    "mandate_id": "uuid|null",
    "presentation_id": "uuid|null",
    "handoff_id": "uuid|null",
    "device_transition_id": "uuid|null"
  },

  "principal": {
    "holder_did": "did:soul:...",
    "sera_agent_did": "did:soul:agent:..."
  },

  "origin": {
    "sera_runtime_id": "sera-runtime:...",
    "device_id": "device:...",
    "service": "string"
  },

  "classification": {
    "authority_class": "A0|A1|A2|A3|A4|A5|null",
    "risk_class": "R0|R1|R2|R3|R4|R5|null"
  },

  "payload": {},

  "privacy": {
    "sensitivity": "PUBLIC|PERSONAL|FINANCIAL|IDENTITY|CREDENTIAL|AUTHORIZATION|SECURITY",
    "contains_plaintext_sensitive_data": false,
    "disclosure_level": "SUMMARY"
  },

  "integrity": {
    "payload_hash": "sha256:...",
    "previous_event_hash": "sha256:...|null",
    "checkpoint_ref": "checkpoint:...|null"
  }
}
```

---

## 6. Event Immutability

Once recorded, a SAEL event shall not be overwritten.

Corrections are represented through additional events.

Example:

```
ACTION.EXECUTION_RESULT_RECORDED
ACTION.RECONCILIATION_CORRECTION
```

The correction references the earlier event and preserves both.

Historical evidence is never rewritten to make the past match later knowledge.

---

## 7. Event Ordering

SAEL shall support deterministic ordering using:

- event timestamp;
- monotonic sequence where available;
- correlation lineage;
- hash chaining;
- service-local sequence numbers where required.

Clock drift must not invalidate evidence. If timestamps conflict, sequence/correlation evidence shall remain available.

---

## 8. Event Type Namespace

Event types use uppercase hierarchical namespaces.

Examples:

```
ACTION.INTENT_CREATED
ACTION.INTENT_RESOLVED
ACTION.CONTRACT_CREATED
ACTION.RISK_CLASSIFIED
ACTION.AUTHORITY_CLASSIFIED
ACTION.POLICY_EVALUATED
TRUST.PROTOCOL_EVALUATED
TRUST.REV_EVALUATED
PRESENTATION.REVEAL_REQUESTED
PRESENTATION.REVEALED
APPROVAL.GRANTED
MANDATE.EVALUATED
SIGNING.REQUESTED
SIGNING.COMPLETED
EXECUTION.SUBMITTED
EXECUTION.CONFIRMED
EXECUTION.UNKNOWN
SECURITY.DEVICE_SUSPENDED
RECOVERY.SERA_STATE_RESTORED
```

---

## 9. Canonical Action Lineage

For consequential activity, the expected evidence lineage is:

```
INTENT_CREATED
  ↓
INTENT_RESOLVED
  ↓
ACTION_CONTRACT_CREATED
  ↓
AUTHORITY_CLASSIFIED
  ↓
RISK_CLASSIFIED
  ↓
DEVICE_ELIGIBILITY_EVALUATED
  ↓
MANDATE_EVALUATED (if A3/A4)
  ↓
POLICY_EVALUATED
  ↓
TRUST_PROTOCOL_EVALUATED
  ↓
REV_EVALUATED
  ↓
REVEAL / REVIEW (if required)
  ↓
APPROVAL_GRANTED (if A2)
  ↓
AUTHENTICATION_COMPLETED
  ↓
SIGNING_REQUESTED
  ↓
SIGNING_COMPLETED
  ↓
EXECUTION_SUBMITTED
  ↓
EXECUTION_CONFIRMED / FAILED / UNKNOWN
  ↓
RECONCILIATION
```

Not every action requires every event, but absence must be explainable by authority/policy class.

---

## 10. Intent Events

### ACTION.INTENT_CREATED

Records creation of the Intent Envelope.

Payload should include references to:

- intent ID;
- modality;
- source channel;
- source classification;
- ambiguity flag;
- input reference.

Raw voice/audio or unrestricted sensitive text should not be duplicated by default.

---

## 11. Interpretation Events

### ACTION.INTENT_RESOLVED

Records:

- resolved intent type;
- entity resolution summary;
- material confidence values;
- ambiguity resolution;
- context references.

The event should not store hidden model reasoning.

It records structured outcomes only.

---

## 12. Action Contract Events

### ACTION.CONTRACT_CREATED

Records:

- action ID;
- version;
- action type;
- material terms hash;
- authority class;
- preliminary risk;
- expiry;
- idempotency reference.

### ACTION.CONTRACT_VERSIONED

Records a new version when material terms change.

Prior versions remain intact.

---

## 13. Authority Evidence

### ACTION.AUTHORITY_CLASSIFIED

Payload:

```json
{
  "authority_class": "A2",
  "basis": "EXPLICIT_APPROVAL_REQUIRED",
  "mandate_id": null,
  "policy_ref": "policy:..."
}
```

Authority classification must be deterministic.

---

## 14. Risk Evidence

### ACTION.RISK_CLASSIFIED

Payload:

```json
{
  "risk_class": "R4",
  "reasons": [
    "HIGH_VALUE",
    "NEW_COUNTERPARTY"
  ],
  "policy_ref": "policy:risk-v1"
}
```

A later change in risk produces a new event.

---

## 15. Device / Runtime Evidence

### DEVICE.ELIGIBILITY_EVALUATED

Records:

- Device ID;
- Runtime ID;
- device trust state;
- runtime eligibility;
- trust freshness;
- action ID;
- outcome;
- reasons.

### DEVICE.STATE_CHANGED

Records state transitions per SCH-03.

---

## 16. Mandate Evidence

### MANDATE.CREATED

Records:

- mandate ID;
- version;
- terms hash;
- holder DID;
- SERA Agent DID;
- authority class;
- validity window;
- scope summary;
- limits summary;
- holder authorization reference.

### MANDATE.EVALUATED

Records:

- action ID;
- mandate ID;
- version;
- scope result;
- limit result;
- risk-ceiling result;
- device/runtime result;
- condition result;
- overall PASS/FAIL.

### MANDATE.USAGE_RESERVED

Records allowance reservation before execution.

### MANDATE.USAGE_FINALIZED

Records final usage after confirmed execution.

### MANDATE.REVOKED / SUSPENDED / EXPIRED / EXHAUSTED

Records lifecycle transitions.

---

## 17. Trust Protocol Evidence

### TRUST.PROTOCOL_EVALUATED

Payload:

```json
{
  "evaluation_id": "uuid",
  "action_id": "uuid",
  "status": "PASS|FAIL|UNAVAILABLE|EXPIRED",
  "decision_ref": "tp:...",
  "evaluated_at": "RFC3339",
  "expires_at": "RFC3339",
  "reason_codes": []
}
```

Do not store privileged Trust Protocol secrets.

---

## 18. REV Evidence

### TRUST.REV_EVALUATED

Payload:

```json
{
  "decision_id": "uuid",
  "action_id": "uuid",
  "status": "PASS|FAIL|UNAVAILABLE|EXPIRED",
  "decision_ref": "rev:...",
  "reason_codes": [],
  "evaluated_at": "RFC3339"
}
```

A REV FAIL remains part of the permanent action evidence.

---

## 19. AURION Evidence

Where continuous attestation is required:

### TRUST.AURION_ATTESTED

Records:

- attestation reference;
- subject;
- time;
- validity window;
- status.

### TRUST.AURION_INVALIDATED

Records loss of required attestation.

---

## 20. Presentation / Reveal Evidence

### PRESENTATION.CONCEALED

Records that sensitive detail was intentionally hidden.

### PRESENTATION.REVEAL_REQUESTED

Records holder request to reveal.

### PRESENTATION.AUTHENTICATED_REVEAL

Records whether required authentication succeeded.

### PRESENTATION.REVEALED

Records:

- presentation ID;
- action ID;
- field categories revealed;
- device;
- timestamp.

Sensitive plaintext field values should not be copied solely to prove reveal.

### PRESENTATION.RECONCEALED

Records concealment restoration.

---

## 21. Review Evidence

### PRESENTATION.MATERIAL_TERMS_REVIEWED

Records:

- material terms hash;
- presentation ID;
- review timestamp;
- device ID.

This proves the reviewed version without duplicating every field.

---

## 22. Approval Evidence

### APPROVAL.REQUESTED

### APPROVAL.GRANTED

Payload:

```json
{
  "approval_id": "uuid",
  "action_id": "uuid",
  "material_terms_hash": "sha256:...",
  "holder_did": "did:soul:...",
  "device_id": "device:...",
  "authentication_ref": "auth:...",
  "approved_at": "RFC3339",
  "expires_at": "RFC3339"
}
```

### APPROVAL.REJECTED

### APPROVAL.EXPIRED

### APPROVAL.INVALIDATED

Invalidation reason examples:

- MATERIAL_TERMS_CHANGED
- DEVICE_STATE_CHANGED
- TRUST_EXPIRED
- REV_EXPIRED
- AUTHENTICATION_EXPIRED

---

## 23. Authentication Evidence

### AUTHENTICATION.REQUESTED

### AUTHENTICATION.COMPLETED

Records:

- method class;
- assurance level;
- device;
- result;
- reference.

Raw biometric material is prohibited.

---

## 24. Signing Evidence

### SIGNING.REQUESTED

Records:

- action ID;
- terms hash;
- signer profile;
- policy references.

### SIGNING.COMPLETED

Records:

- signed payload reference;
- signer key reference identifier;
- signing timestamp;
- result.

Private keys or raw secrets are never stored.

### SIGNING.REJECTED

Records typed rejection reason.

---

## 25. Execution Evidence

### EXECUTION.REQUEST_CREATED

Records execution request ID and idempotency key.

### EXECUTION.SUBMITTED

Records:

- adapter;
- chain/provider;
- submission reference;
- nonce/sequence where relevant;
- timestamp.

### EXECUTION.CONFIRMED

Records:

- network/provider result;
- transaction/reference ID;
- confirmation time;
- final status.

### EXECUTION.FAILED

Records typed failure reason.

### EXECUTION.UNKNOWN

Records uncertain submission state.

---

## 26. Reconciliation Evidence

### EXECUTION.RECONCILIATION_STARTED

### EXECUTION.RECONCILIATION_RESOLVED

Possible resolution:

- CONFIRMED
- FAILED_NOT_SUBMITTED
- FAILED_AFTER_SUBMISSION
- DUPLICATE_SUPPRESSED
- STILL_UNKNOWN

Reconciliation evidence must preserve the original uncertainty.

---

## 27. Credential Presentation Evidence

### CREDENTIAL.PRESENTATION_PREPARED

Records:

- credential type;
- verifier reference;
- proof type;
- requested claim categories;
- disclosure policy.

### CREDENTIAL.PRESENTED

Records:

- verifier;
- proof reference;
- disclosed claim categories;
- result.

Avoid duplicating sensitive claim plaintext where a hash/reference is sufficient.

---

## 28. WalletConnect Evidence

### WALLETCONNECT.REQUEST_RECEIVED

### WALLETCONNECT.REQUEST_EXPLAINED

### WALLETCONNECT.ACTION_APPROVED

### WALLETCONNECT.ACTION_EXECUTED

Each event links external origin to the normalized Action Contract.

---

## 29. External Intelligence Evidence

External intelligence becomes SAEL-relevant only when material to an action or risk decision.

### INTELLIGENCE.SIGNAL_USED

Records:

- source reference;
- source class;
- confidence;
- purpose;
- action/risk relation.

The event must not imply the source created authority.

---

## 30. Security Events

Canonical security events include:

- SECURITY.DEVICE_SUSPENDED
- SECURITY.DEVICE_REVOKED
- SECURITY.MANDATE_REVOKED
- SECURITY.SERA_AUTONOMY_PAUSED
- SECURITY.SIGNING_DISABLED
- SECURITY.RECOVERY_STARTED
- SECURITY.COMPROMISE_DETECTED
- SECURITY.EMERGENCY_LOCK
- SECURITY.TRUST_DOWNGRADED

---

## 31. Recovery Events

Examples:

- RECOVERY.HOLDER_AUTHENTICATED
- RECOVERY.SERA_DID_RESOLVED
- RECOVERY.STATE_MANIFEST_VERIFIED
- RECOVERY.STATE_BUNDLE_RETRIEVED
- RECOVERY.STATE_RESTORED
- RECOVERY.DEVICE_REGISTERED
- RECOVERY.RUNTIME_REGISTERED
- RECOVERY.AUTHORITY_REESTABLISHED
- RECOVERY.COMPLETED
- RECOVERY.FAILED

Recovery evidence shall not imply that unrestricted transaction authority was automatically restored.

---

## 32. Portable-State Events

SAEL may record state-management evidence such as:

- SERA_STATE.MANIFEST_CREATED
- SERA_STATE.MANIFEST_ROTATED
- SERA_STATE.BACKUP_VERIFIED
- SERA_STATE.RECOVERY_BUNDLE_ACCESSED

SAEL does not store the portable state payload itself.

---

## 33. Evidence Integrity

Each event shall carry a payload hash.

An implementation may additionally use:

- per-stream hash chains;
- Merkle trees;
- signed checkpoints;
- external timestamping;
- immutable object storage;
- redundant archive copies.

The architecture does not require one specific mechanism, but tamper evidence is mandatory.

---

## 34. Integrity Checkpoint

Canonical checkpoint object:

```json
{
  "schema": "ssw.sael-checkpoint.v1",
  "checkpoint_id": "uuid",
  "stream_id": "holder-or-ledger-stream",
  "from_sequence": 1000,
  "to_sequence": 1999,
  "root_hash": "sha256:...",
  "created_at": "RFC3339",
  "signature_ref": "signature:..."
}
```

Checkpoints may be periodically anchored to content-addressed archives.

---

## 35. Storage Architecture

Recommended hybrid model:

```
Runtime Services
   ↓
SAEL Event Ingestion
   ↓
Append-Only Indexed Store
   ↓
Query / Reporting Layer
   ↓
Periodic Integrity Checkpoint
   ↓
Encrypted Archive
   ↓
Content-Addressed / Redundant Storage
```

The indexed store supports active reporting.

The archive supports integrity and long-term preservation.

---

## 36. Local Cache

The holder device may maintain a local cache of recent receipts and SAEL summaries.

Local cache is not necessarily the complete audit source.

If local cache differs from authoritative SAEL, reconciliation is required.

---

## 37. Privacy Minimization

SAEL shall prefer:

- hashes;
- references;
- category labels;
- typed reason codes;
- encrypted values;
- selective disclosure.

SAEL should avoid unnecessary duplication of:

- private identity claims;
- full credentials;
- raw biometric data;
- raw voice recordings;
- private keys;
- seed phrases;
- unrestricted recovery secrets;
- full external documents.

---

## 38. Evidence Disclosure Levels

Reports may use standardized disclosure levels:

### L0 — Summary

Includes:

- event type;
- time;
- status;
- high-level action category.

### L1 — Operational Metadata

Adds:

- device;
- runtime;
- authority/risk class;
- action references.

### L2 — Financial / Counterparty Detail

Adds:

- amount;
- asset;
- chain;
- counterparty where authorized.

### L3 — Identity / Credential Detail

Adds approved credential/presentation detail.

### L4 — Full Audit Evidence

Adds complete permissible evidence references and reason codes.

Disclosure is still subject to holder authorization and privacy policy.

---

## 39. Canonical Audit Query Object

```json
{
  "schema": "ssw.sael-query.v1",
  "query_id": "uuid",
  "holder_did": "did:soul:...",
  "time_range": {
    "from": "RFC3339",
    "to": "RFC3339"
  },
  "filters": {
    "action_types": [],
    "authority_classes": [],
    "risk_classes": [],
    "devices": [],
    "mandates": [],
    "statuses": [],
    "assets": [],
    "chains": []
  },
  "disclosure_level": "L1"
}
```

---

## 40. Canonical Audit Report Object

```json
{
  "schema": "ssw.sael-report.v1",
  "report_id": "uuid",
  "holder_did": "did:soul:...",
  "generated_at": "RFC3339",
  "query_ref": "query-uuid",
  "disclosure_level": "L1",
  "summary": {},
  "entries": [],
  "integrity": {
    "checkpoint_refs": [],
    "report_hash": "sha256:..."
  }
}
```

---

## 41. Report Types

Initial report families should include:

- SERA-assisted activity report;
- executed transaction report;
- delegated-action report;
- approval report;
- blocked-action report;
- REV-denied report;
- credential disclosure report;
- WalletConnect activity report;
- device security report;
- mandate lifecycle report;
- recovery report;
- unknown/reconciled execution report.

---

## 42. SERA-Assisted Transaction Report

A holder may request:

> "Show me all transactions SERA helped with last month."

The report should classify each action role:

- EXPLAINED
- RECOMMENDED
- PREPARED
- EXECUTED_AFTER_APPROVAL
- EXECUTED_UNDER_MANDATE
- BLOCKED

This classification is derived from SAEL event lineage.

---

## 43. Action Role Derivation

Example derivation:

### EXPLAINED

Interpretation/explanation events, no Action Contract execution.

### RECOMMENDED

Recommendation event exists, no prepared execution contract.

### PREPARED

Action Contract created but no execution.

### EXECUTED_AFTER_APPROVAL

A2 + APPROVAL.GRANTED + execution confirmed.

### EXECUTED_UNDER_MANDATE

A3/A4 + MANDATE.EVALUATED PASS + execution confirmed.

### BLOCKED

Action reached a blocking control outcome.

---

## 44. Blocked Action Reporting

A blocked action report should preserve:

- action type;
- block stage;
- typed reason;
- risk class;
- authority class;
- device/runtime;
- Trust/REV outcome where relevant;
- timestamp.

It should not leak concealed details unless disclosure is authorized.

---

## 45. Retention

Retention must be policy-driven.

Different evidence classes may have different retention periods.

Considerations include:

- financial recordkeeping;
- user preferences;
- legal/regulatory obligations;
- security investigations;
- privacy minimization;
- credential lifecycle;
- mandate history.

Deletion or archival must preserve integrity semantics.

---

## 46. Redaction

Where records must be redacted, the system should preserve evidence that a redaction occurred.

A redaction should produce a new event/reference rather than silently rewriting history.

---

## 47. Export

Supported export targets may include:

- JSON;
- CSV for selected report types;
- PDF audit reports;
- accountant-oriented exports;
- compliance-oriented exports.

Exports shall carry:

- generation timestamp;
- report scope;
- disclosure level;
- integrity hash;
- source checkpoint references.

---

## 48. Holder Verification

The holder should be able to verify:

- report hash;
- checkpoint reference;
- event-chain continuity where exposed;
- action lineage;
- approval/mandate basis.

A report should be able to distinguish verified evidence from explanatory narrative.

---

## 49. Administrative Access

Administrative or support access to SAEL must be:

- role-based;
- least privilege;
- purpose-limited;
- evidenced;
- holder-policy aware;
- restricted from key material.

Admin queries should themselves produce SAEL or operations-audit evidence.

---

## 50. Model Access to SAEL

SERA may query SAEL through controlled reporting interfaces.

The model should receive only the minimum necessary report context.

It shall not receive unrestricted raw audit history by default.

SAEL retrieval must pass through the Context Broker where model use is involved.

---

## 51. Prohibited Evidence Content

SAEL must not contain:

- wallet private keys;
- seed phrases;
- raw recovery phrases;
- raw biometric templates;
- unrestricted signing handles;
- privileged Trust Protocol secrets;
- privileged REV secrets;
- hidden chain-of-thought or model internal reasoning.

---

## 52. Canonical Error Events

Examples:

- SAEL.EVENT_WRITE_FAILED
- SAEL.CHECKPOINT_FAILED
- SAEL.REPORT_GENERATION_FAILED
- SAEL.INTEGRITY_MISMATCH
- SAEL.ARCHIVE_UNAVAILABLE
- SAEL.RECONCILIATION_REQUIRED

Failure to write required evidence may block consequential execution where policy marks evidence as mandatory.

---

## 53. Evidence-First Execution Rule

For high-value or high-risk paths, the system should establish an evidence reservation before execution.

Conceptually:

```
Prepare action
  ↓
Reserve evidence lineage
  ↓
Execute
  ↓
Finalize evidence
```

This reduces the risk of untraceable consequential execution.

---

## 54. Unknown Execution Evidence

If execution status becomes unknown:

```
EXECUTION.UNKNOWN
  ↓
MANDATE allowance remains reserved
  ↓
duplicate suppressed
  ↓
RECONCILIATION_STARTED
  ↓
RECONCILIATION_RESOLVED
```

The uncertainty interval must remain visible in the evidence chain.

---

## 55. SAEL and Concealed Detail

Interactive reports may conceal sensitive fields.

Concealment changes presentation only.

The underlying evidence remains structurally linked.

Reveal events for audit reports may themselves be evidenced where policy requires.

---

## 56. SAEL and SERA Portable State

SAEL and portable SERA state are independent.

Portable state may remember:

- preferences;
- aliases;
- language;
- approved long-term context.

SAEL proves:

- action;
- authority;
- approval;
- execution;
- result.

Restoring SERA state does not rewrite SAEL.

---

## 57. SAEL and SERA Agent DID

SAEL events bind to the SERA Agent DID and, where applicable, the Runtime ID.

This permits audit across:

- device changes;
- runtime migrations;
- cloud provider changes;
- model provider changes;
- wallet reinstalls.

Agent identity continuity is preserved without treating any one runtime as the full agent.

---

## 58. SAEL and Device Revocation

Revoking a device does not remove its historical evidence.

The holder should still be able to identify:

- actions performed on that device;
- approvals granted;
- mandates used;
- compromise timeline;
- revocation time.

---

## 59. SAEL and Mandate Revocation

Revoking a mandate does not remove historical delegated-action evidence.

Reports should distinguish:

- action performed while mandate valid;
- action attempted after suspension/revocation;
- action blocked due to revoked mandate.

---

## 60. Canonical Event Severity

Optional operational severity:

- INFO
- NOTICE
- WARNING
- HIGH
- CRITICAL

Severity is operational and distinct from R0-R5 action risk.

---

## 61. Correlation Requirements

Every consequential action must carry one stable `correlation_id` from interpretation through final evidence.

This enables cross-service reconstruction without depending on timestamp proximity.

---

## 62. Service Attribution

Each event records the producing service.

Examples:

- sera-orchestrator;
- context-broker;
- authority-engine;
- risk-engine;
- trust-protocol-adapter;
- rev-adapter;
- approval-service;
- signer-gateway;
- execution-router;
- chain-adapter;
- credential-service.

This supports fault isolation and audit.

---

## 63. Reason Codes

Control-plane decisions should use typed reason codes.

Examples:

- POLICY_PASS
- POLICY_DENY
- DEVICE_NOT_ELIGIBLE
- MANDATE_LIMIT_EXCEEDED
- TRUST_FAILED
- REV_FAILED
- APPROVAL_EXPIRED
- TERMS_CHANGED
- EXECUTION_DUPLICATE_SUPPRESSED

Narrative explanation may be generated separately.

---

## 64. Report Narrative

SERA may generate a human-readable explanation of a report.

The narrative must be clearly derived from structured evidence.

If the narrative conflicts with structured evidence, structured evidence governs.

---

## 65. Security Invariants

1. SAEL is not conversational memory.
2. SAEL events are append-only.
3. Corrections create new evidence.
4. Key material is never evidence content.
5. Raw biometric material is never evidence content.
6. Hidden model reasoning is never evidence content.
7. Every consequential action has stable correlation.
8. A2 execution must evidence approval.
9. A3/A4 execution must evidence mandate evaluation.
10. Required Trust Protocol/REV outcomes must be evidencable.
11. Unknown execution state must remain visible.
12. Device revocation does not erase history.
13. Mandate revocation does not erase history.
14. Reports derive from structured evidence.
15. Narrative cannot override evidence.

---

## 66. Open Implementation Items

Downstream work must define:

- canonical JSON Schema files;
- storage technology;
- event partitioning;
- checkpoint interval;
- archive encryption;
- signing profile;
- hash-chain strategy;
- Merkle implementation;
- retention schedules;
- export formats;
- query indexes;
- access-control policy;
- event ingestion reliability;
- evidence write-ahead behavior;
- privacy redaction workflow.

---

## 67. Exit Criteria

SSW-AI-SCH-05 is ready to advance when:

1. event types are converted into machine schemas;
2. action lineage can be reconstructed end to end;
3. A2 approval evidence is validated;
4. A3/A4 mandate evidence is validated;
5. device-state evidence is integrated;
6. Trust Protocol/REV evidence is mapped;
7. unknown execution reconciliation is tested;
8. audit reports are generated from SAEL only;
9. checkpoint integrity is validated;
10. privacy review confirms no prohibited sensitive content is required.

---

## 68. Controlled Statement

SAEL is the accountability spine of the SERA-first wallet.

SERA may remember enough to assist the holder.

But SERA proves what she did through evidence, not memory.
