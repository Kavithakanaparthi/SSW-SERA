# SSW-AI-ISC-02: Canonicalization, Hashing & Signing-Gateway Contract

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-ISC-02  
**Status:** Controlled Draft  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-01, SSW-AI-02, SSW-AI-CF-A01, SSW-AI-SCH-01 through SSW-AI-SCH-05, SSW-AI-TM-01, SSW-AI-ISC-01  
**Repository:** Kavithakanaparthi/SSW-SERA

---

## 1. Purpose

This specification defines the canonicalization, hashing and signing-gateway contract used to bind holder-reviewed or delegated action terms to the exact payload that is ultimately signed.

Its purpose is to ensure that no model, orchestrator, adapter, runtime or downstream service can silently mutate material terms after authorization.

The governing invariant is:

> The signer signs only what the holder approved or what a valid mandate explicitly permits.

---

## 2. Security Objectives

The signing path shall provide:

1. deterministic object canonicalization;
2. stable terms hashing;
3. exact approval-to-payload binding;
4. exact mandate-to-payload binding;
5. action-version binding;
6. Trust Protocol and REV freshness binding;
7. device/runtime eligibility validation;
8. replay prevention;
9. idempotency;
10. chain-specific payload validation;
11. audit evidence;
12. strict rejection of free-form inputs.

---

## 3. Signing Boundary

The Signing Gateway is a privileged cryptographic control-plane service.

It may receive only:

- canonical Action Contract references;
- canonical material terms;
- policy decisions;
- Trust Protocol result;
- REV result;
- approval or mandate evidence;
- device/runtime eligibility evidence;
- chain-specific signing payload candidate.

It must never receive:

- free-form natural language;
- raw model output;
- prompt text as execution instruction;
- unrestricted tool output;
- arbitrary unvalidated calldata.

---

## 4. Canonical Serialization Profile

The architecture adopts a deterministic JSON-compatible canonicalization profile for all security-sensitive hashes.

The exact production profile shall be one of:

- RFC 8785 JSON Canonicalization Scheme; or
- a formally equivalent Soulverse canonical profile with documented byte-level behavior.

Until final implementation selection, this specification requires RFC 8785-compatible semantics.

Canonicalization shall define:

- UTF-8 encoding;
- deterministic property ordering;
- normalized number representation;
- no insignificant whitespace;
- no duplicate object keys;
- deterministic escaping;
- no undefined values;
- no comments;
- no implementation-specific map ordering.

---

## 5. Canonicalization Input Validation

Before canonicalization, the object shall pass schema validation.

Canonicalization shall fail if:

- duplicate keys exist;
- unsupported numeric representation exists;
- non-finite numbers exist;
- required fields are absent;
- unknown security-critical fields are present where schema forbids them;
- string normalization policy is violated;
- an object contains ambiguous aliases for the same semantic field.

---

## 6. Hash Profile

Baseline hash profile:

```
HASH-ALG = SHA-256
ENCODING = lowercase hexadecimal prefixed with "sha256:"
```

Example:

```
sha256:2f4c...
```

The algorithm profile shall be versioned so stronger algorithms may be introduced later without ambiguity.

---

## 7. Material Terms Hash

The `material_terms_hash` binds exactly the holder- or mandate-relevant execution semantics.

Conceptually:

```
material_terms_hash =
  SHA256(
    JCS(
      action_type,
      action_version,
      material_terms,
      execution_destination,
      network,
      route,
      fee_policy_relevant_fields,
      contract_or_verifier_identity,
      validity_window
    )
  )
```

The precise included field registry shall be action-type-specific.

---

## 8. Action Contract Hash

A broader `action_contract_hash` binds the complete security-relevant Action Contract.

It shall include:

- action ID;
- action version;
- principal identities;
- authority class;
- risk class;
- material terms hash;
- policy references;
- device/runtime scope;
- Trust Protocol requirements;
- REV requirements;
- approval/mandate reference;
- expiry;
- idempotency reference.

---

## 9. Approval Binding

An A2 approval shall reference:

- action ID;
- action version;
- material terms hash;
- holder DID;
- Device ID;
- authentication reference;
- approval timestamp;
- approval expiry.

The Signing Gateway shall reject approval if any bound field differs.

---

## 10. Mandate Binding

An A3/A4 signing request shall reference:

- mandate ID;
- mandate version;
- mandate terms hash;
- mandate evaluation ID;
- action ID;
- action version;
- material terms hash.

The Signing Gateway shall independently confirm the action remains within mandate scope.

A passing Mandate Service response is necessary but not sufficient if the signer can independently validate critical bounds.

---

## 11. Trust Protocol Binding

Trust Protocol results used for signing shall bind at least:

- action ID;
- action version;
- material terms hash;
- policy version;
- evaluated context version where applicable;
- issued_at;
- expires_at;
- status.

A Trust Protocol PASS for one action may not be reused for another action.

---

## 12. REV Binding

REV result shall bind:

- action ID;
- action version;
- material terms hash;
- authority class;
- risk class;
- policy version;
- issued_at;
- expires_at;
- decision status.

Stale or mismatched REV decisions are invalid.

---

## 13. Device and Runtime Binding

Signing requests shall include:

- Device ID;
- current device trust state;
- device-trust evaluation ID;
- SERA Runtime ID;
- runtime eligibility evaluation ID.

The Signing Gateway shall reject:

- SUSPENDED devices;
- REVOKED devices;
- expired device evaluations;
- ineligible runtimes;
- runtime/device mismatches.

---

## 14. Canonical Signing Request

```json
{
  "schema": "ssw.signing-request.v1",
  "signing_request_id": "uuid",
  "action_id": "uuid",
  "action_version": 3,
  "action_contract_hash": "sha256:...",
  "material_terms_hash": "sha256:...",
  "holder_did": "did:soul:...",
  "sera_agent_did": "did:soul:agent:...",
  "sera_runtime_id": "sera-runtime:...",
  "device_id": "device:...",
  "authority": {
    "class": "A2",
    "approval_ref": "approval:uuid",
    "mandate_ref": null
  },
  "control_refs": {
    "policy_ref": "policy:uuid",
    "device_trust_ref": "device-eval:uuid",
    "runtime_ref": "runtime-eval:uuid",
    "trust_protocol_ref": "tp:uuid",
    "rev_ref": "rev:uuid"
  },
  "payload": {
    "payload_type": "evm.transaction",
    "payload_ref": "payload:uuid",
    "payload_hash": "sha256:..."
  },
  "replay": {
    "idempotency_key": "string",
    "replay_token": "opaque",
    "nonce": "string|null"
  },
  "issued_at": "RFC3339",
  "expires_at": "RFC3339"
}
```

---

## 15. Chain-Specific Payload Canonicalization

Each execution family shall define a chain-specific canonical payload profile.

Examples:

- EVM transaction;
- Solana transaction;
- Bitcoin transaction;
- credential proof;
- WalletConnect contract call;
- off-chain signed request.

The generic signer contract shall not assume one chain format.

---

## 16. EVM Signing Payload Baseline

An EVM payload shall bind:

- chain ID;
- nonce;
- to;
- value;
- data;
- gas-related policy fields;
- transaction type;
- max fee / priority fee where relevant;
- access list where relevant.

If gas values are allowed to vary after approval, the permitted range must be explicitly policy-bounded.

---

## 17. Fee Mutation Rules

Fees may be categorized as:

### Material fee fields

Require re-review if changed beyond policy threshold.

### Bounded execution fee fields

May vary within a pre-authorized deterministic range.

The policy must define:

- allowed percentage or absolute variance;
- max fee;
- expiry;
- whether new approval is required.

No adapter may invent an unbounded fee change.

---

## 18. Route Binding

If route selection is material, the route identifier and route hash shall be included in material terms.

Route changes involving:

- different bridge;
- different chain;
- different counterparty;
- materially different fee/risk;
- additional contract;

invalidate prior approval unless policy proves equivalence.

---

## 19. Credential Signing Payload

For credential presentation, signing shall bind:

- verifier;
- requested claims;
- disclosed claims;
- proof method;
- nonce/challenge;
- audience;
- expiration;
- holder DID;
- credential reference.

The signer must not sign a broader disclosure than the reviewed Action Contract permits.

---

## 20. WalletConnect Signing Payload

WalletConnect signing shall bind:

- request origin;
- chain;
- contract;
- method selector;
- decoded semantic action;
- calldata hash;
- approval amount;
- value;
- session reference.

Raw calldata alone is insufficient evidence for holder review.

---

## 21. Replay Protection

Every signing request shall include replay protection.

Supported mechanisms may include:

- chain nonce;
- one-time replay token;
- consumed approval state;
- consumed mandate reservation;
- idempotency key;
- expiration.

The signer shall record consumption atomically where feasible.

---

## 22. Approval Consumption

For one-time A2 approval:

```
APPROVED
  ↓
SIGNING_REQUEST_ACCEPTED
  ↓
APPROVAL_CONSUMED
```

A consumed approval cannot authorize a second signing request unless policy explicitly marks it reusable.

Reusable approvals are prohibited by default.

---

## 23. Mandate Reservation

For A3/A4:

```
Mandate Evaluation PASS
  ↓
Usage Reservation
  ↓
Signing
  ↓
Execution
  ↓
Usage Finalization
```

If execution is unknown, the reservation remains active.

---

## 24. Signing Gateway Validation Order

The Signing Gateway shall evaluate in this order:

1. request schema;
2. request freshness;
3. service caller authorization;
4. action ID/version;
5. action contract hash;
6. material terms hash;
7. device/runtime eligibility;
8. authority class;
9. approval or mandate validity;
10. policy result;
11. Trust Protocol result;
12. REV result;
13. payload type;
14. payload hash;
15. chain-specific semantics;
16. replay/idempotency state;
17. signer-key eligibility;
18. evidence reservation where required.

Failure at any mandatory step blocks signing.

---

## 25. Caller Restrictions

Only explicitly authorized control-plane services may invoke the Signing Gateway.

Prohibited callers include:

- model runtime;
- SERA conversational model;
- external gateway;
- WalletConnect peer;
- chain adapter;
- news/intelligence service;
- SAEL Query service;
- SERA State Service.

---

## 26. Key Selection

Signer key selection must be deterministic based on:

- holder wallet/account;
- chain;
- key policy;
- device/security domain;
- action type.

The caller may request a key class but may not supply arbitrary secret key material.

---

## 27. Key Isolation

Soul ID and SERA signing keys are portable and DID-bound rather than hardware-bound.

Encrypted key material may be persisted through IPFS/content-addressed storage under the SoulScan-authorized recovery model.

Required controls:

- plaintext private keys are never published to IPFS;
- plaintext private keys are never persisted in PostgreSQL, SAEL or logs;
- the active encrypted key object is selected through a signed DID-bound key manifest;
- SoulScan authorizes/reconstructs access to the recovery path;
- recovered plaintext key material exists only within the controlled signing runtime for the bounded operation;
- the Signing Gateway receives an opaque key reference and returns a signature or signed payload, never raw private key material;
- hardware-backed storage may be used as an optional local protection/cache layer but is not the custody or recovery root.

SERA follows the same model as Soul ID, while remaining subordinate to its Holder DID governance and current Trust/REV/authority controls.

---

## 28. Authentication Freshness

Where authentication is required, signer shall validate:

- authentication reference;
- assurance level;
- Device ID;
- issue time;
- expiry;
- action binding where supported.

Authentication from one device cannot be reused by another device unless an explicit cross-device authorization protocol permits it.

---

## 29. Signer Result

```json
{
  "schema": "ssw.signing-result.v1",
  "signing_request_id": "uuid",
  "action_id": "uuid",
  "status": "SIGNED|REJECTED",
  "signed_payload_ref": "signed:uuid|null",
  "signed_payload_hash": "sha256:...|null",
  "key_ref": "keyref:opaque|null",
  "reason_codes": [],
  "signed_at": "RFC3339|null",
  "sael_event_ref": "sael-event:uuid"
}
```

