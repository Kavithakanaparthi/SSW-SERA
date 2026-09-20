# SSW-AI-SERA-RT-02: Context Broker & Purpose-Bound Context Retrieval

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-SERA-RT-02  
**Status:** Controlled Runtime Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-SERA-RT-01

## 1. Purpose

SERA-RT-02 implements the policy-enforcing Context Broker between SERA reasoning and wallet/context sources.

The governing invariant is:

> A model receives only the minimum purpose-bound context permitted for the requested capability.

## 2. Context Sources

The broker consumes structured source adapters.

Sources may represent:

- live wallet state;
- explicit holder preferences;
- entity aliases;
- credential metadata;
- device/runtime state;
- security/risk signals;
- approved external context.

Models never receive direct database access through the broker.

## 3. Context Tiers

- C0 — no model context
- C1 — public/non-sensitive
- C2 — abstracted personal
- C3 — sensitive task context
- C4 — restricted task context
- C5 — prohibited

C5 is never emitted.

## 4. Model Location

Supported model locations:

- NONE
- ON_DEVICE
- PROTECTED_CLOUD

Cloud retrieval is separately bounded by each capability policy and by each source item's external-transmission flag.

## 5. Capability Policy

Each capability policy defines:

- allowed context keys;
- required versus optional keys;
- allowed fields per key;
- maximum context tier;
- maximum cloud tier;
- permitted retention class.

A model cannot request an arbitrary wallet field and cause the broker to retrieve it.

## 6. Field Minimization

Source values are reduced to policy-allowed top-level fields before entering the Context Manifest.

Unlisted fields are discarded.

## 7. Freshness

A required source item whose validity window has expired is not used.

The manifest becomes INCOMPLETE rather than allowing stale data to masquerade as current state.

## 8. Prohibited Data

The following remain prohibited regardless of capability policy:

- private keys;
- seed phrases;
- signing secrets;
- raw recovery secrets;
- raw biometric templates;
- unrestricted signing handles.

## 9. Context Manifest

The broker emits a typed Context Manifest containing:

- request/capability/purpose;
- minimized context items;
- source references;
- provenance;
- observed/freshness timestamps;
- confidence;
- retention class;
- external-transmission eligibility;
- exclusions and reason codes;
- manifest hash.

## 10. Persistence

Context values are not persisted by SERA-RT-02.

For auditability, the Context Broker stores only manifest metadata:

- manifest ID/hash;
- context keys;
- tiers;
- source references;
- provenance;
- freshness;
- exclusion reasons.

This avoids converting operational logging into a shadow holder-data store.

## 11. Authority Boundary

Context never grants authority.

An alias, behavioral pattern, news item or previous transfer may help SERA propose a transaction.

The final counterparty, authority, Trust/REV and Action Contract controls remain independent.

## 12. Failure Behavior

Missing personalization degrades to generic behavior.

Missing or stale required consequential context produces INCOMPLETE.

Explicitly prohibited or unauthorized requested context produces BLOCKED.

## 13. Next Runtime Artifact

**SSW-AI-SERA-RT-03: SERA Memory Domains & Holder-Controlled Personalization**
