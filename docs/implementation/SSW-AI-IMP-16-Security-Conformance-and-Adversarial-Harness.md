# SSW-AI-IMP-16: Security / Conformance / Adversarial Harness

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-IMP-16  
**Status:** Controlled Implementation Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-IMP-15

## 1. Purpose

IMP-16 creates the first reusable adversarial harness for the SSW-SERA control plane.

The goal is not merely to prove the happy path.

The goal is to prove that the system rejects mutated, replayed, stale, substituted, cross-context or under-authorized evidence.

## 2. Required Attack Classes

The harness tracks:

- replay;
- idempotency conflict;
- material hash mutation;
- Action Contract mutation;
- approval substitution;
- approval expiry;
- mandate scope bypass;
- mandate stale/indeterminate conditions;
- stale Trust decision;
- stale REV decision;
- Trust/REV reference substitution;
- device/runtime mismatch;
- wrong Holder DID / SERA DID binding;
- alias poisoning;
- stale counterparty resolution;
- recovery rollback;
- prohibited recovery compartment;
- stale device session;
- OAP replay;
- model-to-signer caller attempt;
- payload mutation;
- chain mismatch;
- SAEL producer spoofing;
- SAEL previous-hash tampering;
- SAEL disclosure escalation.

## 3. Harness Design

The harness uses deterministic mutation functions.

A mutation must change one security-relevant variable at a time so the expected rejection reason remains attributable.

## 4. Conformance Manifest

Every case has:

- case ID;
- control boundary;
- attack description;
- expected outcome;
- production gate relevance.

## 5. Production Gate

IMP-16 establishes the harness and test matrix.

It does not by itself certify production security.

Production signing and asset movement remain NOT GATED until these tests are actually executed in CI/staging against production-grade transports, persistent stores, cryptographic service verification and real signer infrastructure.

## 6. Next Program Step

After IMP-16, the implementation foundation/control-path baseline is complete.

The next program phase is productionization and SERA product runtime integration, beginning with service framework, persistence, transport, HSM/KMS, production Trust/REV integration, and mobile/runtime integration.
