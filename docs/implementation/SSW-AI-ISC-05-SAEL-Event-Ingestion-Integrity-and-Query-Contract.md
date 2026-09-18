# SSW-AI-ISC-05: SAEL Event Ingestion, Integrity & Query Contract

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-ISC-05  
**Status:** Controlled Draft  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-01, SSW-AI-02, SSW-AI-CF-A01, SSW-AI-SCH-01 through SSW-AI-SCH-05, SSW-AI-TM-01, SSW-AI-ISC-01 through SSW-AI-ISC-04  
**Repository:** Kavithakanaparthi/SSW-SERA

---

## 1. Purpose

This specification defines the operational contract for ingesting, validating, storing, checkpointing, querying and reporting SERA Activity & Evidence Ledger (SAEL) events.

Its purpose is to ensure that audit-grade evidence remains append-only, tamper-evident, attributable to authorized producers, queryable by the holder, and durable enough to support consequential action accountability.

The governing principle is:

> Evidence must survive service failure, runtime changes and narrative disagreement.

---

## 2. Scope

This specification defines:

- producer authentication;
- event admission;
- schema validation;
- canonicalization;
- event hashing;
- append ordering;
- idempotent ingestion;
- durability acknowledgement;
- evidence reservation;
- checkpointing;
- archive;
- query authorization;
- disclosure levels;
- report generation;
- integrity verification;
- redaction;
- retention;
- degraded evidence behavior;
- repair/reconciliation;
- operational monitoring.

---

## 3. SAEL Roles

### SAEL Ingestion Service

Accepts and validates runtime evidence.

### SAEL Append Store

Maintains authoritative indexed append-only event sequence.

### SAEL Checkpoint Service

Produces integrity roots over bounded event ranges.

### SAEL Archive Service

Stores encrypted long-term copies and checkpoint-linked archives.

### SAEL Query Service

Executes authorized evidence queries.

### SAEL Report Service

Builds holder-facing and audit-facing reports from structured evidence.

---

## 4. Producer Classes

Authorized producer classes include:

- SERA Orchestrator;
- Authority Engine;
- Risk Engine;
- Policy Engine;
- Device Trust Service;
- Runtime Registry;
- Mandate Service;
- Trust Protocol Adapter;
- REV Adapter;
- AURION Adapter;
- Presentation Service;
- Approval Service;
- Authentication Gateway;
- Signing Gateway;
- Execution Router;
- Chain/Provider Adapter;
- Credential Service;
- WalletConnect Gateway;
- Recovery Service;
- SERA State Service.

Each producer receives its own service identity and event-type allowlist.

---

## 5. Producer Authorization

An event producer may emit only event types within its assigned namespace.

Examples:

```
Signing Gateway
  -> SIGNING.*

REV Adapter
  -> TRUST.REV_*

Device Trust Service
  -> DEVICE.*

Mandate Service
  -> MANDATE.*
```

A producer attempting to emit another service's authoritative event type must be rejected.

---

## 6. Canonical Event Submission

```json
{
  "schema": "ssw.sael-ingest-request.v1",
  "request_id": "uuid",
  "producer": {
    "service_id": "signing-gateway",
    "service_instance_id": "instance:uuid"
  },
  "event": {
    "schema": "ssw.sael-event.v1",
    "event_id": "uuid",
    "event_type": "SIGNING.COMPLETED",
    "event_version": 1,
    "occurred_at": "RFC3339",
    "correlation": {},
    "principal": {},
    "origin": {},
    "classification": {},
    "payload": {},
    "privacy": {},
    "integrity": {}
  },
  "idempotency_key": "string",
  "submitted_at": "RFC3339"
}
```

---

## 7. Ingestion Validation Order

The Ingestion Service shall validate:

1. service authentication;
2. producer authorization;
3. request freshness;
4. event schema;
5. event-type namespace;
6. principal/correlation fields;
7. privacy classification;
8. prohibited-content checks;
9. canonical event hash;
10. idempotency;
11. sequence assignment;
12. append durability.

Failure at any mandatory step rejects the event.

---

## 8. Canonicalization

SAEL events shall use the canonicalization profile defined by ISC-02.

Each event hash shall use explicit domain separation.

Conceptual:

```
event_hash =
  SHA256(
    "SSW:SAEL:EVENT:V1" ||
    0x00 ||
    canonical_event_bytes
  )
```

---

## 9. Event Hash Fields

The canonical hash shall include:

