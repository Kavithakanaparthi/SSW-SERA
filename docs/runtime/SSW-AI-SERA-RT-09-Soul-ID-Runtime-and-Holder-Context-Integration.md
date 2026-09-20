# SSW-AI-SERA-RT-09: Soul ID Runtime & did:soul Holder Context Integration

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-SERA-RT-09  
**Status:** Controlled Runtime Baseline — IN PROGRESS  
**Date:** 2026-09-19  
**Parent:** SSW-AI-SERA-RT-08  
**Normative Inputs:** SSW-AI-CF-A02, SSW-SERA-DB17A, SSW-AI-ISC-06, SSW-AI-IMP-13

## 1. Purpose

RT-09 operationalizes the Soul ID holder identity context required by SERA.

The governing hierarchy remains:

```text
Holder Soul ID
  -> anchors Soul Super Wallet
  -> governs SERA Agent DID
  -> represented by current SERA runtime
  -> constrained by current device/environment
```

The device is not the wallet ownership root.

## 2. Runtime Responsibilities

RT-09 provides a provider-neutral runtime boundary to:

- resolve the current Holder `did:soul`;
- validate Holder DID namespace and status;
- obtain current DID-document provenance and version metadata;
- resolve the current Soul Super Wallet holder context;
- verify the wallet's authorized SERA Agent DID;
- verify the Holder DID / SERA governance relationship;
- expose minimized holder identity context to the Context Broker;
- preserve Soul ID/SoulScan as the recovery root;
- fail closed on revoked, suspended, stale or mismatched identity state.

RT-09 does not rebuild Soul ID.

## 3. Holder Identity Context

The controlled context records:

- Holder DID;
- SERA Agent DID;
- wallet context reference;
- Soul ID ACTIVE state;
- DID-document reference;
- DID document version;
- recovery-policy reference;
- verification-method references at the deterministic runtime boundary;
- integrity/provenance reference;
- verified SERA governance binding;
- binding version;
- freshness window;
- explicit continuity semantics.

The machine contract fixes:

`wallet_ownership_root = SOUL_ID`

`device_ownership_root = false`

`recovery_root = SOUL_ID_SOULSCAN`

`authority_effect = NONE`

## 4. Identity Is Not Authority

A resolved Holder DID answers who the wallet is anchored to.

A verified SERA governance binding answers which SERA Agent DID belongs to that holder's wallet context.

Neither result authorizes:

- payment;
- credential disclosure;
- signing;
- mandate creation;
- mandate use;
- device trust;
- runtime eligibility.

Those remain separate control-plane decisions.

## 5. Fail-Closed Rules

The runtime blocks on:

- invalid Holder DID namespace;
- Holder DID using the agent namespace;
- invalid SERA Agent DID namespace;
- Holder/SERA identity collision;
- unresolved Soul ID;
- Holder binding mismatch;
- suspended Soul ID;
- revoked Soul ID;
- invalid DID document version;
- stale identity resolution;
- missing Soul ID provenance;
- unresolved wallet identity context;
- wallet Holder DID mismatch;
- wrong authorized SERA Agent DID;
- suspended/revoked SERA governance relationship;
- invalid governance-binding version;
- stale wallet identity context;
- missing governance provenance.

## 6. Context Broker Integration

The holder identity ContextSource exposes only minimized C2 wallet-state metadata.

It does not expose:

- private keys;
- raw DID documents;
- recovery secrets;
- SoulScan biometric material;
- unrestricted verification-method material;
- transaction authority.

External transmission is disabled by default.

## 7. Relationship to Recovery

RT-09 complements the existing recovery runtime.

Canonical recovery remains:

```text
SoulScan recovery
 -> Holder Soul ID recovered
 -> wallet context established
 -> authorized SERA Agent DID resolved
 -> SERA state restored
 -> current device/runtime registered
 -> Trust / REV / authority re-established
```

Recovery identity continuity must not silently restore old approvals, mandates or sessions.

## 8. Live Integration Handoff

The existing Soul ID and Soul Super Wallet identity implementations remain authoritative live systems.

The production provider must supply:

- Holder DID resolution;
- current DID document version/provenance;
- Soul ID status;
- recovery-policy reference;
- current wallet Holder binding;
- current authorized SERA Agent DID;
- governance-binding status/version/provenance;
- freshness metadata.

Provider data must map into the RT-09 interfaces without changing the architecture.

## 9. Next Runtime Artifact

**SSW-AI-SERA-RT-10: SVID4AI Runtime & Holder-Bound SERA Agent DID / Delegation Integration**
