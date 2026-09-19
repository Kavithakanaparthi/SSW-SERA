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

General SERA portable state must not itself contain:

- plaintext wallet or SERA private keys;
- seed phrases;
- raw recovery secrets;
- raw biometric templates;
- old runtime sessions;
- revoked Device IDs;
- expired/revoked mandates;
- unrestricted signing handles.

Wallet/SERA signing-key recovery is a separate protected compartment. Under the SoulScan/IPFS model, recovery may restore encrypted DID-bound signing key material through the authorized key-recovery path. That recovered key material is not treated as ordinary portable SERA state and does not by itself restore execution authority.

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

- a successfully recovered and current DID-bound signing key through the SoulScan/IPFS key-recovery path;
- eligible Device ID;
- eligible Runtime ID;
- valid runtime session;
- current authentication;
- policy pass;
- action-specific Trust Protocol/REV;
- any required post-recovery waiting or step-up controls.

The key is portable. Device/runtime eligibility remains an execution-assurance control and does not define key ownership.

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