- event ID;
- event type;
- event version;
- occurred_at;
- correlation fields;
- principal;
- origin;
- classification;
- payload;
- privacy metadata;
- previous event hash where applicable.

Transport metadata not semantically part of the event may be excluded.

---

## 10. Append Sequence

The authoritative append store shall assign a monotonically increasing sequence per logical stream.

Possible stream scopes:

- holder stream;
- tenant stream;
- partitioned holder stream;
- service stream with cross-stream correlation.

The implementation may choose partitioning, but event lineage must remain reconstructable.

---

## 11. Previous Hash Linkage

Where per-stream hash chaining is used:

```json
{
  "sequence": 10294,
  "previous_event_hash": "sha256:...",
  "event_hash": "sha256:..."
}
```

A missing predecessor creates an integrity alert.

---

## 12. Idempotent Ingestion

Retries are allowed.

If the same `event_id` or `idempotency_key` is resubmitted with identical content:

- return original acceptance result.

If same key is used with different content:

- reject with `IDEMPOTENCY_CONFLICT`.

---

## 13. Ingestion Result

```json
{
  "schema": "ssw.sael-ingest-result.v1",
  "request_id": "uuid",
  "event_id": "uuid",
  "accepted": true,
  "sequence": 10294,
  "event_hash": "sha256:...",
  "durability": "COMMITTED",
  "recorded_at": "RFC3339"
}
```

Durability values:

- RECEIVED
- JOURNALED
- COMMITTED
- CHECKPOINTED
- ARCHIVED

---

## 14. Durability Semantics

### RECEIVED

Accepted by ingress process only.

Not sufficient for consequential execution.

### JOURNALED

Persisted to durable local/write-ahead log.

### COMMITTED

Persisted to authoritative append store.

### CHECKPOINTED

Covered by signed integrity checkpoint.

### ARCHIVED

Included in encrypted long-term archive.

---

## 15. Evidence Reservation

Before selected high-risk actions, services may create an evidence reservation.

```json
{
  "schema": "ssw.sael-reservation.v1",
  "reservation_id": "uuid",
  "correlation_id": "uuid",
  "action_id": "uuid",
  "expected_event_types": [
    "SIGNING.COMPLETED",
    "EXECUTION.SUBMITTED"
  ],
  "required_durability": "COMMITTED",
  "expires_at": "RFC3339"
}
```

The action may proceed only after reservation acceptance where policy requires.

---

## 16. Evidence Reservation Completion

A reservation closes when:

- expected events are recorded;
- execution fails before required events;
- reservation expires;
- action is cancelled.

Incomplete reservations produce operational alerts and reconciliation work.

---

## 17. High-Risk Execution Rule

For R4/R5 actions, default policy should require:

- SAEL path healthy;
- evidence reservation or equivalent durable lineage;
- COMMITTED status before irreversible execution where technically feasible.

This prevents "execution succeeded, evidence vanished" failure modes.

---

## 18. Checkpoint Service

The checkpoint service shall periodically produce signed integrity roots.

Inputs:

- stream ID;
- start sequence;
- end sequence;
- event hashes.

Output:

```json
{
  "schema": "ssw.sael-checkpoint.v1",
  "checkpoint_id": "uuid",
  "stream_id": "holder-stream",
  "from_sequence": 1000,
  "to_sequence": 1999,
  "root_hash": "sha256:...",
  "created_at": "RFC3339",
  "signature_ref": "signature:..."
}
```

---

## 19. Checkpoint Frequency

Checkpoint cadence may depend on:

- event volume;
- risk;
- storage cost;
- recovery objectives;
- regulatory needs.

High-value execution streams may checkpoint more frequently.

---

## 20. Archive Contract

Archive bundles should include:

- bounded event range;
- checkpoint reference;
- encrypted event payloads;
- manifest;
- archive hash.

Conceptual:

```
Checkpoint
   ↓
Archive Manifest
   ↓
Encrypted Event Bundle
   ↓
Content-Addressed Storage / Redundant Object Store
```

Archive storage does not become authority.

---

## 21. Archive Integrity Verification

On retrieval:

1. verify archive hash;
2. verify manifest;
3. verify checkpoint signature;
4. verify event hashes;
5. verify sequence continuity.

Any mismatch creates `SAEL.INTEGRITY_MISMATCH`.

---

## 22. Query Authorization

SAEL query access requires explicit authorization.

Query caller classes may include:

- holder;
- SERA through Context Broker;
- approved reporting service;
- authorized support/compliance role where applicable.

Each query is scope- and disclosure-bound.

---

## 23. Canonical Query Request

