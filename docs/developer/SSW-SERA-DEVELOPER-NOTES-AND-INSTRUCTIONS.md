# SSW-SERA Developer Notes & Instructions

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DEV-NOTES-001  
**Status:** Living Controlled Developer Record  
**Repository:** `Kavithakanaparthi/SSW-SERA`  
**Last Updated:** 2026-09-20

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

## 3. Standing Handoff Directive

The following integration boundaries are intentionally left open for the development team and shall remain recorded in this document until live integration evidence is supplied:

- DEV-OPEN-001 — Soul ID Portable Signing-Key Integration;
- DEV-OPEN-002 — SoulScan Recovery Authorization Integration;
- DEV-OPEN-003 — SERA Portable Signing-Key Integration.

These open items do **not** pause continued SSW-SERA repository construction.

The controlled interfaces, schemas, failure behavior and security invariants are considered the authoritative handoff boundary. Developers shall connect the existing Soul ID and SoulScan production implementations behind those interfaces without redesigning the custody or recovery architecture.

The build program should continue through all independent runtime, mobile, observability, deployment and release-preparation work while these items remain open.

Only the relevant production gates remain blocked until developers provide the required integration evidence.

---



---

# STAGE-WISE LIVE INTEGRATION TEST & EVIDENCE EXECUTION PLAN

## Purpose

DEV-OPEN-001 through DEV-OPEN-004 shall be executed as one controlled sequence.

Each stage must:

1. complete the required live integration in the approved staging environment;
2. run the defined positive and negative tests;
3. capture stable evidence references;
4. submit evidence through the live integration evidence registry;
5. undergo independent review;
6. move to VERIFIED only after review;
7. allow the derived gate status to update automatically.

No stage may be declared complete based only on implementation claims, screenshots, unit tests, or developer confirmation.

The required sequence is:

```text
DEV-OPEN-001
  -> DEV-OPEN-002
  -> DEV-OPEN-003
  -> Signing Gate eligible for COMPLETE
  -> DEV-OPEN-004
  -> Execution Gate eligible for COMPLETE
```

Production signing and production asset movement remain disabled until their separate activation and release controls are satisfied.

---

## Stage 1 — DEV-OPEN-001: Soul ID Portable Signing-Key Integration

### Objective

Prove that the live Soul ID portable signing-key path works end to end without changing the controlled custody model.

### Live Test Path

```text
Holder Soul ID
  -> authoritative signed/current key manifest
  -> encrypted key object retrieval
  -> CID/hash verification
  -> SoulScan-authorized key access
  -> envelope opening
  -> ephemeral signing session
  -> controlled signing operation
  -> session expiry / cleanup
```

### Mandatory Positive Tests

- current manifest resolves successfully;
- manifest signature/integrity validates;
- encrypted key object resolves from the configured content-addressed path;
- CID/hash matches the manifest;
- SoulScan authorization is accepted where required;
- envelope opens successfully;
- ephemeral signing session is created;
- controlled signing operation succeeds;
- session expires/cleans up correctly;
- replacement-device recovery succeeds.

### Mandatory Negative Tests

- wrong CID/hash rejection;
- stale key-version rejection;
- wrong Holder DID rejection;
- expired/invalid recovery authorization rejection;
- expired signing-session rejection;
- plaintext-key persistence/exposure scan;
- API response inspection for private-key leakage.

### Required Evidence

Submit E1-E10 from:

`docs/release/evidence/submissions/DEV-OPEN-001-evidence-submission-template.json`

Evidence must include:

- production interface mapping;
- environment configuration references;
- manifest-resolution run;
- CID/hash verification;
- replacement-device recovery;
- stale-version rejection;
- wrong-holder rejection;
- no-plaintext-key persistence verification;
- integration test results;
- independent security review.

### Submission and Review

1. populate the DEV-OPEN-001 submission template;
2. change submission status to `EVIDENCE_SUBMITTED`;
3. update DEV-OPEN-001 in the live evidence registry to `EVIDENCE_SUBMITTED`;
4. commit the submission and registry update together;
5. request independent review;
6. reviewer marks VERIFIED or REJECTED.

### Gate Effect

If VERIFIED:

- DEV-OPEN-001 satisfies one Signing Gate dependency;
- Signing Gate remains BLOCKED until DEV-OPEN-002 and DEV-OPEN-003 are also VERIFIED or validly WAIVED.

---

## Stage 2 — DEV-OPEN-002: SoulScan Recovery Authorization Integration

### Objective

Prove that live SoulScan recovery authorization is valid, replay-safe, identity-bound, and cannot become transaction authorization.

### Live Test Path

```text
Recovery request
  -> SoulScan live authorization
  -> signed response verification
  -> Holder DID / SERA DID binding
  -> purpose / assurance validation
  -> expiry / replay validation
  -> controlled recovery path
  -> signing boundary re-entry
```

### Mandatory Positive Tests

- live SoulScan endpoint/interface resolves correctly;
- signed authorization response verifies;
- Holder DID binding validates;
- SERA Agent DID binding validates where applicable;
- purpose matches recovery;
- required RP2 / RAL4-RAL5 assurance is present;
- issued/expiry time is valid;
- verifier/evidence references are preserved;
- valid recovery authorization enables recovery path entry only.

