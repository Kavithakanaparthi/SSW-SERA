# SSW-AI-MOB-05: Staged SERA-First Migration, Cohort Rollout & Rollback Control

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-MOB-05  
**Status:** Controlled Mobile Integration Baseline — IN PROGRESS  
**Date:** 2026-09-19  
**Parent:** SSW-AI-MOB-04  
**Normative Input:** SSW-SERA-DB16

## 1. Purpose

MOB-05 operationalizes the staged migration from the current Soul Super Wallet experience to a SERA-first wallet.

The governing principle remains:

`Preserve capability, change orchestration.`

No migration stage may remove deterministic wallet recovery, security or conventional-wallet fallback.

## 2. Migration Stages

MOB-05 controls progression through:

- M0 baseline/instrumentation;
- M1 additive SERA assistant;
- M2 primary coordinator;
- M3 SERA-first default;
- M4 controlled delegation.

Stage skipping is prohibited.

## 3. Release Sequence Binding

The runtime aligns migration with DB16 release sequencing:

- R0 internal architecture prototype;
- R1 internal wallet integration;
- R2 controlled execution preparation;
- R3 controlled production cohort;
- R4 SERA-first opt-in;
- R5 SERA-first default;
- R6 delegation pilot.

M4 delegated execution requires R6 and production signing.

## 4. M3 Evidence Gate

M3 requires evidence that M2 did not reduce:

- transaction success;
- recoverability;
- user comprehension;
- access to security controls;
- supportability.

It also requires all ten DB16 release gates:

- functional parity;
- intent accuracy;
- transaction safety;
- privacy;
- Trust/REV binding;
- recovery;
- evidence;
- accessibility;
- performance;
- supportability.

## 5. Cohort Limits

The controlled baseline applies conservative maximum cohort limits:

- M1: up to 100%;
- M2: up to 25%;
- M3 before R5: up to 10%;
- M3 at R5: up to 100%;
- M4: up to 5%.

Production governance may choose stricter limits.

## 6. Rollback

Rollback is deterministic.

Supported modes include:

- read-only SERA;
- disable SERA-first home;
- disable proactive surfaces;
- disable voice;
- disable delegation;
- conventional wallet.

Critical incidents, privacy incidents, material transaction regression or fallback failure force conventional-wallet rollback.

Control-plane outage degrades to read-only SERA.

Signer outage disables delegation.

External-provider failure disables dependent proactive context rather than the wallet.

## 7. Reliability Thresholds

This baseline blocks expansion when:

- unresolved critical incidents exist;
- crash-free sessions fall below the controlled threshold;
- fallback success falls below the controlled threshold;
- transaction success materially regresses against baseline.

Thresholds are machine-enforced defaults and may be tightened by production release governance.

## 8. Compatibility

Migration must preserve:

- Soul ID;
- wallet keys;
- chain/token integrations;
- credentials;
- transaction history;
- WalletConnect;
- spam classifications;
- safely portable holder preferences.

A SERA-first interface change does not require creating a new wallet or identity.

## 9. Authority

Migration state and cohort enrollment do not grant authority.

Feature rollout cannot bypass:

- mandate requirements;
- Trust Protocol;
- REV;
- authentication;
- signing;
- device/runtime trust;
- policy/risk controls.

## 10. Next

After MOB-05 closure, assemble the Mobile Integration Gate evidence package and distinguish repository-baseline completion from live native integration blockers DEV-OPEN-006 and DEV-OPEN-011 through DEV-OPEN-014.
