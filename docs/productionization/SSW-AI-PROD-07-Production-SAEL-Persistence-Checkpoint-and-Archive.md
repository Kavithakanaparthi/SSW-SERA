# SSW-AI-PROD-07: Production SAEL Persistence / Checkpoint / Archive

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-PROD-07  
**Status:** Controlled Productionization Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-PROD-06

## 1. Purpose

PROD-07 replaces the in-memory SAEL reference store with a durable append-only evidence implementation.

The governing invariant is:

> Evidence history may be extended, checkpointed and archived, but authoritative events are never rewritten in place.

## 2. Authoritative Append Store

PostgreSQL is the Phase 1 authoritative append store.

Each logical stream maintains:

- current sequence;
- current event hash.

Event append occurs in one transaction that:

1. validates producer authorization;
2. validates event schema;
3. calculates the canonical event hash;
4. checks idempotency;
5. locks the stream head;
6. verifies previous-event linkage;
7. assigns the next sequence;
8. inserts the immutable event;
9. advances the stream head;
10. updates evidence reservations.

Only after commit may durability be reported as COMMITTED.

## 3. Event Immutability

The `ssw.sael_event` table is protected against UPDATE and DELETE operations through a database trigger.

Corrections are new events.

Redaction is a view/access concern and does not rewrite the original event.

## 4. Idempotency

Identical retries return the original sequence/hash.

Same producer/idempotency key with different event content is rejected.

Same event ID with different content is rejected.

## 5. Evidence Reservations

Evidence reservations are durable.

They record:

- action ID;
- required event types;
- required durability;
- expiry;
- completion state.

Ingestion updates matching reservations transactionally after new evidence is committed.

## 6. Checkpoints

A checkpoint covers an explicit contiguous stream range.

Checkpoint construction verifies the range before checkpoint creation.

A deterministic Merkle root is calculated over event hashes.

Checkpoint metadata is then domain-separated and signed through an injected `SaelCheckpointSigner`.

Production checkpoint key custody remains external to SAEL.

## 7. Archive

Archive creation consumes:

- checkpoint metadata;
- covered immutable event rows;
- archive manifest.

An injected `SaelArchiveWriter` performs encryption and durable storage.

The archive writer returns:

- archive reference;
- archive hash;
- encryption profile.

The object-store or content-addressed archive backend is not the authority source.

## 8. Archive Provider Boundary

PROD-07 does not hard-code:

- S3;
- GCS;
- Azure Blob;
- IPFS;
- another content-addressed store.

Any production archive provider must satisfy:

- encryption before storage;
- integrity hash verification;
- checkpoint linkage;
- retention controls;
- recovery/export requirements.

## 9. Integrity Verification

Stream verification recomputes:

- sequence continuity;
- previous-event linkage;
- event hash;
- stored stream head.

Any mismatch fails integrity verification.

## 10. Query Disclosure

Query APIs retain the existing L0 through L4 disclosure ceiling.

A caller cannot request a disclosure level above its authorized maximum.

SAEL query authorization remains separate from conversational SERA memory.

## 11. Production Gate

PROD-07 establishes the durable evidence substrate.

The final Production SAEL Gate still requires:

- production producer identities;
- production checkpoint signing key;
- production encrypted archive provider;
- retention policy;
- recovery drill evidence;
- integrity monitoring.

## 12. Next Controlled Artifact

**SSW-AI-PROD-08: Staging Security Gate & Release Evidence**
