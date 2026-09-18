

---

## SOURCE 41
**Path:** `docs/implementation/SSW-AI-ISC-06-Recovery-State-Restore-and-Runtime-Rebinding-Contract.md`  
**Blob SHA:** `1d0d876aa96521b9aa6f512668a1a3c8c2037dba`

# SSW-AI-ISC-06: Recovery, State Restore & Runtime Rebinding Contract

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-ISC-06  
**Status:** Controlled Draft  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-01, SSW-AI-02, SSW-AI-CF-A01, SSW-AI-SCH-01 through SSW-AI-SCH-05, SSW-AI-TM-01, SSW-AI-ISC-01 through SSW-AI-ISC-05  
**Repository:** Kavithakanaparthi/SSW-SERA

---

## 1. Purpose

This specification defines the recovery contract for restoring Soul Super Wallet and SERA continuity after device loss, reinstall, compromise, migration or holder-initiated recovery.

Soul Super Wallet is identity-bound, not device-bound. The holder recovers the Holder Soul ID through the SoulScan facial-biometric recovery mechanism and may establish the wallet on a new device without possession of the former device. SERA recovery occurs inside that recovered Holder DID wallet context.

The governing invariants are:

> Soul ID recovery restores the holder's wallet identity context.

> SERA recovery restores the holder-bound agent identity and portable state inside that wallet context.

> Recovery of SERA state or keys alone does not create wallet authority.

The recovery path must preserve the separation between:

- Holder DID;
- SERA Agent DID;
- SERA portable state;
- Device ID;
- Runtime ID;
- mandates;
- signing authority;
- SAEL evidence.

---

## 2. Scope

This specification defines:

- holder recovery initiation;
- recovery authentication;
- SERA Agent DID resolution;
- state-manifest retrieval;
- state-bundle verification;
- encrypted state restore;
- rollback detection;
- device registration;
- runtime registration;
- authority re-establishment;
- mandate handling;
- device revocation preservation;
- session invalidation;
- recovery-mode restrictions;
- recovery evidence;
- failure handling;
- compromise response;
- cross-device migration.

It does not define final social-recovery, guardian-recovery or legal recovery policy for Soul ID itself.

---

## 3. Recovery Triggers

Recovery may be initiated after:

- lost device;
- stolen device;
- device replacement;
- factory reset;
- wallet reinstall;
- compromised runtime;
- compromised device;
- operating-system migration;
- app migration;
- holder-requested SERA reset;
- state corruption;
- cloud/storage outage with alternate archive restore.

---

## 4. Recovery Modes

Canonical modes:

- DEVICE_REPLACEMENT
- DEVICE_LOSS
- DEVICE_COMPROMISE
- RUNTIME_REINSTALL
- SERA_STATE_RESTORE
- SERA_RESET
- FULL_WALLET_RECOVERY
- CONTROLLED_MIGRATION

Each mode carries different authority restrictions.

---

## 5. Recovery State Machine

```
NOT_STARTED
   ↓
RECOVERY_INITIATED
   ↓
SOUL_ID_BIOMETRIC_RECOVERY
   ↓
HOLDER_DID_RECOVERED
   ↓
WALLET_CONTEXT_ESTABLISHED
   ↓
SERA_DID_RESOLVED
   ↓
STATE_MANIFEST_VERIFIED
   ↓
STATE_BUNDLE_VERIFIED
   ↓
STATE_RESTORED
   ↓
DEVICE_REGISTERED
   ↓
RUNTIME_REGISTERED
   ↓
TRUST_REESTABLISHED
   ↓
AUTHORITY_REESTABLISHED
   ↓
RECOVERY_COMPLETED
```

Failure at any stage moves to:

```
RECOVERY_FAILED
```

or:

```
RECOVERY_SUSPENDED
```

for investigation.

---

## 6. Canonical Recovery Session

```json
{
  "schema": "ssw.recovery-session.v1",
  "recovery_id": "uuid",
  "mode": "DEVICE_REPLACEMENT",
  "holder_did": "did:soul:...",
  "sera_agent_did": "did:soul:agent:...",
  "source_device_id": "device:old|null",
  "target_device_id": "device:new|null",
  "target_runtime_id": "sera-runtime:new|null",
  "state": "RECOVERY_INITIATED",
  "started_at": "RFC3339",
  "expires_at": "RFC3339",
  "risk_class": "R5",
  "authority_class": "A5",
  "auth_ref": null,
  "sael_correlation_id": "uuid"
}
```

Recovery is R5/A5 by default.

---

## 7. Holder Authentication

Before SERA state restore or runtime rebinding, the holder must establish the Holder Soul ID wallet context.

For Soul Super Wallet, the canonical recovery path is SoulScan facial-biometric recovery of the holder's Soul ID. This recovery is designed to work on a replacement device and does not depend on possession of the prior device.

Additional authentication or security controls may be required by policy for high-risk operations, but a surviving trusted device is not the root proof of wallet ownership.

The recovery runtime shall never treat possession of encrypted SERA state, SERA keys, or a Device ID as holder authentication.

---

## 8. SERA Agent DID Resolution

After Soul ID biometric recovery:

1. recover/resolve the Holder DID;
2. establish Soul Super Wallet under that Holder DID;
3. resolve the SERA Agent DID recorded as governed by that Holder DID;
4. verify the holder-to-SERA governance binding in both the recovered wallet context and SERA identity record;
5. validate current DID state;
6. verify SERA Agent DID is not revoked/replaced.

SERA keys recovered independently are inert for consequential wallet operations unless this same Holder DID binding and wallet context are present.

The system must distinguish:

- SERA Agent DID;
- old Runtime IDs;
- old Device IDs.

Resolving the SERA Agent DID does not restore old runtime authority.

---

## 9. State Manifest Retrieval

Recovery shall retrieve the latest valid SERA State Manifest.

Expected fields include:

- holder DID;
- SERA Agent DID;
- state version;
- previous state CID;
- current state CID;
- encryption profile;
- schema version;
- created_at;
- signature reference.

---

## 10. State Manifest Verification

Before bundle retrieval:

- verify manifest signature;
- verify holder DID binding;
- verify SERA Agent DID binding;
- verify schema version;
- verify state-version monotonicity;
- verify current manifest status;
- check revocation/replacement;
- validate lineage.

A manifest that cannot be verified shall not be used.

---

## 11. Rollback Detection

Recovery shall detect attempts to restore older state.

Possible indicators:

- lower state_version;
- manifest not current;
- previous-state lineage mismatch;
- stale checkpoint;
- superseded manifest signature.

Rollback may be allowed only under explicit recovery policy.

Rollback never restores historical authority.

---

## 12. State Bundle Retrieval

After manifest validation:

```
Current State CID
  ↓
Retrieve encrypted bundle
  ↓
Verify CID
  ↓
Verify archive/container integrity
  ↓
Authenticate decryption
  ↓
Decrypt approved state compartments
```

Storage provider response is not trusted without cryptographic verification.

---

## 13. Portable State Restore

Portable state may restore:

- language preferences;
- aliases;
- pronunciation;
- notification preferences;
- concealment preferences;
- approved memory;
- wallet-context preferences;
- non-secret automation preferences;
- selected personalization.

Portable state must not restore:

- wallet private keys;
- seed phrases;
- raw recovery secrets;
- raw biometric templates;
- old runtime sessions;
- revoked Device IDs;
- expired/revoked mandates;
- unrestricted signing handles.

---

## 14. Compartment Restore

State restore should be compartmentalized.

Example compartments:

- preferences;
- language;
- voice adaptation;
- aliases;
- notifications;
- concealment;
- memory;
- non-secret automation preferences.

Recovery policy may restore compartments selectively.

---

## 15. Device Registration After Wallet Recovery

Device registration occurs **after or alongside establishment of the Holder DID wallet context**. It is an execution-security control, not a wallet-ownership control.

A newly used device begins as:

```
UNREGISTERED
```

and may progress through:

```
UNREGISTERED
  ↓
REGISTERED
  ↓
ATTESTED
  ↓
TRUSTED or LIMITED
```

The holder can still recover Soul Super Wallet on that new device through Soul ID facial biometrics before the device becomes highly trusted for consequential operations.

SCH-03 remains authoritative for device assurance.

---

## 16. Runtime Registration During Recovery

The recovery runtime is temporary.

After device establishment:

- register production Runtime ID;
- bind to SERA Agent DID;
- bind to Device ID;
- attest runtime;
- evaluate eligibility;
- terminate temporary recovery runtime where applicable.

Old runtime session tokens are invalid.

---

## 17. Runtime Rebinding

A new Runtime ID may bind to the same persistent SERA Agent DID only after:

- holder recovery authentication;
- valid device registration;
- runtime attestation;
- runtime key establishment;
- runtime registry approval.

SERA Agent DID continuity does not imply Runtime ID continuity.

---

## 18. Device Revocation Preservation

Recovery must preserve terminal revocations.

If old device is REVOKED:

- it remains REVOKED;
- it is not imported from portable state as active;
- its sessions remain invalid;
- its runtime remains revoked/suspended according to policy;
- SAEL history remains.

---

## 19. Device Suspension During Uncertain Loss

For DEVICE_LOSS mode:

- source device should be SUSPENDED immediately where possible;
- delegated execution may pause;
- high-risk sessions revoke;
- holder may later choose REVOKE or RESTORE.

Restoration requires strong revalidation.

---

## 20. Compromise Recovery

For DEVICE_COMPROMISE:

Default actions:

- revoke Device ID;
- revoke Runtime IDs;
- revoke sessions;
- suspend/revoke device-bound mandates;
- rotate runtime credentials;
- review recent SAEL activity;
- consider wallet key rotation under separate wallet-security policy;
- establish new trusted device.

Compromised device IDs do not reactivate.

---

## 21. Mandate Handling

Mandates are separate authority-domain objects.

During recovery:

- A3/A4 execution should pause by default;
- mandates remain historically visible;
- active status must be revalidated;
- device-bound mandates may become ineligible;
- revoked/expired mandates never reactivate;
- portable-state references do not override mandate service.

---

## 22. Authority Re-Establishment

Authority is restored gradually.

Suggested sequence:

1. A0 informational access;
2. A1 prepare/retrieve;
3. A2 explicit approval after trust re-establishment;
4. A3 mandate use after mandate/device validation;
5. A4 conditional autonomy only after stronger post-recovery checks;
6. A5 remains direct-holder only.

Recovery should reduce authority before restoring it.

---

## 23. Signing Re-Establishment

Signing eligibility requires:

- eligible Device ID;
- eligible Runtime ID;
- valid runtime session;
- signer-key availability;
- current authentication;
- policy pass;
- action-specific Trust Protocol/REV;
- any required post-recovery waiting or step-up controls.

State restore alone never restores signing.

---

## 24. Session Reset

Recovery invalidates or re-evaluates:

- old runtime sessions;
- device-bound sessions;
- privileged session tokens;
- approval-grant sessions;
- signing-request sessions.

New sessions are issued only under ISC-04.

---

## 25. Approval Handling

Prior approvals should not generally survive full recovery.

Default:

- pending approvals -> INVALIDATED;
- action remains inspectable;
- holder may re-review/re-approve.

This avoids reuse of stale approval context after trust reset.

---

## 26. Trust Protocol / REV After Recovery

Consequential actions after recovery require fresh Trust Protocol/REV where policy requires.

Old PASS decisions are invalid because:

- device context changed;
- runtime changed;
- recovery context changed;
- policy may require elevated scrutiny.

---

## 27. Recovery Risk Window

The platform may enter a temporary post-recovery elevated-risk window.

Controls may include:

- reduced value limits;
- A3/A4 paused;
- stronger authentication;
- fresh Trust/REV every action;
- high-risk action delay;
- enhanced notifications.

The exact window is policy-defined.

---

## 28. Cross-Device Controlled Migration

For planned migration, possession of the old device is convenient but not required for wallet continuity.

Canonical path:

```
Holder recovers/authenticates Soul ID
  ↓
Soul Super Wallet context established on target device
  ↓
SERA Agent DID governance binding verified
  ↓
Portable SERA state restored
  ↓
Target runtime registers
  ↓
Target device/runtime assurance evaluated
  ↓
Action authority re-established according to policy
  ↓
Old device optionally retained, LIMITED, SUSPENDED or REVOKED
```

If both devices are available, the old device may assist the migration, but it is never the ownership root.

---

## 29. SERA Reset

A holder may reset SERA personalization while preserving wallet identity and evidence.

Reset may:

- clear selected portable memory;
- create new state bundle;
- optionally preserve same SERA Agent DID;
- revoke old runtime sessions;
- preserve SAEL.

A more radical reset may create a new SERA Agent DID under separate controlled process.

---

## 30. SERA Agent Replacement

If holder chooses new SERA Agent DID:

- old SERA Agent DID archived/revoked according to policy;
- selected portable state may transfer;
- mandates must be reissued;
- SAEL preserves old/new lineage;
- no authority silently transfers.

---

## 31. Recovery Evidence

SAEL shall record:

- RECOVERY.INITIATED
- RECOVERY.HOLDER_AUTHENTICATED
- RECOVERY.SERA_DID_RESOLVED
- RECOVERY.STATE_MANIFEST_VERIFIED
- RECOVERY.STATE_BUNDLE_VERIFIED
- RECOVERY.STATE_RESTORED
- RECOVERY.DEVICE_REGISTERED
- RECOVERY.RUNTIME_REGISTERED
- RECOVERY.TRUST_REESTABLISHED
- RECOVERY.AUTHORITY_REESTABLISHED
- RECOVERY.COMPLETED
- RECOVERY.FAILED
- RECOVERY.SUSPENDED

---

## 32. Recovery Event Payload

Example:

```json
{
  "recovery_id": "uuid",
  "mode": "DEVICE_REPLACEMENT",
  "holder_did": "did:soul:...",
  "sera_agent_did": "did:soul:agent:...",
  "source_device_id": "device:old",
  "target_device_id": "device:new",
  "stage": "STATE_RESTORED",
  "status": "PASS",
  "reason_codes": []
}
```

Sensitive recovery secrets are never stored.

---

## 33. Recovery Failure Codes

Canonical codes:

