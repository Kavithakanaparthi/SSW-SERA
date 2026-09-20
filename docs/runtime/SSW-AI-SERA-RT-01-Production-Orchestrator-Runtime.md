# SSW-AI-SERA-RT-01: Production Orchestrator Runtime

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-SERA-RT-01  
**Status:** Controlled Runtime Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-PROD-08

## 1. Purpose

SERA-RT-01 implements the first persistent production-shaped SERA action orchestrator.

SERA may interpret and prepare. The orchestrator coordinates deterministic controls. It does not become the authority, Trust, REV, signing or execution boundary.

## 2. First Production Action Family

The first runtime family is:

`payment.send`

The orchestrator accepts only a validated Resolved Intent contract. It does not accept free-form model text as an execution request.

## 3. Runtime State

Canonical initial states:

- AWAITING_APPROVAL
- CONTROL_EVALUATION
- TRUST_EVALUATION
- REV_EVALUATION
- READY_TO_SIGN
- BLOCKED
- EXPIRED
- CANCELLED
- FAILED

The first controlled runtime intentionally stops at READY_TO_SIGN.

Live signing remains behind DEV-OPEN-001 through DEV-OPEN-003.

## 4. Prepare Flow

```
Resolved Intent
  -> Action Contract Builder
  -> exact material-term hash
  -> Review Record
  -> persistent orchestration record
  -> transactional evidence outbox
  -> AWAITING_APPROVAL
```

## 5. Resume Flow

After holder authentication and approval:

```
Exact Review + Authentication
  -> Approval Record
  -> Authority
  -> Risk
  -> Device / Runtime Eligibility
  -> Policy
  -> Trust Protocol
  -> REV
  -> Signing Request
  -> READY_TO_SIGN
```

Any failed mandatory control transitions the orchestration to BLOCKED with deterministic reason codes.

## 6. Persistence

Orchestration state is stored in the PROD-03 PostgreSQL domain-record substrate under:

- owner_service: `orchestrator`
- record_type: `action-orchestration`

Writes use optimistic concurrency.

Every state transition also writes an outbox event inside the same transaction.

## 7. Resume Semantics

A process restart must not require the holder to recreate an action silently.

The orchestrator reloads the existing record and resumes from its stored state.

Trust and REV calls use stable request IDs supplied to the orchestration run and therefore remain compatible with persistent request-idempotency protections.

## 8. Expiry

An expired Action Contract transitions to EXPIRED before additional control calls.

It must be rebuilt rather than reused.

## 9. Model Boundary

The runtime receives `ssw.resolved-intent.v1`.

Unstructured model output cannot call:

- Trust;
- REV;
- signer;
- execution router.

## 10. Signing Boundary

The first runtime produces a validated Signing Request and persists READY_TO_SIGN.

It does not invoke the live signer while Soul ID/SoulScan production bindings remain developer-owned open items.

## 11. Evidence

Every persisted transition creates a transactional outbox record containing only operational identifiers, state and reason codes.

Sensitive material terms are not duplicated into the outbox payload.

## 12. Next Runtime Artifact

**SSW-AI-SERA-RT-02: Context Broker & Purpose-Bound Context Retrieval**