### Mandatory Negative Tests

- expired authorization rejection;
- Holder DID mismatch rejection;
- SERA DID mismatch rejection;
- replay rejection;
- altered/integrity-failed response rejection;
- wrong-purpose rejection;
- recovery-to-signing boundary test;
- proof that SoulScan PASS alone cannot execute or approve a transaction;
- proof that Trust Protocol and REV are not bypassed.

### Required Evidence

Evidence must include:

- production endpoint/interface mapping;
- signed response verification profile;
- successful authorization run;
- expired authorization rejection;
- Holder DID mismatch rejection;
- SERA DID mismatch rejection;
- replay rejection;
- recovery-to-signing boundary test;
- explicit proof that SoulScan recovery alone cannot execute a transaction;
- independent security review.

### Submission and Review

1. create the DEV-OPEN-002 evidence submission record;
2. set status to `EVIDENCE_SUBMITTED`;
3. update DEV-OPEN-002 in the live evidence registry;
4. attach stable run IDs, environment, commit SHA, submitter and timestamps;
5. request independent review;
6. reviewer marks VERIFIED or REJECTED.

### Gate Effect

If VERIFIED:

- DEV-OPEN-002 satisfies one Signing Gate dependency;
- DEV-OPEN-002 also satisfies the mapped Recovery Gate dependency;
- Signing Gate remains BLOCKED until DEV-OPEN-001 and DEV-OPEN-003 are satisfied.

---

## Stage 3 — DEV-OPEN-003: SERA Portable Signing-Key Integration

### Objective

Prove that SERA uses the same portable, DID-bound recovery/signing method while remaining governed by the Holder Soul ID and without restoring delegated authority automatically.

### Live Test Path

```text
Holder Soul ID
  -> governance binding
  -> SERA Agent DID
  -> current SERA key manifest
  -> encrypted SERA key object
  -> SoulScan-authorized recovery
  -> ephemeral SERA signing session
  -> fresh Trust / REV evaluation
  -> mandate revalidation where applicable
```

### Mandatory Positive Tests

- Holder/SERA governance binding validates;
- current SERA manifest resolves;
- encrypted SERA key object validates;
- replacement-device recovery succeeds;
- ephemeral SERA signing session is established;
- fresh Trust/REV evaluation occurs after recovery;
- A3/A4 mandate revalidation occurs before delegated execution.

### Mandatory Negative Tests

- wrong-holder transplant rejection;
- stale key manifest rejection;
- revoked SERA DID rejection;
- governance-binding mismatch rejection;
- expired recovery authorization rejection;
- attempt to reuse pre-recovery Trust/REV decision rejection;
- attempt to reuse stale A3/A4 mandate state rejection;
- proof that key recovery does not automatically restore delegated authority.

### Required Evidence

Evidence must include:

- Holder/SERA governance-binding test;
- replacement-device recovery;
- wrong-holder transplant rejection;
- stale-manifest rejection;
- revoked SERA DID rejection;
- fresh Trust/REV requirement;
- A3/A4 mandate revalidation evidence;
- no-plaintext-key persistence verification;
- independent security review.

### Submission and Review

1. create the DEV-OPEN-003 evidence submission record;
2. set status to `EVIDENCE_SUBMITTED`;
3. update DEV-OPEN-003 in the live evidence registry;
4. commit all evidence references together;
5. request independent review;
6. reviewer marks VERIFIED or REJECTED.

### Gate Effect

When DEV-OPEN-001, DEV-OPEN-002 and DEV-OPEN-003 are all VERIFIED or validly WAIVED:

- the automated gate derivation may advance the Signing Gate to COMPLETE;
- tracker and release manifest must be updated in the same controlled change;
- CI drift verification must pass;
- production signing remains disabled until explicit activation under release controls.

---

## Stage 4 — DEV-OPEN-004: Production EVM RPC & Signed Payload Resolver Binding

### Objective

Prove that an already authorized and signed payload can be submitted and reconciled through the production-equivalent EVM execution path without route mutation, replay, blind resubmission, or chain ambiguity.

### Live Test Path

```text
Authorized action
  -> exact signed payload resolution
  -> payload hash verification
  -> chain-ID verification
  -> production-equivalent EVM RPC
  -> transaction submission
  -> transaction hash verification
  -> reconciliation
  -> idempotent retry / unknown-outcome handling
```

### Mandatory Positive Tests

- approved RPC endpoint/provider resolves;
- environment-specific credential delivery works;
- SignedPayloadResolver returns the exact raw signed transaction;
- signed payload hash matches;
- chain ID matches the authorized action;
- expected EVM transaction hash matches;
- staging submission succeeds;
- reconciliation reaches an authoritative state;
- identical retry is handled idempotently.

### Mandatory Negative Tests

- chain-ID mismatch rejection;
- signed-payload hash mismatch rejection;
- expected/network transaction-hash mismatch rejection;
- altered raw transaction rejection;
- timeout/unknown-outcome reconciliation test;
- no blind resubmission after uncertain outcome;
- provider failover without duplicate broadcast;
- route/chain substitution rejection.