- HOLDER_AUTH_FAILED
- SERA_DID_NOT_FOUND
- SERA_DID_RELATIONSHIP_INVALID
- STATE_MANIFEST_NOT_FOUND
- STATE_MANIFEST_SIGNATURE_INVALID
- STATE_MANIFEST_ROLLBACK_DETECTED
- STATE_CID_MISMATCH
- STATE_BUNDLE_CORRUPT
- STATE_DECRYPTION_FAILED
- DEVICE_REGISTRATION_FAILED
- DEVICE_ATTESTATION_FAILED
- RUNTIME_REGISTRATION_FAILED
- RUNTIME_ATTESTATION_FAILED
- AUTHORITY_REESTABLISHMENT_BLOCKED
- MANDATE_REVALIDATION_FAILED
- SIGNING_NOT_ELIGIBLE
- RECOVERY_POLICY_DENY

---

## 34. State Restore Conflict

If local and remote portable state versions conflict:

- compare signed manifests;
- prefer authoritative current manifest;
- preserve conflict evidence;
- do not merge authority-bearing data;
- allow holder review for non-authoritative personalization conflicts.

---

## 35. Cloud Replica Failure

If cloud replica unavailable:

- attempt content-addressed archive;
- attempt alternate encrypted replica;
- attempt local export/import if available.

Cloud availability is not identity continuity.

---

## 36. IPFS / Content-Addressed Failure

If one CID source unavailable:

- retrieve from redundant pin/archive provider;
- verify CID;
- do not accept a differently hashed replacement as equivalent.

---

## 37. Recovery Without Portable State

If SERA portable state is unavailable but the Holder Soul ID is recoverable through SoulScan facial biometrics:

- Soul Super Wallet can still be restored under the Holder DID;
- wallet ownership and continuity are not lost with the device or SERA state bundle;
- wallet may create fresh SERA state;
- SERA Agent DID may remain or be re-established per policy;
- personalization may be lost;
- SAEL remains separate;
- portable SERA memory is never the authority root.

---

## 38. Recovery Without SAEL Availability

If SAEL temporarily unavailable:

- recovery may proceed only to the level allowed by policy;
- high-risk authority re-establishment may block;
- local durable recovery evidence should queue;
- evidence reconciles when SAEL returns.

---

## 39. Offline Recovery

Offline recovery is highly constrained.

It may support:

- local state inspection;
- limited deterministic restoration;
- emergency device lockdown;
- local credential access where policy permits.

It should not restore high-risk signing or A3/A4 autonomy without required online trust checks unless a pre-existing offline recovery profile exists.

---

## 40. Recovery Service API

### Start recovery

`POST /recovery/sessions`

### Authenticate holder

`POST /recovery/{id}/authenticate`

### Resolve SERA identity

`POST /recovery/{id}/resolve-sera`

### Restore state

`POST /recovery/{id}/restore-state`

### Register device/runtime

`POST /recovery/{id}/register-target`

### Re-establish authority

`POST /recovery/{id}/reestablish-authority`

### Complete

`POST /recovery/{id}/complete`

---

## 41. Recovery API Guardrails

Recovery Service may coordinate, but cannot:

- directly sign wallet transactions;
- create mandates;
- reactivate revoked devices;
- bypass attestation;
- revive expired approvals;
- override REV;
- grant unlimited authority.

---

## 42. Recovery Session Expiry

Recovery sessions must be time-limited.

Expired sessions:

- cannot continue;
- require re-authentication;
- preserve evidence;
- revoke temporary recovery credentials.

---

## 43. Recovery Session Binding

Recovery session binds to:

- holder DID;
- SERA Agent DID;
- recovery mode;
- target Device ID where known;
- target Runtime ID where known;
- authentication reference;
- validity window.

A recovery session cannot be reused for another holder or SERA Agent DID.

---

## 44. Step-Up During Recovery

Sensitive stages may require step-up authentication:

- manifest decryption;
- device promotion;
- signing reactivation;
- mandate reactivation;
- recovery completion.

---

## 45. Post-Recovery Review

The holder should receive a post-recovery summary:

- restored device;
- revoked/suspended old devices;
- new runtime;
- mandates active/suspended;
- sessions reset;
- state version restored;
- recent security events;
- recommended review items.

The summary derives from structured recovery evidence.

---

## 46. Security Invariants

1. Soul Super Wallet ownership and continuity are anchored to the Holder Soul ID, not to Device ID.
2. Holder Soul ID may be recovered on a replacement device through the SoulScan facial-biometric recovery mechanism.
3. State restore does not restore authority.
4. SERA Agent DID resolution does not restore runtime eligibility.
5. Revoked Device IDs do not reactivate.
6. Revoked Runtime IDs do not reactivate.
7. Expired/revoked mandates do not reactivate.
8. Prior approvals do not survive full recovery by default.
9. Old Trust/REV PASS does not survive recovery context changes.
10. Portable state never contains wallet private keys or unrestricted signing handles.
11. Recovery runtime cannot sign by default.
12. Recovery is R5/A5 by default.
13. SAEL history survives device/runtime replacement.
14. Rollback is detected and policy-controlled.
15. Cloud storage is not identity authority.
16. Recovery progressively re-establishes authority.
17. Device assurance may restrict execution but cannot redefine wallet ownership.
18. SERA keys alone cannot operate outside the wallet context of the Holder DID to which SERA is bound.
19. Compromise recovery prioritizes containment over convenience.

---

## 47. Threat Model Gaps Closed

This specification materially closes:

- **SG-08 Recovery authorization profile**

It also strengthens:

- rollback protection;
- runtime rebinding;
- mandate revalidation;
- device-revocation preservation;
- state-manifest verification.

---

## 48. Open Implementation Items

Still required:

- SoulScan facial-biometric Holder Soul ID recovery integration;
- binding proof between recovered Holder DID, Soul Super Wallet and SERA Agent DID;
- encryption key-wrapping profile;
- state bundle format;
- conflict-resolution UI;
- post-recovery risk-window defaults;
- planned-migration protocol;
- SERA Agent DID replacement protocol;
- offline recovery profile;
- recovery admin/support controls.

---

## 49. Conformance Tests

Minimum tests:

1. old revoked device remains revoked after restore;
2. old revoked runtime remains revoked;
3. expired mandate not reactivated;
4. prior approval invalidated after full recovery;
5. stale manifest rollback detected;
6. wrong holder DID manifest rejected;
7. wrong SERA Agent DID bundle rejected;
8. tampered CID rejected;
9. recovery runtime cannot sign;
10. holder can recover Soul Super Wallet on a new UNREGISTERED device through Soul ID facial biometrics;
11. wallet recovery does not require possession of the prior device;
12. new runtime requires independent registration;
13. independently recovered SERA keys cannot operate under a different Holder DID;
14. post-recovery action requires fresh Trust/REV where policy requires;
15. portable state restore does not recreate sessions;
16. compromised-device recovery revokes affected sessions;
17. SAEL continuity survives migration.

---

## 50. Exit Criteria

SSW-AI-ISC-06 advances when:

1. recovery session service exists;
2. holder recovery proof is integrated;
3. state-manifest verification works;
4. rollback detection works;
5. target device/runtime registration works;
6. old authority remains revoked;
7. authority is progressively re-established;
8. SAEL records recovery end to end;
9. post-recovery risk controls are enforced;
10. planned migration and compromise recovery are both tested.

---

## 51. Controlled Statement

Soul Super Wallet follows the holder's Soul ID, not a device.

A lost phone therefore does not mean a lost wallet. The holder may recover the Soul ID through SoulScan facial biometrics and establish the wallet on another device.

SERA follows that Holder DID governance relationship. Device and runtime controls determine execution assurance after recovery, not ownership.

SERA state and keys recovered outside the correct Holder DID wallet context remain inert for consequential wallet operations.


---

## SOURCE 42
**Path:** `docs/implementation/SSW-AI-IRR-01-Implementation-Readiness-Review.md`  
**Blob SHA:** `6ca2753eebecbaef83fec430feef7c38c1b03329`

# SSW-AI-IRR-01: Implementation Readiness Review

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Review ID:** SSW-AI-IRR-01  
**Status:** Controlled Implementation Readiness Review  
**Date:** 2026-09-17  
**Reviewed:** SSW-AI-ISC-01 through SSW-AI-ISC-06  
**Repository:** Kavithakanaparthi/SSW-SERA

---

## 1. Purpose

This review evaluates whether the SERA-first Soul Super Wallet architecture has progressed far enough from Candidate Freeze and schema design into implementation-ready service contracts.

The review checks:

- service-boundary consistency;
- state ownership;
- authority containment;
- signing isolation;
- Trust Protocol / REV binding;
- runtime/device trust;
- evidence durability;
- recovery safety;
- threat-model gap ownership;
- missing contracts that still block concrete API and code implementation.

---

## 2. Review Disposition

**Result: READY FOR CONCRETE IMPLEMENTATION DESIGN, WITH PRE-CODE SECURITY CONDITIONS**

No architectural contradiction was found across ISC-01 through ISC-06 that requires reopening Candidate Freeze.

The core control path is now coherent:

```
Holder / Trigger
   ↓
SERA Interaction
   ↓
Context + Intent
   ↓
Action Contract
   ↓
Authority
   ↓
Risk
   ↓
Device / Runtime
   ↓
Mandate / Approval
   ↓
Policy
   ↓
Trust Protocol
   ↓
REV
   ↓
Authentication
   ↓
Canonical Signing
   ↓
Execution
   ↓
SAEL Evidence
```

Recovery, runtime registration and evidence durability remain outside the model authority boundary.

---

## 3. Service Boundary Review

### ISC-01

**Status: PASS**

Service ownership is explicit.

The following separations are preserved:

- Orchestrator cannot sign.
- Authority Engine cannot execute.
- Risk Engine cannot grant authority.
- Approval Service cannot sign.
- Mandate Service cannot bypass REV.
- Execution Router cannot mutate signed payload.
- SAEL cannot create authority.
- SERA State Service cannot restore signing authority.

No privilege-collapse issue was identified.

---

## 4. Canonicalization and Signing Review

### ISC-02

**Status: PASS**

The signing boundary now binds:

- action ID;
- action version;
- material terms hash;
- action contract hash;
- holder DID;
- SERA Agent DID;
- Runtime ID;
- Device ID;
- authority basis;
- policy;
- Trust Protocol;
- REV;
- payload hash;
- replay state.

The threat-model gaps for deterministic canonicalization and signer verification are structurally closed.

### Remaining implementation choice

The production canonicalization profile must be fixed to one exact byte-level standard and library set.

Recommended baseline remains RFC 8785-compatible JSON canonicalization with versioned domain-separated SHA-256 hashing.

---

## 5. Trust Protocol / REV Review

### ISC-03

**Status: PASS**

Trust Protocol and REV decisions are correctly bound to exact execution context.

A PASS cannot be treated as a reusable trust badge.

Invalidation is defined for:

- material-term change;
- action-version change;
- risk elevation;
- policy change;
- device-state change;
- runtime change;
- approval invalidation;
- mandate change;
- AURION invalidation;
- decision expiry.

This closes the stale-PASS threat class.

---

## 6. Runtime, Device and Session Review

### ISC-04

**Status: PASS WITH PLATFORM PROFILE REQUIRED**

The distinction among:

- SERA Agent DID;
- Device ID;
- Runtime ID;
- Session ID

is consistent.

Runtime sessions are correctly treated as scoped operational credentials rather than delegated authority.

Cloud reasoning runtimes remain outside signing authority.

Wearable runtimes remain constrained.

### Remaining implementation requirement

Platform-specific attestation profiles are still required for:

- iOS;
- Android;
- wearables;
- protected cloud runtime.

This is an implementation blocker for production trust enforcement, not an architecture blocker.

---

## 7. SAEL Readiness Review

### ISC-05

**Status: PASS**

SAEL now has operational contracts for:

- producer authentication;
- namespace authorization;
- canonical event hashing;
- idempotent ingestion;
- durability levels;
- evidence reservations;
- checkpoints;
- archives;
- disclosure-bound queries;
- durable queues;
- integrity-failure response.

The evidence path is sufficiently defined to proceed to storage and API design.

### Remaining engineering choice

Concrete database, event-stream, checkpoint and archive technologies remain open.

These may be selected without reopening architecture provided the append-only and tamper-evidence properties remain intact.

---

## 8. Recovery Review

### ISC-06

**Status: PASS WITH RECOVERY-PROOF PROFILE REQUIRED**

The recovery design preserves the key invariant:

> State restore does not restore authority.

Recovery correctly separates:

- identity restoration;
- portable state restoration;
- Device ID registration;
- Runtime ID registration;
- trust re-establishment;
- mandate revalidation;
- signing re-establishment.

Revoked devices and runtimes remain terminal.

Expired and revoked mandates do not reactivate.

Old approvals and Trust/REV decisions do not survive recovery by default.

### Remaining implementation requirement

A concrete holder-recovery proof profile and encryption key-wrapping profile are still required.

---

## 9. Threat Model Gap Closure Status

The SG items from SSW-AI-TM-01 now stand as follows:

| Gap | Description | Status |
|---|---|---|
| SG-01 | Canonical JSON serialization | CLOSED by ISC-02 |
| SG-02 | Signing-gateway verification | CLOSED by ISC-02 |
| SG-03 | Runtime integrity profile | ARCHITECTURALLY CLOSED by ISC-04, platform profile pending |
| SG-04 | Offline policy package | OPEN |
| SG-05 | Deterministic condition language | OPEN |
| SG-06 | SAEL write durability | CLOSED by ISC-05 |
| SG-07 | Trust/REV binding | CLOSED by ISC-03 |
| SG-08 | Recovery authorization | ARCHITECTURALLY CLOSED by ISC-06, concrete proof profile pending |
| SG-09 | Counterparty identity binding | STRUCTURALLY CLOSED, schema refinement pending |
| SG-10 | Platform attestation | OPEN IMPLEMENTATION PROFILE |

---

## 10. Remaining Pre-Code Security Specifications

Five specifications should be completed before production code is considered security-complete.

### PC-01 Offline Authorization Package

Must define:

- signed offline policy object;
- permitted A/R classes;
- devices;
- value limits;
- counterparties;
- chains;
- freshness;
- replay controls;
- reconciliation;
- cryptographic provenance.

### PC-02 Deterministic Condition Expression Language

Needed for A4 mandate conditions.

Must be:

- deterministic;
- bounded;
- machine-evaluable;
- non-ambiguous;
- versioned;
- safe against unbounded execution.

### PC-03 Platform Attestation Profiles

Separate profiles for:

- iOS;
- Android;
- wearables;
- protected cloud runtime.

### PC-04 Recovery Proof & Key-Wrapping Profile

Must define:

- holder recovery proof;
- recovery authentication;
- state decryption key access;
- key rotation;
- device migration;
- lost-device scenarios.

### PC-05 Counterparty Canonical Identity Profile

Must define stable resolution and provenance for:

- DIDs;
- wallet addresses;
- merchants;
- organizations;
- contacts/aliases.

Aliases must never be the authority-bearing identifier.

---

## 11. Machine-Readable Artifact Gap

The current contracts are semantically detailed but are primarily normative Markdown specifications.

Before implementation teams begin independently coding services, the following machine-readable artifacts should be generated:

1. JSON Schema for all canonical objects.
2. OpenAPI contracts for internal APIs.
3. enum and reason-code registry.
4. action-type registry.
5. event-type registry.
6. policy schema.
7. mandate condition schema.
8. service identity and authorization matrix.
9. compatibility/version registry.

This is the bridge from architecture to code.

---

## 12. Recommended Repository Structure

The implementation phase should introduce a structure similar to:

```
contracts/
  json-schema/
  openapi/
  enums/
  events/
  policies/

services/
  sera-orchestrator/
  context-broker/
  authority-engine/
  risk-engine/
  policy-engine/
  device-trust/
  mandate-service/
  trust-adapter/
  rev-adapter/
  approval-service/
  signing-gateway/
  execution-router/
  sael/
  runtime-registry/
  recovery/

packages/
  canonicalization/
  typed-errors/
  identifiers/
  policy-evaluator/
  evidence-client/

tests/
  contract/
  security/
  conformance/
  integration/
  recovery/
```

The exact programming language and deployment model remain implementation decisions.

---

## 13. API Readiness

The architecture is ready to generate actual API contracts for:

- Action Contract service;
- Authority Engine;
- Risk Engine;
- Device Trust;
- Mandate Service;
- Trust Protocol adapter;
- REV adapter;
- Approval Service;
- Signing Gateway;
- Execution Router;
- SAEL;
- Runtime Registry;
- Recovery Service.

No remaining architecture question blocks these API definitions.

---

## 14. Data Store Readiness

Authoritative state ownership is clear enough to begin data modeling.

Expected authoritative stores include:

- Action / workflow state;
- mandate store;
- device trust store;
- runtime registry;
- approval store;
- execution state;
- SAEL append store;
- SERA state-manifest metadata;
- policy registry.

Private signing keys remain outside ordinary application data stores.

---

## 15. Deployment Readiness

Trust zones are clear enough to begin deployment topology design.

At minimum, deployment must preserve:

- SERA/model zone separation from signer;
- signer isolation;
- SAEL write-path isolation;
- control-plane service authentication;
- external adapter isolation;
- production/non-production separation;
- recovery-service restrictions.

---

## 16. Test Readiness

A strong conformance suite can now be built from existing specifications.

Initial mandatory test families:

- action-contract schema tests;
- material-term hashing tests;
- mandate boundary tests;
- device-state transition tests;
- session-scope tests;
- stale Trust/REV rejection;
- signing substitution tests;
- replay/idempotency tests;
- concealed-detail tests;
- SAEL integrity tests;
- recovery rollback tests;
- cross-device handoff tests.

---

## 17. No-Go Conditions

Implementation shall not be considered production-ready if any of the following remain true:

1. free-form model output can reach signer;
2. signer does not independently validate terms hash;
3. mandate conditions are interpreted by generative AI at execution time;
4. Trust/REV PASS can be reused across material changes;
5. device/runtime/session state is not independently validated;
6. SAEL evidence can be silently overwritten;
7. revoked devices can reactivate through recovery;
8. offline execution lacks signed bounded policy;
9. production runtime attestation is absent;
10. recovery decryption/authentication is weaker than the authority being restored.

---

## 18. Implementation Gate

**Gate decision: PROCEED TO CONCRETE API, SCHEMA, REPOSITORY AND DEPLOYMENT DESIGN**

Conditions:

- PC-01 through PC-05 remain mandatory tracked security work;
- machine-readable schemas must become authoritative for service implementation;
- conformance tests must be built alongside contracts rather than after implementation.

---

## 19. Recommended Next Sequence

The next build sequence should be:

1. **SSW-AI-API-01: Canonical JSON Schema & Enum Registry**
2. **SSW-AI-API-02: Internal OpenAPI Contract Set**
3. **SSW-AI-POL-01: Offline Authorization Package Specification**
4. **SSW-AI-POL-02: Deterministic Mandate Condition Language**
5. **SSW-AI-ATT-01: Device & Runtime Attestation Profiles**
6. **SSW-AI-REC-01: Holder Recovery Proof & Key-Wrapping Profile**
7. **SSW-AI-ID-01: Counterparty Canonical Identity Resolution Profile**
8. repository scaffold;
9. deployment topology;
10. contract and security test harness.

---

## 20. Controlled Statement

The SERA architecture has crossed an important boundary.

We are no longer deciding what the system should fundamentally be.

We now have enough control-plane definition to begin expressing the architecture as machine contracts, services, schemas and tests.

The next risk is not architectural ambiguity.

It is implementation drift.

From this point forward, the machine-readable contracts and conformance tests must become the guardrails that keep the implementation faithful to the architecture.


---

## SOURCE 43
**Path:** `docs/implementation/SSW-AI-IRR-02-Post-Closure-Implementation-Gate-Review.md`  
**Blob SHA:** `a56fac2d2ee5deebce9265c100275ba4cefed0e5`

# SSW-AI-IRR-02: Post-Closure Implementation Gate Review

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Review ID:** SSW-AI-IRR-02  
**Status:** Controlled Implementation Gate  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

This review determines whether the SERA-first Soul Super Wallet architecture is sufficiently specified to proceed from architecture and machine-contract definition into repository scaffolding and concrete service implementation.

This review supersedes the open-gap assessment in SSW-AI-IRR-01 where later specifications have closed those items.

## 2. Gate Decision

**GO FOR REPOSITORY SCAFFOLDING AND CONCRETE IMPLEMENTATION**

The architecture, machine schemas, internal API contracts, offline authority profile, deterministic mandate language, attestation profile, recovery profile and counterparty identity profile are now sufficiently defined to begin implementation.

This is not a production-release approval.

It is approval to begin coding against the controlled architecture.

## 3. Core Architecture Baseline

The implementation baseline now includes:

- SSW-AI-01 Platform Capability and Constraint Architecture
- SSW-AI-02 SERA Interaction, Intent and Authority Architecture
- SSW-AI-CF-A01 Candidate Freeze Harmonization Amendment
- SSW-AI-CF-A02 Soul ID-Anchored Wallet & SERA Continuity Amendment
- SCH-01 through SCH-05
- TM-01
- ISC-01 through ISC-06
- API-01
- API-02
- POL-01
- POL-02
- ATT-01
- REC-01
- ID-01

## 4. Canonical Identity Model

The controlling hierarchy is:

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

Soul Super Wallet is identity-bound, not device-bound.

The Holder Soul ID is the continuity root.

SoulScan facial-biometric recovery restores the Holder Soul ID wallet context on a replacement device.

Device and runtime trust affect execution assurance, not ownership.

## 5. SERA Identity Rule

SERA's Agent DID is subordinate to the Holder DID.

Consequential operation requires the control plane to verify:

- recovered/current Holder DID wallet context;
- valid Holder DID to SERA Agent DID governance binding;
- current runtime representation of that SERA DID;
- authority class;
- risk class;
- policy;
- approval or mandate;
- Trust Protocol;
- REV;
- signing boundary.

SERA key possession alone is not authority.

## 6. Original IRR-01 Gap Closure

### SG-01 Canonical JSON Serialization

**CLOSED**

Closed by ISC-02.

### SG-02 Signing-Gateway Verification

**CLOSED**

Closed by ISC-02.

### SG-03 Runtime Integrity

**CLOSED AT SPECIFICATION LEVEL**

ISC-04 defines runtime identity, sessions and eligibility.

ATT-01 defines concrete attestation profiles and platform-neutral evidence semantics.

### SG-04 Offline Policy Package

**CLOSED**

Closed by POL-01.

Offline consequential operation requires a pre-existing signed, bounded Offline Authorization Package.

### SG-05 Deterministic Condition Language

**CLOSED**

Closed by POL-02.

A4 conditions use DMCL, not natural-language execution logic.

### SG-06 SAEL Write Durability

**CLOSED**

Closed by ISC-05.

### SG-07 Trust Protocol / REV Binding

**CLOSED**

Closed by ISC-03.

### SG-08 Recovery Authorization

**CLOSED AT SPECIFICATION LEVEL**

ISC-06 defines recovery state and authority re-establishment.

REC-01 defines Holder recovery proof and SERA state key-wrapping semantics.

CF-A02 clarifies that Soul ID facial-biometric recovery is the wallet continuity root.

### SG-09 Counterparty Identity

**CLOSED**

Closed by ID-01.

### SG-10 Platform Attestation

**CLOSED AT SPECIFICATION LEVEL**

Closed by ATT-01.

## 7. Machine Contract Readiness

The repository now contains machine-readable contracts for:

- common identifiers and enums;
- Action Contract;
- Delegated Authority Mandate;
- Offline Authorization Package;
- Deterministic Mandate Condition Language;
- Attestation Evidence;
- Recovery Proof;
- Wrapped SERA State Key;
- Counterparty Resolution;
- Internal OpenAPI surface.

These are sufficient to begin generating:

- validators;
- typed models;
- service stubs;
- SDK contracts;
- conformance fixtures.

## 8. Implementation Guardrails

The following remain hard no-go conditions during coding:

1. model output may not be sent directly to signer;
2. free-form text may not become A4 execution conditions;
3. signer may not trust caller-supplied approval claims without independent validation;
4. SERA Agent DID possession may not substitute for Holder DID wallet context;
5. device identity may not be treated as wallet ownership;
6. offline execution may not occur outside a valid OAP;
7. Trust/REV decisions may not be reused after material-term changes;
8. counterparty aliases may not become authority identifiers;
9. SAEL may not be implemented as overwriteable mutable history;
10. recovery may not restore old sessions or revoked devices;
11. biometric recovery may not be interpreted as standing transaction approval;
12. cloud reasoning runtime may not receive unrestricted signing authority.

## 9. Implementation Priority

The recommended implementation sequence is:

1. repository scaffold;
2. common contracts package;
3. canonicalization and hashing package;
4. typed error package;
5. schema validation package;
6. action/intent contracts;
7. authority service;
8. risk service;
9. policy service;
10. device/runtime registry;
11. mandate service;
12. DMCL evaluator;
13. Trust Protocol adapter;
14. REV adapter;
15. approval service;
16. signing gateway;
17. execution router;
18. SAEL ingestion/query service;
19. recovery service;
20. counterparty resolver;
21. integration tests;
22. security/conformance tests.

## 10. Initial Repository Structure

Recommended structure:

```
contracts/
  enums/
  json-schema/
  openapi/

packages/
  canonicalization/
  identifiers/
  typed-errors/
  schema-validation/
  policy-evaluator/
  dmcl/
  evidence-client/

services/
  orchestrator/
  context/
  authority/
  risk/
  policy/
  device/
  runtime/
  mandate/
  trust/
  rev/
  approval/
  signing/
  execution/
  sael/
  recovery/
  counterparty/

tests/
  contract/
  conformance/
  security/
  integration/
  recovery/
```

## 11. First Code Milestone

The first executable milestone should prove the control path without real asset movement:

```
Intent Fixture
  ↓
Action Contract
  ↓
Authority
  ↓
Risk
  ↓
Policy
  ↓
Device / Runtime
  ↓
Mandate / Approval
  ↓
Trust Protocol Stub
  ↓
REV Stub
  ↓
Signing Gateway Dry Run
  ↓
Execution Stub
  ↓
SAEL Evidence
```

No production signing keys are required for this milestone.

## 12. Mock / Stub Policy

The following may initially be stubbed:

- Trust Protocol external endpoint;
- REV external endpoint;
- chain execution adapter;
- biometric recovery provider integration;
- external DID resolver;
- platform attestation provider.

Stubs must preserve the real interface contract and reason codes.

They may not bypass control-plane ordering.

## 13. Build Acceptance Criteria

The first build is accepted when:

- schemas compile;
- OpenAPI validates;
- typed models generate;
- an Action Contract traverses the control path;
- A2 blocks without approval;
- A3/A4 block without mandate;
- A4 rejects natural-language conditions;
- DMCL evaluates deterministically;
- changed material terms invalidate prior approval;
- invalid device/runtime blocks privileged path;
- SERA DID under wrong Holder DID fails;
- counterparty ambiguity blocks execution;
- offline action fails without valid OAP;
- signer dry-run verifies all bindings;
- SAEL records full action lineage;
- recovery test restores SERA state without restoring old authority.

## 14. Security Test Minimum

Before any real signing integration:

- replay tests;
- idempotency tests;
- hash mutation tests;
- approval substitution tests;
- mandate scope bypass tests;
- stale Trust/REV tests;
- stale attestation tests;
- alias poisoning tests;
- SERA-to-wrong-holder binding tests;
- recovery rollback tests;
- OAP replay tests;
- DMCL stale-signal tests.

## 15. Production Decisions Still Deferred

These are implementation selections, not architecture blockers:

- exact canonical JSON library;
- exact service framework;
- exact database technology;
- exact message/event transport;
- exact secret manager/HSM;
- exact workload identity deployment;
- exact Apple/Android adapter implementation;
- exact cryptographic algorithms/profile;
- exact deployment topology;
- observability stack.

These should be selected during implementation design without reopening architecture unless a selection conflicts with the established invariants.

## 16. Gate Result by Layer

| Layer | Status |
|---|---|
| Product architecture | GO |
| Identity model | GO |
| Authority model | GO |
| Risk model | GO |
| Mandate model | GO |
| A4 condition model | GO |
| Trust/REV binding | GO |
| Device/runtime model | GO |
| Recovery model | GO |
| Counterparty identity | GO |
| Offline authorization | GO |
| Evidence/audit | GO |
| Machine schema baseline | GO |
| Internal API baseline | GO |
| Production deployment | NOT YET GATED |
| Production signing | NOT YET GATED |

## 17. Next Controlled Artifact

The next artifact is:

**SSW-AI-IMP-01: Repository Scaffold, Package Boundaries & Build Bootstrap**

IMP-01 should create the actual project directories, package manifests, schema-validation harness, base service skeletons and contract tests.

## 18. Controlled Statement

The architecture is no longer waiting for another conceptual layer.

