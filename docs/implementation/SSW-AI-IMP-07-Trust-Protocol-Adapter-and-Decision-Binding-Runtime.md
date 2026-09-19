# SSW-AI-IMP-07: Trust Protocol Adapter & Decision Binding Runtime

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-IMP-07  
**Status:** Controlled Implementation Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-IMP-06

## 1. Purpose

IMP-07 replaces the Trust Protocol stub with a typed adapter and decision-binding runtime.

The governing invariant is:

> A Trust Protocol PASS is valid only for the exact action, material terms, authority basis, risk state, policy context, device/runtime context and validity window to which it was issued.

A PASS is not a reusable trust badge.

## 2. Adapter Boundary

The Trust Protocol runtime is represented as an injected transport:

```ts
interface TrustProtocolTransport {
  evaluate(request: TrustProtocolRequest): Promise<unknown>;
}
```

The repository does not hard-code a production URL or vendor transport in IMP-07.

The adapter owns:

- request construction;
- request schema validation;
- exact decision binding validation;
- freshness validation;
- expected service identity validation;
- fail-closed UNAVAILABLE handling;
- safe Action Contract enrichment after verified PASS.

## 3. Trust Protocol Request

The request binds:

- request ID;
- action ID/version;
- material-terms hash;
- Holder DID;
- SERA Agent DID;
- Device ID;
- Runtime ID;
- device/session eligibility decision reference;
- authority class;
- approval or mandate reference;
- mandate evaluation reference where applicable;
- risk class and reason codes;
- policy decision reference and policy version;
- issue/expiry time.

## 4. Trust Protocol Decision

The decision binds the same execution context and adds:

- PASS / FAIL / UNAVAILABLE / EXPIRED;
- reason codes;
- service identity;
- decision hash;
- signature reference;
- issue/expiry time.

IMP-07 validates the decision object and its binding.

Cryptographic service-signature verification remains a production integration requirement. IMP-07 requires an approved service identity and non-empty signature reference but does not yet resolve a production trust-service public key.

## 5. Binding Verification

The verifier rejects a decision when any of the following differs from the request:

- request ID;
- action ID;
- action version;
- material-terms hash;
- Holder DID;
- SERA Agent DID;
- Device ID;
- Runtime ID;
- authority class;
- risk class;
- policy version.

## 6. Freshness

A decision is unusable when:

- current time is after `expires_at`;
- decision status is EXPIRED;
- request itself is expired.

An expired decision cannot be revived by local policy.

## 7. Service Provenance

The adapter requires an expected Trust Protocol service identity.

A decision from a different service identity is rejected.

This is not yet equivalent to cryptographic service authentication. It is the typed application-level provenance binding required before the production mTLS/signature layer is connected.

## 8. UNAVAILABLE

If Trust Protocol is required and returns UNAVAILABLE:

- the adapter returns fail-closed verification;
- Action Contract is not enriched with a Trust reference;
- signing remains unreachable.

Offline exceptions remain governed only by POL-01 and are not created by this adapter.

## 9. FAIL

FAIL is authoritative for that exact request.

The adapter preserves reason codes and does not automatically retry as PASS.

## 10. Action Contract Enrichment

Only a fresh, correctly bound, provenance-valid PASS may create a copied Action Contract with:

```
trust.trust_protocol_ref = <decision_id>
```

The original Action Contract is not mutated.

REV remains unresolved after IMP-07.

## 11. A2 / A3 / A4 Binding

A2 requests carry the approval reference when available.

A3/A4 requests carry:

- mandate reference;
- mandate evaluation decision reference;
- mandate terms hash.

A Trust decision issued under one authority basis cannot be reused under another.

## 12. Tests

IMP-07 proves:

1. exact request construction from control-plane decisions;
2. matching PASS verifies;
3. PASS for another action fails;
4. material-terms mismatch fails;
5. Holder/SERA mismatch fails;
6. device/runtime mismatch fails;
7. authority or risk mismatch fails;
8. stale policy version fails;
9. expired decision fails;
10. UNAVAILABLE fails closed;
11. wrong service identity fails;
12. only verified PASS enriches Action Contract.

## 13. Production Work Still Required

Before production Trust Protocol use:

- real endpoint transport;
- mTLS/workload identity;
- service-signature verification;
- key rotation;
- retry/rate-limit policy;
- cache policy;
- observability;
- SAEL ingestion integration.

## 14. Next Controlled Artifact

**SSW-AI-IMP-08: REV Adapter & Runtime Pass/Fail Binding**