### Required Evidence

Evidence must include:

- provider/endpoint mapping;
- credential-delivery mechanism;
- signed-payload resolver mapping;
- chain-ID mismatch rejection;
- payload-hash mismatch rejection;
- transaction-hash mismatch rejection;
- timeout/unknown-outcome reconciliation;
- identical retry / no-resubmission evidence;
- successful staging transaction evidence;
- independent review.

### Submission and Review

1. create the DEV-OPEN-004 evidence submission record;
2. set status to `EVIDENCE_SUBMITTED`;
3. update DEV-OPEN-004 in the live evidence registry;
4. commit evidence references and registry update together;
5. request independent review;
6. reviewer marks VERIFIED or REJECTED.

### Gate Effect

If VERIFIED:

- DEV-OPEN-004 satisfies the mapped Execution Gate dependency;
- the automated derivation may advance the Execution Gate to COMPLETE if no other mapped blocker exists;
- tracker and release manifest must advance atomically with the evidence state;
- CI drift verification must pass;
- production asset movement remains disabled until the remaining release gates and explicit activation controls are satisfied.

---

## Evidence Submission Rules for All Four Stages

For DEV-OPEN-001 through DEV-OPEN-004:

- use stable run IDs or durable evidence references;
- record staging environment;
- record integration version;
- record commit/build SHA where applicable;
- record submission timestamp;
- record submitting team/person;
- do not include secrets in the repository;
- preserve failed/rejected evidence history;
- do not mark VERIFIED without independent review;
- do not manually override derived gate state;
- submit tracker/manifest advancement together with the registry change when verification changes a gate;
- require `npm run verify:release-drift` and full CI to pass before accepting the state change.

The live evidence registry remains authoritative:

`docs/release/evidence/SSW-SERA-Live-Integration-Evidence-Registry.json`

The controlling release-gate derivation and drift controls remain REL-03 and REL-04.


# OPEN INTEGRATION ITEMS

## DEV-OPEN-001 — Soul ID Portable Signing-Key Integration

**Source Artifacts**

- SSW-AI-PROD-05
- SSW-AI-PROD-05A
- SSW-AI-ISC-02
- SSW-AI-ISC-06
- SSW-AI-REC-01

**Status:** OPEN — LIVE SIGNING INTEGRATION TEST AND EVIDENCE SUBMISSION REQUIRED

### Immediate Required Action

The developer shall now execute the DEV-OPEN-001 live Soul ID portable signing integration test in the approved staging environment and submit the resulting evidence for independent verification.

This is the next required action for DEV-OPEN-001. Repository preparation is complete.

The developer shall:

1. deploy or bind the production-equivalent Soul ID portable signing integration in staging;
2. execute the complete live signing integration test against the controlled interfaces listed below;
3. execute all mandatory negative tests;
4. capture stable run IDs, commit/build SHA, environment references and configuration references without exposing secrets;
5. complete `docs/release/evidence/submissions/DEV-OPEN-001-evidence-submission-template.json` with the resulting evidence references;
6. submit the completed evidence package by updating the live integration evidence registry entry for DEV-OPEN-001 from `OPEN` to `EVIDENCE_SUBMITTED`;
7. request independent security/engineering verification;
8. do not mark DEV-OPEN-001 `VERIFIED` or `COMPLETE` until the independent reviewer accepts the submitted evidence.

The authoritative execution checklist is:

`docs/release/live/SSW-AI-LIVE-01-DEV-OPEN-001-Soul-ID-Portable-Signing-Key-Evidence-Packet.md`

The machine-readable submission template is:

`docs/release/evidence/submissions/DEV-OPEN-001-evidence-submission-template.json`

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

### Required Live Integration Test

The live staging test must exercise the complete path:

```text
Holder Soul ID
  -> current signed key manifest
  -> encrypted key object retrieval
  -> CID/hash verification
  -> SoulScan-authorized key access
  -> envelope opening
  -> ephemeral signing session
  -> controlled signing operation
  -> session expiry / cleanup
```

The same integration version must also demonstrate rejection of wrong CID/hash, stale key version, wrong Holder DID, expired/invalid recovery authorization, expired signing session and any API/storage attempt that would expose plaintext key material.

A unit-only or mock-only run does not satisfy this requirement.

### Evidence Submission Procedure

After the live staging test completes:

1. populate every E1-E10 entry in `docs/release/evidence/submissions/DEV-OPEN-001-evidence-submission-template.json`;
2. set the submission status to `EVIDENCE_SUBMITTED`;
3. record the staging environment, integration version, commit SHA, submission timestamp and submitter;
4. add the submitted evidence references to DEV-OPEN-001 in `docs/release/evidence/SSW-SERA-Live-Integration-Evidence-Registry.json`;
5. change only DEV-OPEN-001 registry status from `OPEN` to `EVIDENCE_SUBMITTED`;
6. commit the evidence submission, registry update and any required non-secret supporting references together;
7. allow CI drift verification to confirm that no gate is prematurely marked complete;
8. request independent review.

### Required Completion Evidence

Before this item can be marked VERIFIED/COMPLETE, provide:

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


---

## DEV-OPEN-004 — Production EVM RPC & Signed Payload Resolver Binding