The next meaningful risk is implementation drift.

From this point, the safest way to advance the product is to make the code conform to the contracts already defined.


---

## SOURCE 44
**Path:** `docs/api/SSW-AI-API-01-Canonical-JSON-Schema-and-Enum-Registry.md`  
**Blob SHA:** `767ced25c0eee2077338f35092766f89ad765086`

# SSW-AI-API-01: Canonical JSON Schema & Enum Registry

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-API-01  
**Status:** Controlled Machine-Contract Baseline  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-SCH-01 through SCH-05, SSW-AI-ISC-01 through ISC-06, SSW-AI-IRR-01  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

This specification establishes the first machine-enforceable contract baseline for SERA and Soul Super Wallet.

It defines:
- the authoritative JSON Schema version;
- shared identifier patterns;
- canonical authority and risk enums;
- device/runtime states;
- decision statuses;
- approval and execution states;
- common reason-code registries;
- core schemas for Action Contracts and Delegated Authority Mandates;
- compatibility and versioning rules.

## 2. Schema Standard

The repository adopts JSON Schema Draft 2020-12 for machine validation.

All schemas shall:
- set `$schema`;
- define a stable `$id`;
- use explicit versioned titles;
- set `additionalProperties: false` for security-sensitive objects unless extensibility is deliberately defined;
- avoid ambiguous numeric types for financial amounts;
- represent atomic financial values as integer-form strings;
- represent timestamps as RFC3339 `date-time`;
- represent hashes using versioned algorithm prefixes such as `sha256:`.

## 3. Authoritative Machine Artifacts

This API-01 baseline creates:

- `contracts/enums/ssw-enums.v1.json`
- `contracts/json-schema/ssw-common.v1.schema.json`
- `contracts/json-schema/ssw-action-contract.v1.schema.json`
- `contracts/json-schema/ssw-mandate.v1.schema.json`

Later API artifacts shall build on these definitions rather than re-declare them independently.

## 4. Shared Identifier Rules

Canonical string patterns are defined for:

- Holder DID: `^did:soul:[a-z0-9._:-]+$`
- SERA Agent DID: `^did:soul:agent:[a-z0-9._:-]+$`
- Runtime ID: `^sera-runtime:[A-Za-z0-9._:-]+$`
- Device ID: `^device:[A-Za-z0-9._:-]+$`
- Session ID: `^sera-session:[A-Za-z0-9._:-]+$`
- UUID fields: RFC 4122-compatible UUID strings
- Hashes: `^sha256:[0-9a-f]{64}$`

Exact DID method normalization remains governed by the did:soul profile.

## 5. Canonical Enums

The first enum registry includes:

### Authority
A0, A1, A2, A3, A4, A5

### Risk
R0, R1, R2, R3, R4, R5

### Device Trust
UNREGISTERED, REGISTERED, ATTESTED, TRUSTED, LIMITED, SUSPENDED, REVOKED

### Runtime State
UNREGISTERED, REGISTERED, ATTESTED, ELIGIBLE, LIMITED, SUSPENDED, REVOKED

### Trust / REV Status
NOT_REQUIRED, PENDING, PASS, FAIL, UNAVAILABLE, EXPIRED

### Approval Status
NOT_REQUIRED, REQUIRED, PENDING, APPROVED, REJECTED, EXPIRED, INVALIDATED

### Execution Status
NOT_READY, READY, SUBMITTING, SUBMITTED, CONFIRMED, FAILED, EXECUTION_STATUS_UNKNOWN, CANCELLED, BLOCKED

### Mandate Lifecycle
DRAFT, REVIEWED, AUTHORIZED, ACTIVE, SUSPENDED, REVOKED, EXPIRED, EXHAUSTED, TERMINATED

## 6. Common Reason Codes

Reason codes are strings from a controlled registry. Initial families include:

- ambiguity;
- device/runtime;
- mandate;
- policy;
- Trust Protocol;
- REV;
- approval;
- authentication;
- signer;
- execution;
- recovery;
- SAEL integrity.

Services may emit explanatory text, but control-plane behavior shall use typed reason codes.

## 7. Financial Numeric Rules

Financial values shall use:

```json
{
  "atomic": "50000000",
  "decimals": 6
}
```

Floating-point numbers are prohibited for authoritative financial quantities.

## 8. Versioning

A breaking schema change requires a new schema identifier and version.

Examples:
- `ssw.action-contract.v1`
- `ssw.action-contract.v2`

Services may support multiple versions only through explicit compatibility profiles.

A client may not downgrade to a disabled or weaker schema version.

## 9. Validation Order

Consumers shall validate:

1. transport envelope;
2. declared schema ID/version;
3. JSON Schema;
4. semantic cross-field rules;
5. policy constraints;
6. cryptographic bindings where applicable.

JSON Schema validity alone is not sufficient authorization.

## 10. Cross-Field Rules Outside JSON Schema

Some rules remain semantic and must be enforced by service logic, including:

- A3/A4 requires mandate reference;
- A2 consequential action requires approval;
- R5 cannot be autonomously executed under baseline policy;
- material-term changes invalidate approval;
- mandate limit arithmetic;
- Trust/REV freshness;
- device/runtime eligibility;
- replay consumption;
- state-transition legality.

## 11. CI Requirements

The repository should add automated checks that:

- every JSON file validates syntactically;
- every schema validates against Draft 2020-12 meta-schema;
- example contracts validate;
- invalid security fixtures fail;
- enum references resolve;
- schema IDs are unique;
- no production service introduces undeclared security-critical enums.

## 12. Security Invariants

1. Enums are controlled vocabulary, not free-form policy.
2. Unknown authority or risk classes fail validation.
3. Unknown device states fail validation.
4. Financial values never use floating-point authority.
5. Unknown schema versions fail closed for consequential actions.
6. JSON Schema validation does not substitute for authority evaluation.
7. Machine-readable contracts become normative for implementation.

## 13. Next Machine Contracts

API-02 shall define the Internal OpenAPI Contract Set using these schemas.

Subsequent artifacts shall add:
- intent envelope schema;
- resolved intent schema;
- presentation schema;
- approval schema;
- Trust Protocol/REV decision schemas;
- SAEL event schema;
- runtime/session schemas;
- recovery schemas.

## 14. Controlled Statement

From this point forward, architecture prose explains the system.

Machine contracts define what implementations are allowed to accept.


---

## SOURCE 45
**Path:** `docs/api/SSW-AI-API-02-Internal-OpenAPI-Contract-Set.md`  
**Blob SHA:** `5c7777363b778d3dddc3a28a9ea426983f63543c`

# SSW-AI-API-02: Internal OpenAPI Contract Set

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-API-02  
**Status:** Controlled Machine-Contract Baseline  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-API-01, SSW-AI-ISC-01 through ISC-06  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

This specification converts the internal service boundaries defined in ISC-01 through ISC-06 into a callable OpenAPI baseline.

The initial aggregate contract is stored at:

`contracts/openapi/ssw-internal-api.v1.yaml`

It defines internal endpoints for:

- Authority Engine
- Risk Engine
- Device Trust Service
- Mandate Service
- Trust Protocol Adapter
- REV Adapter
- Approval Service
- Signing Gateway
- Execution Router
- SAEL
- Runtime Registry
- Recovery Service

## 2. API Principles

Every consequential internal request shall carry:

- `X-Correlation-ID`
- `X-Request-ID`
- `Idempotency-Key` where state changes are possible
- authenticated service identity
- explicit schema version
- holder/action identity where relevant

## 3. Security Model

The OpenAPI contract declares service authentication using mutual TLS as the baseline internal service identity mechanism.

Production deployment may layer:

- workload identity;
- SPIFFE/SPIRE;
- signed service tokens;
- service mesh policy;

but service identity must remain distinct from holder session identity.

## 4. Error Model

All error responses use the controlled error envelope:

```json
{
  "error": {
    "code": "DEVICE_NOT_ELIGIBLE",
    "category": "AUTHORIZATION",
    "retryable": false,
    "details_ref": null
  }
}
```

Free-form text is explanatory only.

## 5. Idempotency

State-changing endpoints SHALL require `Idempotency-Key` unless the operation is inherently idempotent by resource identity.

This applies especially to:

- mandate reservation/finalization;
- approvals;
- signing;
- execution submission;
- SAEL ingestion;
- runtime registration;
- recovery session creation.

## 6. Machine Schema Reuse

The OpenAPI contract references API-01 machine schemas for:

- Action Contract
- Mandate
- common identifiers

The OpenAPI file shall not duplicate these canonical structures unnecessarily.

## 7. Service Authorization

OpenAPI describes transport and payload contracts. Caller authorization remains enforced by runtime policy.

Examples:

- Orchestrator may call Authority/Risk.
- External Gateway may not call Signing Gateway.
- Model runtime may not call signing endpoints.
- Approval Service does not gain signing power merely by creating an approval.

## 8. Versioning

Initial API base version:

`/internal/v1`

Breaking changes require a new major path or formally versioned endpoint contract.

## 9. Compatibility

Backward-compatible additions may include optional response metadata.

Changes to:

- authority semantics;
- material-term bindings;
- signing requirements;
- mandate semantics;
- Trust/REV semantics;

require explicit version review.

## 10. Validation

CI shall validate:

1. OpenAPI syntax;
2. referenced schemas resolve;
3. no duplicate operation IDs;
4. all state-changing operations define idempotency semantics;
5. error responses use controlled envelope;
6. privileged operations require service authentication;
7. signing endpoints accept only canonical signing requests.

## 11. Next Step

After API-02, the remaining pre-code security items identified in IRR-01 should be formalized beginning with:

**SSW-AI-POL-01: Offline Authorization Package Specification**

## 12. Controlled Statement

The architecture now has a callable internal surface.

From this point forward, service implementation should conform to the OpenAPI contracts rather than inventing private request formats service by service.


---

## SOURCE 46
**Path:** `docs/policy/SSW-AI-POL-01-Offline-Authorization-Package-Specification.md`  
**Blob SHA:** `9577e139a4569ec344f6f8d31beb3f6125eecfdb`

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


---

## SOURCE 47
**Path:** `docs/policy/SSW-AI-POL-02-Deterministic-Mandate-Condition-Language.md`  
**Blob SHA:** `7efcbaa7b71a95781c9ca07c1338a4b8d4f990a3`

# SSW-AI-POL-02: Deterministic Mandate Condition Language

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-POL-02  
**Status:** Controlled Security Specification  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-SCH-02, SSW-AI-TM-01, SSW-AI-ISC-01 through ISC-03, API-01, API-02, POL-01  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

This specification defines the Deterministic Mandate Condition Language (DMCL), the machine-evaluable rule language used for A4 conditional autonomous execution.

The governing invariant is:

> A4 conditions must be decidable from typed data, explicit operators and trusted inputs. Natural-language interpretation is not part of execution-time authorization.

## 2. Design Goals

DMCL shall be:

- deterministic;
- bounded;
- non-ambiguous;
- side-effect free;
- non-Turing-complete;
- versioned;
- machine-validatable;
- auditable;
- replayable;
- independent of model judgment.

## 3. Non-Goals

DMCL does not:

- execute arbitrary code;
- call arbitrary external APIs;
- run loops;
- define functions;
- mutate wallet state;
- create mandates;
- widen mandate scope;
- infer missing values from prose;
- evaluate subjective concepts such as "reasonable", "safe", "good price" or "trusted enough" without an explicit typed input.

## 4. Condition Model

A condition is a typed expression tree.

Example:

```json
{
  "op": "and",
  "args": [
    {
      "op": "lte",
      "left": {"ref":"action.amount.atomic"},
      "right": {"literal":"100000000"}
    },
    {
      "op": "eq",
      "left": {"ref":"action.asset.symbol"},
      "right": {"literal":"USDC"}
    },
    {
      "op": "in",
      "left": {"ref":"counterparty.id"},
      "right": {"set":["did:soul:merchant-a","did:soul:merchant-b"]}
    }
  ]
}
```

## 5. Expression Types

DMCL supports:

- boolean;
- integer-string;
- decimal metadata;
- string;
- timestamp;
- duration;
- identifier;
- enum;
- set of primitive typed values.

Floating-point numbers are prohibited.

## 6. Operator Families

### Boolean

- and
- or
- not

### Equality

- eq
- neq

### Ordered Comparison

- lt
- lte
- gt
- gte

### Membership

- in
- not_in

### Time

- before
- after
- within_window
- weekday_in
- time_of_day_between

### Counter / Limit

- count_lte
- cumulative_lte
- frequency_lte

### Presence

- exists
- not_exists

No regex or free-form expression evaluation is allowed in v1.

## 7. References

Every `ref` must point to an allowlisted typed data path.

Initial reference domains:

### Action

- action.type
- action.amount.atomic
- action.amount.decimals
- action.asset.id
- action.asset.symbol
- action.chain.id
- action.counterparty.id
- action.contract.id
- action.risk.class
- action.created_at

### Mandate

- mandate.id
- mandate.version
- mandate.valid_from
- mandate.valid_until

### Usage

- usage.actions_in_window
- usage.cumulative_atomic_in_window
- usage.last_action_at

### Device / Runtime

- device.id
- device.state
- runtime.id
- runtime.class
- runtime.state

### Trust

- trust.protocol.status
- rev.status
- aurion.status

### External Typed Signals

Only pre-registered signals with schema and provenance.

Example:

- signal.fx.usdc_usd
- signal.market.price.eth_usd
- signal.merchant.status
- signal.account.balance.atomic

External signals must never be identified by arbitrary URL in the condition itself.

## 8. Literal Values

Literals must declare values compatible with the referenced operand type.

Financial atomic values are strings:

```json
{"literal":"5000000","type":"integer_string"}
```

## 9. Data Sources

External inputs must come from a registered data-source descriptor containing:

- source_id;
- schema;
- provenance;
- freshness policy;
- trust classification;
- retrieval method;
- failure behavior.

The DMCL expression references logical signal names, not implementation URLs.

## 10. Freshness

Conditions relying on dynamic signals must define freshness limits.

If a required signal is stale or unavailable:

```
condition result = INDETERMINATE
```

For A4:

```
INDETERMINATE -> DO NOT EXECUTE
```

No optimistic assumption is permitted.

## 11. Evaluation Result

Canonical results:

- TRUE
- FALSE
- INDETERMINATE
- ERROR

Only TRUE permits the condition gate to pass.

FALSE, INDETERMINATE and ERROR block autonomous execution.

## 12. Evaluation Context

