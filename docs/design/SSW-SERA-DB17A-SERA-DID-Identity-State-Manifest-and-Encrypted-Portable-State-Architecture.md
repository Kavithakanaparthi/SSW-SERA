# SSW-SERA-DB17A: SERA DID Identity, State Manifest & Encrypted Portable State Architecture

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB17A  
**Status:** Controlled Design Board / Pre-Freeze Closure Input  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

This document defines the persistent identity, recovery, portability, state versioning, encrypted backup and runtime-instance model for SERA.

It resolves a key pre-freeze question: whether SERA should be backed up to conventional cloud infrastructure, to IPFS, or against the holder's decentralized identity.

The architectural conclusion is that these are not equivalent choices and should not be collapsed into one storage decision.

The governing principle is:

> SERA is recovered through identity, not through an account.

SERA identity, SERA portable state, and SERA runtime instances are separate architectural objects with different trust, storage and recovery requirements.

## 2. Core Architectural Decision

SERA SHALL possess a persistent agent DID linked to and governed by the holder's Soul ID.

Conceptually:

```text
did:soul:holder
      |
      | controls / delegates to
      v
did:soul:agent:sera
```

The SERA DID SHALL be independent of:

- the physical device;
- mobile operating system;
- wearable platform;
- AI model provider;
- cloud provider;
- storage provider;
- application installation;
- local runtime process.

SERA's identity SHALL therefore survive device replacement, model-provider replacement, application migration and backend migration.

## 3. Holder DID and SERA DID Relationship

The holder remains the principal.

The holder DID establishes the root identity relationship. The SERA DID represents the holder-bound AI agent.

The relationship SHALL support:

- holder control or delegated control;
- explicit agent identity;
- cryptographic verification methods;
- capability references;
- device/runtime bindings;
- authority and delegation references;
- revocation;
- rotation;
- recovery;
- audit linkage.

The SERA DID MUST NOT itself imply unrestricted wallet authority.

Identity establishes who SERA is. Authority determines what a specific SERA runtime may do.

## 4. SERA Identity Is Not SERA Memory

The SERA DID SHOULD remain compact and identity-oriented.

It SHOULD NOT directly contain:

- conversational memory;
- financial history;
- balances;
- credential claims;
- voice recordings;
- voice biometrics;
- behavioral history;
- transaction details;
- raw personalization state;
- private wallet keys;
- seeds or recovery secrets.

These belong in separate protected state or evidence domains.

## 5. Three Separate Persistence Domains

The architecture SHALL distinguish:

### 5.1 Identity Domain

Persistent SERA identity and holder relationship.

Examples:

- `did:soul:agent:sera`;
- controller/delegation relationship;
- verification methods;
- service references;
- revocation state.

### 5.2 Portable State Domain

Holder-specific state required to restore SERA continuity.

Examples:

- preferences;
- aliases;
- pronunciation adaptations;
- language preferences;
- approved personalization;
- interaction preferences;
- notification preferences;
- concealed-detail preferences;
- non-secret runtime configuration;
- holder-approved memory classes.

### 5.3 Evidence Domain

Historical record of what SERA did.

This domain is governed by DB11 and DB17B and SHALL NOT be merged into portable conversational memory.

## 6. SERA State Manifest

Portable SERA state SHALL be referenced through a signed and versioned State Manifest.

Illustrative structure:

```json
{
  "type": "SERAStateManifest",
  "sera_did": "did:soul:agent:sera:...",
  "holder_did": "did:soul:...",
  "state_version": 27,
  "previous_state_cid": "bafy...",
  "current_state_cid": "bafy...",
  "created_at": "...",
  "encryption_profile": "SSW-SERA-STATE-ENC-1",
  "schema_version": "1.0",
  "authorized_recovery_policy_ref": "...",
  "signature": "..."
}
```

The manifest SHALL establish:

- SERA identity;
- holder relationship;
- current authorized state version;
- previous state lineage where retained;
- schema version;
- encryption profile;
- recovery policy reference;
- signature or equivalent integrity protection.

## 7. Content-Addressed Portable State

Portable state SHOULD use content-addressed storage so that modification produces a new immutable content identifier.

