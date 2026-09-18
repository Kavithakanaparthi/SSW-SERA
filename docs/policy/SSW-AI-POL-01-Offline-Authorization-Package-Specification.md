# SSW-AI-POL-01: Offline Authorization Package Specification

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-POL-01  
**Status:** Controlled Security Specification  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-CF-A01, SSW-AI-TM-01, SSW-AI-ISC-02, ISC-03, ISC-04, ISC-06, API-01, API-02  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

This specification defines the Offline Authorization Package (OAP), the only valid mechanism by which a SERA-first Soul Super Wallet may continue narrowly scoped consequential actions when live Trust Protocol or REV evaluation is unavailable.

The governing rule is:

> Offline operation may preserve previously granted authority. It may never create, infer, widen, renew or reinterpret authority.

## 2. Default Rule

If live Trust Protocol or REV is mandatory under current policy and unavailable, the default outcome is fail closed.

An offline exception is valid only when a pre-existing, signed, machine-readable OAP explicitly permits the action.

## 3. OAP Characteristics

An OAP must be:

- created before the outage;
- holder-authorized where holder authority is required;
- policy-approved;
- signed;
- versioned;
- time-bounded;
- device-bound;
- runtime-bound where required;
- action-family bounded;
- asset and chain bounded;
- counterparty bounded where relevant;
- value bounded;
- risk bounded;
- replay protected;
- usage counted;
- reconciliation required.

## 4. OAP Does Not Create Authority

The OAP may reference:

- A2 approval model;
- A3 bounded delegation;
- A4 conditional autonomy.

It cannot create:

- A5 authority;
- unrestricted wallet signing;
- arbitrary new counterparties;
- arbitrary new chains;
- arbitrary new assets;
- self-renewing mandates.

## 5. Canonical Offline Authorization Package

The canonical machine object is defined in:

`contracts/json-schema/ssw-offline-authorization-package.v1.schema.json`

Required domains include:

- package identity;
- holder/SERA identity;
- issuance and expiry;
- authority classes;
- maximum risk class;
- device/runtime scope;
- capabilities/action types;
- asset/chain scope;
- counterparty scope;
- value/frequency/cumulative limits;
- freshness constraints;
- trust/REV substitution basis;
- replay protection;
- usage counters;
- reconciliation rules;
- integrity/signature.

## 6. Authority Scope

Permitted authority classes are:

- A1
- A2
- A3
- A4

A0 does not require offline authorization.

A5 is prohibited.

For A2, the holder must still explicitly approve the action unless the approval was already validly created and remains bound to unchanged material terms.

For A3/A4, the referenced mandate must remain active and within scope.

## 7. Risk Ceiling

An OAP must define `max_risk_class`.

Recommended baseline:

- R0-R2 may be eligible for broader offline support.
- R3 may be eligible only under narrow policy.
- R4 should be exceptional and heavily constrained.
- R5 offline execution is prohibited.

The actual policy is implementation-controlled, but the package must state the ceiling.

## 8. Device Constraints

An OAP shall bind to explicit device eligibility.

At minimum:

- allowed Device IDs or approved device class;
- minimum device trust state;
- attestation freshness threshold;
- compromise/revocation check when connectivity returns.

REVOKED and SUSPENDED devices are never eligible.

## 9. Runtime Constraints

Where runtime participation matters, the OAP shall define:

- allowed Runtime IDs or classes;
- minimum runtime state;
- allowed runtime capabilities.

Protected cloud reasoning runtime does not gain offline signing authority merely because an OAP exists.

## 10. Action Scope

OAP action scope shall be explicit.

Examples:

- payment.send
- credential.present
- transit.tap
- merchant.pay
- emergency.lock

Wildcard action scope is prohibited by default.

## 11. Asset and Chain Scope

For financial actions, OAP shall define:

- allowed asset identifiers;
- allowed chain identifiers;
- token contract where relevant;
- maximum per-action value;
- maximum cumulative value.

## 12. Counterparty Scope

The package may restrict execution to:

- canonical DID;
- canonical wallet address;
- merchant identifier;
- organization identifier;
- pre-approved counterparty set.

Aliases are not authoritative identifiers.

## 13. Value Limits

Financial limits must use atomic integer values.

Required controls may include:

- per-action maximum;
- cumulative window maximum;
- frequency maximum;
- daily/weekly rolling limit.

No floating-point arithmetic is permitted.

## 14. Freshness

An OAP shall define freshness constraints for:

- package age;
- device attestation;
- mandate evaluation;
- policy snapshot;
- cached trust state where applicable.

Expired freshness makes the package unusable.

## 15. Trust Protocol / REV Substitution Basis

The package does not fabricate a Trust Protocol or REV PASS.

Instead, it declares a pre-authorized fallback basis.

Example categories:

- TRUST_PREAUTHORIZED_OFFLINE
- REV_PREAUTHORIZED_OFFLINE
- LOCAL_POLICY_ONLY

Consumers must be able to distinguish live PASS from offline fallback.

## 16. Replay Protection

An OAP shall include replay controls.

Possible controls:

- one-time tokens;
- monotonic local counters;
- nonce windows;
- usage reservations;
- action hashes;
- idempotency keys.

Offline actions must not be repeatable merely by replaying the same package.

## 17. Usage Accounting

Every offline action consumes package capacity.

Usage may track:

- number of actions;
- cumulative value;
- per-counterparty totals;
- last-used timestamp;
- remaining allowance.

