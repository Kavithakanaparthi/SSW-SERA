# SSW-AI-PROD-04: Production Trust / REV Service Integration

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-PROD-04  
**Status:** Controlled Productionization Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-PROD-03

## 1. Purpose

PROD-04 converts the IMP-07 / IMP-08 Trust Protocol and REV adapter contracts into production-shaped authenticated service clients.

The governing invariant remains:

> A Trust Protocol or REV PASS is valid only for the exact execution context to which it was issued, and only when the decision is cryptographically attributable to an approved service key.

## 2. Channel Authentication

The reference transport uses HTTPS with mutual TLS.

The transport requires injected:

- client certificate;
- client private-key reference/material supplied by the future secret provider;
- trusted CA bundle;
- expected server name.

TLS certificate material is not committed to this repository.

## 3. Decision Authentication

Every Trust / REV decision is independently integrity-checked with:

- RFC 8785 canonicalization;
- domain-separated SHA-256 decision hash;
- Ed25519 signature over the 32-byte decision digest;
- service identity;
- key ID;
- approved public key resolver.

A valid TLS channel is not sufficient to accept a decision.

## 4. Signature Reference Profile

PROD-04 defines:

```
ed25519:<key-id>:<base64url-signature>
```

The existing `integrity.signature_ref` field carries this profile.

The signed payload excludes the `integrity` object to avoid circular hashing.

Domains:

- `SSW:TRUST_DECISION:V1`
- `SSW:REV_DECISION:V1`

## 5. Key Resolution

The client consumes an injected `DecisionKeyResolver`.

This permits:

- key rotation;
- multiple active verification keys;
- HSM-backed service signing;
- environment-specific trust roots;
- emergency key revocation.

No public key is hard-coded into action logic.

## 6. Outbound Request Guard

Every outbound Trust / REV request is durably idempotency-claimed using PROD-03 persistence.

Same request ID + same request hash is an identical retry.

Same request ID + different request hash is rejected before network submission.

## 7. Verified Decision Persistence

Cryptographically verified decisions are durably stored as service-owned records with:

- decision ID;
- decision hash;
- full typed decision;
- expiry;
- owner service.

A conflicting stored decision ID/hash fails closed.

## 8. Retry

Network retry is limited to retryable transport classes.

The client does not retry semantic FAIL decisions as though they were transport errors.

## 9. Circuit Breaker

Repeated upstream transport failures open a per-client circuit.

While open:

- Trust / REV returns transport unavailability;
- no local PASS is synthesized;
- consequential actions remain blocked by existing fail-closed behavior.

## 10. Timeouts and Limits

The production HTTP client enforces:

- HTTPS-only endpoints;
- request timeout;
- response body size ceiling;
- JSON-only response parsing;
- server certificate validation;
- optional explicit server-name verification;
- mTLS client certificate presentation.

## 11. Binding Verification

Cryptographic integrity does not replace IMP-07/08 decision-binding verification.

The full path is:

```
mTLS transport
  -> schema validation
  -> service identity check
  -> decision hash verification
  -> Ed25519 verification
  -> exact Action/terms/runtime/policy binding
  -> freshness verification
```

All layers must pass.

## 12. Production Credentials

PROD-04 intentionally uses injected test TLS/key material only.

Real production:

- client certificates;
- CA trust roots;
- Trust signing public keys;
- REV signing public keys;
- rotation sources

remain unconfigured until workload identity / secret management is connected.

## 13. Exit Criteria

PROD-04 is complete when:

- production-shaped mTLS JSON client exists;
- Trust and REV production transports exist;
- decision signatures are verified;
- decision/request persistence is integrated;
- retry/circuit-breaker behavior is tested;
- forged/tampered decisions fail;
- existing CI remains green.

## 14. Next Controlled Artifact

**SSW-AI-PROD-05: HSM / Secure Enclave / MPC Signing Integration**