IPFS is an appropriate persistence mechanism for encrypted portable state because it supports content-addressed objects and location-independent retrieval.

However:

> IPFS is a storage and distribution substrate, not an authorization system and not a confidentiality boundary.

Therefore all holder-sensitive SERA state SHALL be encrypted before publication to IPFS or any equivalent content-addressed network.

## 8. Hybrid Persistence Model

The recommended persistence model is:

```text
Holder DID
   |
   v
SERA DID
   |
   v
Signed State Manifest
   |
   v
Encrypted State CID
   |
   +--> IPFS / content-addressed persistence
   +--> encrypted cloud replica
   +--> local device copy / cache
```

No single storage provider SHALL be authoritative for SERA identity.

Cloud persistence MAY be used for:

- availability;
- redundancy;
- low-latency restoration;
- synchronization;
- disaster recovery.

Cloud storage SHALL NOT become the source of identity or authority.

## 9. Persistence and Pinning

Content addressing does not itself guarantee long-term persistence.

The implementation SHALL therefore define a persistence policy that may include:

- Soulverse-operated IPFS pinning;
- multiple independent pinning providers;
- encrypted cloud object storage;
- holder-controlled local copies;
- recovery export packages;
- periodic availability verification.

Loss of a single persistence provider MUST NOT destroy the holder's SERA state where redundancy policy is satisfied.

## 10. Portable State Bundle

The encrypted state bundle SHOULD be logically compartmentalized.

Illustrative structure:

```text
sera-state/
    identity-metadata/
    preferences/
    language/
    voice-adaptation/
    aliases/
    approved-memory/
    wallet-context-preferences/
    counterparty-aliases/
    automation-preferences/
    notification-preferences/
    concealed-detail-preferences/
    ui-preferences/
```

The physical encoding MAY use CAR/IPLD or another canonical structured format suitable for content-addressed storage.

## 11. Data That MUST NOT Be Stored as Portable SERA State

The portable state bundle MUST NOT contain ordinary copies of:

- wallet private keys;
- seed phrases;
- raw recovery phrases;
- device Secure Enclave keys;
- Android keystore private keys;
- biometric templates;
- unrestricted signing handles;
- raw Trust Protocol secrets;
- privileged REV secrets;
- raw identity-document images unless separately governed;
- raw voice recordings by default.

These remain within their appropriate cryptographic, biometric, credential or evidence domains.

## 12. Memory Classes and Backup Policy

SERA memory SHALL be classified before inclusion in portable state.

Suggested classes:

| Class | Description | Portable Backup |
|---|---|---|
| M0 | Ephemeral reasoning / transient context | No |
| M1 | Session context | No, unless explicit continuation policy |
| M2 | Holder preferences | Yes, encrypted |
| M3 | Learned holder context such as aliases and pronunciations | Yes, encrypted |
| M4 | Sensitive structured context | Separate protected storage / policy governed |
| M5 | Execution evidence and audit history | No, separate evidence architecture |

This prevents conversational convenience from becoming uncontrolled data accumulation.

## 13. Voice Adaptation Portability

Voice adaptation SHOULD be portable where the holder enables it.

Portable voice state may include:

- pronunciation corrections;
- vocabulary adaptation;
- accent adaptation parameters;
- preferred language and code-switching patterns;
- holder-approved aliases;
- correction history summaries.

Raw voice recordings SHOULD NOT be required for normal SERA restoration.

Voice biometric material, if ever used, SHALL be governed separately from general voice adaptation.

## 14. SERA DID Is Not a Runtime Instance

A persistent SERA DID may have multiple runtime instances.

Example:

```text
SERA DID
   |
   +-- Primary phone runtime
   +-- Secondary phone runtime
   +-- Apple Watch runtime
   +-- Wear OS runtime
   +-- protected cloud reasoning runtime
```

Each runtime SHALL have its own:

- runtime identifier;
- device/environment binding;
- trust state;
- capability scope;
- authority scope;
- attestation state where supported;
- lifecycle state;
- revocation state.

No runtime inherits unrestricted authority merely because it is associated with the SERA DID.

## 15. Example Runtime Authority Model

