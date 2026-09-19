# SSW-AI-IMP-05: Device Trust, Runtime Registry & Session Eligibility Implementation

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-IMP-05  
**Status:** Controlled Implementation Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-IMP-04

## 1. Purpose

IMP-05 turns device/runtime eligibility from static placeholders into deterministic runtime state.

The governing rule is:

> Device and runtime assurance determine whether the current environment may participate in an action. They do not determine wallet ownership.

Soul Super Wallet remains anchored to the Holder Soul ID under CF-A02.

## 2. Runtime Records

IMP-05 introduces:

- Device Record;
- Runtime Record;
- Session Eligibility Decision.

## 3. Device Record

Canonical device states:

- UNREGISTERED
- REGISTERED
- ATTESTED
- TRUSTED
- LIMITED
- SUSPENDED
- REVOKED

A Device Record binds to Holder DID and SERA Agent DID but is not proof of wallet ownership.

## 4. Runtime Record

Canonical runtime states:

- UNREGISTERED
- REGISTERED
- ATTESTED
- ELIGIBLE
- LIMITED
- SUSPENDED
- REVOKED

Runtime records bind:

- Runtime ID;
- SERA Agent DID;
- Device ID where applicable;
- runtime class;
- session state;
- attestation reference.

Cloud reasoning runtimes may be registered but cannot receive signing eligibility.

## 5. Session Eligibility

The evaluator consumes:

- validated Action Contract;
- Device Record;
- Runtime Record;
- current time;
- action risk class;
- authority class.

It returns:

- ELIGIBLE
- LIMITED
- INELIGIBLE
- EXPIRED
- SUSPENDED
- REVOKED

## 6. Baseline Rules

- REVOKED device or runtime always blocks.
- SUSPENDED device or runtime always blocks consequential actions.
- R3/R4 `payment.send` requires TRUSTED device and ELIGIBLE runtime.
- ATTESTED may support R0-R2 only in baseline policy.
- LIMITED may support only low-risk/non-signing paths.
- runtime session must be unexpired.
- runtime SERA DID must match Action Contract SERA DID.
- runtime device binding must match Action Contract Device ID.
- Device Holder DID and SERA DID bindings must match the Action Contract.
- cloud reasoning runtime cannot qualify for signing-capable consequential execution.
- a wearable remains LIMITED by default.

## 7. Wallet Recovery

A newly recovered wallet may exist on a new device in UNREGISTERED, REGISTERED or LIMITED state.

That does not invalidate wallet ownership.

It only means consequential controls remain unavailable until current environment assurance is established.

## 8. Policy Integration

IMP-05 adds an immutable helper that applies a successful Session Eligibility Decision to a copy of the Action Contract by setting:

- `policy.device_eligible`
- `policy.runtime_eligible`

It does not mutate the original Action Contract.

The updated contract must pass IMP-02 validation before further evaluation.

## 9. No Authority Creation

Device/runtime eligibility cannot:

- approve an A2 action;
- activate A3/A4 authority;
- pass Trust Protocol;
- pass REV;
- sign;
- execute.

## 10. Tests

IMP-05 proves:

1. TRUSTED + ELIGIBLE + live session qualifies an R3 payment environment;
2. REGISTERED device fails R3 eligibility;
3. REVOKED device fails;
4. SUSPENDED runtime fails;
5. expired runtime session fails;
6. mismatched Holder DID fails;
7. mismatched SERA DID fails;
8. mismatched Device ID fails;
9. cloud reasoning runtime cannot qualify for signing-capable payment;
10. applying eligibility changes a copied Action Contract only.

## 11. Next Controlled Artifact

**SSW-AI-IMP-06: Mandate Runtime & Deterministic DMCL Evaluator**
