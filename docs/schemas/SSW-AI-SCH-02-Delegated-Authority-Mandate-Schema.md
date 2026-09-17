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