```json
{
  "schema": "ssw.sael-query-request.v1",
  "query_id": "uuid",
  "requester": {
    "type": "holder|sera|service|admin",
    "id": "string"
  },
  "holder_did": "did:soul:...",
  "time_range": {
    "from": "RFC3339",
    "to": "RFC3339"
  },
  "filters": {},
  "disclosure_level": "L1",
  "purpose": "holder_activity_review",
  "auth_ref": "auth:uuid",
  "issued_at": "RFC3339",
  "expires_at": "RFC3339"
}
```

---

## 24. Query Disclosure Levels

Canonical levels:

- L0 Summary
- L1 Operational Metadata
- L2 Financial / Counterparty Detail
- L3 Identity / Credential Detail
- L4 Full Permissible Audit Evidence

A requester cannot exceed its authorized disclosure ceiling.

---

## 25. SERA Query Path

SERA does not query unrestricted SAEL directly.

Reference:

```
SERA
  ↓
Context Broker
  ↓
Authorized SAEL Query
  ↓
Minimized Report Context
  ↓
SERA explanation
```

This prevents full audit history from becoming general model context.

---

## 26. Holder Query Examples

Examples:

- "Show all SERA-assisted payments in August."
- "Show actions REV blocked this week."
- "Which transactions ran under a mandate?"
- "Show credential disclosures to this verifier."
- "Show all activity from my old phone."

The Query Service maps these to structured filters.

---

## 27. Report Generation

Reports shall be derived exclusively from SAEL records and authorized referenced data.

Report generation must not use conversational memory as source of truth.

---

## 28. Report Integrity

Each report shall include:

- report ID;
- query reference;
- generation time;
- disclosure level;
- event range;
- checkpoint references;
- report hash.

Narrative sections are marked as derived explanation.

---

## 29. Report Entry Classification

For SERA-assisted activity, reports may classify:

- EXPLAINED
- RECOMMENDED
- PREPARED
- EXECUTED_AFTER_APPROVAL
- EXECUTED_UNDER_MANDATE
- BLOCKED

Classification logic shall be deterministic from event lineage.

---

## 30. Query Consistency

A query may specify consistency mode:

- EVENTUAL
- CHECKPOINTED
- STRONG_CURRENT

### EVENTUAL

Fast, may omit newest uncommitted records.

### CHECKPOINTED

Returns records through latest valid checkpoint.

### STRONG_CURRENT

Includes current committed events plus checkpoint lineage.

High-stakes audit should prefer CHECKPOINTED or STRONG_CURRENT.

---

## 31. Redaction

Redaction never silently rewrites an event.

If content must be redacted:

- preserve original event hash;
- record redaction metadata;
- expose redacted view according to authorization;
- create redaction event where required.

---

## 32. Retention

Retention policy shall be class-based.

Policy dimensions:

- event type;
- financial relevance;
- security relevance;
- credential relevance;
- jurisdiction;
- holder preference;
- legal hold.

Retention expiry should archive/delete according to policy without breaking integrity claims.

---

## 33. Cryptographic Deletion

For content-addressed or immutable archives where physical deletion cannot be guaranteed:

- encryption-key destruction;
- key rotation;
- manifest revocation;
- access revocation

may be used to render protected data inaccessible.

---

## 34. Query Logging

Sensitive queries themselves shall be audited.

SAEL or a separate operations ledger should record:

- requester;
- scope;
- disclosure level;
- purpose;
- time;
- outcome.

This is especially important for administrative access.

---

## 35. Administrative Access

Administrative access must be:

- role-based;
- least privilege;
- time-bounded;
- purpose-limited;
- audited;
- restricted from raw key material.

Admin roles do not receive automatic L4 access.

---

## 36. Integrity Failure Handling

If checkpoint or chain validation fails:

1. mark affected range suspect;
2. halt high-trust reporting from that range;
3. initiate integrity investigation;
4. compare redundant archives;
5. produce SAEL integrity event;
6. never silently "repair" by rewriting history.

---

## 37. Ingestion Failure

If event ingestion fails before consequential execution:

- policy determines whether action blocks;
- R4/R5 default to block if durable evidence is mandatory;
- lower-risk paths may use durable local queue if explicitly allowed.

No service may discard required evidence silently.

---

## 38. Durable Queue

A durable queue may temporarily buffer evidence when central SAEL is unavailable.

Requirements:

- encrypted;
- integrity-protected;
- ordered;
- replay-safe;
- bounded retention;
- flush on recovery;
- detectable overflow.

