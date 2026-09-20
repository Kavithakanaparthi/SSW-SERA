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
