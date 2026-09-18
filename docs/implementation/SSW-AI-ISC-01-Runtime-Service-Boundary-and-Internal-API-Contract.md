# SSW-AI-ISC-01: Runtime Service Boundary & Internal API Contract

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-ISC-01  
**Status:** Controlled Draft  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-01, SSW-AI-02, SSW-AI-CF-A01, SSW-AI-SCH-01 through SSW-AI-SCH-05, SSW-AI-TM-01  
**Repository:** Kavithakanaparthi/SSW-SERA

---

## 1. Purpose

This specification defines the runtime service boundaries and internal API contracts for the SERA-first Soul Super Wallet.

Its purpose is to prevent responsibility collapse across interpretation, authority, policy, signing, execution and evidence.

The governing principle is:

> No single runtime service may simultaneously control unrestricted reasoning, holder authority and cryptographic execution.

---

## 2. Runtime Service Set

The candidate service topology includes:

1. SERA Interaction Gateway
2. SERA Orchestrator
3. Context Broker
4. Intent Normalizer
5. Entity Resolution Service
6. Capability Registry
7. Tool Registry
8. Authority Engine
9. Risk Engine
10. Policy Engine
11. Device Trust Service
12. Mandate Service
13. Trust Protocol Adapter
14. REV Adapter
15. AURION Adapter
16. Presentation & Concealment Service
17. Approval Service
18. Authentication Gateway
19. Signing Gateway
20. Execution Router
21. Chain / Provider Adapters
22. Credential Service
23. WalletConnect / External Request Gateway
24. SAEL Ingestion Service
25. SAEL Query / Reporting Service
26. SERA State Service
27. Runtime Registry
28. Recovery Service

Implementations may combine low-risk stateless components, but security boundaries defined here must remain enforceable.

---

## 3. Trust Zones

Services are grouped into trust zones.

### Z1 Holder Interaction

- SERA Interaction Gateway
- Presentation & Concealment Service

### Z2 SERA Intelligence

- SERA Orchestrator
- Intent Normalizer
- Entity Resolution
- Context Broker

### Z3 Control Plane

- Authority Engine
- Risk Engine
- Policy Engine
- Device Trust Service
- Mandate Service
- Trust Protocol Adapter
- REV Adapter
- AURION Adapter

### Z4 Authentication & Signing

- Authentication Gateway
- Signing Gateway

### Z5 Execution

- Execution Router
- Chain / Provider Adapters
- Credential Service
- WalletConnect Gateway

### Z6 Evidence

- SAEL Ingestion
- SAEL Query / Reporting

### Z7 Identity / State / Recovery

- Runtime Registry
- SERA State Service
- Recovery Service

No service in Z2 may directly invoke signing keys.

---

## 4. SERA Interaction Gateway

### Responsibilities

- accept holder text/voice/system entry;
- create Intent Envelope;
- bind source channel/device/runtime;
- invoke concealment rules;
- return structured responses.

### Prohibited

- signing;
- mandate activation;
- policy override;
- direct execution.

### Primary APIs

- `POST /intent/envelopes`
- `GET /actions/{action_id}/presentation`
- `POST /presentations/{id}/reveal`
- `POST /actions/{action_id}/approve`

---

## 5. SERA Orchestrator

### Responsibilities

- coordinate interpretation;
- request context;
- build plans;
- choose supported capability/tool candidates;
- prepare Action Contract drafts;
- coordinate long-running non-authoritative work.

### Prohibited

- final authority decision;
- changing mandate scope;
- direct key access;
- direct signing;
- bypassing Trust Protocol/REV;
- writing authoritative execution result.

### APIs

- `POST /orchestrator/interpret`
- `POST /orchestrator/plan`
- `POST /orchestrator/actions/prepare`

Outputs are advisory/preparatory until validated.

---

## 6. Context Broker

### Responsibilities

- data classification;
- purpose validation;
- minimization;
- redaction;
- freshness;
- context package construction.

### API

```http
POST /context/packages
```

Request:

```json
{
  "intent_id": "uuid",
  "purpose": "payment.prepare",
  "requested_classes": ["D1","D2"],
  "runtime_id": "sera-runtime:..."
}
```