**Source Artifact**

- SSW-AI-PROD-06

**Status:** OPEN — DEVELOPER INTEGRATION REQUIRED

### Controlled Architecture

The production EVM adapter is provider-neutral.

The repository supplies:

- `HttpsEvmJsonRpcClient`;
- `SignedPayloadResolver`;
- `submitEvmProduction`;
- `reconcileEvmExecution`.

### Developer Action Required

1. connect an approved production EVM RPC endpoint or provider set;
2. provide environment-specific endpoint/credential configuration;
3. bind `SignedPayloadResolver` to the actual signed-transaction storage/output of the Soul ID/SERA signing implementation;
4. ensure the resolver returns the exact raw signed transaction, signed payload hash, chain ID and expected EVM transaction hash;
5. configure failover without blind resubmission;
6. execute staging submission/reconciliation tests on approved test networks before production.

### Required Completion Evidence

- endpoint/provider mapping;
- credential delivery mechanism;
- chain-ID mismatch rejection test;
- signed-payload hash mismatch test;
- network transaction-hash mismatch test;
- timeout/unknown-outcome reconciliation test;
- identical retry/no-resubmission test;
- staging transaction evidence.

**Blocks:** Production Execution Gate / Production Release Gate.

---

## DEV-OPEN-005 — SAEL Checkpoint Signer & Encrypted Archive Provider Binding

**Source Artifact**

- SSW-AI-PROD-07

**Status:** OPEN — DEVELOPER INTEGRATION REQUIRED

### Controlled Architecture

The repository supplies:

- PostgreSQL immutable SAEL append store;
- deterministic Merkle checkpoint roots;
- `SaelCheckpointSigner` interface;
- `SaelArchiveWriter` interface;
- checkpoint/archive persistence and verification boundaries.

### Developer Action Required

1. bind `SaelCheckpointSigner` to the approved production checkpoint-signing key service;
2. bind `SaelArchiveWriter` to the approved encrypted archive storage implementation;
3. define the archive encryption profile and retention configuration;
4. verify archive retrieval against checkpoint/event hashes;
5. perform a recovery drill from archive;
6. configure integrity monitoring and alerting.

### Do Not

Developers must not:

- make the archive provider authoritative for event history;
- rewrite immutable SAEL events during archive/restore;
- store unencrypted sensitive evidence in an external archive;
- use the SAEL checkpoint key for wallet or SERA transaction signing.

### Required Completion Evidence

- checkpoint key/service mapping;
- checkpoint signature verification test;
- archive encryption profile;
- archive provider configuration;
- mutation-detection test;
- restore/recovery drill;
- retention configuration;
- integrity-monitoring evidence.

**Blocks:** Production SAEL Gate / Production Release Gate.

## DEV-OPEN-006 — Existing SSW Capability & Multi-Chain Provider Binding

**Source Artifact**

- SSW-AI-SERA-RT-06

**Status:** OPEN — DEVELOPER INTEGRATION REQUIRED

### Controlled Architecture

The repository supplies:

- deterministic route evaluation through `@soulverse/sera-routing-runtime`;
- typed existing-wallet interfaces through `@soulverse/ssw-capability-adapters`;
- route/capability safety tests.

The existing Soul Super Wallet implementations remain the source systems for live wallet functionality.

### Developer Action Required

Map the current SSW production services behind the typed adapter interfaces for:

1. supported chain/config registry;
2. chain-specific balance services;
3. gas/fee estimators;
4. payment preparation;
5. receive request generation;
6. swap quote/preparation providers;
7. WalletConnect request inspection;
8. credential listing and presentation preparation;
9. spam/token-risk signals.

Also provide the current production provider/configuration inventory requested by DB02.

### Do Not

Developers must not:

- create a bypass from these adapters to signing or broadcast;
- silently switch chains after holder review;
- use floating-point arithmetic for atomic asset values;
- allow holder route preferences to override hard risk or compatibility failures;
- treat WalletConnect inspection as approval;
- treat a credential-preparation adapter as disclosure authority;
- rebuild existing SSW services merely to satisfy the adapter boundary when a safe wrapper is sufficient.

### Required Completion Evidence

- adapter-to-existing-service mapping;
- supported-chain registry evidence;
- exact-balance and fee test evidence;
- recipient compatibility test;
- explicit-chain no-fallback test;
- route-change fresh-review test;
- WalletConnect no-auto-approval test;
- credential no-auto-disclosure test;
- staging integration results.

**Blocks:** Mobile Integration Gate / live SSW capability binding claims.

---

## DEV-OPEN-007 — Existing News, Professional Context & Asset-Risk Provider Binding

**Source Artifact**

- SSW-AI-SERA-RT-07

**Status:** OPEN — DEVELOPER INTEGRATION REQUIRED

### Controlled Architecture

The repository supplies provider-neutral interfaces and Context Broker sources for:

- existing SSW news APIs;
- LinkedIn/professional-context APIs where permitted;
- existing spam-token / asset-risk services.

All external text remains tagged as untrusted advisory context.

### Developer Action Required