Counters must be tamper-evident and reconciled.

## 18. Local Evidence

Offline actions must generate local SAEL-compatible evidence.

Minimum:

- OAP ID/version;
- action ID;
- material terms hash;
- Device ID;
- Runtime ID;
- authority class;
- risk class;
- usage counter;
- local timestamp;
- execution result;
- reconciliation state.

## 19. Reconciliation

When connectivity returns:

1. upload local SAEL evidence;
2. validate OAP signature and version;
3. validate usage counters;
4. reconcile external execution result;
5. reconcile mandate usage;
6. re-evaluate device/runtime state;
7. check Trust Protocol/REV if policy requires post-event assessment;
8. detect duplicates/conflicts;
9. close or quarantine action.

## 20. Conflict Handling

If offline evidence conflicts with server state:

- do not discard either record;
- mark reconciliation conflict;
- freeze affected remaining allowance;
- require investigation or deterministic resolution.

Last-write-wins is prohibited.

## 21. Package Suspension

An OAP may be suspended by:

- holder emergency lock;
- device suspension;
- mandate suspension;
- compromise signal;
- package-level kill state.

If the device has not yet received the suspension, the package may remain technically usable offline. Therefore package limits and expiry must be conservative.

## 22. Package Expiry

Expiry is mandatory.

OAPs shall not be perpetual.

A new package requires fresh issuance and authorization.

Self-renewal is prohibited.

## 23. Emergency Controls

Emergency controls may reduce authority offline.

Examples:

- lock wallet;
- suspend local autonomy;
- disable selected package.

Emergency controls may not increase authority.

## 24. Offline Credential Presentation

Credential presentation may be permitted under OAP where:

- verifier scope is bounded;
- proof type is allowed;
- disclosure scope is fixed;
- credential remains valid;
- challenge/replay rules are satisfied.

Unknown verifier + sensitive claims should fail closed unless explicitly covered.

## 25. Offline Financial Execution

Offline financial execution should be restricted to environments with deterministic settlement assumptions.

Examples may include:

- pre-authorized terminal flows;
- pre-funded bounded instruments;
- offline-capable payment rails;
- later-broadcast signed transactions where nonce/replay safety is preserved.

Ordinary chain execution still requires network access.

## 26. Unknown Execution

If network status is uncertain after offline submission or delayed broadcast:

- mark EXECUTION_STATUS_UNKNOWN;
- preserve usage reservation;
- do not retry automatically;
- reconcile before reuse.

## 27. OAP Integrity

The OAP must be canonically serialized and hashed using ISC-02.

Required integrity fields:

- package hash;
- issuer/signing profile;
- signature reference;
- issued_at;
- expires_at;
- policy version.

## 28. OAP Issuance

Issuance requires:

- eligible device/runtime;
- current policy;
- holder authorization when authority is holder-derived;
- active mandate where A3/A4 is used;
- fresh Trust/REV if issuance policy requires;
- SAEL event.

## 29. OAP Revocation

Online revocation shall:

- mark package revoked centrally;
- notify active devices;
- revoke related privileged sessions where appropriate;
- generate SAEL evidence.

Offline device enforcement begins when revocation state reaches the device unless local emergency state already blocks it.

## 30. Machine Schema

The machine schema SHALL reject:

- A5;
- R5 max risk;
- perpetual packages;
- missing expiry;
- unrestricted wildcard scope where prohibited;
- floating-point financial values;
- missing replay controls;
- missing integrity fields.

## 31. Error Codes

Canonical OAP errors include:

- OAP_NOT_FOUND
- OAP_EXPIRED
- OAP_REVOKED
- OAP_DEVICE_NOT_ALLOWED
- OAP_RUNTIME_NOT_ALLOWED
- OAP_ACTION_NOT_ALLOWED
- OAP_ASSET_NOT_ALLOWED
- OAP_CHAIN_NOT_ALLOWED
- OAP_COUNTERPARTY_NOT_ALLOWED
- OAP_VALUE_LIMIT_EXCEEDED
- OAP_FREQUENCY_LIMIT_EXCEEDED
- OAP_RISK_LIMIT_EXCEEDED
- OAP_REPLAY_DETECTED
- OAP_USAGE_CONFLICT
- OAP_RECONCILIATION_REQUIRED
- OAP_SIGNATURE_INVALID

## 32. Threat Model Gap Closure

This specification materially closes:

**SG-04 Offline policy package**

## 33. Conformance Tests

Minimum tests:

1. package without expiry fails;
2. A5 package fails;
3. R5 ceiling fails;
4. revoked device fails;
5. unauthorized runtime fails;
6. unsupported action fails;
7. wrong asset fails;
8. wrong chain fails;
9. wrong counterparty fails;
10. per-action limit exceeded fails;
11. cumulative limit exceeded fails;
12. replayed action fails;
13. expired package fails;
14. tampered package signature fails;
15. unknown execution preserves allowance reservation;
16. reconciliation conflict freezes remaining affected allowance.

## 34. Exit Criteria

POL-01 advances when:

- schema validates;
- OAP issuance is defined in API layer;
- signer consumes OAP only through validated control path;
- local usage counters are tamper-evident;
- reconciliation is implemented;
- revocation propagation is tested;
- offline SAEL evidence is preserved.

## 35. Controlled Statement

Offline operation is not permission to improvise.

It is a pre-authorized corridor with hard walls.

When live trust infrastructure disappears, the system may continue only inside those walls.
