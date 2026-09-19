# SSW-AI-IMP-08: REV Adapter & Runtime Pass/Fail Binding

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-IMP-08  
**Status:** Controlled Implementation Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-IMP-07

## 1. Purpose

IMP-08 replaces the REV stub with a typed runtime-gate adapter and exact decision-binding verifier.

The governing invariant is:

> REV PASS is the final runtime permission signal before signing, but it is valid only for the exact action and control context for which it was issued.

REV does not create holder approval, delegation, Trust Protocol PASS, or signing authority.

## 2. Runtime Gate Position

```
Action Contract
  ↓
Authority
  ↓
Risk
  ↓
Policy
  ↓
Device / Runtime
  ↓
Mandate or Approval
  ↓
Trust Protocol
  ↓
REV
  ↓
Signing Gateway
```

IMP-08 stops before the Signing Gateway.

## 3. REV Request

A REV request binds:

- request ID;
- action ID/version;
- material-terms hash;
- authority class;
- risk class;
- policy reference/version;
- verified Trust Protocol decision reference;
- device eligibility decision reference;
- runtime eligibility reference;
- approval reference;
- mandate reference;
- mandate evaluation reference;
- AURION reference where applicable;
- issue and expiry time.

## 4. REV Decision

REV returns:

- PASS
- FAIL
- UNAVAILABLE
- EXPIRED

Every decision is bound back to the exact request context and includes:

- service identity;
- decision hash;
- signature reference;
- short validity window;
- single-use indicator.

## 5. Fail-Closed Rules

REV is rejected when:

- Trust Protocol has not produced VERIFIED_PASS where required;
- action ID/version differs;
- material terms hash differs;
- authority class differs;
- risk class differs;
- policy version differs;
- Trust Protocol decision reference differs;
- request is expired;
- decision is expired;
- expected REV service identity differs;
- decision status is UNAVAILABLE or FAIL.

## 6. Single-Use Baseline

Consequential REV PASS defaults to single-use.

IMP-08 carries the `single_use` property into the decision.

Actual transactional consumption is deferred to the Signing Gateway implementation, which must mark a single-use REV decision consumed atomically with the signing request or equivalent reservation.

## 7. AURION

`aurion_ref` is optional in the baseline request.

Where future policy or mandate requires AURION, absence of the required attestation reference must block request construction before REV is called.

IMP-08 does not implement the AURION service itself.

## 8. Trust Dependency

REV construction requires a verified Trust Protocol PASS whenever the Action Contract requires Trust Protocol.

REV cannot accept an unverified raw Trust decision object.

## 9. Action Contract Enrichment

Only a fresh, correctly bound, provenance-valid REV PASS may create a copied Action Contract with:

```
trust.rev_ref = <rev decision id>
```

The original Action Contract is not mutated.

Execution status remains NOT_READY.

## 10. Production Work Still Required

Before production REV use:

- real REV endpoint transport;
- workload identity / mTLS;
- cryptographic REV service-signature verification;
- emergency kill-state distribution;
- decision consumption persistence;
- idempotent retry semantics;
- rate limiting;
- SAEL ingestion;
- operational alerting.

## 11. Tests

IMP-08 proves:

1. valid request is constructed only after verified Trust PASS;
2. matching REV PASS verifies;
3. action mismatch fails;
4. material-terms mismatch fails;
5. Trust decision mismatch fails;
6. authority/risk/policy mismatch fails;
7. expired decision fails;
8. wrong REV service identity fails;
9. UNAVAILABLE fails closed;
10. FAIL remains authoritative;
11. only verified PASS enriches a copied Action Contract;
12. Action Contract remains NOT_READY after REV PASS.

## 12. Next Controlled Artifact

**SSW-AI-IMP-09: Approval, Authentication & Exact-Term Authorization Binding**