1. bind the existing production news providers to `NewsProviderAdapter`;
2. bind the approved LinkedIn/professional integration to `ProfessionalContextProviderAdapter`;
3. bind the existing spam/token-risk implementation to `AssetRiskProviderAdapter`;
4. map provider timestamps, provenance, confidence and veracity into the controlled records;
5. document provider retention, privacy, terms/API scope and environment configuration;
6. preserve Context Broker minimization before model exposure.

### Do Not

Developers must not:

- treat external text as system/model instructions;
- treat LinkedIn or another professional profile as DID/credential identity proof;
- allow news to establish transaction authority;
- allow a spam classification to automatically transfer, burn or dispose of an asset;
- pass unrestricted raw provider payloads into model context;
- remove source provenance.

### Required Completion Evidence

- provider-to-interface mappings;
- source/freshness test evidence;
- malformed/untrusted-content isolation test;
- professional-context non-identity test;
- spam/risk non-execution test;
- Context Broker minimization test;
- staging API results.

**Blocks:** live external-intelligence capability claims, not continued repository construction.

---

# COMPLETION RULE

DEV-OPEN-001 through DEV-OPEN-007 are intentionally open-ended developer integration items.

They do not block continued repository construction.

They do block:

- Production Signing Gate closure;
- Production Release Gate closure;
- any claim that live Soul ID/SoulScan-backed signing is operational.

The controlled interfaces and security invariants are considered complete unless a developer discovers a material incompatibility with the existing Soul ID/SoulScan implementation.


---

## DEV-OPEN-008 — Soulogram / OpenID4VP Live Credential Presentation Binding

**Status:** OPEN  
**Introduced by:** SSW-AI-SERA-RT-08

Developers shall bind the existing Soul Super Wallet credential store and Soulogram/OpenID4VC implementation behind the RT-08 credential runtime interfaces.

Required production binding responsibilities include:

- credential metadata lookup without exposing raw credential values to SERA/model context;
- canonical verifier identity resolution;
- OpenID4VP request-object and presentation-definition validation;
- nonce/domain/audience binding;
- supported credential/proof format negotiation;
- selective-disclosure proof generation;
- proof/presentation signing using the existing controlled credential key path;
- presentation delivery;
- verifier receipt/result normalization;
- revocation/status checks where applicable;
- SAEL evidence references without duplicating sensitive claim values.

The live provider may not reinterpret or widen the authorized disclosure plan.

A prepared credential presentation is not disclosure authority.

The RT-08 controlled request hash, holder identity, SERA Agent identity, verifier identity, disclosed claim set and authorization evidence must remain invariant across proof generation and presentation.

This item blocks live credential-presentation capability claims but does not block continued construction of independent SSW-SERA runtime work.


---

## DEV-OPEN-009 — Soul ID Holder Context & SERA Governance Live Binding

**Status:** OPEN  
**Introduced by:** SSW-AI-SERA-RT-09

Developers shall bind the existing Soul ID and Soul Super Wallet identity services behind the RT-09 `SoulIdProvider` interface.

Required production binding responsibilities include:

- resolve the current Holder `did:soul`;
- return current Soul ID ACTIVE / SUSPENDED / REVOKED state;
- return the current DID-document reference and monotonic document version;
- return the current Soul ID recovery-policy reference;
- return controlled verification-method references and integrity provenance;
- resolve the current Soul Super Wallet context for that Holder DID;
- return the wallet's currently authorized SERA Agent DID;
- return the Holder/SERA governance-binding status, version and provenance;
- provide authoritative observation and validity timestamps;
- reject stale or unverifiable identity state.

The provider must not treat device registration, runtime registration or key possession as wallet ownership.

The provider must not convert Soul ID resolution, SoulScan recovery or SERA governance resolution into transaction authority.

The live binding must preserve CF-A02:

```text
Holder Soul ID
  -> Soul Super Wallet
  -> SERA Agent DID
  -> SERA Runtime
  -> Current Device / Environment
```

This item blocks claims of live Soul ID holder-context integration but does not block continued independent SSW-SERA construction.


---

## DEV-OPEN-010 — SVID4AI Agent Identity & Holder Delegation Live Binding

**Status:** OPEN  
**Introduced by:** SSW-AI-SERA-RT-10

Developers shall bind the live SVID4AI service behind the RT-10 `Svid4AiProvider` interface.

Required production binding responsibilities include:

- resolve the current SERA `did:soul:agent`;
- return current ACTIVE / SUSPENDED / REVOKED agent status;
- return the governing Holder DID;
- return the Operator DID;
- return current SVID4AI DID-document reference and monotonic version;
- return controlled verification-method references;
- return Holder/agent governance-binding reference and version;
- return integrity/provenance evidence;
- return authoritative observation and validity timestamps;
- reject stale, ambiguous or unverifiable agent identity state.

For the SSW-SERA holder-bound profile:

- governing Holder DID must equal the Soul Super Wallet Holder DID;
- Operator DID must equal the Holder DID;
- an ACTIVE SVID4AI identity does not grant transaction or credential-disclosure authority;
- holder-issued mandates remain the only delegated execution-authority objects;
- mandate scope, limits, conditions, device/runtime restrictions and expiry must remain enforced by the existing deterministic mandate runtime;
- Trust Protocol and REV remain mandatory where the mandate/policy requires them;
- AURION remains separately enforced where required;
- SERA must never self-expand or self-renew delegated authority.

