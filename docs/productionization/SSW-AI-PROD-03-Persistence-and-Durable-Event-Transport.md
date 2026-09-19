# SSW-AI-PROD-03: Persistence & Durable Event Transport

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-PROD-03  
**Status:** Controlled Productionization Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-PROD-02

## 1. Purpose

PROD-03 establishes durable authoritative state and transactional event-delivery primitives for the SSW-SERA runtime.

The governing principle is:

> A state change that requires downstream evidence or delivery must not depend on a best-effort in-memory message.

## 2. Phase 1 Persistence Decision

Phase 1 selects PostgreSQL as the durable relational system of record for server-side control-plane state.

PostgreSQL is used for:

- authoritative service-owned state;
- optimistic concurrency;
- idempotency claims;
- replay claims;
- mandate usage reservations;
- execution reconciliation state;
- transactional outbox;
- deduplicating inbox.

SAEL's final append/checkpoint/archive implementation remains PROD-07, but PROD-03 supplies the durable transport substrate required to feed it.

## 3. Durable Event Transport

Phase 1 uses a transactional outbox / inbox pattern.

This avoids making action correctness depend on an external broker before broker-scale requirements exist.

Reference path:

```
Authoritative state transaction
        |
        +--> state mutation
        |
        +--> outbox insert
        |
        +--> COMMIT
                |
                v
        outbox dispatcher
                |
                v
        consumer / SAEL / downstream service
                |
                v
        inbox deduplication
```

A future NATS/Kafka/Pulsar transport may replace the dispatcher transport without changing the state/outbox atomicity contract.

## 4. State Ownership

Durable records include an explicit `owner_service`.

A service may not silently mutate another service's authoritative state.

The generic domain-record substrate exists to support controlled service-owned JSON state while domain-specific tables are introduced where stronger relational constraints are required.

## 5. Concurrency

Authoritative record writes use optimistic version checks.

A stale writer receives a conflict rather than last-write-wins.

## 6. Idempotency

Idempotency claims persist:

- owner service;
- idempotency key;
- request hash;
- optional response reference;
- expiry.

Same key + same hash is an identical retry.

Same key + different hash is a conflict.

## 7. Replay

Replay claims persist:

- replay token;
- request hash;
- optional REV decision ID;
- expiry;
- consumption time.

Consequential single-use REV decisions can therefore be consumed durably rather than only in process memory.

## 8. Mandate Usage Reservation

Mandate usage updates are transactionally serialized.

The reservation operation checks:

- current action count;
- current cumulative atomic value;
- requested increment;
- configured ceilings.

The update either succeeds atomically or fails without partial usage mutation.

## 9. Execution Reconciliation

Execution state persists:

- action ID;
- execution request ID;
- status;
- signed payload hash;
- idempotency key;
- submission reference;
- network transaction ID;
- version;
- timestamps.

`EXECUTION_STATUS_UNKNOWN` remains a first-class state for reconciliation.

## 10. Outbox

Outbox rows support:

- topic;
- partition key;
- JSON payload;
- headers;
- attempts;
- availability time;
- lease;
- delivery state.

Workers claim rows using `FOR UPDATE SKIP LOCKED`.

## 11. Inbox

Consumers persist received event IDs with payload hashes.

Duplicate identical delivery is accepted as already processed.

Conflicting payload hashes for the same event ID are treated as integrity conflicts.

## 12. Database Security Boundary

PROD-03 introduces no production database credentials.

Connection details are supplied through `DATABASE_URL` only in CI/test at this stage.

Production credentials and secret delivery remain part of the later workload-identity / secret-management work.

## 13. Migration Discipline

Migrations are ordered SQL files under `db/migrations`.

The migration runner records applied migration IDs and SHA-256 checksums.

A previously applied migration whose checksum changes is rejected.

## 14. CI

GitHub CI provisions an ephemeral PostgreSQL service and runs:

- clean npm ci;
- migrations;
- full existing test suite;
- PostgreSQL persistence integration tests;
- strict TypeScript.

## 15. Deliberately Deferred

PROD-03 does not yet provide:

- production database hosting;
- high-availability/failover topology;
- backup and restore operations;
- production encryption-key integration;
- broker-scale transport;
- SAEL checkpoints/archive;
- production credentials.

## 16. Next Controlled Artifact

**SSW-AI-PROD-04: Production Trust / REV Service Integration**
