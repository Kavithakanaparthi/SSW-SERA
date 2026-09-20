# SSW-AI-SERA-RT-03: SERA Memory Domains & Holder-Controlled Personalization

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-SERA-RT-03  
**Status:** Controlled Runtime Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-SERA-RT-02

## 1. Purpose

SERA-RT-03 implements durable holder-controlled personalization without allowing memory to become authority.

The governing invariant is:

> Memory may improve interpretation and recommendations. Memory never grants permission to execute.

## 2. Implemented Memory Domains

The first runtime supports:

- M1 — HOLDER_PREFERENCE
- M2 — LANGUAGE_VOICE
- M3 — ENTITY_ALIAS
- M4 — BEHAVIORAL_CONVENIENCE

The following are intentionally excluded:

- M5 delegation/policy, which belongs in the deterministic mandate/policy stores;
- M6 evidence, which belongs in SAEL;
- M7 keys/recovery/signing secrets, which are prohibited from memory.

## 3. Provenance

Durable writes require one of:

- HOLDER_EXPLICIT
- HOLDER_CORRECTION
- SYSTEM_OBSERVED

A model inference alone is not accepted as a durable memory authority source.

## 4. Authority

Every memory object carries:

`authority_effect: "NONE"`

This is a machine contract, not a UI convention.

Entity aliases may assist candidate resolution, but the final counterparty used for execution must still pass the canonical Counterparty Resolver.

## 5. Confidence

Confidence is recorded from 0 to 1.

Holder-explicit and holder-correction writes may use high confidence.

System-observed convenience memory remains non-authoritative regardless of confidence.

## 6. Retention

Supported memory retention:

- RT1 temporary convenience
- RT2 explicit preference
- RT3 personal vocabulary / aliases

Authority retention RT4, evidence RT5 and key lifecycle RT6 are not valid ordinary memory retention classes.

## 7. Context Tier

Durable memory may be classified C1 through C4.

C5 is prohibited.

A memory row also states whether it may be transmitted externally through the Context Broker.

The Context Broker remains responsible for final task-specific minimization.

## 8. Inspection

Holder-scoped memory can be inspected by domain and key.

Deleted memory values are not returned.

## 9. Correction

A correction updates the same logical memory item with:

- a new version;
- HOLDER_CORRECTION provenance;
- refreshed confidence;
- updated value;
- an evidence/outbox event.

Corrections do not create authority rules.

## 10. Forget / Delete

Forget transitions a memory record to DELETED and replaces the retained value with an empty object.

The system preserves only the minimum tombstone metadata required to prove that deletion occurred.

A deletion event is emitted through the transactional outbox.

## 11. Expiry

Expired memory is not returned for active retrieval.

The runtime can mark expired records EXPIRED without converting them into history-derived authority.

## 12. Prohibited Material

Recursive write validation rejects fields associated with:

- private keys;
- seed phrases;
- signing secrets;
- recovery secrets;
- raw biometric templates;
- unrestricted signing handles;
- passwords;
- authentication tokens.

## 13. Context Broker Integration

A memory-backed Context Source adapter exposes a selected memory item to SERA-RT-02.

The adapter returns:

- structured value;
- context tier;
- memory provenance;
- confidence;
- retention;
- source reference;
- external-transmission flag.

The Context Broker still applies capability allowlists and field minimization.

## 14. Next Runtime Artifact

**SSW-AI-SERA-RT-04: Voice Runtime, Numerical Safety & Correction Learning**
