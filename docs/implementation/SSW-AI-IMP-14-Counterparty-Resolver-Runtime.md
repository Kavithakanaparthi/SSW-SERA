# SSW-AI-IMP-14: Counterparty Resolver Runtime

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-IMP-14  
**Status:** Controlled Implementation Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-IMP-13

## 1. Purpose

IMP-14 implements deterministic counterparty resolution from human-friendly references into canonical authority identifiers.

The governing rule is:

> Labels assist recognition. Canonical identifiers determine who the system may actually act with.

## 2. Resolver Behavior

The resolver consumes candidate records from approved sources and returns the existing `ssw.counterparty-resolution.v1` machine contract.

It enforces:

- canonical identifier typing;
- chain qualification for addresses/contracts;
- provenance;
- verification status;
- freshness;
- deterministic ambiguity outcomes;
- holder confirmation requirements;
- external-profile non-authority;
- SERA Agent DID / Holder DID separation.

## 3. Executable Resolution

Only a UNIQUE resolution may be used as a material execution counterparty.

UNRESOLVED, MULTIPLE_CANDIDATES, LOW_CONFIDENCE and CONFLICTING_IDENTIFIERS block consequential action construction.

## 4. External Profiles

EXTERNAL_PROFILE may contribute context.

It cannot by itself produce an executable payment identity.

## 5. Chain Qualification

CHAIN_ADDRESS and CONTRACT_ADDRESS identifiers require:

- chain_id;
- normalized_value.

An unqualified address is not authority-grade identity.

## 6. Freshness

STALE, REVOKED or CONFLICTED candidates cannot become an executable selected identity.

## 7. Material Change

Changing the selected canonical identifier after Action Contract creation is a material-term mutation and requires a new authorization cycle.

## 8. Next Controlled Artifact

**SSW-AI-IMP-15: End-to-End Control Path Integration**
