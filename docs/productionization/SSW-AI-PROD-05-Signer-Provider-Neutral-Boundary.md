# SSW-AI-PROD-05: SoulScan / IPFS Portable Signing Key Integration

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-PROD-05  
**Status:** IN PROGRESS — Portable Key Custody Model Adopted  
**Date:** 2026-09-19  
**Parent:** SSW-AI-PROD-04

## 1. Purpose

PROD-05 establishes the isolated production signer boundary without committing the platform to one HSM, device Secure Enclave, MPC provider or cloud KMS before that provider choice is made.

The governing invariant is:

> The signing system may receive an approved digest and an opaque key reference. It may never receive free-form instructions or export private key material.

## 2. Canonical Signer Model

Soul ID and SERA keys are portable and DID-bound.

The canonical provider model is:

- SOULSCAN_IPFS_PORTABLE;
- TEST_PORTABLE.

Hardware-bound, HSM, MPC and cloud-KMS modes are not the canonical custody path for Soul ID or SERA.

## 3. Key Registry

Public key metadata is persisted independently from secret key material.

A key descriptor may contain:

- opaque key_ref;
- holder DID;
- key class;
- provider class;
- algorithm;
- public-key reference;
- allowed chains;
- allowed action types;
- lifecycle status.

Private key material is prohibited from the registry.

## 4. Signing Digest Boundary

The signer coordinator does not accept arbitrary digest bytes directly from an orchestrator.

A `SigningDigestVerifier` must derive/verify a digest from the already-authorized signing payload.

Default production behavior is DENY until a chain-specific digest verifier is installed.

PROD-06 will supply the first real EVM transaction encoder/digest profile.

## 5. Authorization Reservation

Before calling a signer provider, the coordinator durably reserves:

- signing request idempotency;
- replay token;
- single-use REV decision ID;
- signer key reference;
- signing operation ID.

If signer outcome becomes unknown, the authorization reservation remains consumed until reconciliation.

## 6. Key Eligibility

Key selection is constrained by:

- holder DID;
- requested key class;
- action type;
- chain;
- key status;
- provider class.

The caller may request a key class but cannot choose arbitrary key material.

## 7. Signer Outcome

Canonical signer operation states:

- RESERVED;
- SIGNING;
- SIGNED;
- REJECTED;
- SIGNER_STATUS_UNKNOWN.

An unknown provider outcome does not release replay/REV claims.

## 8. Test Provider

CI uses an isolated ephemeral Ed25519 signer solely to prove:

- key isolation;
- opaque key reference selection;
- deterministic coordinator flow;
- signature generation without key export;
- unknown-outcome handling.

It is not an EVM production signer.

## 9. Production Integration Choice

The remaining integration is not a custody-provider choice.

The required production providers are:

- SoulScan recovery authorization;
- IPFS/content-addressed encrypted key-object storage;
- DID/key-manifest resolution.

Hardware protection may remain optional and subordinate.

## 10. Current Production Gate

Production signing remains NOT GATED.

The signing control boundary is complete, but PROD-05 remains IN PROGRESS until the SoulScan recovery adapter, IPFS encrypted-key adapter and cryptographic key-envelope profile are integrated.

