# SSW-AI-PROD-05A: SoulScan / IPFS Portable Key Custody Amendment

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-PROD-05A  
**Status:** CONTROLLED AMENDMENT  
**Date:** 2026-09-19  
**Supersedes:** hardware-bound custody assumptions in PROD-05 and any conflicting implementation-language in ISC-02 / REC-01 / ISC-06

## 1. Decision

Soul ID signing keys are not hardware-bound.

Soul ID key continuity is recovered through the SoulScan-authorized key-recovery path with encrypted key material persisted through IPFS/content-addressed storage.

SERA SHALL follow the same custody and recovery model as Soul ID.

## 2. Canonical Custody Model

```
Holder Soul ID / SERA DID
        ↓
SoulScan recovery authorization
        ↓
Resolve current signed key manifest / CID
        ↓
Retrieve encrypted key material from IPFS-compatible storage
        ↓
Verify CID + manifest + DID binding + recovery policy
        ↓
Recover/decrypt signing key material in controlled runtime
        ↓
Use key only inside bounded signing operation
        ↓
Zeroize / discard transient plaintext material where technically possible
```

## 3. Key Storage Rules

- plaintext private keys SHALL NOT be published to IPFS;
- plaintext private keys SHALL NOT be persisted in PostgreSQL;
- plaintext private keys SHALL NOT be written to SAEL;
- plaintext private keys SHALL NOT be logged;
- content-addressed storage SHALL contain encrypted key material only;
- active key material SHALL bind to the relevant DID and key version;
- signed manifests SHALL identify the current authorized encrypted key object/CID;
- stale/superseded key manifests SHALL fail recovery.

## 4. SoulScan Role

SoulScan is the recovery authorization mechanism.

Raw biometric images/templates SHALL NOT be used directly as cryptographic keys.

SoulScan authorizes or reconstructs access to the DID-bound key-recovery path according to the Soul ID recovery profile.

## 5. SERA Key Model

SERA has its own DID-bound signing key material under `did:soul:agent`.

SERA key recovery SHALL:

- use the same SoulScan/IPFS recovery model;
- bind to the governing Holder Soul ID;
- preserve SERA DID continuity;
- not automatically restore A3/A4 execution authority;
- require current policy, runtime, Trust Protocol and REV before consequential signing.

Recovery of a SERA key alone does not create wallet authority.

## 6. Device Role

A device may provide:

- local encrypted cache;
- execution assurance;
- runtime attestation;
- temporary in-memory signing environment;
- optional local wrapping convenience.

A device is not:

- the key ownership root;
- the recovery root;
- the holder identity root;
- a prerequisite for continuity.

## 7. Hardware / HSM / MPC Role

Secure Enclave, HSM, MPC and cloud KMS are not the canonical Soul ID/SERA custody model.

They may be introduced later only as optional deployment or institutional variants and must not redefine the portable SoulScan/IPFS model.

## 8. Signing Runtime

The Signing Gateway SHALL consume an opaque DID-bound key reference.

A portable key provider SHALL resolve the current authorized encrypted key object, recover the key under a valid SoulScan/recovery context, and expose only a bounded signing operation to the gateway.

The gateway SHALL NOT receive raw key material.

## 9. Recovery Separation

General portable SERA state and signing-key recovery remain separate compartments.

```
SERA portable state
  -> preferences, memory, aliases, configuration

SERA key recovery
  -> encrypted DID-bound signing key material / key manifest
```

The fact that both may use IPFS does not merge their security domains.

## 10. Production Gate

PROD-05 shall now advance through:

1. portable key manifest contract;
2. encrypted key-object storage adapter;
3. SoulScan recovery authorization adapter;
4. DID/key-version binding;
5. signing-runtime ephemeral key session;
6. stale-manifest / rollback protection;
7. tests for Holder DID / SERA DID mismatch;
8. tests proving no device dependency.

Production signing remains NOT GATED until the actual SoulScan and IPFS providers are connected and the cryptographic key-envelope profile is finalized.
