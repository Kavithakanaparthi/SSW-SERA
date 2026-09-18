# SSW-AI-CF-A02: Soul ID-Anchored Wallet & SERA Continuity Amendment

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Amendment ID:** SSW-AI-CF-A02  
**Status:** Adopted Controlled Harmonization  
**Date:** 2026-09-17  
**Supersedes conflicting device-centric wording in:** ISC-04, ISC-06, ATT-01, REC-01 and any earlier architecture text

## 1. Decision

Soul Super Wallet is **not device-bound**.

Wallet continuity is anchored to the holder's Soul ID.

The holder may recover the Soul ID on a new device through SoulScan facial-biometric recovery and establish Soul Super Wallet on that device without possession of the prior device.

## 2. Identity Hierarchy

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

The device is replaceable.

The Holder DID relationship is persistent.

## 3. SERA Binding

SERA's Agent DID is bound to and governed by the wallet owner's Holder DID.

A SERA Agent DID or SERA key set recovered independently is not sufficient for consequential wallet operation.

The control plane must verify:

1. current Soul Super Wallet context is established under Holder DID H;
2. SERA Agent DID S declares/is recorded as governed by H;
3. the wallet's authorized SERA relationship resolves to S;
4. the current SERA runtime represents S;
5. normal authority, policy, Trust Protocol, REV and signing controls pass.

Therefore:

```
SERA key possession
  ≠ Holder DID authority
  ≠ wallet signing authority
```

## 4. Device Role

Device identity and attestation are security signals for the current execution environment.

They may affect:

- runtime eligibility;
- session scope;
- authentication requirements;
- risk classification;
- signing policy;
- mandate eligibility;
- Trust Protocol;
- REV.

They do not determine:

- who owns Soul Super Wallet;
- whether the Holder DID exists;
- whether the holder can recover the wallet;
- who owns SERA.

## 5. Recovery Order

Canonical recovery order:

```
SoulScan facial-biometric recovery
  ↓
Holder Soul ID recovered
  ↓
Soul Super Wallet context established
  ↓
SERA Agent DID governance binding verified
  ↓
SERA portable state / keys restored
  ↓
Current runtime registered
  ↓
Current device/runtime assurance evaluated
  ↓
Scoped authority resumes under normal controls
```

## 6. Biometric Boundary

Facial biometrics recover or establish the holder's Soul ID recovery path.

Raw biometric material must not be treated as:

- a wallet private key;
- an SERA state-encryption key;
- a standing transaction approval;
- a mandate.

Biometric recovery establishes identity continuity. Consequential operations remain governed by the normal control plane.

## 7. Device Loss

Loss or compromise of one device may require:

- revoking that Device ID;
- revoking its Runtime IDs;
- revoking its sessions;
- rotating device-specific wrapping keys;
- reviewing recent evidence.

It does **not** revoke the Holder DID, Soul Super Wallet ownership, or SERA Agent DID solely because that device was lost.

## 8. Non-Transferability

SERA's Holder DID binding is non-transferable by default.

Recovery may restore the same SERA under the same Holder DID.

Moving SERA to another Holder DID is not normal recovery and requires a separate controlled migration or creation of a new SERA Agent DID.

## 9. Normative Priority

If any prior specification implies that:

- a trusted old device is required to prove wallet ownership;
- wallet recovery requires possession of the old device;
- device registration establishes wallet ownership;
- SERA recovery is independently usable outside its Holder DID wallet context;

this amendment governs and that interpretation is rejected.

## 10. Controlled Statement

The wallet follows the person through Soul ID.

SERA follows the wallet owner through the Holder DID governance binding.

Devices come and go. Identity does not.