The evaluator receives an immutable context snapshot.

```json
{
  "evaluation_id": "uuid",
  "action_id": "uuid",
  "mandate_id": "uuid",
  "evaluated_at": "RFC3339",
  "inputs": {},
  "input_hash": "sha256:..."
}
```

All referenced inputs must resolve from that snapshot.

## 13. No Side Effects

Condition evaluation may not:

- submit transactions;
- update counters;
- reserve mandate allowance;
- call signer;
- create approvals;
- modify device state.

It returns only a result and evidence.

State mutation occurs later in the control plane.

## 14. Bounded Complexity

DMCL v1 limits:

- maximum expression depth: 16;
- maximum boolean children per node: 32;
- maximum set size: 256;
- maximum total nodes: 512;
- no recursion;
- no loops;
- no user-defined functions.

Exceeding a bound invalidates the condition.

## 15. Time Semantics

All timestamps use UTC RFC3339 internally.

Time-zone-sensitive rules must include explicit IANA timezone in the condition metadata.

Ambiguous local-time transitions must resolve according to documented policy.

## 16. Example: Scheduled Vendor Payment

```json
{
  "op":"and",
  "args":[
    {
      "op":"eq",
      "left":{"ref":"action.counterparty.id"},
      "right":{"literal":"did:soul:vendor-a"}
    },
    {
      "op":"lte",
      "left":{"ref":"action.amount.atomic"},
      "right":{"literal":"250000000"}
    },
    {
      "op":"time_of_day_between",
      "timezone":"America/Detroit",
      "start":"08:00",
      "end":"18:00",
      "value":{"ref":"evaluation.time"}
    }
  ]
}
```

## 17. Example: Balance Refill

```json
{
  "op":"and",
  "args":[
    {
      "op":"lt",
      "left":{"ref":"signal.account.balance.atomic"},
      "right":{"literal":"100000000"}
    },
    {
      "op":"lte",
      "left":{"ref":"usage.actions_in_window"},
      "right":{"literal":"3"}
    }
  ]
}
```

The model may explain this rule, but may not evaluate it authoritatively.

## 18. Example: Prohibited Subjective Rule

Invalid:

```
"Buy ETH when the price looks attractive."
```

Valid replacement:

```json
{
  "op":"lte",
  "left":{"ref":"signal.market.price.eth_usd"},
  "right":{"literal":"2500"}
}
```

## 19. Action Binding

A DMCL condition is part of the mandate terms hash.

Changing:

- operator;
- reference;
- literal;
- set;
- window;
- timezone;
- source requirement;

creates a new mandate version requiring authorization.

## 20. Evaluation Ordering

For an A4 action:

1. validate mandate;
2. validate condition schema;
3. resolve input snapshot;
4. verify source freshness;
5. evaluate DMCL;
6. record result;
7. continue to Risk/Policy/Trust/REV;
8. reserve usage;
9. sign;
10. execute.

Condition TRUE does not bypass any later control.

## 21. Condition Evidence

SAEL should record:

- evaluation ID;
- mandate ID/version;
- action ID;
- condition hash;
- input hash;
- result;
- reason codes;
- evaluated_at;
- evaluator version.

Sensitive raw values may remain referenced rather than duplicated.

## 22. Data Source Failure

If a required signal source fails:

- do not substitute model estimation;
- do not use stale value beyond freshness;
- do not infer from historical trend.

Result becomes INDETERMINATE.

## 23. Security Invariants

1. Natural language is never executable condition syntax.
2. Model output cannot directly satisfy a condition.
3. Conditions cannot call arbitrary tools.
4. Conditions cannot mutate state.
5. External inputs must be schema-registered.
6. Stale inputs do not pass.
7. INDETERMINATE does not execute.
8. R5 cannot be unlocked by DMCL.
9. Condition TRUE does not bypass Policy, Trust Protocol, REV or signer.
10. Condition changes require new mandate hash/version.

## 24. Error Codes

- DMCL_SCHEMA_INVALID
- DMCL_OPERATOR_UNSUPPORTED
- DMCL_REFERENCE_NOT_ALLOWED
- DMCL_TYPE_MISMATCH
- DMCL_SOURCE_UNAVAILABLE
- DMCL_SOURCE_STALE
- DMCL_COMPLEXITY_EXCEEDED
- DMCL_TIMEZONE_INVALID
- DMCL_RESULT_FALSE
- DMCL_RESULT_INDETERMINATE
- DMCL_EVALUATION_ERROR

## 25. Machine Schema

The canonical v1 schema is:

`contracts/json-schema/ssw-dmcl-expression.v1.schema.json`

## 26. Threat Model Gap Closure

This specification materially closes:

**SG-05 Deterministic condition language**

## 27. Conformance Tests

Minimum tests:

1. same inputs always return same result;
2. natural-language string condition rejected;
3. unsupported operator rejected;
4. stale signal returns INDETERMINATE;
5. unavailable signal returns INDETERMINATE;
6. type mismatch rejected;
7. expression depth > 16 rejected;
8. >512 nodes rejected;
9. condition mutation changes hash;
10. subjective phrase cannot be represented as executable operator;
11. TRUE still requires downstream control checks;
12. FALSE blocks A4;
13. INDETERMINATE blocks A4.

## 28. Exit Criteria

POL-02 advances when:

- schema validator exists;
- evaluator is deterministic across supported platforms;
- source registry is defined;
- freshness enforcement works;
- conformance fixtures pass;
- SAEL records condition evaluation evidence.

## 29. Controlled Statement

A4 autonomy is not "SERA decides when it feels appropriate."

It is a deterministic policy machine operating inside authority the holder already defined.


---

## SOURCE 48
**Path:** `docs/recovery/SSW-AI-REC-01-Holder-Recovery-Proof-and-Key-Wrapping-Profile.md`  
**Blob SHA:** `d2639804e6bc36749cf96cc26bbc22e3839a4dd2`

# SSW-AI-REC-01: Holder Recovery Proof & Key-Wrapping Profile

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-REC-01  
**Status:** Controlled Security Specification  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-ISC-06, SSW-AI-ATT-01, SSW-AI-API-01, SSW-AI-API-02  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

This specification defines how, after the holder recovers the Holder Soul ID through the SoulScan facial-biometric path, the system proves the recovered wallet context is authorized to restore the SERA Agent DID and encrypted SERA state, and how SERA state keys are wrapped, unwrapped, rotated and made available to the current runtime.

Soul Super Wallet itself is not device-bound.

The governing invariants are:

> Soul ID facial-biometric recovery establishes holder wallet continuity independently of the prior device.

> Recovery material may restore encrypted SERA state inside that Holder DID wallet context. It must not become a substitute for wallet signing authority.

> SERA keys recovered independently remain unusable for consequential wallet operations unless SERA is operating under the same Holder DID to which its Agent DID is bound.

## 2. Scope

This profile defines:

- holder recovery proof classes;
- recovery assurance levels;
- threshold requirements;
- recovery session binding;
- state-encryption key hierarchy;
- key-encryption keys;
- wrapped key objects;
- device-bound re-wrapping;
- recovery key rotation;
- compromise handling;
- recovery without original device;
- planned migration;
- post-recovery restrictions;
- evidence requirements.

It does not define the Soul ID root recovery protocol itself.

## 3. Recovery Proof Classes

Initial recovery proof classes:

### RP1 Surviving Trusted Device Proof

Uses a surviving TRUSTED device with fresh authentication.

### RP2 Soul ID Facial-Biometric Recovery Proof

Uses the SoulScan facial-biometric recovery mechanism to recover the holder's Soul ID. This is the canonical Soul Super Wallet identity-recovery path and is not dependent on possession of a prior device.

### RP3 Recovery Credential Proof

Uses a separately provisioned recovery credential bound to the holder.

### RP4 Guardian / Threshold Proof

Uses an approved multi-party or guardian recovery process.

### RP5 Administrative / Legal Recovery

Exceptional controlled process. Never sufficient by itself to recreate signing authority without additional holder-security controls.

## 4. Assurance Levels

Canonical recovery assurance:

- RAL1: continuity-only recovery
- RAL2: portable-state restore
- RAL3: new device/runtime registration
- RAL4: signing re-establishment eligibility
- RAL5: high-risk authority restoration review

Higher assurance requires stronger proof composition.

## 5. Proof Composition

Recommended minimums:

- RAL1: one valid proof class
- RAL2: RP2 is the canonical wallet-continuity proof; other approved proofs may supplement it where policy allows
- RAL3: recovered Holder DID context + target runtime/device assurance
- RAL4: recovered Holder DID context + device/runtime assurance + fresh authentication + policy
- RAL5: enhanced recovery policy, potentially multi-factor/threshold

Exact thresholds are policy-controlled.

## 6. Recovery Proof Object

The canonical machine object is:

`contracts/json-schema/ssw-recovery-proof.v1.schema.json`

It binds:

- recovery ID;
- holder DID;
- SERA Agent DID;
- proof class;
- assurance level;
- subject device/runtime where applicable;
- challenge;
- issued_at;
- expires_at;
- verifier;
- evidence hash;
- result.

## 7. Challenge Binding

Every interactive recovery proof must bind to a server-issued challenge.

The challenge binds:

- recovery ID;
- holder DID;
- SERA Agent DID;
- requested recovery stage;
- target device/runtime if known;
- issued_at;
- expires_at.

Replay is prohibited.

## 8. State Key Hierarchy

Portable SERA state shall use a dedicated encryption hierarchy.

Recommended structure:

```
SERA State Data
  encrypted with
State Data Encryption Key (SDEK)
  wrapped by
State Key Encryption Key (SKEK)
  protected through
Recovery / Device Wrapping Profiles
```

Wallet private keys are outside this hierarchy.

## 9. SDEK

The State Data Encryption Key encrypts portable SERA state bundles.

Properties:

- randomly generated;
- high entropy;
- never derived from conversational data;
- not reused as wallet signing key;
- rotatable;
- not stored plaintext in remote storage.

## 10. SKEK

The State Key Encryption Key wraps SDEK material.

The SKEK may itself be protected by one or more mechanisms:

- device-bound hardware key;
- recovery credential key;
- threshold-derived recovery key;
- HSM/MPC-controlled wrapping key;
- platform keystore wrapping.

The implementation may support multiple wrapping slots, including a **Holder Soul ID recovery wrapping path** that is independent of any one physical device.

Facial biometrics should not be treated as raw encryption-key material. The biometric recovery process authorizes or reconstructs access to the recovery key path; the SDEK/SKEK must remain cryptographically separate from raw biometric data.

## 11. Wrapped Key Object

A wrapped SDEK record shall include:

- key object ID;
- holder DID;
- SERA Agent DID;
- wrapping profile;
- target device/runtime or recovery class;
- cipher suite;
- wrapped key bytes;
- created_at;
- expires_at if applicable;
- key version;
- integrity tag;
- provenance.

## 12. Multiple Wrapping Slots

To avoid single-device dependency, the system may maintain multiple authorized wrapping slots.

Examples:

- Holder Soul ID recovery slot;
- current device hardware slot;
- additional device slot;
- recovery credential slot;
- threshold recovery slot.

At least one recovery path should avoid dependence on possession of a particular device, otherwise a device loss would contradict the Soul ID recovery model.

Adding a slot is a high-security event and must be evidenced.

## 13. Planned Migration

For controlled migration, the old device is optional.

Canonical sequence:

1. recover/authenticate the Holder Soul ID on the target environment, using SoulScan facial biometrics where recovery is needed;
2. establish Soul Super Wallet for that Holder DID;
3. verify that the SERA Agent DID is governed by the same Holder DID;
4. obtain the authorized Holder Soul ID recovery key path;
5. unwrap the SDEK in a protected environment;
6. attest/register the target runtime/device for execution assurance;
7. optionally create a target-device wrapping slot for convenience and local protection;
8. verify state restore;
9. optionally revoke old device-specific slots.

The Holder Soul ID recovery slot remains conceptually distinct from device-specific convenience slots.

Plaintext SDEK should exist only transiently inside protected execution memory.

## 14. Lost Device Recovery

If the original device is unavailable:

1. initiate Soul ID recovery on the replacement device;
2. complete SoulScan facial-biometric recovery of the Holder DID;
3. establish Soul Super Wallet for that Holder DID;
4. verify the bound SERA Agent DID;
5. obtain/reconstruct the authorized Holder Soul ID recovery SKEK path;
6. unwrap the SDEK;
7. restore SERA state;
8. separately attest/register the target runtime/device for execution assurance;
9. create a new device wrapping slot if desired;
10. suspend/revoke the lost device and its runtime/session state;
11. rotate keys if compromise risk exists.

Possession of the original device is not required.

## 15. Compromised Device Recovery

If compromise is suspected:

- revoke old Device ID;
- revoke old Runtime IDs;
- invalidate old wrapping slot;
- rotate SDEK or SKEK according to policy;
- re-encrypt state bundle if SDEK rotates;
- issue fresh wrapping slots;
- review SAEL for suspicious recovery/state access.

## 16. Key Rotation

Rotation types:

### SDEK Rotation

Requires re-encryption of state bundle.

### SKEK Rotation

Re-wraps SDEK without re-encrypting state.

### Device Wrapping-Key Rotation

Replaces one device-specific wrapping slot.

Rotation events must be versioned and evidenced.

## 17. Key Separation

Strict separation:

- SDEK: state confidentiality
- SKEK: state-key protection
- Runtime key: runtime identity/session
- Wallet private key: transaction signing
- Recovery credential key: recovery proof/wrapping only

No key should serve more than one trust purpose unless explicitly reviewed.

## 18. Cipher Agility

The profile shall be algorithm-agile.

Initial recommended categories:

- AEAD for state encryption;
- authenticated key wrapping or AEAD for wrapped key objects;
- strong KDF where derivation is required;
- hardware-backed key generation where available.

Exact production algorithms belong in the cryptographic implementation profile.

## 19. Recovery Credential Storage

Recovery credentials must not be stored as plaintext secrets by Soulverse.

Where possible:

- holder controls credential;
- server stores public verifier or wrapped material;
- recovery proof uses challenge-response.

## 20. Threshold Recovery

A future threshold profile may split recovery authority across independent factors.

Example:

```
2-of-3:
- trusted recovery device
- holder recovery credential
- guardian/enterprise recovery authority
```

Threshold shares must not individually decrypt SERA state.

## 21. SERA Agent DID Binding

Wrapped state keys must bind to both:

- the Holder DID; and
- the SERA Agent DID governed by that Holder DID.