---

## 30. Canonical Rejection Codes

- SIGNING_REQUEST_SCHEMA_INVALID
- SIGNING_REQUEST_EXPIRED
- CALLER_NOT_AUTHORIZED
- ACTION_VERSION_MISMATCH
- ACTION_HASH_MISMATCH
- MATERIAL_TERMS_HASH_MISMATCH
- DEVICE_NOT_ELIGIBLE
- RUNTIME_NOT_ELIGIBLE
- APPROVAL_INVALID
- APPROVAL_EXPIRED
- APPROVAL_CONSUMED
- MANDATE_INVALID
- MANDATE_SCOPE_MISMATCH
- MANDATE_RESERVATION_MISSING
- POLICY_FAILED
- TRUST_PROTOCOL_FAILED
- TRUST_PROTOCOL_EXPIRED
- REV_FAILED
- REV_EXPIRED
- PAYLOAD_HASH_MISMATCH
- UNSUPPORTED_PAYLOAD_TYPE
- CHAIN_SEMANTICS_INVALID
- REPLAY_DETECTED
- IDEMPOTENCY_CONFLICT
- KEY_NOT_ELIGIBLE
- EVIDENCE_RESERVATION_FAILED

---

## 31. Evidence Reservation

For R4/R5 and policy-selected actions, the signer may require SAEL evidence reservation before signing.

Reference flow:

```
SAEL reserve lineage
  ↓
Signer validates
  ↓
Signer signs
  ↓
SAEL SIGNING.COMPLETED
```

If evidence reservation fails and policy marks it mandatory, signing fails closed.

---

## 32. Hash Domain Separation

Hashes used for different semantic purposes shall include explicit domain separation.

Examples:

```
SSW:ACTION:V1
SSW:MATERIAL_TERMS:V1
SSW:MANDATE:V1
SSW:SIGNING_PAYLOAD:EVM:V1
SSW:SAEL:EVENT:V1
```

Conceptually:

```
hash = SHA256(domain_tag || 0x00 || canonical_bytes)
```

This prevents cross-object hash confusion.

---

## 33. String and Identifier Normalization

Security-sensitive identifiers shall use canonical representations.

Examples:

- DIDs normalized per DID method rules;
- EVM addresses normalized to canonical binary form before hashing;
- chain IDs normalized as decimal strings or integers by schema;
- token amounts normalized to atomic integer strings;
- timestamps normalized to UTC RFC3339;
- asset contract addresses bound with chain ID.

Display formatting is never authoritative.

---

## 34. Numeric Safety

Financial amounts shall not use floating-point arithmetic.

Use:

- atomic integer representation;
- arbitrary precision integer;
- explicit decimals metadata.

Example:

```json
{
  "atomic": "50000000",
  "decimals": 6
}
```

The signer validates atomic values only.

---

## 35. Null and Optional Field Semantics

Schemas shall distinguish:

- absent field;
- explicit null;
- empty value.

Security-critical fields must not depend on ambiguous null semantics.

Optional fields included in hashes must have documented canonical treatment.

---

## 36. Schema Versioning

Every hashed object includes a schema/version discriminator.

Example:

```
ssw.action-contract.v1
```

A version change may alter canonicalization or field inclusion only through a controlled migration.

---

## 37. Backward Compatibility

The signer may support multiple schema versions concurrently only if:

- each version has a complete validation profile;
- hash domain separation includes version;
- deprecated versions have sunset policy;
- no downgrade attack is possible.

Clients may not choose weaker legacy versions after policy disables them.

---

## 38. Downgrade Protection

Signing requests shall carry required minimum schema/security profile.

The signer rejects requests attempting:

- older hash algorithm;
- older mandate schema;
- weaker device profile;
- weaker authentication profile;
- weaker Trust/REV binding.

---

## 39. Idempotency Semantics

If the exact same signing request is retried with the same idempotency key:

- signer may return the same prior result;
- signer must not create an unrelated second signature if that would alter nonce or authorization semantics.

