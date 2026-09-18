# SSW-AI-ISC-03: Trust Protocol / REV Decision Binding Contract

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-ISC-03  
**Status:** Controlled Draft  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-01, SSW-AI-02, SSW-AI-CF-A01, SSW-AI-SCH-01 through SSW-AI-SCH-05, SSW-AI-TM-01, SSW-AI-ISC-01, SSW-AI-ISC-02  
**Repository:** Kavithakanaparthi/SSW-SERA

---

## 1. Purpose

This specification defines how Trust Protocol and REV decisions are created, bound, validated, expired, invalidated, evidenced and consumed within the SERA-first Soul Super Wallet.

The objective is to prevent reuse of stale, unrelated or context-mismatched PASS decisions.

The governing invariant is:

> A Trust Protocol or REV PASS is valid only for the exact action, material terms, authority basis, policy context and validity window to which it was issued.

---

## 2. Roles

### Trust Protocol

Evaluates relevant trust conditions, including:

- identity;
- authority;
- delegation;
- policy;
- device/runtime state;
- counterparty context;
- contextual trust signals.

Trust Protocol produces a structured evaluation.

### REV

Acts as the final runtime allow/deny gate where required.

REV may consume:

- Trust Protocol result;
- device trust;
- mandate;
- policy;
- risk;
- AURION;
- execution context.

REV does not replace holder approval when A2 applies.

---

## 3. Decision Binding Domains

Every decision shall be bound to:

1. action ID;
2. action version;
3. material terms hash;
4. holder DID;
5. SERA Agent DID;
6. authority class;
7. risk class;
8. policy version;
9. Device ID;
10. Runtime ID where applicable;
11. mandate or approval basis;
12. issued_at;
13. expires_at.

Additional fields may be action-specific.

---

## 4. Trust Protocol Request

```json
{
  "schema": "ssw.trust-protocol-request.v1",
  "request_id": "uuid",
  "action_id": "uuid",
  "action_version": 1,
  "material_terms_hash": "sha256:...",
  "principal": {
    "holder_did": "did:soul:...",
    "sera_agent_did": "did:soul:agent:..."
  },
  "runtime": {
    "device_id": "device:...",
    "sera_runtime_id": "sera-runtime:...",
    "device_trust_ref": "device-eval:..."
  },
  "authority": {
    "class": "A2",
    "approval_ref": "approval:uuid|null",
    "mandate_ref": "mandate:uuid|null"
  },
  "risk": {
    "class": "R3",
    "reason_codes": []
  },
  "policy": {
    "policy_ref": "policy:uuid",
    "policy_version": "string"
  },
  "context_refs": [],
  "issued_at": "RFC3339",
  "expires_at": "RFC3339"
}
```

---

## 5. Trust Protocol Decision

```json
{
  "schema": "ssw.trust-protocol-decision.v1",
  "decision_id": "uuid",
  "request_id": "uuid",
  "action_id": "uuid",
  "action_version": 1,
  "material_terms_hash": "sha256:...",
  "status": "PASS|FAIL|UNAVAILABLE|EXPIRED",
  "reason_codes": [],
  "principal": {
    "holder_did": "did:soul:...",
    "sera_agent_did": "did:soul:agent:..."
  },
  "runtime": {
    "device_id": "device:...",
    "sera_runtime_id": "sera-runtime:..."
  },
  "authority_class": "A2",
  "risk_class": "R3",
  "policy_version": "string",
  "issued_at": "RFC3339",
  "expires_at": "RFC3339",
  "integrity": {
    "decision_hash": "sha256:...",
    "signature_ref": "signature:..."
  }
}
```

---

## 6. REV Request

REV receives a fully bound execution context.

```json
{
  "schema": "ssw.rev-request.v1",
  "request_id": "uuid",
  "action_id": "uuid",
  "action_version": 1,
  "material_terms_hash": "sha256:...",
  "authority_class": "A2",
  "risk_class": "R3",
  "policy_ref": "policy:uuid",
  "policy_version": "string",
  "trust_protocol_decision_ref": "tp:uuid",
  "device_trust_ref": "device-eval:uuid",
  "runtime_ref": "runtime-eval:uuid",
  "approval_ref": "approval:uuid|null",
  "mandate_ref": "mandate:uuid|null",
  "aurion_ref": "aurion:uuid|null",
  "issued_at": "RFC3339",
  "expires_at": "RFC3339"
}
```

