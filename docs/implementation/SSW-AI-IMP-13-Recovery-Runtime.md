# SSW-AI-IMP-13: Recovery Runtime

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-IMP-13  
**Status:** Controlled Implementation Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-IMP-12

## 1. Purpose

IMP-13 implements the first holder-anchored SERA recovery runtime.

The governing rules are:

> Soul ID recovery restores the wallet identity context.

> SERA recovery restores holder-bound agent state inside that wallet context.

> Recovery never revives old sessions, revoked devices, expired approvals or stale mandates.

## 2. Baseline Capabilities

IMP-13 provides:

- Recovery Session contract;
- SERA State Manifest contract;
- recovery-proof validation;
- Holder DID / SERA Agent DID binding;
- state-version monotonicity and rollback detection;
- wrapped-state-key eligibility checks;
- recovery-plan generation;
- explicit authority reset;
- explicit old-session invalidation;
- explicit revoked-device preservation.

## 3. SoulScan Separation

SoulScan facial biometric recovery may establish the Holder Soul ID wallet context.

It does not authorize a transaction.

## 4. Restored State

Allowed portable state classes include preferences, aliases, voice adaptation, notification policy, concealment settings and approved non-secret memory.

The runtime refuses to restore raw private keys, seed phrases, raw biometric templates, old sessions or revoked authority.

## 5. Authority Re-Establishment

Recovery output always requires fresh:

- device registration;
- runtime registration;
- attestation;
- Trust/REV;
- approval or mandate evaluation for consequential actions.

## 6. Next Controlled Artifact

**SSW-AI-IMP-14: Counterparty Resolver Runtime**
