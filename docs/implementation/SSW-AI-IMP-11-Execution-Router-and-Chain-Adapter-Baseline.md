# SSW-AI-IMP-11: Execution Router & Chain Adapter Baseline

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-IMP-11  
**Status:** Controlled Implementation Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-IMP-10

## 1. Purpose

IMP-11 implements the execution-routing boundary without enabling uncontrolled production asset movement.

The governing rule is:

> Execution adapters may translate and submit already-authorized payloads. They may not reinterpret authority or materially mutate terms.

## 2. Baseline Scope

The first execution family is EVM.

IMP-11 provides:

- execution request/result contracts;
- adapter registry;
- deterministic EVM simulation;
- submission transport interface;
- idempotency and replay checks;
- explicit EXECUTION_STATUS_UNKNOWN state;
- fail-closed behavior when signed payload evidence is absent.

## 3. Execution States

- NOT_READY
- SIMULATED
- READY_TO_SUBMIT
- SUBMITTING
- SUBMITTED
- CONFIRMED
- FAILED
- EXECUTION_STATUS_UNKNOWN
- CANCELLED
- BLOCKED

## 4. Submission Safety

Production submission is disabled in this baseline.

The router may:

- validate;
- simulate;
- prepare submission envelopes.

It may not broadcast unless an injected transport is explicitly enabled and a signed payload reference/hash is present.

## 5. Unknown Execution

A transport timeout after submission attempt must not be treated as failure.

The router returns:

`EXECUTION_STATUS_UNKNOWN`

and preserves the idempotency key and submission reference for reconciliation.

## 6. Adapter Isolation

Chain adapters receive:

- chain-qualified payload;
- signed payload reference;
- signed payload hash;
- action correlation IDs.

They do not receive:

- natural-language intent;
- model output;
- holder secrets;
- private keys.

## 7. EVM Semantic Checks

The adapter independently confirms:

- chain ID;
- destination;
- atomic value;
- calldata;
- nonce;
- transaction type.

Material mutation requires a new authorization cycle.

## 8. Next Controlled Artifact

**SSW-AI-IMP-12: SAEL Runtime**
