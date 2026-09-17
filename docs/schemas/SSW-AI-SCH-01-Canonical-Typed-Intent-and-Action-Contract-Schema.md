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