Buffered events preserve original timestamps and producer identity.

---

## 39. Queue Overflow

If durable evidence queue reaches safety threshold:

- high-risk actions fail closed;
- low-risk actions may degrade according to policy;
- holder/admin receives alert;
- no silent dropping.

---

## 40. SAEL Recovery

After outage:

```
Restore service
  ↓
Verify append head
  ↓
Replay durable queue
  ↓
Deduplicate
  ↓
Restore sequence continuity
  ↓
Checkpoint
  ↓
Reconcile reservations
```

---

## 41. Duplicate Event Reconciliation

If duplicate transport occurs:

- identical event -> deduplicate;
- conflicting event with same ID -> integrity incident.

Conflicts are never resolved by arbitrary last-write-wins.

---

## 42. Event Producer Compromise

If producer compromise is suspected:

- revoke producer credentials;
- block new events from instance;
- preserve prior evidence;
- flag affected time range;
- compare downstream action evidence;
- require re-attestation/redeployment.

---

## 43. Schema Registry

SAEL event schemas shall be registered and versioned.

Ingestion rejects:

- unknown schema versions;
- deprecated versions beyond grace policy;
- forbidden field additions in security-sensitive event types.

---

## 44. Forward Compatibility

New optional fields may be introduced only if:

- old consumers safely ignore them;
- canonical hashing behavior is explicit;
- they do not change existing field semantics.

Security-critical semantic changes require new event version.

---

## 45. Reason Codes

SAEL operational failures shall use typed reason codes.

Examples:

- PRODUCER_NOT_AUTHORIZED
- EVENT_SCHEMA_INVALID
- EVENT_TYPE_NOT_ALLOWED
- PROHIBITED_CONTENT
- IDEMPOTENCY_CONFLICT
- SEQUENCE_CONFLICT
- DURABILITY_FAILURE
- CHECKPOINT_FAILURE
- ARCHIVE_FAILURE
- QUERY_NOT_AUTHORIZED
- DISCLOSURE_LEVEL_DENIED
- INTEGRITY_MISMATCH
- RETENTION_POLICY_BLOCK

---

## 46. Performance Separation

Reporting queries should not degrade ingestion durability.

Recommended separation:

- write-optimized ingestion path;
- read replica/query layer;
- asynchronous reporting;
- checkpoint/archive pipeline.

Evidence capture has priority over convenience reporting.

---

## 47. Privacy Controls

SAEL should store references instead of plaintext where possible for:

- credential claims;
- identity documents;
- raw external content;
- sensitive counterparty metadata.

Key material, seed phrases and raw biometric material remain prohibited.

---

## 48. Threat Model Gaps Closed

This specification materially closes:

- **SG-06 SAEL write durability**

It also strengthens:

- evidence tamper resistance;
- audit authorization;
- degraded evidence handling;
- query privacy;
- recovery integrity.

---

## 49. Open Implementation Items

Still required:

- concrete storage technology;
- checkpoint algorithm;
- archive encryption profile;
- retention matrix;
- query indexing strategy;
- report export formats;
- local durable queue implementation;
- producer credential issuance;
- operations audit integration.

---

## 50. Conformance Tests

Minimum tests:

1. unauthorized producer event rejected;
2. producer cannot emit foreign namespace event;
3. duplicate identical event deduplicates;
4. duplicate conflicting event raises incident;
5. checkpoint detects missing event;
6. archive verification detects mutation;
7. L1 requester cannot retrieve L3 fields;
8. SERA query passes through Context Broker;
9. R4 execution blocks when mandatory evidence path unavailable;
10. durable queue flush preserves ordering;
11. queue overflow blocks policy-selected actions;
12. redaction does not change original event hash;
13. narrative report cannot override structured event role;
14. revoked admin credential cannot query;
15. integrity mismatch marks affected range suspect.

---

## 51. Exit Criteria

SSW-AI-ISC-05 advances when:

1. append store is operational;
2. producer authorization is enforced;
3. event canonicalization is consistent;
4. durable queue behavior is implemented;
5. checkpoints verify correctly;
6. query disclosure levels are enforced;
7. SAEL-only reports generate correctly;
8. archive integrity is validated;
9. degraded evidence behavior is tested;
10. administrative query auditing is operational.

---

## 52. Controlled Statement

SAEL is not just a log.

It is the evidentiary boundary that lets the holder, the wallet and future auditors distinguish what SERA suggested, what the holder authorized, what the control plane permitted, and what actually executed.

If evidence cannot be trusted, autonomy cannot be trusted either.