This item blocks claims of live SVID4AI production integration but does not block continued controlled repository construction.


---

## DEV-OPEN-011 — Native iOS / Android SERA Shell Binding

**Status:** OPEN  
**Introduced by:** SSW-AI-MOB-01

Developers shall bind the existing Soul Super Wallet mobile applications to the MOB-01 shared shell decision contract.

Required production responsibilities include:

- map existing iOS and Android application startup state into the shared MOB-01 shell inputs;
- implement feature-flag delivery by cohort, platform, app version and jurisdiction where applicable;
- preserve direct deterministic access to balances, send, receive, swap, credentials, activity, WalletConnect, settings, security and recovery;
- implement SERA outage fallback to the conventional wallet;
- implement control-plane outage degradation to safe read-only SERA behavior;
- ensure signer unavailability blocks delegated/autonomous execution;
- keep recovery and security controls independently accessible when SERA is the default home;
- prevent platform-specific UI code from widening capabilities beyond the shared shell decision;
- record migration-stage and fallback telemetry without sensitive wallet or conversational contents;
- support deterministic rollback of `sera_primary_home` and other SERA feature flags.

MOB-01 is platform-neutral. Native Swift/SwiftUI, Kotlin/Compose or existing application-framework bindings remain implementation choices of the mobile codebase and must consume, not redefine, the shared authority/fallback semantics.

This item blocks the Mobile Integration Gate and live SERA-first mobile claims.


---

## DEV-OPEN-012 — Native Adaptive Workspace & Fallback View Rendering

**Status:** OPEN  
**Introduced by:** SSW-AI-MOB-02

Developers shall render MOB-02 adaptive workspace decisions and deterministic fallback surfaces in the existing iOS and Android Soul Super Wallet applications.

Required production responsibilities include:

- map each shared workspace kind to an OS-appropriate native surface;
- preserve the shared READ / PREPARE / NAVIGATE effect boundary;
- never implement workspace-local authority that bypasses the wallet approval/authentication path;
- visibly distinguish authoritative wallet state from external context;
- expose source/inspectability actions for the universal "Show me" path;
- navigate every generated workspace back to a canonical deterministic wallet surface;
- invalidate expired transient workspaces and request fresh authoritative state;
- preserve canonical fallback surfaces for Assets, Send, Receive, Swap, Credentials, Activity, Security, Identity, WalletConnect and Settings;
- keep Security and Identity directly reachable independent of SERA;
- respect subsystem availability and disable only the affected manual capability;
- ensure accessibility equivalents exist for every generated workspace action and fallback control.

Platform-specific presentation code may change layout, animation and native component selection, but may not widen the shared workspace effect model.

This item blocks native adaptive-workspace completion under the Mobile Integration Gate.


---

## DEV-OPEN-013 — Native Voice/Text & Concealed-Detail Interaction Binding

**Status:** OPEN  
**Introduced by:** SSW-AI-MOB-03

Developers shall bind the existing iOS and Android interaction layers to the MOB-03 shared voice/text and concealed-presentation contract.

Required production responsibilities include:

- route voice commands through the SERA-RT-04 voice safety envelope before mobile action progression;
- preserve text/voice intent parity without treating either modality as authorization;
- implement H0-H3 concealed-detail presentation across in-app, lock-screen, notification, widget, Live Activity and other supported OS surfaces;
- keep reveal, review and approval as separate state transitions and separate SAEL evidence;
- enforce authentication before H3 reveal where required;
- implement auto-rehide on app backgrounding, screen lock, device change, timeout and explicit hide;
- prevent concealed values from being spoken by SERA or accessibility output until permitted;
- enforce required-review fields before an approval control becomes eligible;
- ensure approval always routes to the deterministic approval/authentication runtime rather than being executed by the presentation component;
- keep presentation state separate from the canonical action object and material-term hash.

Native code may apply stricter privacy rules but may not weaken the shared concealment or authority separation.

This item blocks completion of native Voice UI and Concealed Details UX under the Mobile Integration Gate.


---

## DEV-OPEN-014 — Native Cross-Device Handoff & OS Proactive Surface Binding

**Status:** OPEN  
**Introduced by:** SSW-AI-MOB-04

Developers shall bind native iOS, Android, desktop/web and future wearable surfaces to the MOB-04 cross-device and proactive-surface contract.

Required production responsibilities include:

- persist and transport device-neutral task references without transporting approval or signing authority;
- resolve source and target device trust/attestation state before handoff;
- enforce target-device capability scopes;
- re-enter fresh control-plane evaluation for every consequential continuation;
- require fresh authentication for high-risk or wearable continuation where specified;
- route high-risk wearable flows to a full trusted phone/desktop surface;
- render privacy-filtered notification/widget/Live Activity/Dynamic Island/wearable payloads;
- preserve MOB-03 concealment semantics on locked and ambient surfaces;
- suppress stale or low-value proactive events according to priority/freshness policy;
- never allow native notification actions to execute consequential wallet actions outside the deterministic approval/authentication path;
- record handoff and proactive-surface lineage in SAEL without duplicating sensitive content.

