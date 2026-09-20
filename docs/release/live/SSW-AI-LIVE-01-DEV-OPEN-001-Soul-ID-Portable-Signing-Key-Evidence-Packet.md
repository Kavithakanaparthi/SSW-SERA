# SSW-AI-LIVE-01: DEV-OPEN-001 Soul ID Portable Signing-Key Evidence Packet

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-LIVE-01  
**Mapped Integration:** DEV-OPEN-001  
**Status:** ACTION REQUIRED — EXECUTE LIVE SIGNING INTEGRATION TEST AND SUBMIT EVIDENCE  
**Date:** 2026-09-20  
**Blocks:** Signing Gate / Release Gate

## 1. Purpose

This packet is now the execution instruction for the DEV-OPEN-001 live signing integration test.

The developer shall perform the staging live integration run, capture the required E1-E10 evidence, populate the controlled submission template, update the DEV-OPEN registry to EVIDENCE_SUBMITTED, and request independent verification.

This packet converts DEV-OPEN-001 from a prose handoff into an exact live-evidence submission checklist.

It does not mark DEV-OPEN-001 complete.

It defines the minimum evidence required before the registry may move from OPEN to EVIDENCE_SUBMITTED and then, after independent review, to VERIFIED.

## 2. Controlled Boundary

The required production path remains:

`Soul ID -> current signed key manifest -> encrypted key object -> SoulScan-authorized access -> controlled ephemeral signing session`

The live implementation must bind behind the existing repository interfaces:

- `PortableKeyManifestResolver`;
- `SoulScanAuthorizationClient`;
- `IpfsGatewayEncryptedKeyStore`;
- `KeyEnvelopeOpener`;
- `PortableKeyRecoveryCoordinator`;
- `PortableSigningSession`.

No evidence submission may redefine custody architecture.

## 2A. Required Live Test Execution

Run the complete production-equivalent signing flow in the approved staging environment using the actual live bindings behind the controlled interfaces.

The executed path must be:

```text
Holder Soul ID
  -> authoritative signed/current key manifest
  -> production-equivalent encrypted key object retrieval
  -> CID/hash verification
  -> SoulScan-authorized recovery/key access
  -> production-equivalent envelope opening
  -> ephemeral signing session
  -> controlled signing operation
  -> session expiry and key-material cleanup
```

The test run must use one identifiable integration version and commit/build SHA so all positive and negative evidence belongs to the same implementation.

The live run must include:

- one successful manifest resolution;
- one successful encrypted key-object retrieval and integrity verification;
- one successful SoulScan-authorized access;
- one successful ephemeral signing-session establishment;
- one successful controlled signing operation;
- one successful replacement-device recovery;
- wrong CID/hash rejection;
- stale key-version rejection;
- wrong Holder DID rejection;
- expired/invalid recovery authorization rejection where applicable;
- expired signing-session rejection;
- verification that no plaintext private key is persisted or exposed.

Do not replace this run with mocks, unit-only tests, screenshots or design attestations.

## 3. Mandatory Evidence Set

A complete submission shall contain references for all of the following.

### E1 — Production Interface Mapping

Provide a versioned mapping showing:

- repository interface;
- production Soul ID component/service;
- endpoint or invocation boundary;
- authentication method;
- environment;
- owning team;
- deployment/version identifier.

Acceptance condition: every controlled interface has one authoritative live binding.

### E2 — Environment Configuration References

Provide references to the staging/production configuration locations for:

- Soul ID manifest resolver;
- IPFS/content-addressed gateway;
- key-envelope/decryption implementation;
- SoulScan authorization integration;
- signer session configuration.

Do not submit secret values.

Acceptance condition: configuration references are environment-specific and secrets remain externalized.

### E3 — Manifest Resolution Test

Demonstrate retrieval of the current signed key manifest for a controlled test Holder Soul ID.

Capture:

- test/run ID;
- Holder DID;
- manifest version;
- key ID;
- CID/object reference;
- signature/integrity verification result;
- timestamp;
- commit/build SHA.

Acceptance condition: resolver returns the authoritative current manifest and validates its integrity.

### E4 — IPFS CID / Hash Verification

Demonstrate that the encrypted key object retrieved from the configured content-addressed path matches the manifest-bound CID/hash.

Acceptance condition: altered object, wrong CID or hash mismatch is rejected.

### E5 — Replacement-Device Recovery

Execute the portable recovery flow on a replacement device/runtime.

Capture:

- original holder identity reference;
- replacement-device/runtime reference;
- recovery authorization reference;
- recovered key reference/version;
- resulting signing-session reference;
- proof that the previous physical device is not required as the ownership root.

Acceptance condition: holder can recover the correct DID-bound signing capability without device-bound custody substitution.

### E6 — Stale Key-Version Rejection

Attempt recovery/signing with an older manifest/key version.

Acceptance condition: stale version is rejected before a signing session becomes usable.

### E7 — Wrong Holder DID Rejection

Attempt to use a valid encrypted key object/manifest under a different Holder Soul ID.

Acceptance condition: DID/key/CID binding prevents the transplant.

### E8 — No-Plaintext-Key Persistence Verification

Provide evidence that plaintext private-key material is not persisted in:

- PostgreSQL;
- IPFS/content-addressed storage;
- SAEL;
- logs;
- telemetry;
- API responses;
- durable temporary files.

Preferred evidence includes configuration inspection, storage scans, log scans and controlled instrumentation.

Acceptance condition: no plaintext private key or recovery material is present outside the controlled ephemeral signing session.

### E9 — Integration Test Results

Provide the staging integration run covering at minimum:

- manifest resolution;
- encrypted object retrieval;
- integrity validation;
- recovery authorization;
- envelope opening;
- ephemeral session establishment;
- session expiry/cleanup;
- successful controlled signing operation;
- rejection paths E4/E6/E7.

Acceptance condition: all required tests pass on the same mapped integration version.

### E10 — Security Review

Provide a security review reference confirming:

- portable DID-bound custody preserved;
- no canonical migration to device hardware, HSM, MPC or cloud KMS;
- no plaintext persistence;
- no API leakage;
- no bypass of manifest or SoulScan authorization;
- ephemeral signing session behavior reviewed;
- rollback/version protections reviewed.

Acceptance condition: review has no unresolved finding that invalidates the controlled architecture.

## 4. Evidence Submission Procedure

After the live run completes, the developer shall:

1. populate all E1-E10 fields in `docs/release/evidence/submissions/DEV-OPEN-001-evidence-submission-template.json`;
2. set the template status to `EVIDENCE_SUBMITTED`;
3. provide the staging environment, integration version, commit SHA, submission timestamp and submitter;
4. update DEV-OPEN-001 in `docs/release/evidence/SSW-SERA-Live-Integration-Evidence-Registry.json`;
5. attach or reference all stable run IDs, test artifacts, configuration attestations and review references;
6. commit the evidence submission and registry update together;
7. leave Signing Gate blocked;
8. request independent review.

Only after independent verification may DEV-OPEN-001 move to `VERIFIED`.

## 4A. Evidence Submission Metadata

Every evidence reference shall include:

- evidence kind;
- stable reference/URL/run ID;
- environment;
- commit SHA where applicable;
- submission timestamp;
- submitting team/person.

The DEV-OPEN registry status remains OPEN until the required evidence set is assembled.

Once assembled, status may move to EVIDENCE_SUBMITTED.

Only an independent verifier may move the item to VERIFIED.

## 5. Required Negative Tests

At minimum:

1. wrong CID/hash;
2. stale manifest version;
3. wrong Holder DID;
4. expired/invalid SoulScan authorization where applicable;
5. plaintext-key persistence scan;
6. expired signing session;
7. API response inspection for private-key leakage.

A positive signing demonstration without these negative tests is insufficient.

## 6. Non-Acceptable Substitutions

The following do not satisfy DEV-OPEN-001:

- screenshots without reproducible run references;
- a design document saying the integration exists;
- a development-only mock;
- a unit test using an in-memory key store;
- evidence from a different key-management architecture;
- evidence that relies on the original device as the root of ownership;
- an HSM/KMS implementation that silently replaces the portable Soul ID custody model.

## 7. Registry Transition

Current allowed progression:

`OPEN -> EVIDENCE_SUBMITTED -> VERIFIED`

or:

`OPEN -> EVIDENCE_SUBMITTED -> REJECTED`

DEV-OPEN-001 must remain OPEN until live evidence is actually supplied.

## 8. Completion Effect

When DEV-OPEN-001 is VERIFIED:

- it satisfies one of the three Signing Gate dependencies;
- Signing Gate remains blocked until DEV-OPEN-002 and DEV-OPEN-003 also satisfy their required evidence;
- Release Gate remains blocked by all other applicable live dependencies.

Verification of DEV-OPEN-001 alone does not enable production signing.