---

## 7. REV Decision

```json
{
  "schema": "ssw.rev-decision.v1",
  "decision_id": "uuid",
  "request_id": "uuid",
  "action_id": "uuid",
  "action_version": 1,
  "material_terms_hash": "sha256:...",
  "status": "PASS|FAIL|UNAVAILABLE|EXPIRED",
  "reason_codes": [],
  "authority_class": "A2",
  "risk_class": "R3",
  "policy_version": "string",
  "trust_protocol_decision_ref": "tp:uuid",
  "issued_at": "RFC3339",
  "expires_at": "RFC3339",
  "integrity": {
    "decision_hash": "sha256:...",
    "signature_ref": "signature:..."
  }
}
```

---

## 8. Decision Freshness

Decision validity is time-bounded.

A consumer shall reject a decision when:

- current time is after `expires_at`;
- policy version changed materially;
- device state changed materially;
- action version changed;
- material terms hash changed;
- mandate state changed;
- approval was invalidated;
- risk class increased;
- AURION state invalidated where required.

---

## 9. Material Change Invalidation

Any change to material terms invalidates prior Trust Protocol and REV decisions.

Examples:

- recipient change;
- amount change;
- asset change;
- chain change;
- route change;
- contract change;
- credential claim change;
- verifier change.

New Action Contract version requires new evaluation unless policy proves the change is explicitly non-material.

---

## 10. Authority Change Invalidation

The following require re-evaluation:

- A2 becomes A3;
- A3 becomes A4;
- mandate ID/version changes;
- approval basis changes;
- mandate becomes suspended/revoked;
- holder approval expires.

A PASS issued under one authority path cannot be reused under another.

---

## 11. Risk Change Invalidation

If risk increases:

```
R3 -> R4
```

prior decisions are invalid unless they were explicitly issued for a risk ceiling that covers the new class and policy allows reuse.

Default behavior is re-evaluation.

Risk decrease does not automatically permit reuse if other context changed.

---

## 12. Device State Change

Decision invalidation triggers include:

- TRUSTED -> LIMITED;
- TRUSTED -> SUSPENDED;
- ATTESTED -> REGISTERED;
- any active state -> REVOKED.

Device trust upgrade may also require fresh evaluation for higher-privilege action.

---

## 13. Runtime Change

If action continues on another runtime:

- runtime eligibility must be re-evaluated;
- Trust Protocol may require fresh evaluation;
- REV must be re-evaluated if runtime is decision-bound.

Cross-device handoff never carries a blanket PASS.

---

## 14. Policy Version Binding

Decisions must bind to explicit policy version.

If policy changes:

- active decisions may remain valid only if policy declares backward validity;
- otherwise they expire immediately.

No service may assume policy equivalence without explicit version semantics.

---

## 15. Approval Binding

For A2:

REV and, where required, Trust Protocol should bind to the approval context or exact approved material terms hash.

If approval is invalidated:

- Trust Protocol/REV execution eligibility is invalidated;
- action returns to approval flow.

---

## 16. Mandate Binding

For A3/A4:

Trust Protocol and REV must reference:

- mandate ID;
- mandate version;
- mandate terms hash;
- mandate evaluation result.

If mandate usage, status or limits change so action no longer qualifies, prior PASS is unusable.

---

## 17. AURION Binding

Where AURION is required, REV shall bind to current attestation reference.

If AURION invalidates during a long-running flow:

- new execution step pauses;
- current pending action re-evaluates;
- already-submitted external action proceeds to reconciliation.

---

## 18. Decision Consumption

REV PASS may be:

- single-use;
- short-lived reusable within one action version;
- step-scoped.

Default for consequential execution:

```
single action version + short validity
```

A decision shall not authorize a second unrelated action.

---

## 19. Single-Use Execution Binding

Where policy marks REV as single-use:

```
REV PASS
  ↓
Signing Request
  ↓
REV decision marked consumed for execution
```

A duplicate signing attempt with same consumed REV decision is rejected unless idempotent retry of the identical signing request is explicitly allowed.