Response:

```json
{
  "context_package_id": "uuid",
  "approved_classes": ["D1","D2"],
  "redactions": [],
  "expires_at": "RFC3339"
}
```

D8 is never returned.

---

## 7. Intent Normalizer

### Responsibilities

- transform interpreted holder intent into `ssw.resolved-intent.v1`;
- enforce schema completeness;
- surface ambiguity;
- reject free-form execution requests.

### API

`POST /intents/normalize`

Returns deterministic structured intent only.

---

## 8. Entity Resolution Service

### Responsibilities

- resolve recipient aliases;
- resolve DIDs, addresses, assets, chains and merchants;
- preserve provenance and confidence.

### API

`POST /entities/resolve`

Response must include stable canonical identifiers.

---

## 9. Capability Registry

### Responsibilities

- declare supported capabilities;
- map action families to required controls;
- expose capability versions.

### API

`GET /capabilities/{capability}`

Registry data is declarative, not authoritative for holder consent.

---

## 10. Tool Registry

### Responsibilities

- enumerate callable tools/adapters;
- declare permissions and data classes;
- expose trust zone;
- expose whether tool can cause external state change.

### API

`GET /tools/{tool_id}`

Each tool shall declare:

- input schema;
- output schema;
- allowed callers;
- execution risk;
- whether signing is required.

---

## 11. Authority Engine

### Responsibilities

- assign/validate A0-A5;
- determine approval versus mandate path;
- reject invalid authority escalation.

### API

`POST /authority/evaluate`

Request includes Action Contract draft.

Response:

```json
{
  "authority_class": "A2",
  "approval_required": true,
  "mandate_required": false,
  "reason_codes": []
}
```

The Authority Engine cannot sign.

---

## 12. Risk Engine

### Responsibilities

- assign R0-R5;
- apply deterministic risk reasons;
- consume spam/security/counterparty/device signals;
- increase controls where required.

### API

`POST /risk/evaluate`

Risk output cannot grant authority.

---

## 13. Policy Engine

### Responsibilities

- evaluate system and holder policy;
- enforce policy versions;
- determine required controls;
- enforce offline/degraded policies.

### API

`POST /policy/evaluate`

Response includes:

- PASS/FAIL;
- policy version;
- required controls;
- reason codes;
- expiry.

---

## 14. Device Trust Service

### Responsibilities

- maintain SCH-03 state machine;
- evaluate device eligibility for specific action;
- enforce trust freshness.

### APIs

- `GET /devices/{device_id}`
- `POST /devices/{device_id}/evaluate`
- `POST /devices/{device_id}/transitions`

No other service may silently mutate device state.

---

## 15. Mandate Service

### Responsibilities

- create mandate drafts;
- validate holder-authorized mandates;
- enforce scope/limits/conditions;
- reserve/finalize usage;
- suspend/revoke.

### APIs

- `POST /mandates`
- `POST /mandates/{id}/evaluate`
- `POST /mandates/{id}/reserve`
- `POST /mandates/{id}/finalize`
- `POST /mandates/{id}/revoke`

Only holder-authorized or policy-authorized lifecycle operations may activate authority.

---

## 16. Trust Protocol Adapter

### Responsibilities

- normalize Trust Protocol input;
- obtain decision;
- bind result to action/policy/version;
- expose freshness.

### API

`POST /trust-protocol/evaluate`

Response:

```json
{
  "evaluation_id": "uuid",
  "status": "PASS|FAIL|UNAVAILABLE|EXPIRED",
  "action_id": "uuid",
  "terms_hash": "sha256:...",
  "policy_version": "string",
  "expires_at": "RFC3339"
}
```

---

## 17. REV Adapter

### Responsibilities

- invoke REV;
- bind PASS/FAIL to action and context;
- enforce non-reuse of stale decisions.

### API

`POST /rev/evaluate`

REV result must include action ID and validity.

---

## 18. AURION Adapter

### Responsibilities

- obtain continuous attestation;
- report validity transitions;
- trigger pause/fail where required.

### APIs

- `POST /aurion/attest`
- `GET /aurion/attestations/{id}`

---