```text
SERA Agent DID
      |
      +-- Runtime A
      |     Device: Primary Phone
      |     Authority: Full interactive within policy
      |
      +-- Runtime B
      |     Device: Watch
      |     Authority: Limited / wearable-scoped
      |
      +-- Runtime C
            Environment: Protected Cloud
            Authority: Reasoning only
            Signing: NONE
```

This preserves identity continuity without collapsing device trust into agent identity.

## 16. Recovery Flow

Reference recovery sequence:

```text
New Device
   |
   v
Holder recovers / authenticates Soul ID
   |
   v
Resolve SERA DID
   |
   v
Resolve current signed State Manifest
   |
   v
Retrieve encrypted state bundle
   |
   v
Verify CID + manifest signature + version lineage
   |
   v
Satisfy recovery / decryption policy
   |
   v
Decrypt approved portable state
   |
   v
Register new runtime/device
   |
   v
Assign device-scoped authority
   |
   v
Restore SERA continuity
```

Recovery of SERA state SHALL NOT automatically restore unrestricted transaction authority.

Device registration and authority must be re-established according to device-trust and policy requirements.

## 17. Recovery Security

Recovery SHALL defend against:

- stale-state rollback;
- unauthorized manifest substitution;
- CID substitution;
- compromised storage providers;
- replayed recovery requests;
- unauthorized device registration;
- cross-holder state confusion;
- malicious state injection.

Minimum controls SHOULD include:

- signed manifest verification;
- holder/SERA DID binding verification;
- monotonically increasing or otherwise protected state versioning;
- previous-state lineage checks;
- authenticated decryption;
- device-registration controls;
- recovery event evidence.

## 18. State Versioning and Rollback

Each durable SERA state update SHALL produce a new version.

The system SHOULD preserve enough lineage to:

- verify continuity;
- detect rollback;
- recover from corrupt state;
- support limited holder-selected rollback where policy allows;
- preserve auditability of state transitions.

Rollback SHALL NOT rewrite action evidence.

## 19. Synchronization

Multiple SERA runtimes may need synchronized non-sensitive state.

Synchronization SHALL be policy-scoped and conflict-aware.

Examples:

- language preferences may sync broadly;
- concealed-detail preference may sync by device class;
- wearable authority SHALL NOT sync merely as a preference;
- delegated authority objects SHALL remain in the authority domain;
- execution evidence SHALL remain in the evidence domain.

## 20. Cloud Reasoning Boundary

A cloud SERA runtime MAY process holder-approved context for reasoning.

It MUST NOT receive unrestricted signing capability merely because it is a SERA runtime.

A cloud runtime SHOULD be treated as:

- an intelligence endpoint;
- a planning endpoint;
- a contextual reasoning endpoint;
- optionally a notification/orchestration endpoint.

It SHALL remain outside the private-key boundary.

## 21. Model Provider Independence

SERA identity SHALL not depend on any one model provider.

The portable state format SHOULD therefore avoid provider-specific opaque memory constructs wherever practical.

Holder state SHOULD be represented using Soulverse-controlled canonical schemas so that SERA can move between:

- local models;
- cloud models;
- future model providers;
- hybrid reasoning stacks.

## 22. Privacy Model

Portable state SHALL follow:

- local-first handling for sensitive data;
- encryption before remote persistence;
- purpose limitation;
- memory-class separation;
- holder-controlled deletion/reset where technically and legally possible;
- minimized metadata leakage;
- no use of portable state for model training without explicit holder consent.

## 23. IPFS Privacy Caveat

Even when payloads are encrypted, content identifiers and network-level retrieval metadata may reveal that an object exists or is being accessed.

Therefore the implementation SHOULD evaluate:

- private or controlled IPFS networks where appropriate;
- gateway privacy;
- encrypted manifests;
- indirection layers;
- rotating state objects;
- limited metadata exposure;
- holder-controlled retrieval patterns.

## 24. Deletion and Revocation

Because content-addressed systems may retain copies outside the holder's control, deletion SHALL be implemented primarily through cryptographic revocation and key destruction where necessary.

A revoked state object SHALL no longer be considered authoritative even if its ciphertext remains retrievable.

