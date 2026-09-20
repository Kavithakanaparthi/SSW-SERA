# SSW-SERA Developer Notes & Instructions

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DEV-NOTES-001  
**Status:** Living Controlled Developer Record  
**Repository:** `Kavithakanaparthi/SSW-SERA`  
**Last Updated:** 2026-09-19

## 1. Purpose

This document is the maintained engineering handoff record for implementation items that depend on existing Soulverse systems, deployment credentials, provider infrastructure or developer-owned integration work.

It shall be updated whenever a controlled build artifact leaves an intentional integration boundary open for developers.

This document does not replace the Project Build Tracker or append-only Build Progress Ledger.

## 2. Maintenance Rule

For every developer-owned open integration item, record:

- item ID;
- source artifact;
- current interface/contract;
- developer action required;
- dependencies;
- security constraints;
- required evidence;
- completion status.

Do not silently change architecture while completing an integration item.

If the production system differs materially from the controlled interface, stop and raise an architecture-change item before implementation.

---

# OPEN INTEGRATION ITEMS

## DEV-OPEN-001 — Soul ID Portable Signing-Key Integration

**Source Artifacts**

- SSW-AI-PROD-05
- SSW-AI-PROD-05A
- SSW-AI-ISC-02
- SSW-AI-ISC-06
- SSW-AI-REC-01

**Status:** OPEN — DEVELOPER INTEGRATION REQUIRED

### Controlled Architecture

Soul ID signing keys are portable and DID-bound.

They are not hardware-bound.

The controlled key path is:

```
Soul ID
  -> signed/current key manifest
  -> encrypted key object in IPFS/content-addressed storage
  -> SoulScan-authorized recovery/key access
  -> controlled ephemeral signing session
```

### Existing Interfaces

Developers shall integrate the existing Soul ID implementation behind the repository interfaces, including:

- `PortableKeyManifestResolver`
- `SoulScanAuthorizationClient`
- `IpfsGatewayEncryptedKeyStore`
- `KeyEnvelopeOpener`
- `PortableKeyRecoveryCoordinator`
- `PortableSigningSession`

Relevant implementation packages:

- `packages/signer-runtime`
- `packages/portable-key-client`

Relevant machine contracts:

- `ssw.portable-key-manifest.v1`
- `ssw.soulscan-recovery-authorization.v1`
- `ssw.encrypted-key-object-ref.v1`

### Developer Action Required

Connect these interfaces to the existing Soul ID production implementation.

Specifically:

1. bind key-manifest resolution to the authoritative Soul ID key-manifest source;
2. bind encrypted key-object retrieval to the production IPFS/content-addressed storage path;
3. bind the envelope opener to the existing Soul ID cryptographic key-recovery/decryption implementation;
4. preserve key-version monotonicity and rollback protection;
5. preserve DID/key/CID binding;
6. provide ephemeral signing-session semantics;
7. ensure plaintext key material is never returned across service APIs.

### Do Not

Developers must not:

- move Soul ID custody to Secure Enclave, HSM, MPC or cloud KMS as the canonical wallet model;
- persist plaintext private keys in PostgreSQL;
- write plaintext keys to IPFS;
- write private keys or recovery material to SAEL;
- expose private keys through API responses;
- make a physical device the ownership or recovery root;
- bypass key-manifest or SoulScan authorization checks.

Optional local hardware protection may be used only as a subordinate cache/protection mechanism.

### Required Completion Evidence

Before this item can be marked COMPLETE, provide:

- production interface mapping;
- environment configuration references;
- manifest-resolution test evidence;
- IPFS CID/hash verification evidence;
- successful recovery on a replacement device;
- stale key-version rejection evidence;
- wrong Holder DID rejection evidence;
- no-plaintext-key persistence verification;
- integration test results;
- security review evidence.

---

## DEV-OPEN-002 — SoulScan Recovery Authorization Integration

**Source Artifacts**

- SSW-AI-PROD-05A
- SSW-AI-REC-01
- SSW-AI-ISC-06

**Status:** OPEN — DEVELOPER INTEGRATION REQUIRED

### Controlled Architecture

SoulScan is the holder recovery-authorization mechanism.

Raw biometric images or templates are not signing keys and must not be used directly as encryption-key material.

SoulScan authorizes or reconstructs access to the DID-bound recovery path.

### Developer Action Required

Connect `SoulScanAuthorizationClient` to the existing SoulScan production service.

The production response must map to:

`ssw.soulscan-recovery-authorization.v1`

and bind:

- recovery ID;
- Holder Soul ID;
- SERA Agent DID where applicable;
- key reference;
- purpose;
- RP2 proof class;
- RAL4/RAL5 assurance;
- issued/expiry time;
- verifier reference;
- evidence reference;
- integrity/signature reference.

### Do Not

Developers must not:

- invent a second biometric recovery system;
- replace SoulScan with device possession;
- treat raw face data as a private key;
- persist raw biometric templates in SSW-SERA;
- allow recovery authorization to become transaction authorization;
- allow a SoulScan PASS to bypass Trust Protocol or REV.

### Required Completion Evidence

Provide:

- production endpoint/interface mapping;
- signed response verification profile;
- expired authorization rejection test;
- Holder DID mismatch test;
- SERA DID mismatch test;
- replay test;
- recovery-to-signing boundary test;
- confirmation that SoulScan recovery alone cannot execute a transaction.

---

## DEV-OPEN-003 — SERA Portable Signing-Key Integration

**Source Artifacts**

- SSW-AI-PROD-05
- SSW-AI-PROD-05A

**Status:** OPEN — DEVELOPER INTEGRATION REQUIRED

### Controlled Architecture

SERA follows the same portable key-management method as Soul ID.

SERA key material is:

- DID-bound;
- encrypted;
- recoverable through the SoulScan/IPFS path;
- governed by the Holder Soul ID.

SERA key recovery does not automatically restore A3/A4 authority.

### Developer Action Required

Use the same existing Soul ID key-recovery and envelope implementation for SERA, with separate SERA DID key material and governance binding.

Verify:

```
Holder Soul ID
   governs
SERA Agent DID
   owns/uses
SERA portable signing key
```

before a signing session is opened.

### Required Completion Evidence

Provide:

- Holder/SERA governance-binding test;
- SERA recovery on replacement device;
- wrong-holder transplant rejection;
- stale key manifest rejection;
- revoked SERA DID rejection;
- fresh Trust/REV requirement after recovery;
- A3/A4 mandate revalidation evidence.

---

# COMPLETION RULE

DEV-OPEN-001, DEV-OPEN-002 and DEV-OPEN-003 are intentionally open-ended developer integration items.

They do not block continued repository construction.

They do block:

- Production Signing Gate closure;
- Production Release Gate closure;
- any claim that live Soul ID/SoulScan-backed signing is operational.

The controlled interfaces and security invariants are considered complete unless a developer discovers a material incompatibility with the existing Soul ID/SoulScan implementation.