## 19. Presentation & Concealment Service

### Responsibilities

- implement SCH-04;
- calculate concealed fields;
- manage reveal state;
- manage re-concealment;
- determine review eligibility.

### APIs

- `GET /presentations/{id}`
- `POST /presentations/{id}/reveal`
- `POST /presentations/{id}/reconceal`
- `POST /presentations/{id}/review`

It may not approve actions.

---

## 20. Approval Service

### Responsibilities

- create approval request;
- bind approval to material terms hash;
- validate presentation/review requirements;
- invalidate on material change.

### APIs

- `POST /approvals`
- `GET /approvals/{id}`
- `POST /approvals/{id}/grant`
- `POST /approvals/{id}/reject`
- `POST /approvals/{id}/invalidate`

Approval does not sign.

---

## 21. Authentication Gateway

### Responsibilities

- invoke platform-authentication mechanisms;
- return typed assurance result;
- never expose raw biometric material.

### API

`POST /authentication/challenges`

Response includes authentication reference, assurance level and expiry.

---

## 22. Signing Gateway

### Responsibilities

- independently validate canonical signing payload;
- verify terms hash;
- verify approval/mandate;
- verify device/runtime eligibility;
- verify Trust/REV freshness;
- enforce nonce/replay constraints;
- sign only valid payloads.

### API

`POST /signing/requests`

### Required rejection cases

- free-form input;
- terms mismatch;
- stale approval;
- invalid mandate;
- revoked device;
- stale REV;
- unsupported chain;
- replay token consumed.

The signer never accepts a model response directly.

---

## 23. Execution Router

### Responsibilities

- receive signed payload;
- route to correct adapter;
- enforce idempotency;
- track execution status;
- initiate reconciliation on uncertainty.

### APIs

- `POST /executions`
- `GET /executions/{id}`
- `POST /executions/{id}/reconcile`

Execution Router cannot alter signed material terms.

---

## 24. Chain / Provider Adapters

### Responsibilities

- chain-specific serialization/submission;
- network interaction;
- status retrieval;
- provider failover.

### Prohibited

- changing signed payload;
- changing recipient;
- changing amount;
- interpreting natural language.

Adapters are treated as potentially fallible external-boundary components.

---

## 25. Credential Service

### Responsibilities

- select credential;
- construct presentation;
- create ZKP/selective disclosure;
- submit proof;
- preserve disclosure minimization.

### APIs

- `POST /credentials/presentations/prepare`
- `POST /credentials/presentations/submit`

No protected disclosure occurs without Action Contract authority.

---

## 26. WalletConnect / External Request Gateway

### Responsibilities

- ingest external dApp requests;
- classify origin;
- decode contract/method intent;
- normalize to Intent Envelope / Action Contract.

### API

`POST /external/walletconnect/requests`

External request is never passed directly to signer.

---

## 27. SAEL Ingestion Service

### Responsibilities

- accept authoritative runtime events;
- validate producer identity;
- append event;
- assign sequence;
- maintain hash linkage;
- support durability acknowledgement.

### API

`POST /sael/events`

Response:

```json
{
  "event_id": "uuid",
  "sequence": 10294,
  "accepted": true,
  "durability": "COMMITTED"
}
```

High-risk flows may require `COMMITTED` before execution.

---

## 28. SAEL Query / Reporting Service

### Responsibilities

- execute holder-authorized queries;
- generate reports;
- apply disclosure levels;
- preserve evidence/narrative distinction.

### APIs

- `POST /sael/queries`
- `POST /sael/reports`
- `GET /sael/reports/{id}`

---

## 29. SERA State Service

### Responsibilities

- manage encrypted portable-state manifests;
- retrieve/store encrypted state bundles;
- maintain version lineage;
- never store wallet signing keys.

### APIs

- `GET /sera-state/manifest`
- `POST /sera-state/manifest`
- `GET /sera-state/bundles/{cid}`

State service is not an authority service.

---

## 30. Runtime Registry

### Responsibilities

- register SERA Runtime IDs;
- bind runtime to SERA Agent DID and device/environment;
- maintain lifecycle and revocation;
- expose runtime eligibility metadata.

### APIs

