# SSW-AI-IMP-10: Canonical Signing Gateway Baseline

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-IMP-10  
**Status:** Controlled Implementation Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-IMP-09

## 1. Purpose

IMP-10 implements the first independent Signing Gateway verifier.

The Signing Gateway remains DRY_RUN_ONLY.

It does not hold private keys, emit signatures, or move assets.

Its purpose is to prove that the signer boundary can independently reject stale, mismatched, replayed, under-authorized or ambiguously bound signing attempts.

## 2. Production Canonicalization Profile

The signing boundary adopts RFC 8785 JSON Canonicalization Scheme semantics.

The implementation uses the `canonicalize` TypeScript package as the concrete JCS serializer.

Security-sensitive hashes use:

- UTF-8 canonical bytes;
- SHA-256;
- lowercase hexadecimal;
- explicit domain separation.

## 3. Signing Gateway Rule

> The signer independently verifies the evidence chain. It never trusts an upstream PASS merely because another service said PASS.

## 4. Signing Request

IMP-10 introduces `ssw.signing-request.v1`.

The request binds:

- signing request ID;
- action ID/version;
- Action Contract hash;
- material-terms hash;
- Holder DID;
- SERA Agent DID;
- Runtime ID;
- Device ID;
- authority basis;
- policy/device/runtime/Trust/REV references;
- payload candidate and payload hash;
- replay/idempotency values;
- request issue/expiry time.

## 5. Payload Baseline

The first supported payload family is:

`evm.transaction`

The dry-run payload binds:

- chain ID;
- to;
- value atomic string;
- data;
- nonce;
- transaction type;
- max fee;
- priority fee.

The gateway does not sign it.

## 6. Independent Verification

The gateway independently verifies:

1. request schema;
2. request freshness;
3. caller identity against allowlist;
4. Action Contract schema;
5. Action Contract hash;
6. material-terms hash;
7. action ID/version;
8. Holder DID / SERA DID / Device ID / Runtime ID;
9. device/runtime eligibility;
10. A2 Approval Record or A3/A4 Mandate Decision;
11. policy result;
12. Trust Protocol decision;
13. REV decision;
14. payload hash;
15. payload/action semantic match;
16. replay/idempotency state.

## 7. A2 Approval

For A2 the gateway requires:

- Approval Record status APPROVED;
- exact action ID/version;
- exact material-terms hash;
- exact Holder DID;
- exact Device ID;
- exact Runtime ID;
- unexpired Approval Record.

## 8. A3/A4 Delegation

For A3/A4 the gateway requires:

- matching mandate ID;
- Mandate Evaluation Decision status PASS;
- exact action/version/material hash;
- mandate terms hash present.

The gateway does not yet reserve cumulative mandate allowance. That remains required before production delegated signing.

## 9. Trust Protocol

The gateway re-validates the Trust Protocol Decision object and confirms:

- PASS;
- exact action ID/version;
- exact material-terms hash;
- Holder DID;
- SERA Agent DID;
- Device ID;
- Runtime ID;
- authority class;
- risk class;
- policy version;
- freshness;
- approved service identity.

## 10. REV

The gateway re-validates the REV Decision and confirms:

- PASS;
- exact action ID/version;
- exact material-terms hash;
- authority class;
- risk class;
- policy version;
- exact Trust decision reference;
- freshness;
- approved service identity;
- unconsumed single-use state.

## 11. Replay Baseline

IMP-10 introduces an injected ReplayStore interface.

The baseline in-memory implementation tracks:

- signing request ID;
- idempotency key;
- replay token;
- REV decision ID.

A conflicting reuse rejects.

A byte-identical idempotent dry-run retry may return the same accepted result only when the request hash is identical.

Persistent transactional replay state is still required for production.

## 12. Dry-Run Result

IMP-10 returns:

- DRY_RUN_ACCEPTED;
- REJECTED.

A successful result contains:

- verified request hash;
- verified payload hash;
- key class requested;
- no key material;
- no signature;
- no signed payload.

## 13. Key Isolation

Private keys remain outside IMP-10.

The gateway accepts only an opaque requested key class.

It never accepts:

- raw private keys;
- seed phrases;
- arbitrary secret material.

## 14. Production Gaps

Production signing remains NOT GATED until at least:

- HSM / Secure Enclave / MPC adapter;
- signer workload identity;
- Trust/REV cryptographic signature verification;
- persistent atomic replay/consumption store;
- chain-specific payload verification;
- mandate usage reservation;
- signer-key eligibility policy;
- SAEL reservation and signing evidence;
- security/adversarial tests.

## 15. Tests

IMP-10 proves rejection for:

- expired signing request;
- wrong caller;
- action hash mismatch;
- material-terms mismatch;
- Approval Record mismatch;
- stale Approval Record;
- Trust mismatch;
- stale Trust decision;
- REV mismatch;
- stale REV decision;
- payload hash mismatch;
- unsupported payload type;
- replay token reuse;
- idempotency conflict;
- consumed single-use REV;
- Holder/SERA identity mismatch.

It proves that a fully bound A2 payment can reach DRY_RUN_ACCEPTED without generating a signature.

## 16. Next Controlled Artifact

**SSW-AI-IMP-11: Execution Router & Chain Adapter Baseline**