A recovered SERA key path must not be usable under a different Holder DID. A wrapped key object for one Holder/SERA relationship cannot be used for another without explicit controlled migration/reissuance.

## 22. Device-Specific Wrapping

Device wrapping slots, when used, bind to canonical Device ID and, where useful, Runtime ID.

They are optional protection/convenience mechanisms and are not the root recovery mechanism for Soul Super Wallet.

Replacing a device requires a new device-specific slot, but it does not require transfer of wallet ownership and does not invalidate the Holder Soul ID recovery slot.

## 23. Recovery Runtime Restrictions

Recovery runtime:

- may perform state recovery coordination;
- may access wrapped state under policy;
- may not sign wallet transactions;
- may not activate mandates;
- may not bypass REV.

## 24. Post-Recovery Authority

Successful state decryption restores SERA state only.

It does not restore:

- A3/A4 mandate eligibility automatically;
- signer eligibility;
- old sessions;
- old approvals;
- old Trust/REV PASS.

These are re-established through normal control-plane checks.

## 25. Recovery Proof Expiry

Recovery proofs are short-lived and stage-bound.

A proof used to restore state cannot be reused later to authorize a transaction.

## 26. Failure Handling

If recovery proof fails:

- no state key unwrap;
- no device promotion;
- no runtime rebinding;
- SAEL event emitted.

If key unwrap fails:

- do not attempt insecure fallback;
- preserve evidence;
- allow alternate authorized recovery path only.

## 27. Backup and Replica Strategy

Encrypted state bundles may exist in multiple storage backends.

Only wrapped keys and verified manifests determine accessibility.

Storage possession does not equal decryption authority.

## 28. SAEL Evidence

SAEL shall record:

- recovery proof requested;
- proof class;
- assurance level;
- result;
- wrapping slot created/revoked;
- SDEK/SKEK rotation events;
- state unwrap attempt;
- state restore;
- Holder DID and SERA Agent DID governance binding;
- target-device binding where a device-specific slot is created.

Never log plaintext keys.

## 29. Error Codes

- RECOVERY_PROOF_INVALID
- RECOVERY_PROOF_EXPIRED
- RECOVERY_PROOF_REPLAYED
- RECOVERY_ASSURANCE_INSUFFICIENT
- WRAPPED_KEY_NOT_FOUND
- WRAPPED_KEY_INTEGRITY_FAILED
- WRAPPING_SLOT_REVOKED
- SDEK_UNWRAP_FAILED
- SKEK_UNAVAILABLE
- TARGET_DEVICE_NOT_ATTESTED
- TARGET_RUNTIME_NOT_ELIGIBLE
- KEY_ROTATION_REQUIRED
- RECOVERY_THRESHOLD_NOT_MET

## 30. Machine Schema

The canonical proof schema is:

`contracts/json-schema/ssw-recovery-proof.v1.schema.json`

The wrapped-key schema is:

`contracts/json-schema/ssw-wrapped-state-key.v1.schema.json`

## 31. Threat Model Gap Closure

This specification completes the concrete profile required for:

**SG-08 Recovery authorization**

and closes the recovery-proof/key-wrapping implementation condition identified in IRR-01.

## 32. Conformance Tests

Minimum tests:

1. expired proof fails;
2. replayed proof fails;
3. wrong holder DID fails;
4. wrong SERA Agent DID fails;
5. SERA recovery under the wrong Holder DID fails;
6. device loss does not prevent recovery through the Holder Soul ID recovery path;
7. wrong target device fails only for a device-specific wrapping slot;
8. revoked wrapping slot fails;
9. corrupted wrapped key fails;
10. state key cannot sign transaction;
11. recovery runtime cannot sign;
12. successful state restore does not restore mandate/session authority;
13. compromised-device recovery rotates/revokes affected device slots without revoking Holder DID ownership;
14. planned migration preserves state without requiring the old device.

## 33. Exit Criteria

REC-01 advances when:

- proof verifier is implemented;
- wrapping slots are versioned;
- Holder Soul ID recovery wrapping path is implemented;
- device-specific wrapping remains optional and subordinate;
- lost-device flow succeeds without the old device;
- compromise rotation is tested;
- SAEL recovery evidence is emitted;
- signing boundary remains independent.

## 34. Controlled Statement

Soul Super Wallet recovery begins with the holder's Soul ID, recoverable through facial biometrics, not with a device.

SERA recovery then restores the agent that belongs to that Holder DID.

The state key opens SERA memory and continuity inside the correct Holder DID wallet context.

It does not open the wallet's authority boundary, and recovered SERA keys cannot be transplanted to another holder.


---

## SOURCE 49
**Path:** `docs/identity/SSW-AI-ID-01-Counterparty-Canonical-Identity-Resolution-Profile.md`  
**Blob SHA:** `e74e022e7c74d277d8917bb672ef93ffd74ab08c`

# SSW-AI-ID-01: Counterparty Canonical Identity Resolution Profile

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-ID-01  
**Status:** Controlled Security Specification  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-SCH-01, SSW-AI-SCH-02, SSW-AI-TM-01, SSW-AI-ISC-01 through ISC-03, SSW-AI-CF-A02  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

This specification defines how SERA resolves human-friendly counterparties into stable canonical identities for wallet actions, mandates, credential presentation and external requests.

The governing invariant is:

> Labels help the holder recognize a counterparty. Canonical identifiers determine who or what the system is actually acting with.

Aliases, contact names, social-profile names and merchant display names are never authoritative by themselves.

## 2. Scope

This profile covers:

- individuals;
- Holder DIDs;
- organization DIDs;
- SERA/agent DIDs where relevant;
- wallet addresses;
- merchant identities;
- service providers;
- contracts;
- credential verifiers;
- contacts and aliases;
- linked external profiles;
- provenance;
- confidence;
- ambiguity;
- canonical identity changes.

## 3. Counterparty Classes

Initial classes:

- PERSON
- ORGANIZATION
- MERCHANT
- WALLET_ADDRESS
- SMART_CONTRACT
- CREDENTIAL_VERIFIER
- SERVICE_PROVIDER
- AGENT
- UNKNOWN

## 4. Canonical Identity Types

Supported canonical identifiers may include:

- `did:soul:<holder>`
- organizational DID
- `did:soul:agent:<agent>`
- chain-qualified wallet address
- chain-qualified contract address
- merchant identifier
- verifier DID
- provider identifier

Every identifier must be typed and namespaced.

## 5. Human Labels

Examples:

- "Alex"
- "My accountant"
- "Coffee shop"
- "Payroll"
- "Treasury wallet"
- "Acme Inc."

These are display or search labels only.

A label must resolve to one or more canonical candidates before any consequential action proceeds.

## 6. Resolution Pipeline

```
Holder expression
  ↓
Alias / Contact Search
  ↓
Candidate Set
  ↓
Canonical Identifier Resolution
  ↓
Provenance + Confidence
  ↓
Ambiguity Check
  ↓
Holder Review if required
  ↓
Canonical Counterparty Binding
```

## 7. Candidate Object

Each candidate should include:

- candidate ID;
- display label;
- counterparty class;
- canonical identifiers;
- source/provenance;
- confidence;
- last-verified timestamp;
- relationship to holder;
- risk flags;
- verification status.

## 8. Canonical Resolution Record

The machine object is defined at:

`contracts/json-schema/ssw-counterparty-resolution.v1.schema.json`

It binds:

- original holder reference;
- candidate set;
- selected canonical identity;
- provenance;
- confidence;
- ambiguity result;
- verification status;
- holder confirmation where required;
- timestamps;
- integrity hash.

## 9. Chain-Qualified Wallet Identity

A wallet address must never be stored as an unqualified string for authority purposes.

Canonical wallet identity includes:

- chain namespace;
- chain ID;
- address;
- address normalization;
- optional asset context;
- provenance.

Example:

```
eip155:137:0x...
```

Display formatting may differ, but the normalized canonical value governs.

## 10. Contract Identity

Smart contracts require:

- chain;
- address;
- code/contract identifier where available;
- contract type;
- verified metadata source if used;
- current risk flags.

A contract display name cannot substitute for address identity.

## 11. DID Resolution

DID-based counterparties should resolve through the appropriate DID method.

The resolution result should preserve:

- DID;
- controller information;
- verification methods;
- service endpoints where relevant;
- resolution timestamp;
- resolution metadata.

A DID document change may invalidate cached assumptions.

## 12. Merchant Identity

Merchant resolution may combine:

- merchant ID;
- organization DID;
- payment endpoint;
- verified wallet address;
- provider account ID;
- contract address.

The merchant's legal/display name remains presentation metadata.

## 13. Credential Verifier Identity

Credential presentation requires canonical verifier binding.

The verifier record should include:

- verifier DID or equivalent identifier;
- organization identity;
- requested purpose;
- requested claims;
- endpoint;
- proof/audience binding.

A presentation approved for one verifier cannot be reused for another.

## 14. Contact and Alias Sources

Potential sources:

- holder-created alias;
- wallet contact book;
- Soul ID contact;
- verified organization directory;
- prior transaction history;
- imported contacts;
- external profile connector;
- merchant directory.

Each source must be tagged with provenance.

## 15. LinkedIn / External Profile Data

External profile data, including LinkedIn-derived information, may help disambiguate or enrich professional/business context.

It must not by itself become a payment-authority identifier.

External profile fields are contextual evidence, not canonical payment identity.

## 16. Alias Security

Alias changes are sensitive.

If "Alex" previously mapped to one canonical counterparty and now maps to another:

- raise change event;
- invalidate cached assumptions;
- require fresh resolution;
- require holder review for consequential actions.

Alias updates must never silently rewrite mandate scope.

## 17. Mandate Binding

Mandates bind to canonical counterparty identifiers, not aliases.

Example:

Invalid:

```
counterparty = "Payroll"
```

Valid:

```
counterparty = did:soul:organization:example
```

or a chain-qualified address where no DID exists.

## 18. Ambiguity

Resolution statuses:

- UNIQUE
- MULTIPLE_CANDIDATES
- LOW_CONFIDENCE
- UNRESOLVED
- CONFLICTING_IDENTIFIERS

Only UNIQUE with sufficient policy confidence may proceed without holder clarification.

## 19. Confidence

Confidence is advisory, not authority.

Suggested components:

- exact identifier match;
- holder alias match;
- contact match;
- prior verified transaction;
- DID verification;
- organization verification;
- recent holder confirmation;
- source freshness.

No model-generated confidence score can override deterministic ambiguity rules.

## 20. Holder Confirmation

Holder confirmation should display enough canonical detail to distinguish candidates.

Examples:

- name;
- organization;
- DID;
- shortened address;
- chain;
- relationship/source;
- prior transaction indicator.

For concealed-detail contexts, reveal rules from SCH-04 still apply.

## 21. Resolution Freshness

Resolution records should expire or be revalidated when:

- DID document changes;
- merchant endpoint changes;
- wallet address changes;
- alias changes;
- organization verification expires;
- counterparty risk changes;
- long time has elapsed.

## 22. Counterparty Change

Changing the canonical counterparty after approval or mandate evaluation is a material-term change.

It requires:

- new material terms hash;
- new approval where A2;
- new mandate evaluation where A3/A4;
- new Trust Protocol/REV decision where required.

## 23. Provenance

Every canonical identifier should state provenance.

Examples:

- HOLDER_ENTERED
- HOLDER_CONFIRMED
- SOUL_ID_DIRECTORY
- DID_RESOLUTION
- PRIOR_VERIFIED_TRANSACTION
- MERCHANT_DIRECTORY
- WALLETCONNECT_REQUEST
- CREDENTIAL_REQUEST
- EXTERNAL_PROFILE
- CONTRACT_REGISTRY

## 24. Verification Status

Canonical verification statuses:

- VERIFIED
- UNVERIFIED
- STALE
- CONFLICTED
- REVOKED
- UNKNOWN

Verification does not imply trust or authority.

## 25. Risk Signals

Counterparty resolution may emit risk signals such as:

- NEW_COUNTERPARTY
- ADDRESS_CHANGED
- VERIFIER_CHANGED
- CONTRACT_CHANGED
- IDENTITY_CONFLICT
- UNVERIFIED_MERCHANT
- SUSPICIOUS_ALIAS_CHANGE
- RECENTLY_CREATED_IDENTITY

These feed Risk Engine, not authority directly.

## 26. SERA Agent Counterparties

If an external SERA-like or AI agent is a counterparty, resolution should identify:

- agent DID;
- governing/operator DID;
- delegation/authority metadata where available.

Agent DID alone does not prove operator authority.

## 27. Holder DID / SERA DID Separation

For the local wallet:

- Holder DID identifies the owner;
- SERA Agent DID identifies the holder-bound agent;
- counterparty resolution must never confuse the two.

A SERA Agent DID may not replace the Holder DID for ownership-sensitive checks.

## 28. SAEL Evidence

SAEL should record:

- resolution request;
- original label/reference;
- candidate count;
- selected canonical identity;
- ambiguity status;
- provenance;
- holder confirmation where required;
- material changes.

Sensitive contact-book content should be minimized.

## 29. Error Codes

- COUNTERPARTY_UNRESOLVED
- COUNTERPARTY_AMBIGUOUS
- COUNTERPARTY_LOW_CONFIDENCE
- COUNTERPARTY_IDENTITY_CONFLICT
- COUNTERPARTY_STALE
- COUNTERPARTY_REVOKED
- COUNTERPARTY_CHAIN_MISMATCH
- COUNTERPARTY_ADDRESS_CHANGED
- COUNTERPARTY_VERIFIER_CHANGED
- COUNTERPARTY_CONFIRMATION_REQUIRED

## 30. Machine Schema

The canonical resolution schema is:

`contracts/json-schema/ssw-counterparty-resolution.v1.schema.json`

## 31. Threat Model Gap Closure

This specification closes the remaining schema-level work for:

**SG-09 Counterparty identity binding**

## 32. Conformance Tests

Minimum tests:

1. duplicate "Alex" candidates trigger ambiguity;
2. alias alone cannot satisfy mandate counterparty scope;
3. address change invalidates prior approval;
4. chain mismatch fails;
5. DID resolution change triggers revalidation;
6. stale merchant record cannot silently execute;
7. external profile name cannot become payment identity;
8. verifier identity change invalidates credential approval;
9. SERA Agent DID is not confused with governing Holder DID;
10. prior transaction history improves context but does not override explicit conflict.

## 33. Exit Criteria

