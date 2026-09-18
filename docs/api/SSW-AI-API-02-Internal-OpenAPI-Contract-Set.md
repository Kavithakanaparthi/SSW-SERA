# SSW-AI-API-02: Internal OpenAPI Contract Set

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-API-02  
**Status:** Controlled Machine-Contract Baseline  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-API-01, SSW-AI-ISC-01 through ISC-06  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

This specification converts the internal service boundaries defined in ISC-01 through ISC-06 into a callable OpenAPI baseline.

The initial aggregate contract is stored at:

`contracts/openapi/ssw-internal-api.v1.yaml`

It defines internal endpoints for:

- Authority Engine
- Risk Engine
- Device Trust Service
- Mandate Service
- Trust Protocol Adapter
- REV Adapter
- Approval Service
- Signing Gateway
- Execution Router
- SAEL
- Runtime Registry
- Recovery Service

## 2. API Principles

Every consequential internal request shall carry:

- `X-Correlation-ID`
- `X-Request-ID`
- `Idempotency-Key` where state changes are possible
- authenticated service identity
- explicit schema version
- holder/action identity where relevant

## 3. Security Model

The OpenAPI contract declares service authentication using mutual TLS as the baseline internal service identity mechanism.

Production deployment may layer:

- workload identity;
- SPIFFE/SPIRE;
- signed service tokens;
- service mesh policy;

but service identity must remain distinct from holder session identity.

## 4. Error Model

All error responses use the controlled error envelope:

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

Free-form text is explanatory only.

## 5. Idempotency

State-changing endpoints SHALL require `Idempotency-Key` unless the operation is inherently idempotent by resource identity.

This applies especially to:

- mandate reservation/finalization;
- approvals;
- signing;
- execution submission;
- SAEL ingestion;
- runtime registration;
- recovery session creation.

## 6. Machine Schema Reuse

The OpenAPI contract references API-01 machine schemas for:

- Action Contract
- Mandate
- common identifiers

The OpenAPI file shall not duplicate these canonical structures unnecessarily.

## 7. Service Authorization

OpenAPI describes transport and payload contracts. Caller authorization remains enforced by runtime policy.

Examples:

- Orchestrator may call Authority/Risk.
- External Gateway may not call Signing Gateway.
- Model runtime may not call signing endpoints.
- Approval Service does not gain signing power merely by creating an approval.

## 8. Versioning

Initial API base version:

`/internal/v1`

Breaking changes require a new major path or formally versioned endpoint contract.

## 9. Compatibility

Backward-compatible additions may include optional response metadata.

Changes to:

- authority semantics;
- material-term bindings;
- signing requirements;
- mandate semantics;
- Trust/REV semantics;

require explicit version review.

## 10. Validation

CI shall validate:

1. OpenAPI syntax;
2. referenced schemas resolve;
3. no duplicate operation IDs;
4. all state-changing operations define idempotency semantics;
5. error responses use controlled envelope;
6. privileged operations require service authentication;
7. signing endpoints accept only canonical signing requests.

## 11. Next Step

After API-02, the remaining pre-code security items identified in IRR-01 should be formalized beginning with:

**SSW-AI-POL-01: Offline Authorization Package Specification**

## 12. Controlled Statement

The architecture now has a callable internal surface.

From this point forward, service implementation should conform to the OpenAPI contracts rather than inventing private request formats service by service.