---

## 20. Idempotent Retry

An identical retry may reuse a decision if:

- action ID/version unchanged;
- terms hash unchanged;
- request idempotency key matches;
- decision unexpired;
- device/runtime unchanged;
- approval/mandate unchanged;
- no execution-state conflict exists.

---

## 21. UNAVAILABLE Semantics

If Trust Protocol or REV is mandatory and returns UNAVAILABLE:

```
execution eligibility = FAIL CLOSED
```

The action may remain:

- viewable;
- preparable;
- saveable;
- cancelable.

It may not proceed to signing unless a valid pre-existing offline policy explicitly applies.

---

## 22. Offline Decision Profile

A future offline profile must itself be signed, versioned and pre-issued.

It must bind:

- permitted action classes;
- max risk;
- allowed devices;
- validity window;
- allowed authority classes;
- value limits;
- allowed counterparties/chains;
- replay protections;
- reconciliation requirements.

AI may not generate offline authorization.

---

## 23. FAIL Semantics

A FAIL is authoritative for the evaluated request.

The action shall:

- block execution;
- retain evidence;
- expose safe reason code to holder where permitted;
- require material context change or policy-authorized reevaluation before another attempt.

Repeated retries without changed conditions should be rate-limited.

---

## 24. Reason Codes

Trust Protocol reason codes may include:

- IDENTITY_UNVERIFIED
- AUTHORITY_INVALID
- MANDATE_INVALID
- DEVICE_TRUST_INSUFFICIENT
- COUNTERPARTY_RISK
- POLICY_DENY
- CONTEXT_INCONSISTENT
- TRUST_SIGNAL_STALE

REV reason codes may include:

- TRUST_PROTOCOL_FAIL
- RISK_TOO_HIGH
- POLICY_BLOCK
- DEVICE_BLOCK
- MANDATE_SCOPE_FAIL
- APPROVAL_INVALID
- AURION_INVALID
- EXECUTION_CONTEXT_INVALID

Narrative explanations do not control decisions.

---

## 25. Integrity

Decision objects shall be integrity-protected.

At minimum:

- canonical serialization;
- decision hash;
- service signature or equivalent authenticated provenance.

Consumers must validate decision integrity before use.

---

## 26. Service Identity

Trust Protocol and REV adapters must have unique service identities.

The signer must accept decisions only from approved service identities and approved schema versions.

A forged local decision object is invalid.

---

## 27. SAEL Evidence

SAEL shall record:

- request ID;
- decision ID;
- action ID/version;
- material terms hash;
- status;
- reason codes;
- policy version;
- Device ID;
- Runtime ID;
- mandate/approval refs;
- issued_at;
- expires_at;
- consumption/invalidation event.

---

## 28. Invalidation Events

Canonical events include:

- TRUST.PROTOCOL_DECISION_INVALIDATED
- TRUST.REV_DECISION_INVALIDATED

Reasons may include:

- MATERIAL_TERMS_CHANGED
- ACTION_VERSION_CHANGED
- DEVICE_STATE_CHANGED
- RUNTIME_CHANGED
- APPROVAL_INVALIDATED
- MANDATE_CHANGED
- POLICY_CHANGED
- RISK_ELEVATED
- AURION_INVALIDATED
- DECISION_EXPIRED

---

## 29. Signer Verification

The Signing Gateway shall independently verify:

1. decision schema;
2. service provenance;
3. decision integrity;
4. action ID;
5. action version;
6. material terms hash;
7. authority class;
8. risk class;
9. policy version;
10. Device ID;
11. Runtime ID if bound;
12. approval/mandate context;
13. freshness;
14. consumed state.

Any mismatch rejects signing.

---

## 30. Execution Router Verification

Execution Router should verify REV reference again before submission where policy requires.

This protects against:

- signing/submission delay;
- decision expiry after signing;
- emergency revocation;
- mandate revocation before broadcast.

If REV expires after signing but before submission, policy determines whether re-evaluation is required. Default for high-risk actions is re-evaluation.

---

## 31. Emergency Kill Switch

REV may provide emergency kill capability.

If global or scoped kill state becomes active:

- pending affected signing/execution requests fail;
- mandates remain historically intact but unusable;
- SAEL records the block.