ID-01 advances when:

- canonical resolver service exists;
- chain-qualified addresses are enforced;
- DID resolution is integrated;
- alias changes are evidenced;
- ambiguity blocking works;
- mandates bind canonical identifiers;
- SAEL records resolution evidence.

## 34. Controlled Statement

SERA may understand "Alex."

The control plane must know exactly which Alex.


---

## SOURCE 50
**Path:** `docs/ledger/SSW-AI-LEDGER-001.md`  
**Blob SHA:** `fcb6e9203d66080f0bb586c175fd2993995e1479`

# Soul Super Wallet AI-First Program
## Living Discussion & Decision Ledger

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Ledger ID:** SSW-AI-LEDGER-001  
**Status:** Active  
**Record Type:** Append-only living discussion, analysis, and decision record  
**Start Date:** 2026-09-16  
**Rule:** Preserve each substantive user prompt verbatim followed by the assistant's complete visible response verbatim. Do not summarize, rewrite, reorder, or overwrite prior entries unless explicitly instructed by the user.

---

## Entry 001
**Date:** 2026-09-16  
**Topic:** AI-first Soul Super Wallet and iOS / Android platform capability assessment

### User Prompt — Verbatim

Next project is to turn Soul Super Wallet in to a AI-first wallet where the interface is the agent and the rest is incidental for viewing when needed, credentials, assets, news, and all. 

What kind of support do iOS and Android have to be able to launch something like this? An app whose to-go interface is an AI companion that can float around or park itself on the homescreen for quick access. Before we build we must understand the operating system support we have from both Apple App Store and Google Play Store and their operating systems, iOS and Android. 

Please write in English language.

### Assistant Response — Verbatim

Yes. The concept is technically viable, but the operating systems force us to think about it as **one AI-first wallet with two different presence models**.

The important finding is that we should not begin by redesigning Soul Super Wallet screens. We should begin by designing **SERA as the operating interface to the wallet**, then let credentials, assets, transactions, news, identity, settings, activity and conventional screens become inspectable surfaces behind her.

As of September 2026, the platform situation looks like this.

## 1. The product model I think we should build

Instead of:

**Open Wallet → navigate → choose feature → perform action**

Soul Super Wallet becomes:

**Invoke SERA → tell her what you need → SERA determines intent → verifies identity/authority/policy → presents decision → obtains authorization where required → executes → provides evidence**

The conventional wallet becomes something closer to an **instrument panel behind the agent**.

For example:

> “SERA, do I have enough USDC to pay the invoice from Acme?”

SERA can answer conversationally.

> “Pay Acme $1,850.”

Now SERA identifies the payment intent, determines the wallet and asset, checks balance/gas, verifies recipient, invokes Trust Protocol/REV, presents the transaction for user authorization where required, submits it and returns the receipt.

Or:

> “What credentials do I have for travel?”

Instead of taking the user into a credential browser, SERA retrieves them and says something like:

“Your passport credential, TSA credential and Delta boarding credential are available. Your passport credential expires in 14 months.”

The user can then say:

> “Show me the boarding pass.”

Only then does the graphical wallet surface appear.

That architecture is absolutely feasible.

The question is how omnipresent SERA can be.

---

# 2. iOS: very capable, but Apple controls the stage

There is an important limitation to understand immediately:

### iOS does not give a normal App Store application a general-purpose floating overlay that can hover over arbitrary applications.

So we cannot build an Android-style movable SERA avatar that permanently floats above Safari, Messages, Amazon, Gmail, etc.

Apple deliberately constrains this sort of cross-application UI.

But iOS now gives us a surprisingly rich collection of **system surfaces**, and together they can make SERA feel pervasive without violating Apple's model.