If same idempotency key appears with different payload hash:

- reject with IDEMPOTENCY_CONFLICT.

---

## 40. Nonce Management

Nonce management is chain-specific.

For account-based chains:

- nonce source must be authoritative enough for policy;
- pending transactions considered;
- duplicate nonce use prevented;
- uncertain execution handled before nonce reuse.

For non-account chains, equivalent replay controls apply.

---

## 41. Transaction Replacement

Where chain semantics permit replacement transactions:

- replacement policy must be explicit;
- recipient/value/data must remain unchanged unless re-approved;
- fee-only replacement may be allowed inside bounded policy;
- replacement gets separate execution evidence.

---

## 42. Adapter Verification

Before submission, Execution Router or adapter should verify:

- signed payload hash;
- signer result reference;
- action ID;
- chain;
- expected recipient/contract;
- no mutation.

Adapters may not reserialize in a way that changes signed semantics.

---

## 43. Post-Sign Verification

Where possible, signed payload shall be decoded back into semantic fields and compared to the Action Contract before submission.

This is a defense-in-depth control.

Any mismatch blocks execution.

---

## 44. Cross-Device Signing

If review occurs on one device and signing on another:

- handoff binds terms hash;
- target device independently qualifies;
- target authentication freshness applies;
- approval remains valid only if policy permits cross-device signing.

Cross-device use never means source-device trust is inherited.

---

## 45. Offline Signing

Offline signing is permitted only under a pre-existing offline policy profile.

It must specify:

- allowed action classes;
- device state;
- mandate/approval requirements;
- cached Trust/REV or offline assurance;
- freshness;
- nonce/replay protections;
- maximum value;
- reconciliation.

AI may not infer offline signing authority.

---

## 46. Signing Gateway Availability Failure

If Signing Gateway is unavailable:

- action remains prepared;
- approval/mandate validity continues only until normal expiry;
- no alternate uncontrolled signer may be used;
- holder receives safe degraded-state message.

Availability failure must not widen signing options.

---

## 47. Compromise Response

If Signing Gateway compromise is suspected:

- disable new signing;
- rotate service credentials;
- suspend affected key classes;
- require fresh device/authentication checks;
- preserve SAEL evidence;
- reconcile recently signed payloads;
- potentially revoke affected runtimes/mandates by policy.

---

## 48. Audit Requirements

SAEL shall record:

- SIGNING.REQUESTED;
- SIGNING.REJECTED;
- SIGNING.COMPLETED;
- approval/mandate reference;
- terms hash;
- payload hash;
- Device ID;
- Runtime ID;
- key reference identifier;
- reason codes;
- timestamp.

Private key material is never logged.

---

## 49. Threat Model Gaps Closed

This specification materially closes:

- **SG-01 Canonical JSON serialization**
- **SG-02 Signing-gateway verification profile**

It also strengthens:

- SG-07 Trust/REV binding;
- replay/idempotency controls;
- payload substitution controls.

---

## 50. Open Implementation Items

Still required:

- exact RFC 8785 library/profile selection;
- chain-specific payload schemas;
- signer implementation architecture;
- key-provider abstraction;
- HSM/MPC/Secure Enclave integration;
- nonce service;
- offline signing profile;
- post-sign decoder;
- schema registry;
- migration compatibility tests.

---

## 51. Conformance Tests

Minimum tests shall include:

1. same semantic object hashes identically across supported platforms;
2. different material term changes produce different hashes;
3. property ordering does not change hash;
4. display formatting does not change atomic amount hash;
5. approval for version N fails on version N+1;
6. expired REV fails;
7. revoked device fails;
8. altered recipient fails;
9. altered amount fails;
10. altered calldata fails;
11. duplicate replay token fails;
12. reused consumed approval fails;
13. idempotency-key/payload mismatch fails;
14. cross-device mismatch fails;
15. free-form natural language signing request fails.

---

## 52. Controlled Statement

The signing boundary is the final cryptographic guard between intelligent preparation and irreversible action.

SERA may help determine what should happen.

The signer must prove that what is about to happen is exactly what was authorized.