Emergency kill does not rewrite prior evidence.

---

## 32. Counterparty Change

A counterparty identity change requires fresh Trust Protocol and REV evaluation.

An alias label change alone does not necessarily require reevaluation if canonical counterparty identity remains unchanged.

Canonical identity is authoritative.

---

## 33. Route Change

If route changes materially:

- new terms hash;
- new Trust Protocol evaluation;
- new REV evaluation;
- new approval if A2 and material.

Fee-only bounded replacement may use separate policy if route semantics remain unchanged.

---

## 34. Credential Presentation

For credential actions, Trust/REV binding shall include:

- verifier identity;
- claim scope;
- proof method;
- purpose;
- presentation expiry.

A PASS for one verifier cannot be reused for another.

---

## 35. WalletConnect

For WalletConnect, decision binding shall include:

- origin;
- chain;
- contract;
- method;
- calldata hash;
- approval amount/value;
- session reference.

Changing calldata invalidates prior decisions.

---

## 36. Long-Running Actions

Long-running flows may require periodic re-evaluation.

Triggers include:

- elapsed time;
- AURION change;
- counterparty state change;
- market/risk shift if policy relevant;
- device/runtime change;
- mandate nearing limit;
- policy update.

---

## 37. Caching

Decision caching is permitted only when:

- action binding is preserved;
- freshness is enforced;
- cache cannot broaden reuse;
- policy explicitly allows it.

Global unbound PASS caching is prohibited.

---

## 38. Rate Limiting

Repeated FAIL/UNAVAILABLE requests should be rate-limited to prevent:

- denial-of-service amplification;
- brute-force policy probing;
- excessive external calls.

Rate limiting must not convert FAIL into PASS.

---

## 39. Observability

Operational logs may record:

- decision ID;
- status;
- latency;
- reason codes;
- expiry;
- service version.

They should avoid duplicating sensitive action details unless necessary.

---

## 40. Failure Isolation

If Trust Protocol adapter fails:

- no raw model fallback;
- required actions block.

If REV adapter fails:

- required actions block.

If SAEL is degraded:

- decision may still be computed, but execution policy determines whether missing durable evidence blocks downstream action.

---

## 41. Versioning

Trust Protocol and REV schemas shall be versioned.

A consumer may support multiple versions only with explicit validation profiles.

Downgrade to weaker version is prohibited once policy disables it.

---

## 42. Conformance Tests

Minimum tests:

1. PASS for action A fails on action B.
2. PASS for version 1 fails on version 2.
3. PASS fails after material terms change.
4. PASS fails after device suspension.
5. PASS fails after mandate revocation.
6. PASS fails after approval invalidation.
7. PASS fails after expiry.
8. stale policy version fails.
9. forged decision signature fails.
10. different runtime fails when runtime-bound.
11. WalletConnect calldata change fails.
12. credential verifier change fails.
13. repeated consumed REV fails.
14. valid idempotent retry passes where policy permits.
15. UNAVAILABLE fails closed.

---

## 43. Threat Model Gaps Closed

This specification materially closes:

- **SG-07 Trust/REV binding**

It also strengthens:

- SG-04 offline policy package requirements;
- signing-gateway validation;
- stale decision prevention;
- replay control;
- emergency kill semantics.

---

## 44. Open Implementation Items

Still required:

- Trust Protocol adapter concrete API;
- REV adapter concrete API;
- decision signing key management;
- offline authorization package schema;
- decision cache implementation;
- policy-version compatibility rules;
- long-running action reevaluation intervals;
- global/scoped kill-state distribution.

---

## 45. Exit Criteria

SSW-AI-ISC-03 advances when:

1. Trust/REV decisions are cryptographically attributable;
2. action/terms binding is implemented;
3. signer rejects stale/mismatched decisions;
4. mandate/approval invalidation propagates;
5. emergency kill propagates;
6. offline-policy behavior is machine-enforced;
7. SAEL invalidation events are implemented;
8. conformance tests pass.

---

## 46. Controlled Statement

Trust Protocol evaluates whether the action remains trustworthy.

REV decides whether the action may proceed.

Neither decision is a reusable badge.

Each decision belongs to one bounded execution context and expires when that context changes.