- `POST /runtimes`
- `GET /runtimes/{id}`
- `POST /runtimes/{id}/revoke`

---

## 31. Recovery Service

### Responsibilities

- coordinate holder recovery;
- resolve SERA Agent DID;
- verify state manifest;
- register new device/runtime;
- re-establish scoped authority.

### Prohibited

- silently reactivating revoked devices;
- silently restoring expired mandates;
- auto-restoring unrestricted signing.

---

## 32. Canonical Internal Request Envelope

All privileged internal calls should use a common request envelope.

```json
{
  "request_id": "uuid",
  "correlation_id": "uuid",
  "caller_service": "sera-orchestrator",
  "caller_runtime_id": "sera-runtime:...",
  "action_id": "uuid|null",
  "holder_did": "did:soul:...",
  "sera_agent_did": "did:soul:agent:...",
  "issued_at": "RFC3339",
  "expires_at": "RFC3339",
  "auth_context_ref": "service-auth:...",
  "payload": {}
}
```

---

## 33. Service Authentication

Internal privileged services must use service-to-service authentication.

Required properties:

- unique service identity;
- short-lived credentials;
- least privilege;
- auditable issuance;
- rotation;
- revocation.

A user session token must not substitute for service identity.

---

## 34. Authorization Between Services

Each API must define:

- allowed callers;
- allowed actions;
- data classes accessible;
- whether request may cause external state change.

Example:

```
SERA Orchestrator
  -> MAY call Context Broker
  -> MAY call Authority/Risk
  -> MAY NOT call Signing Gateway directly without validated contract path
```

---

## 35. Service Boundary Matrix

| Caller | Target | Allowed | Notes |
|---|---|---:|---|
| Orchestrator | Context Broker | Yes | minimized context |
| Orchestrator | Authority Engine | Yes | draft contract |
| Orchestrator | Signing Gateway | No direct raw call | only validated signing payload path |
| Approval Service | Signing Gateway | No | approval is not signing |
| Authority Engine | Signer | No | authority classification only |
| Mandate Service | Signer | No direct signing | mandate validation only |
| Execution Router | Signer | No | receives signed payload |
| Signer | Execution Router | Yes | signed payload reference |
| External Gateway | Signer | No | normalize first |
| Model Runtime | SAEL Query | Controlled | through Context Broker/report layer |

---

## 36. State Ownership

Authoritative state ownership must be explicit.

- Action Contract state: Action/Control Plane
- Mandate state: Mandate Service
- Device trust state: Device Trust Service
- Approval state: Approval Service
- Trust Protocol result: Trust Protocol Adapter
- REV result: REV Adapter
- Signing state: Signing Gateway
- Execution state: Execution Router
- Evidence state: SAEL
- Portable SERA state: SERA State Service
- Runtime lifecycle: Runtime Registry

No service may silently own another service's authoritative state.

---

## 37. Idempotency

Every state-changing internal endpoint must support idempotency.

Required for:

- approvals;
- mandate reservations;
- signing requests;
- executions;
- state transitions;
- SAEL ingestion where duplicate transport is possible.

---

## 38. Error Contract

Internal APIs shall return typed errors.

Canonical shape:

```json
{
  "error": {
    "code": "DEVICE_NOT_ELIGIBLE",
    "category": "AUTHORIZATION",
    "retryable": false,
    "details_ref": "opaque-ref|null"
  }
}
```

Free-form text is explanatory only.

---

## 39. Freshness

Security-sensitive service responses must include:

- issued_at;
- expires_at;
- policy/version reference where applicable.

Expired control-plane decisions must not be silently reused.

---

## 40. Correlation

Every service call associated with an action must preserve:

- correlation_id;
- action_id;
- holder DID;
- SERA Agent DID where applicable.

This is required for SAEL reconstruction.

---

## 41. Observability

Operational telemetry must not expose:

- private keys;
- raw credentials;
- hidden credential claims;
- unrestricted holder financial data;
- raw biometrics.

Observability should use:

- IDs;
- hashes;
- reason codes;
- latency/status metadata.

---

## 42. Failure Isolation

Failure of one service must not widen authority.

Examples:

- Context Broker unavailable -> AI degrades, raw wallet context not exposed;
- Risk Engine unavailable -> consequential action blocks;
- REV unavailable where required -> fail closed;
- SAEL unavailable for mandatory-evidence path -> block or durable queue per policy;
- model unavailable -> deterministic wallet fallback;
- reporting unavailable -> execution history remains intact.

---

## 43. Circuit Breakers

The architecture should support circuit breakers for:

- model providers;
- external intelligence;
- RPC/providers;
- Trust Protocol adapter;
- REV adapter;
- chain adapters;
- credential verifiers.

Circuit breaker activation may reduce functionality but must not lower control requirements.

---

## 44. Example Explicit Payment Call Sequence

```
Interaction Gateway
  -> Orchestrator
  -> Context Broker
  -> Intent Normalizer
  -> Entity Resolver
  -> Authority Engine
  -> Risk Engine
  -> Device Trust
  -> Policy Engine
  -> Trust Protocol
  -> REV
  -> Presentation Service
  -> Approval Service
  -> Authentication Gateway
  -> Signing Gateway
  -> Execution Router
  -> Chain Adapter
  -> SAEL throughout
```

---

## 45. Example Delegated Payment Call Sequence

```
Scheduled Trigger
  -> Orchestrator
  -> Intent Normalizer
  -> Mandate Service
  -> Risk Engine
  -> Device/Runtime Evaluation
  -> Policy Engine
  -> Trust Protocol
  -> REV
  -> Authentication policy
  -> Signing Gateway
  -> Execution Router
  -> Chain Adapter
  -> SAEL
```

---

## 46. Example Credential Presentation Sequence

```
Verifier Request
  -> External Gateway
  -> Intent Normalizer
  -> Context Broker
  -> Credential Service prepare
  -> Authority Engine
  -> Risk Engine
  -> Policy / Trust / REV
  -> Presentation / Approval
  -> Credential Service submit
  -> SAEL
```

---

## 47. Security Invariants

1. Orchestrator cannot sign.
2. Model runtime cannot sign.
3. Context Broker cannot grant authority.
4. Authority Engine cannot execute.
5. Risk Engine cannot grant authority.
6. Approval Service cannot sign.
7. Mandate Service cannot bypass REV.
8. Signing Gateway cannot invent material terms.
9. Execution Router cannot change signed payload.
10. External Gateway cannot directly invoke signer.
11. SAEL cannot create authority.
12. SERA State Service cannot restore signing authority.
13. Runtime Registry cannot promote device trust.
14. Device Trust Service cannot create mandates.
15. No service may silently mutate another service's authoritative state.

---

## 48. Implementation Security Conditions From TM-01

This service contract directly addresses:

- SG-03 Runtime integrity profile, partially;
- SG-06 SAEL write durability, partially;
- SG-07 Trust/REV binding, structurally;
- SG-09 Counterparty identity binding, structurally.

The following remain for dedicated specifications:

- SG-01 canonicalization;
- SG-02 signing verification;
- SG-04 offline policy package;
- SG-05 condition language;
- SG-08 recovery authorization;
- SG-10 platform attestation.

---

## 49. Open Implementation Items

- transport protocol choice;
- service mesh or equivalent;
- mTLS/service identity profile;
- retry semantics;
- timeout defaults;
- circuit-breaker thresholds;
- deployment topology;
- secret management;
- per-service data stores;
- event bus;
- schema registry;
- compatibility/versioning rules.

---

## 50. Exit Criteria

SSW-AI-ISC-01 advances when:

1. service identities are defined;
2. each endpoint has an OpenAPI/JSON schema;
3. state ownership is implemented;
4. direct forbidden call paths are technically blocked;
5. signer accepts only validated payloads;
6. SAEL correlation survives end-to-end;
7. degraded service behavior is tested;
8. service authorization matrix is enforced.

---

## 51. Controlled Statement

The SERA-first wallet is not one intelligent monolith.

It is a controlled system of cooperating services with deliberately separated powers.

Reasoning may propose.

Policy may constrain.

Authority may permit.

Signing may authorize cryptographically.

Execution may act.

Evidence must prove what happened.