The active signed manifest SHALL determine the current authorized state.

## 25. Lost Device Scenario

If a device is lost:

1. revoke or suspend the device runtime;
2. preserve the SERA DID;
3. preserve portable state;
4. rotate affected device/runtime credentials;
5. recover on a new trusted device;
6. re-establish device-scoped authority;
7. retain evidence of the revocation and recovery process.

Losing a phone MUST NOT mean losing SERA identity.

## 26. SERA Replacement and Rebinding

The architecture SHOULD support a holder choosing to:

- reset SERA personality/personalization;
- create a new SERA agent DID;
- archive a prior SERA DID;
- transfer selected portable state to a new SERA instance;
- preserve historical evidence independently.

This prevents the SERA DID from becoming an irreversible lifetime lock-in.

## 27. Relationship to DB08

DB08 defines memory, context and personalization policy.

DB17A defines how the durable subset of that state is:

- identified;
- encrypted;
- versioned;
- stored;
- recovered;
- moved between devices and runtimes.

## 28. Relationship to DB11 and DB17B

Portable state and audit evidence SHALL remain separate.

SERA memory MAY help the agent assist the holder.

SERA evidence SHALL prove what the agent did.

The activity/evidence ledger MUST NOT depend on conversational memory for historical reconstruction.

## 29. Relationship to DB05 and DB13

The SERA DID does not grant execution authority by itself.

DB05 defines authority boundaries. DB13 defines runtime control-plane enforcement.

Therefore:

```text
SERA Identity
   !=
SERA Authority
   !=
Device Authority
   !=
Signing Authority
```

These remain separate control domains.

## 30. Candidate Architecture Decisions

**D17A-01** SERA SHALL have a persistent `did:soul:agent` identity linked to the holder's Soul ID.

**D17A-02** SERA identity SHALL be independent of device, model provider, cloud provider and storage provider.

**D17A-03** SERA DID SHALL NOT contain holder memory, financial history or raw sensitive state.

**D17A-04** Portable SERA state SHALL be represented as encrypted, versioned state objects referenced through signed manifests.

**D17A-05** Content-addressed storage such as IPFS SHOULD be used for portable-state integrity and location-independent recovery.

**D17A-06** IPFS content SHALL be encrypted before publication when it contains holder-specific SERA state.

**D17A-07** Cloud storage MAY provide redundancy and availability but SHALL NOT constitute the authoritative SERA identity or authority record.

**D17A-08** Multiple persistence mechanisms SHOULD be supported to avoid single-provider dependence.

**D17A-09** SERA runtime instances SHALL be separately identified and device/environment scoped.

**D17A-10** SERA DID association SHALL NOT cause a runtime to inherit unrestricted authority.

**D17A-11** Recovery of SERA state SHALL NOT automatically restore unrestricted signing or transaction authority.

**D17A-12** Private keys, seeds, raw recovery secrets and biometric templates SHALL NOT be ordinary portable SERA state.

**D17A-13** Durable holder memory SHALL be explicitly classified before backup.

**D17A-14** Execution evidence and audit history SHALL remain separate from conversational/personalization state.

**D17A-15** Model-provider-specific memory formats SHALL not become the canonical SERA state model.

**D17A-16** State revocation SHALL be governed by the active signed manifest and cryptographic policy, not by assumed deletion from every storage node.

## 31. Pre-Freeze Closure Result

DB17 identified "SERA memory recovery and portability rules" as a pre-freeze blocker.

DB17A resolves that blocker at architectural level.

The remaining implementation work includes:

- exact `did:soul:agent` document profile;
- State Manifest JSON schema;
- encryption and key-wrapping profile;
- CID/CAR encoding profile;
- pinning and redundancy policy;
- recovery proof protocol;
- synchronization conflict rules;
- runtime registration schema;
- portability test vectors.

These can proceed as controlled specifications after the core architecture is frozen.

## 32. Final Architectural Principle

> SERA's identity lives in the DID relationship. SERA's continuity lives in encrypted portable state. SERA's accountability lives in the evidence ledger. Storage providers may preserve these objects, but they do not become the holder's authority.