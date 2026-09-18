# SSW-AI-REC-01: Holder Recovery Proof & Key-Wrapping Profile

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-REC-01  
**Status:** Controlled Security Specification  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-ISC-06, SSW-AI-ATT-01, SSW-AI-API-01, SSW-AI-API-02  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

This specification defines how a holder proves recovery authority for SERA state restoration and how encrypted SERA state keys are wrapped, unwrapped, rotated and re-bound to replacement devices or runtimes.

The governing invariant is:

> Recovery material may restore encrypted SERA state. It must not become a substitute for wallet signing authority.

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

### RP2 Soul ID Recovery Proof

Uses a valid Soul ID recovery mechanism.

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
- RAL2: RP1 or RP2/RP3 equivalent
- RAL3: strong holder proof + target-device attestation
- RAL4: strong holder proof + device/runtime attestation + fresh authentication + policy
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

The implementation may support multiple wrapping slots.

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

- primary phone slot;
- secondary trusted device slot;
- recovery credential slot;
- threshold recovery slot.

Adding a slot is a high-security event and must be evidenced.

## 13. Planned Migration

For controlled migration:

1. authenticate holder on old trusted device;
2. attest new device;
3. register new Runtime ID;
4. generate new device-bound wrapping key;
5. unwrap SDEK in protected environment;
6. re-wrap SDEK for new device;
7. verify restore;
8. optionally revoke old slot/device.

Plaintext SDEK should exist only transiently inside protected execution memory.

## 14. Lost Device Recovery

If original device is unavailable:

1. initiate recovery;
2. satisfy approved recovery proof threshold;
3. suspend/revoke lost device;
4. obtain/reconstruct authorized SKEK path;
5. unwrap SDEK;
6. attest target device;
7. create new device wrapping slot;
8. restore state;
9. rotate keys if compromise risk exists.

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

Wrapped state keys must bind to the SERA Agent DID.

A wrapped key object for one SERA Agent DID cannot be used for another without explicit migration/reissuance.

## 22. Target Device Binding

Device wrapping slots shall bind to canonical Device ID and, where useful, Runtime ID.

Replacing a device requires a new wrapping slot.

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
- target-device binding.

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
5. wrong target device fails;
6. revoked wrapping slot fails;
7. corrupted wrapped key fails;
8. state key cannot sign transaction;
9. recovery runtime cannot sign;
10. successful state restore does not restore mandate/session authority;
11. compromised-device recovery rotates/revokes affected slots;
12. planned migration preserves state while changing device wrapping key.

## 33. Exit Criteria

REC-01 advances when:

- proof verifier is implemented;
- wrapping slots are versioned;
- device-bound key wrapping is implemented;
- lost-device flow is tested;
- compromise rotation is tested;
- SAEL recovery evidence is emitted;
- signing boundary remains independent.

## 34. Controlled Statement

Recovery should let the holder regain SERA without making backup material dangerous.

The state key opens memory and continuity.

It does not open the wallet's authority boundary.
