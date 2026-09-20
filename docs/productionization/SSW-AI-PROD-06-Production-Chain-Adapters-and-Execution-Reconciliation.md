# SSW-AI-PROD-06: Production Chain Adapters & Execution Reconciliation

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-PROD-06  
**Status:** Controlled Productionization Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-PROD-05

## 1. Purpose

PROD-06 upgrades the IMP-11 execution boundary from simulation-only routing to a production-shaped EVM submission and reconciliation runtime.

The governing invariant is:

> An uncertain network outcome must be reconciled, not blindly resubmitted.

## 2. Provider Neutrality

The adapter does not depend on a specific RPC vendor.

It accepts an injected EVM JSON-RPC client and may therefore be connected to:

- Soulverse-operated RPC infrastructure;
- a managed RPC provider;
- multiple failover providers;
- a private institutional endpoint.

Provider credentials are not committed to this repository.

## 3. Signed Payload Boundary

The execution runtime receives a signed-payload reference and signed-payload hash.

A `SignedPayloadResolver` is responsible for returning:

- raw signed transaction bytes;
- the verified signed-payload hash;
- expected EVM chain ID;
- expected network transaction hash where available.

The execution adapter independently verifies that the resolved payload matches the request.

## 4. Chain Binding

A production EVM submission is blocked when:

- request chain ID differs from signed-payload chain ID;
- signed payload hash differs;
- signed payload reference is unresolved;
- expected network transaction hash is missing;
- request is expired.

The chain adapter does not reinterpret material terms.

## 5. Submission

The provider-neutral submission path uses:

`eth_sendRawTransaction`

The JSON-RPC result must equal the expected transaction hash supplied by the signed-payload resolver.

A mismatched returned hash is an integrity failure.

## 6. Durable Idempotency

Execution state is persisted before/after submission.

An idempotency key is bound to:

- execution request;
- action;
- signed payload hash;
- expected transaction hash.

A second request with conflicting material is rejected.

An identical retry returns/reconciles the existing execution state rather than resubmitting blindly.

## 7. Unknown Outcome

Network timeouts or connection failures after a submission attempt produce:

`EXECUTION_STATUS_UNKNOWN`

The expected transaction hash is retained.

The system then reconciles with:

- `eth_getTransactionByHash`;
- `eth_getTransactionReceipt`.

## 8. Reconciliation States

Reference mapping:

- transaction absent + receipt absent -> EXECUTION_STATUS_UNKNOWN;
- transaction present + receipt absent -> SUBMITTED;
- receipt status 0x1 -> CONFIRMED;
- receipt status 0x0 -> FAILED.

A missing response is not automatically treated as failed.

## 9. Reconciliation Safety

Reconciliation never creates new authorization.

It only resolves the network status of the already-signed transaction.

## 10. Production Gate

PROD-06 does not itself enable production asset movement.

Production execution still requires:

- live Soul ID/SERA signing integration;
- approved RPC endpoints;
- production environment configuration;
- staging security evidence;
- explicit Production Execution Gate closure.

## 11. Next Controlled Artifact

**SSW-AI-PROD-07: Production SAEL Persistence / Checkpoint / Archive**