Pairing, push-delivery success, watch proximity or device synchronization must never be treated as authority.

This item blocks native cross-device and proactive-surface completion under the Mobile Integration Gate.


---

## DEV-OPEN-015 — Production Feature-Flag, Cohort, Telemetry & Rollback Binding

**Status:** OPEN  
**Introduced by:** SSW-AI-MOB-05

Developers shall bind the live mobile release-control stack to the MOB-05 migration and rollback runtime.

Required production responsibilities include:

- deliver feature flags by cohort, platform, app version and jurisdiction where applicable;
- record non-sensitive migration telemetry for transaction success, crash-free sessions, fallback success, supportability and stage adoption;
- prohibit migration-stage skipping;
- preserve conventional-wallet rollback at every stage;
- enforce opt-in before SERA-first default where the release step requires it;
- prevent M3 expansion without required M2 non-regression evidence and release-gate evidence;
- prevent M4 delegation unless production signing is enabled and the release is explicitly in the delegation-pilot stage;
- provide deterministic remote rollback for SERA-first home, voice, proactive intelligence, external providers and delegated execution;
- preserve Soul ID, wallet keys, credentials, transaction history, WalletConnect and existing wallet state across rollout/rollback;
- avoid logging private conversational contents, keys, raw credentials or concealed details in rollout telemetry.

This item blocks production rollout governance and the live Mobile Integration Gate.


---

## DEV-OPEN-016 — Production Workload Identity Issuance & mTLS/SPIFFE Binding

**Status:** OPEN  
**Introduced by:** SSW-AI-INFRA-01

Developers / platform engineering shall bind the production service environment to the INFRA-01 workload-identity verifier.

Required production responsibilities include:

- select and configure the approved workload identity issuance mechanism;
- establish the production SPIFFE trust domain and trust bundle;
- map each SSW-SERA service workload to a unique SPIFFE ID;
- provision mTLS transport or an approved service-mesh equivalent that preserves authenticated peer identity;
- configure certificate/SVID issuance, renewal and rotation;
- configure service-to-service authorization grants;
- demonstrate rejection of unauthenticated, expired, wrong-domain and unapproved workload identities;
- demonstrate certificate rotation without widening service authority;
- ensure holder/session bearer tokens and HTTP identity headers cannot become workload identity;
- ensure workload private keys/certificates are never committed to the repository.

Required evidence:

- trust-domain definition;
- service-to-SPIFFE mapping;
- trust-bundle/issuer mapping;
- issuance and rotation procedure;
- staging mTLS handshake evidence;
- expired certificate rejection;
- wrong trust-domain rejection;
- ambiguous SPIFFE identity rejection;
- unauthorized target-service rejection;
- unauthorized action rejection;
- plain HTTP / asserted-header rejection.

This item blocks live workload identity claims and contributes to production environment/release gating.


---

## DEV-OPEN-017 — Production Observability Exporter, Retention & Residency Binding

**Status:** OPEN  
**Introduced by:** SSW-AI-INFRA-02

Developers / platform engineering shall bind the production telemetry pipeline to the INFRA-02 sanitization contract.

Required production responsibilities include:

- select the approved production telemetry/export stack;
- ensure sanitization occurs before exporter submission;
- map logs, metrics, traces and security signals to approved destinations;
- configure retention by telemetry class;
- configure data residency / regional placement where applicable;
- preserve request, correlation, action and trace lineage;
- prohibit holder DIDs, wallet addresses, recipient addresses and free-form holder content as metric labels;
- ensure seed phrases, private keys, raw credentials, bearer tokens, signed payloads, biometric material and unrestricted prompts/conversation contents are not exported;
- configure access control for operations/security staff;
- demonstrate that administrative observability cannot approve, sign or execute holder actions;
- provide alert routing for critical service, Trust/REV, signer, replay, reconciliation and SAEL-integrity signals.

Required evidence:

- exporter architecture;
- sanitized sample log/trace/metric payloads;
- secret-field rejection test;
- high-cardinality label rejection test;
- retention matrix;
- residency mapping;
- access-control mapping;
- critical alert test;
- incident reconstruction drill using references without sensitive payload duplication.

This item blocks live production observability claims and contributes to environment/release gating.


---

## DEV-OPEN-018 — Live Environment Separation, Secret Namespace & Promotion Binding

**Status:** OPEN  
**Introduced by:** SSW-AI-INFRA-03

Developers / platform engineering shall bind the actual development, test, staging and production infrastructure to the INFRA-03 environment-separation contract.

Required production responsibilities include:

- provision distinct database namespaces per environment;
- provision distinct secret namespaces per environment;
- provision distinct workload trust domains / credential issuers per environment;
- provision distinct telemetry namespaces per environment;
- prevent development/test credentials from authenticating to staging/production;
- prevent production secrets and production holder data from being copied into lower environments;
- enforce sequential promotion only;
- require green tests, contracts, migrations and typecheck for promotion;
- require workload identity, sanitized observability and controlled secrets before staging;
- require PRODUCTION_CANDIDATE evidence, zero release blockers, completed staging security execution and manual approval before production promotion;
- demonstrate rollback using production-safe prior artifacts/configuration rather than state copied from lower environments;
- preserve separate signing/execution gates so deployment promotion cannot enable production asset movement.

