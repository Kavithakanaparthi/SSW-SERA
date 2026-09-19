# SSW-AI-IMP-12: SAEL Runtime

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-IMP-12  
**Status:** Controlled Implementation Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-IMP-11

## 1. Purpose

IMP-12 implements the first SERA Activity & Evidence Ledger runtime.

The governing principle is:

> Evidence must survive narrative disagreement and remain attributable, ordered and tamper-evident.

## 2. Baseline Capabilities

IMP-12 provides:

- canonical SAEL event schema;
- ingest request/result contracts;
- producer namespace authorization;
- RFC 8785 canonical event hashing;
- per-stream previous-hash linkage;
- monotonic sequence assignment;
- idempotent ingestion;
- COMMITTED durability in the reference store;
- evidence reservations;
- reservation completion tracking;
- disclosure-bounded query;
- integrity verification.

## 3. Producer Authorization

Each producer is configured with allowed event prefixes.

Examples:

- signing-gateway → SIGNING.*
- execution-router → EXECUTION.*
- rev-adapter → TRUST.REV_*
- recovery-service → RECOVERY.*

A producer cannot author another service's authoritative evidence namespace.

## 4. Append Store

The initial implementation is an in-memory reference append store.

It preserves:

- append-only semantics;
- stream sequence;
- previous hash;
- event hash;
- idempotency result.

Production persistence, write-ahead logging, checkpoint signatures and encrypted archive remain required before production release.

## 5. Query Disclosure

Query levels:

- L0 summary;
- L1 operational metadata;
- L2 financial/counterparty detail;
- L3 identity/credential detail;
- L4 full permissible evidence.

The runtime never returns a disclosure level above the caller's configured ceiling.

## 6. Reservations

A reservation can require specific event types at COMMITTED durability.

This baseline tracks reservation completeness and expiry.

## 7. Next Controlled Artifact

**SSW-AI-IMP-13: Recovery Runtime**