Apple describes WidgetKit as allowing apps to surface content through Home Screen widgets, Lock Screen widgets, Live Activities and Controls. App Intents then allows actions to execute from these surfaces and integrate with system experiences. ([developer.apple.com](https://developer.apple.com/documentation/widgetkit?changes=_10&language=objc&utm_source=chatgpt.com))

So I would design SERA on iOS as a **distributed companion**, rather than a floating companion.

### The iOS presence architecture could look like this:

| Surface | SERA use |
|---|---|
| Main app | Full conversational SERA |
| Home Screen widget | SERA quick access + status |
| Lock Screen widget | Ask / authenticate / wallet status |
| Control Center | Invoke SERA / scan / pay / prove |
| Dynamic Island | Active transaction / agent task / authorization |
| Live Activity | Long-running task or transaction status |
| Notifications | Proactive alerts and approvals |
| App Intents | Execute SSW actions from system surfaces |
| Siri | Voice invocation and supported intents |
| Shortcuts | User-created SERA workflows |
| Action Button | Direct SERA launch where supported |
| Apple Watch | Authentication, alerts, credential/payment actions |
| StandBy | Wallet/agent contextual status |

Apple explicitly supports interactive widgets through buttons and toggles, with actions implemented through App Intents. ([developer.apple.com](https://developer.apple.com/documentation/widgetkit?changes=_10&language=objc&utm_source=chatgpt.com))

This is considerably more interesting than merely putting a SERA icon on the Home Screen.

---

# 3. The iOS Home Screen SERA

Imagine the user's Home Screen.

Instead of a conventional Soul Super Wallet icon being the primary interaction:

**SERA widget**

could show:

**SERA**

> What can I help with?

🎙 Speak  
⌨ Ask  
◎ Scan  
↗ Pay

The widget cannot become an unrestricted mini-app. Apple expects widgets to remain glanceable and focused, and widget code itself isn't simply running continuously behind the interface. Interactive actions are handed to App Intents. ([developer.apple.com](https://developer.apple.com/videos/play/wwdc2026/277/?utm_source=chatgpt.com))

But tapping:

**Ask SERA**

could deep-link immediately into the conversational interface.

Apple explicitly supports deep-linking a widget or Live Activity into the appropriate scene in the application. ([developer.apple.com](https://developer.apple.com/documentation/WidgetKit/Linking-to-specific-app-scenes-from-your-widget-or-Live-Activity?changes=_2_3_2&language=objc&utm_source=chatgpt.com))

So the experience can be:

**Home Screen → tap SERA → conversation already active**

rather than:

Home Screen → wallet splash → wallet dashboard → AI tab → conversation.

That difference sounds small technically. Product-wise, it is enormous.

---

# 4. SERA through the Dynamic Island

Dynamic Island is particularly interesting.

Apple's Live Activities can surface on the Lock Screen and Dynamic Island and can support interactions. ([developer.apple.com](https://developer.apple.com/ios?utm_source=chatgpt.com))

Suppose the user tells SERA:

> “Move $5,000 USDC to my treasury wallet once ETH gas goes below 8 gwei.”

SERA doesn't need to leave a traditional wallet UI open.

When the condition is reached:

**Dynamic Island**

> SERA  
> Transfer ready  
> $5,000 USDC

Tap.

Then:

**Review → authorize → execute**

Likewise:

> “Book the cheapest refundable Detroit to New York flight tomorrow afternoon.”

If the future Soulverse agent architecture supports the commerce workflow, the Dynamic Island could communicate the **state of the agent task** rather than pretending that SERA must literally remain running visually.

Conceptually:

**SERA ◉ Searching**

then

**SERA ◉ 3 options found**

then

**SERA ◉ Approval required**

then

**✓ Booking complete**

This is arguably a better iOS-native implementation than a cartoon character floating over other apps.

---

# 5. Lock Screen SERA

Apple also allows widgets on the Lock Screen. ([developer.apple.com](https://developer.apple.com/documentation/widgetkit?changes=_10&language=objc&utm_source=chatgpt.com))

We could create several SERA configurations:

**SERA**
- Ask
- Scan credential
- Prove identity
- Pay
- Wallet status
- Pending approvals

For a decentralized identity wallet, this matters enormously.

Imagine approaching an airport desk.

Without opening Soul Super Wallet:

**Lock screen → SERA credential control → authenticate → present credential**

Or:

**Control Center → Soul ID → present**

The wallet becomes much less "app-like."

---

# 6. Control Center could become another SERA doorway

Apple now lets applications expose Controls through WidgetKit/App Intents. Controls can appear in Control Center and, depending on context/device, other system surfaces. ([developer.apple.com](https://developer.apple.com/documentation/widgetkit/controls-collection?utm_source=chatgpt.com))

We should seriously consider controls such as:

**Ask SERA**

**Scan**

**Pay**

**Present Soul ID**

**Emergency Lock Wallet**

That last one could become particularly powerful with SoulShield/REV.

For example:

**Control Center → Lock Wallet**

→ REV denies transaction execution  
→ wallet enters protection state  
→ SERA confirms the action

This starts turning Soulverse into something closer to an **OS capability** rather than merely an application.

---

# 7. Siri/App Intents integration is strategically important

Apple's App Intents framework is now one of the major ways applications make their functionality accessible to system experiences, including Siri, Spotlight, Shortcuts and Apple Intelligence-related experiences. ([developer.apple.com](https://developer.apple.com/documentation/appintents/apple-intelligence-and-siri-ai?utm_source=chatgpt.com))

That means Soulverse should expose an intentional action vocabulary.

For example:

```text
GetWalletBalance
GetCredential
PresentCredential
VerifyCredential
GetTransactionStatus
PrepareTransfer
AuthorizeTransfer
SendAsset
ReceiveAsset
GetTrustStatus
LockWallet
UnlockWallet
ScanIdentity
AskSERA
```

Then SERA and iOS both operate on the same underlying capability layer.

That is much better architecture than tying AI directly to SwiftUI screens.

---

# 8. iOS background intelligence is constrained

This is another architectural boundary we need to respect.

An iOS application normally becomes **suspended when it moves into the background**. Apple permits specific background execution modes rather than giving every application indefinite computation time. ([developer.apple.com](https://developer.apple.com/documentation/xcode/configuring-background-execution-modes?utm_source=chatgpt.com))

Therefore we should **not** design:

> "SERA runs continuously on the iPhone in the background."

Instead:

### SERA should have three execution tiers.

**Device SERA**

Handles:
- UI
- voice
- local inference where appropriate
- local wallet context
- cryptography
- biometric authorization
- key operations
- privacy filtering

**Soulverse Agent Runtime**

Handles:
- persistent tasks
- asynchronous workflows
- monitored conditions
- research
- transaction preparation
- service integrations
- AP2/AP3 commerce workflows

**OS event layer**

Handles:
- push notifications
- Live Activities
- widgets
- App Intents
- background refresh where appropriate

So SERA may *appear* continuously available while respecting iOS process rules.

That is the right abstraction.

---

# 9. Android is considerably more permissive

Android can get much closer to the product you originally described:

> **an AI companion that can float around or park itself on the Home Screen.**

Android gives us several mechanisms.

The most interesting are:

### A. Home Screen widgets

Android widgets are movable and resizable Home Screen surfaces that expose application information and functionality. ([developer.android.com](https://developer.android.com/develop/ui/views/appwidgets/overview?utm_source=chatgpt.com))

We could have:

**Small SERA**

👁 SERA  
Ask me anything

or a wider:

**SERA**

> What would you like me to do?

🎙️ Speak | Scan | Pay | ID

And unlike a normal app icon, users can resize it.

---

# 10. Android notification bubbles are almost made for this idea

Android notification bubbles literally allow conversations to float above other app content and expand into an interactive view. ([developer.android.com](https://developer.android.com/develop/ui/compose/notifications/bubbles?utm_source=chatgpt.com))

This may be our cleanest Android implementation.

Imagine a small SERA orb:

**◉**

sitting beside the screen.

Tap it.

A conversational window unfolds:

> **SERA**  
> What do you need?

User:

> “How much ETH do I have?”

SERA:

> 4.81 ETH across two accounts.

Collapse it.

Back to:

**◉**

Android specifically describes bubbles as floating above other app content and allowing the user to expand and interact with the associated conversation. Users remain in control of whether bubbles are enabled. ([developer.android.com](https://developer.android.com/develop/ui/compose/notifications/bubbles?utm_source=chatgpt.com))

For SERA, the conceptual fit is extremely strong because **SERA actually is a conversation**.

---

# 11. Android 17 makes this even more interesting

Google's current Android documentation states that beginning with **Android 17, bubbles are formalized as a proper windowing mode**, similar in concept to other multitasking modes, and users can add apps to the bubble UI. ([developer.android.com](https://developer.android.com/develop/ui/compose/notifications/bubbles?utm_source=chatgpt.com))

That direction strongly supports the AI-first SSW concept.

Instead of treating the bubble as a novelty, we can treat it as an Android-native SERA surface.

---

# 12. Android also technically supports real overlays

Android has `TYPE_APPLICATION_OVERLAY`.

An app with `SYSTEM_ALERT_WINDOW` permission can display a window above other application windows. ([developer.android.com](https://developer.android.com/reference/kotlin/android/Manifest.permission?utm_source=chatgpt.com))

So yes:

### We technically can build a SERA avatar that follows the user between applications.

Something like:

```text
            ◉ SERA
               ↓

┌───────────────────────────┐
│       another app         │
│                           │
│                           │
│                     ◉     │
└───────────────────────────┘
```

Drag it.

Park it.

Tap it.

Expand:

```text
        ┌─────────────────┐
        │ SERA            │
        │ What can I do?  │
        │                 │
        │ 🎙 Ask    Scan  │
        └─────────────────┘
               ◉
```

This is technically possible.

But I would **not make unrestricted overlay permission our default architecture**.

Google itself says very few apps should need `SYSTEM_ALERT_WINDOW`, and Android recommends alternatives such as bubbles or picture-in-picture where appropriate. ([developer.android.com](https://developer.android.com/reference/kotlin/android/Manifest.permission?utm_source=chatgpt.com))

So my hierarchy would be:

**1. Bubble**  
**2. Widget**  
**3. Notification/Quick Settings/system surfaces**  
**4. Optional overlay companion mode**

not overlay first.

---

# 13. Android background execution is also not unlimited

Android gives us more freedom, but modern Android is increasingly strict about background processes.

For example, Android generally prevents apps targeting Android 12+ from arbitrarily starting foreground services while already in the background, except for specified circumstances. ([developer.android.com](https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start?utm_source=chatgpt.com))

Interactions with a widget, notification or bubble are among the user-visible events that can enable certain legitimate foreground work. ([developer.android.com](https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start?utm_source=chatgpt.com))

Android also requires foreground services to remain visibly apparent to the user and applies increasingly tight restrictions and resource controls. ([developer.android.com](https://developer.android.com/develop/background-work/services/fgs/launch?authuser=0000&hl=en&utm_source=chatgpt.com))

So again:

**persistent agent ≠ persistent phone process.**

The long-running SERA brain should not depend on keeping an Android service immortal either.

---

# 14. There is a very important restriction for our AI-agent design

This one should become an architecture decision now.

We should **not build SERA by giving it Accessibility permissions and letting it click through other apps autonomously.**

Google's current AccessibilityService policy explicitly says that apps using Accessibility for automation cannot use it to autonomously:

- initiate,
- plan,
- execute actions,
- or make decisions on the user's behalf.

Narrow deterministic automation remains possible, but generalized autonomous AI automation through Accessibility is prohibited for ordinary apps. ([support.google.com](https://support.google.com/googleplay/android-developer/answer/10964491?hl=en&utm_source=chatgpt.com))

So this architecture:

**SERA → inspect Amazon UI → click product → enter card → click Buy**

is the wrong foundation.

Instead:

**SERA → merchant API / agent protocol / deep link / Intent / AP2 / commerce interface**

is the correct architecture.

That aligns beautifully with what we were already building around **SVID4AI, delegated authority, Trust Protocol, REV and AP2/AP3**.

The agent should interact with **systems**, not impersonate human finger taps.

---

# 15. This changes the SVID4AI story considerably

There is a deeper architecture emerging.

Instead of:

```text
User
 ↓
SERA
 ↓
UI automation
 ↓
Other Apps
```

we want:

```text
                         ┌── Merchant
                         │
                         ├── Bank
                         │
User → SERA → SVID4AI → ├── Airline
           ↓             │
       Soul ID           ├── Exchange
           ↓             │
    Trust Protocol       ├── Credential Issuer
           ↓             │
          REV            └── Agent/API Service
           ↓
      Authorization
           ↓
       Execution
```

The app isn't the agent.

**The interface is the agent.**

The wallet provides its powers.

That's an important distinction.

---

# 16. App Store implications for Soul Super Wallet

Apple currently permits cryptocurrency wallet applications, provided the wallet is offered by a developer enrolled as an organization. Apple separately imposes stricter requirements around exchanges, ICOs and regulated financial services. ([developer.apple.com](https://developer.apple.com/app-store/review/guidelines/uk/?utm_source=chatgpt.com))

That fits Soul Super Wallet's non-custodial model much better than if Soulverse itself were operating as a custodial exchange.

For the App Store architecture, I would therefore keep clear boundaries between:

**wallet functionality**

and

**regulated service providers accessed through the wallet**.

For example:

```text
SERA
 ↓
"I want to swap 2 ETH"
 ↓
Soulverse prepares intent
 ↓
licensed/eligible provider
 ↓
user authorization
 ↓
execution
```

rather than positioning Soulverse as the exchange unless that regulatory role is intentionally undertaken.

Apple also specifically calls out financial services and crypto exchanges as highly regulated categories that should be submitted by appropriate legal entities. ([developer.apple.com](https://developer.apple.com/app-store/review/guidelines/uk/?utm_source=chatgpt.com))

---

# 17. Google Play is interesting for SSW because it explicitly distinguishes non-custodial wallets

Google's current policy says:

> **Non-custodial wallets are out of scope of its Cryptocurrency Exchanges and Software Wallets policy.** ([support.google.com](https://support.google.com/googleplay/android-developer/answer/16329703?hl=en&utm_source=chatgpt.com))

That's significant for Soul Super Wallet.

It does **not** mean "no regulation."

Google still requires compliance with applicable laws and its blockchain/user-data policies. ([support.google.com](https://support.google.com/googleplay/android-developer/answer/13607354?hl=en&utm_source=chatgpt.com))

But the distinction supports maintaining SSW very clearly as:

**user-controlled keys + user-controlled assets + user-authorized actions**

rather than quietly introducing custodial behaviour through SERA.

---

# 18. AI introduces another policy layer

Google's July 2026 policy update explicitly clarified that its User Data rules apply to **third-party AI integrations** and that developers remain responsible for disclosure, consent and limited use of data. ([support.google.com](https://support.google.com/googleplay/android-developer/answer/17134731?hl=en&utm_source=chatgpt.com))

Google also has an AI-generated-content policy applying to chatbot-style generative AI applications. ([support.google.com](https://support.google.com/googleplay/android-developer/answer/14094294?hl=en&utm_source=chatgpt.com))

That gives us another important SERA principle:

### SERA must never simply dump wallet context into an external LLM.

Instead we should build something like:

```text
Wallet Data
    │
    ▼
SERA Context Broker
    │
    ├─ sensitivity classification
    ├─ credential minimization
    ├─ purpose limitation
    ├─ user policy
    ├─ local processing
    └─ selective external inference
             │
             ▼
           Model
```

Keys, seeds and signing material obviously never enter the AI context.

But I would go further.

Raw credentials need not enter it either unless absolutely required.

SERA should usually reason on **claims and abstractions**.

For example:

not:

> Kavitha's full passport credential JSON...

but:

```text
credential_type: passport
status: valid
expiry_remaining: 14_months
issuer_trust: verified
requested_claim: nationality
```

That is more consistent with the privacy architecture Soulverse is already building.

---

# 19. SERA must distinguish "thinking" from "authority"

This becomes absolutely central once AI becomes the wallet interface.

An AI can say:

> "I recommend paying this invoice."

That does not mean it possesses the authority to pay it.

We need four distinct layers:

```text
INTENT
What does the user want?

       ↓

REASONING
What action would accomplish it?

       ↓

AUTHORITY
Is SERA allowed to perform it?

       ↓

AUTHORIZATION
Does this particular execution satisfy policy?

       ↓

EXECUTION
Perform the action.
```

This maps almost perfectly onto:

**Soul ID → SVID4AI → Trust Protocol → REV → Wallet execution.**

That is one of the reasons this product direction fits Soulverse unusually well.

---

# 20. Transactions should have graduated autonomy

We should not make every request require the same interaction.

Consider:

### Tier 0: Read

> “What's my USDC balance?”

No transaction authorization.

### Tier 1: Prepare

> “Prepare $50 USDC for Jane.”

SERA creates the transaction but does not execute.

### Tier 2: Explicit approval

> “Send Jane $50.”

SERA prepares.

User biometric approval.

Execution.

### Tier 3: Delegated

> “Pay my AWS invoice automatically each month if it remains under $500.”

User creates bounded authority.

```text
recipient = AWS
asset = USDC
max = $500
frequency = monthly
expiry = 12 months
```

SVID4AI records delegation.

Trust Protocol verifies authority.

REV gates every execution.

### Tier 4: Autonomous conditional

> “Maintain at least $5,000 USDC in my operating wallet. Rebalance when necessary.”

Now SERA can act within a highly explicit authority envelope.

That is where an AI-first wallet starts becoming genuinely new rather than a chatbot pasted onto a crypto wallet.

---

# 21. I would therefore define the two UX models this way

### iOS

**SERA Everywhere, Floating Nowhere**

```text
Home Widget
    │
Lock Screen
    │
Control Center
    │
Dynamic Island
    │
Siri / Intents
    │
Notifications
    │
Watch
    │
    ▼
   SERA
    │
    ▼
Soul Super Wallet
```

Apple controls the external presentation surfaces.

---

### Android

**SERA Everywhere, Floating When Wanted**

```text
Home Widget ─────┐
Bubble ──────────┤
Overlay* ────────┤
Notification ────┤
Quick actions ───┤
Voice ───────────┤
                 ▼
                SERA
                 │
                 ▼
          Soul Super Wallet

* optional, permissioned mode
```

---

# 22. We should not create an AI tab

This deserves emphasis.

A conventional implementation would probably produce:

```text
Home
Assets
Credentials
Activity
AI
Settings
```

I think that would miss the opportunity.

Instead:

```text
┌──────────────────────────────┐
│                              │
│             SERA             │
│                              │
│       What can I do?         │
│                              │
│          ◉ Speak             │
│                              │
│                              │
│ Credentials  Assets  Activity│
└──────────────────────────────┘
```

And eventually even the buttons might disappear until needed.

SERA becomes **the shell**.

Assets become a view.

Credentials become a view.

News becomes a view.

Transactions become a view.

Identity becomes a view.

Settings become a view.

The user no longer has to know *where a function lives*.

That is a profound usability change.

---

# 23. We can make SERA proactive without becoming annoying

Because SERA has context, she can surface:

> “Your identity credential expires in 12 days.”

> “A wallet you've transacted with was flagged by your policy.”

> “Your recurring subscription increased 18%.”

> “The recipient you're about to pay differs from the one used last month.”

> “Your travel credential is ready.”

> “Your wallet has three pending approvals.”

> “ETH gas is currently below the threshold you asked me to watch.”

But SERA should operate under a **proactivity policy**:

```text
CRITICAL
interrupt

ACTION REQUIRED
surface prominently

RELEVANT
surface opportunistically

INFORMATIONAL
place in briefing

LOW VALUE
remain silent
```

Otherwise an intelligent wallet quickly becomes an intelligent mosquito.

---

# 24. Voice should be first-class

The conversational surface should support:

**text**

and

**voice**

from day one.

For example:

> “SERA.”

> “Yes?”

> “How much money did I send this week?”

> “$4,820 across seven transactions. $3,100 went to business accounts.”

> “Anything unusual?”

> “One transaction was 2.4 times larger than your typical payment to that recipient.”

> “Show it.”

Only at **show it** does a conventional interface appear.

That is what I mean by the graphical wallet becoming incidental.

---

# 25. We should eventually think beyond the phone

If the interface truly becomes SERA, the concept naturally extends to:

```text
                    SERA
                     │
       ┌─────────────┼─────────────┐
       │             │             │
     iPhone       Android        Web
       │             │             │
    Watch          Wear OS       Desktop
       │             │             │
    CarPlay      Android Auto      │
       │             │             │
       └─────────────┼─────────────┘
                     │
               Agent Runtime
                     │
                Soulverse
```

The device becomes merely another viewport into the same identity-bound agent.

---

# 26. Platform capability summary

| Capability | iOS | Android |
|---|---|---|
| AI-first app UI | **Yes** | **Yes** |
| Home Screen companion | **Yes, widget** | **Yes, widget** |
| Interactive Home widget | **Yes, constrained** | **Yes** |
| Floating conversation | **No general overlay** | **Yes, Bubble** |
| Arbitrary floating avatar | **No** | **Technically yes, permission required** |
| Persistent overlay over apps | **No** | **Possible, heavily permissioned** |
| Lock Screen presence | **Excellent** | **Good** |
| Dynamic ongoing task UI | **Live Activities / Dynamic Island** | **Notifications / bubbles / system surfaces** |
| Voice invocation | **Yes** | **Yes** |
| OS shortcuts/actions | **App Intents** | **Intents / shortcuts / actions** |
| Continuous arbitrary background AI | **No** | **No, constrained** |
| Cloud agent runtime | **Yes** | **Yes** |
| External-app UI automation | **Not a viable architecture** | **Do not use Accessibility for autonomous AI** |
| API/agent commerce | **Yes** | **Yes** |
| Non-custodial wallet distribution | **Permitted subject to policy** | **Supported; special crypto-wallet policy currently excludes non-custodial wallets** |

---

# 27. My proposed architecture

I would now stop thinking of the project as:

**"Add AI to Soul Super Wallet."**

It deserves its own architecture.

I would define:

## SSW AI-FIRST ARCHITECTURE

```text
┌─────────────────────────────────────────────────────────┐
│                    SERA EXPERIENCE                       │
│                                                         │
│  Conversation │ Voice │ Proactivity │ Context │ Views   │
└─────────────────────────┬───────────────────────────────┘
                          │
                SERA ORCHESTRATOR
                          │
       ┌──────────────────┼───────────────────┐
       │                  │                   │
       ▼                  ▼                   ▼
 Intent Engine      Context Engine       Agent Planner
       │                  │                   │
       └──────────────────┼───────────────────┘
                          ▼
                  AUTHORITY LAYER
                          │
                    Soul ID
                          │
                    SVID4AI
                          │
                  Trust Protocol
                          │
                         REV
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
      Credentials       Assets        Services
      Soulogram          SSW          Commerce
      SoulScan          SoulFi        APIs
          │               │               │
          └───────────────┼───────────────┘
                          ▼
                    EXECUTION LAYER
                          │
                  Evidence / Receipt
```

That is where I think we should start the new program.

---

# 28. Before coding, I recommend one formal platform-definition phase

I would make this the first controlled workstream:

### **SSW-AI-01: AI-First Wallet Platform Capability & Constraint Architecture**

It should document, feature by feature:

1. **iOS capability matrix**
   - widgets
   - Live Activities
   - Dynamic Island
   - App Intents
   - Siri
   - Shortcuts
   - Control Center
   - notifications
   - Lock Screen
   - Action Button
   - background execution
   - biometrics
   - NFC
   - credential presentation
   - watchOS
   - CarPlay
   - App Store restrictions

2. **Android capability matrix**
   - widgets
   - bubbles
   - overlays
   - notifications
   - shortcuts
   - voice
   - foreground services
   - background jobs
   - Digital Credentials
   - NFC
   - biometrics
   - Wear OS
   - Android Auto
   - Play Store restrictions

3. **SERA interaction taxonomy**
   - ask
   - view
   - retrieve
   - recommend
   - prepare
   - authorize
   - execute
   - monitor
   - delegate
   - automate

4. **Agent authority model**
   - user action
   - explicit consent
   - standing mandate
   - delegated authority
   - transaction limits
   - expiry
   - revocation
   - Trust Protocol
   - REV
   - AURION

5. **OS presence architecture**
   - iOS distributed SERA
   - Android ambient/floating SERA

6. **privacy architecture**
   - local context
   - cloud context
   - model isolation
   - credential minimization
   - key isolation
   - data retention
   - third-party model exposure

7. **App Store / Play Store release requirements**

8. **reference UX flows**

9. **technical architecture**

10. **production readiness constraints**

I would then move directly into **SSW-AI-02: SERA Interaction, Intent & Authority Architecture**, before we touch the existing wallet UI.

The central conclusion from this first investigation is quite encouraging: **Apple does not let us literally float SERA around iOS, but it gives us enough system surfaces to make her feel continuously accessible. Android can go further and give us a real bubble or optional floating companion.** If we architect SERA as the identity-bound agent shell rather than as a screen inside the wallet, we can build one coherent product across both without fighting either operating system.