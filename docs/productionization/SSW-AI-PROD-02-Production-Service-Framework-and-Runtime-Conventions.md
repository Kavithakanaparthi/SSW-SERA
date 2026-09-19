# SSW-AI-PROD-02: Production Service Framework & Runtime Conventions

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-PROD-02  
**Status:** Controlled Productionization Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-PROD-01

## 1. Purpose

PROD-02 establishes the common production service chassis for SSW-SERA before persistence, production credentials, HSM/KMS, Trust/REV endpoints or chain providers are connected.

The governing principle is:

> Service deployment may be consolidated operationally, but security boundaries, state ownership and caller authorization remain explicit.

## 2. Framework Decision

Phase 1 selects:

- Node.js 22;
- built-in `node:http` transport;
- a Soulverse-owned `@soulverse/service-host` runtime layer;
- JSON over authenticated internal service channels;
- dependency injection for workload identity, persistence, transports and observability exporters.

No third-party HTTP framework is required for the baseline.

This keeps the supply chain narrow and preserves the option to introduce a Fastify or other adapter later without changing service contracts.

## 3. Standard Lifecycle

Every hosted service follows:

```
CONFIGURED
  -> STARTING
  -> READY
  -> DRAINING
  -> STOPPED
```

A failed readiness dependency does not make the process non-live. It makes the service unready for traffic.

## 4. Required Endpoints

Every hosted service exposes:

- `GET /health/live`
- `GET /health/ready`
- `GET /meta`

These endpoints reveal no holder-sensitive data.

## 5. Request Context

Every internal request receives a context containing:

- request ID;
- correlation ID where supplied;
- action ID where supplied;
- caller identity only after identity-verifier success;
- request start time.

Raw identity headers are not authoritative.

## 6. Service Identity

PROD-02 defines an `IdentityVerifier` interface.

The default verifier denies all asserted callers.

Tests may use a static verifier.

Production workload identity will be connected in a later controlled artifact. A bearer string or user session token must never silently become service identity.

## 7. Error Contract

Service handlers return typed errors:

```json
{
  "error": {
    "code": "DEVICE_NOT_ELIGIBLE",
    "category": "AUTHORIZATION",
    "retryable": false,
    "details_ref": null
  }
}
```

Stack traces and unrestricted exception messages are never returned to callers.

## 8. Logging

The baseline logger emits structured JSON.

Automatic redaction covers keys containing:

- secret;
- token;
- password;
- private_key;
- seed;
- biometric;
- credential;
- authorization.

Production telemetry should prefer IDs, hashes, reason codes, state, duration and status.

## 9. Readiness

Each service owns a readiness registry.

Dependencies are named and individually reported as READY / NOT_READY.

Examples:

- persistence;
- event transport;
- Trust Protocol upstream;
- REV upstream;
- signer;
- provider/RPC.

A dependency becoming unavailable must not widen authority.

## 10. Timeouts and Body Limits

Runtime configuration includes:

- request timeout;
- request body byte limit;
- graceful shutdown interval.

Oversized request bodies are rejected before handler execution.

## 11. Graceful Shutdown

On shutdown:

1. readiness changes to false;
2. new consequential traffic can be rejected by deployment routing;
3. the HTTP listener stops accepting new connections;
4. in-flight work receives the configured grace interval;
5. the process closes.

No state-changing handler should rely on process termination as its idempotency mechanism.

## 12. Operational Configuration

Non-secret runtime configuration is environment-driven and validated once at startup.

Secrets are not part of PROD-02 configuration.

Future secret values must arrive through a controlled secret-provider interface rather than ordinary process configuration where possible.

## 13. Trust-Zone Mapping

The production topology manifest preserves the DB15 zones:

- Z2 control plane;
- Z3 intelligence;
- Z4 execution;
- Z6 evidence;
- Z7 operations.

Signing/key material remains a separate key-security domain.

## 14. Production Gaps Deliberately Left Open

PROD-02 does not yet implement:

- PostgreSQL or other durable state;
- event/message transport;
- workload identity credentials;
- KMS/HSM;
- OpenTelemetry exporter;
- production service mesh;
- Trust/REV endpoints;
- production chain providers;
- deployment/IaC.

Those are sequenced after the runtime chassis.

## 15. Exit Criteria

PROD-02 is complete when:

- common service-host package exists;
- lifecycle/config/request-context/error/readiness/logging conventions are executable;
- topology manifest exists;
- tests and strict typecheck pass in CI;
- tracker and ledger are updated.

## 16. Next Controlled Artifact

**SSW-AI-PROD-03: Persistence & Durable Event Transport**
