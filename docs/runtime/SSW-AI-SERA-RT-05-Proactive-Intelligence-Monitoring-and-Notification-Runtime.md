# SSW-AI-SERA-RT-05: Proactive Intelligence, Monitoring & Notification Runtime

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-SERA-RT-05  
**Status:** Controlled Runtime Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-SERA-RT-04

## 1. Purpose

RT-05 implements the deterministic proactive-intelligence control layer defined by DB09.

The governing invariant is:

> Monitoring permission is not transaction authority, and an external signal is never execution permission.

## 2. Implemented Objects

The runtime introduces:

- Monitoring Grant;
- Proactive Signal;
- Proactive Assessment;
- Notification Decision;
- privacy-safe notification rendering;
- durable evidence/provenance.

## 3. Monitoring Grants

A monitoring grant controls whether SERA may evaluate a signal class for a holder.

A grant contains:

- holder DID;
- SERA Agent DID;
- signal class;
- scope;
- allowed delivery classes;
- processing preference;
- retention;
- validity;
- enabled state.

Every grant carries:

`authority_effect: "NONE"`

It cannot authorize a transaction, credential disclosure, mandate or signing operation.

## 4. Signal Normalization

All source adapters normalize into a Proactive Signal.

Signal classes include:

- WALLET;
- CHAIN;
- CREDENTIAL;
- SECURITY;
- TRUST;
- NEWS;
- PROFESSIONAL_CONTEXT;
- SERVICE.

A normalized signal carries source identity, source class, confidence, freshness, veracity state, evidence references, subject, severity and a deterministic deduplication key.

Raw source content is not required by the assessment engine.

## 5. Veracity

Veracity states:

- CONFIRMED;
- HIGH_CONFIDENCE;
- CORROBORATED;
- UNCONFIRMED;
- CONFLICTING;
- STALE.

External NEWS and PROFESSIONAL_CONTEXT signals are capped below critical interruption unless independently corroborated by authoritative holder-relevant state.

## 6. Deterministic Assessment

Assessment inputs are normalized factors from 0 to 1:

- exposure;
- relationship;
- actionability;
- risk impact;
- holder preference;
- recency;
- duplicate penalty;
- fatigue penalty.

The runtime combines those with source confidence and signal severity.

A model may later explain an assessment. It does not choose the interruption class.

## 7. Urgency

- U0 SILENT
- U1 INFORMATIONAL
- U2 RELEVANT
- U3 ACTION_REQUIRED
- U4 CRITICAL

## 8. Notification Decisions

- SUPPRESS
- RECORD
- DIGEST
- SURFACE_IN_CONTEXT
- NOTIFY
- INTERRUPT

The runtime does not emit EXECUTE.

## 9. Duplicate Suppression

Signals use holder-scoped dedupe keys.

An identical incident arriving repeatedly can be stored once and assessed without generating repeated holder interruptions.

Source corroboration can be represented as a new normalized signal version in a later extension; duplicate delivery alone does not increase confidence.

## 10. Privacy Rendering

For locked/public surfaces, sensitive ACTION_REQUIRED and CRITICAL alerts render generic text rather than financial, credential or identity details.

Detailed content is available only after the experience layer establishes the permitted display context.

## 11. Evidence

Every assessment stores:

- signal ID;
- monitoring grant ID;
- factor inputs;
- relevance score;
- urgency;
- notification class;
- final decision;
- reason codes;
- evidence references.

This supports holder questions such as:

> Why did SERA alert me?

## 12. Authority Boundary

RT-05 may:

- detect;
- normalize;
- correlate;
- score;
- suppress;
- notify;
- prepare a future action proposal.

It cannot:

- sign;
- execute;
- activate a mandate;
- disclose a credential;
- move assets.

Any action triggered from an alert must re-enter the normal Action Contract, authority, Trust Protocol and REV path.

## 13. Next Runtime Artifact

**SSW-AI-SERA-RT-06: Multi-Chain Routing & Existing SSW Capability Adapters**