Required evidence:

- environment inventory;
- database namespace mapping;
- secret namespace mapping;
- trust-domain mapping;
- telemetry namespace mapping;
- lower-to-higher credential rejection;
- production-data-to-lower-environment prohibition evidence;
- staging promotion drill;
- production promotion dry-run with blockers;
- rollback drill;
- audit record of promotion approvals.

This item blocks live environment-separation claims and contributes to production release gating.


---

## DEV-OPEN-019 — Provider-Specific IaC, Network & Deployment Binding

**Status:** OPEN  
**Introduced by:** SSW-AI-INFRA-04

Developers / platform engineering shall bind the provider-neutral INFRA-04 deployment manifest to the selected production infrastructure stack.

Required responsibilities include:

- select the approved cloud/private/sovereign deployment provider(s);
- compile the logical trust-zone manifest into provider-specific IaC;
- preserve environment-specific database, secret, workload-identity and telemetry namespaces;
- enforce public-edge exposure only where explicitly declared;
- prevent direct public exposure of intelligence and evidence zones;
- configure internal service-to-service authentication and authorization;
- configure encrypted data stores and backup policies;
- bind secret references without embedding secret values in source or generated plans;
- route external providers only through controlled adapter services;
- configure staging and production replicas/availability consistent with the controlled manifest;
- demonstrate that infrastructure deployment does not enable production signing or asset movement;
- produce an auditable infrastructure plan/diff for every promotion.

Required evidence:

- selected provider and deployment model;
- generated IaC source;
- plan/diff output;
- trust-zone/network map;
- service exposure inventory;
- datastore encryption evidence;
- backup policy evidence;
- secret-reference validation;
- workload identity binding;
- staging deployment evidence;
- rollback/destroy safety procedure;
- production deployment dry-run with signing and asset movement still disabled.

This item blocks the live Production Deployment Gate.


---

## DEV-OPEN-020 — Live Deployment Evidence & Production Deployment Gate Closure

**Status:** OPEN  
**Introduced by:** SSW-AI-INFRA-05

Platform engineering shall produce the live evidence required to move the Production Deployment Gate beyond the repository baseline.

Required evidence includes:

- provider-specific IaC binding complete;
- generated provider plan/diff;
- no-inline-secret verification;
- trust-zone/network verification;
- workload identity binding;
- sanitized observability binding;
- controlled secret-provider binding;
- datastore encryption evidence;
- backup-policy evidence;
- deployed staging environment;
- health/readiness checks;
- rollback drill;
- drift check;
- zero open deployment blockers;
- PRODUCTION_CANDIDATE release evidence before production deployment;
- dedicated staging security execution COMPLETE;
- manual deployment approval.

A successful deployment-gate result does not enable wallet signing or production asset movement. Those remain separately gated.

This item blocks live Production Deployment Gate closure.


---

## DEV-OPEN-021 — Controlled Pilot Execution & Final Release Evidence

**Status:** OPEN  
**Introduced by:** SSW-AI-REL-01

Product, platform, security and operations teams shall produce the live pilot and final-release evidence required by REL-01.

Required pilot evidence includes:

- all pre-pilot production gates COMPLETE;
- zero open release blockers;
- controlled cohort definition and size;
- rollback readiness;
- support readiness;
- sanitized telemetry readiness;
- privacy review completion;
- incident response readiness;
- transaction-success non-regression;
- recoverability non-regression;
- security-control-access non-regression;
- zero unresolved severity-1 incidents.

Required final-release evidence includes:

- Pilot Gate COMPLETE;
- production-candidate release evidence;
- manual final release approval;
- final blocker registry with zero open release blockers.

Pilot and final-release candidacy do not themselves enable signing or production asset movement. Separate activation controls remain required.

This item blocks Pilot Gate and Production Release Gate closure.


---

## Live Integration Evidence Submission Procedure

**Introduced by:** SSW-AI-REL-02

All DEV-OPEN items shall use the controlled live-integration evidence registry before status changes are made in the project tracker.

Evidence submission procedure:

1. keep the DEV-OPEN item status OPEN until evidence exists;
2. add one or more evidence references to the registry;
3. set status to EVIDENCE_SUBMITTED;
4. include environment, commit SHA where applicable, submitter and timestamp;
5. have an independent reviewer evaluate the evidence;
6. mark VERIFIED only when the evidence demonstrates the exact live binding described by the DEV-OPEN item;
7. if evidence is insufficient, mark REJECTED and preserve the review notes;
8. never delete rejected evidence to make the history appear clean;
9. use WAIVED only through an explicit release-governance decision that records scope and expiry;
10. update the project tracker gate state only after the mapped DEV-OPEN items are VERIFIED or validly WAIVED.

Preferred evidence references include GitHub CI runs, staging execution IDs, provider configuration attestations, native test runs, security test runs, rollback drills and signed/manual approval records.

Screenshots or prose assertions alone are not sufficient for release-blocking items when machine-verifiable evidence is available.
