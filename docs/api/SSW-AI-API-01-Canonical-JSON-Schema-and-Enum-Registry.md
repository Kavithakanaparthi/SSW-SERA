# SSW-AI-API-01: Canonical JSON Schema & Enum Registry

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-API-01  
**Status:** Controlled Machine-Contract Baseline  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-SCH-01 through SCH-05, SSW-AI-ISC-01 through ISC-06, SSW-AI-IRR-01  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

This specification establishes the first machine-enforceable contract baseline for SERA and Soul Super Wallet.

It defines:
- the authoritative JSON Schema version;
- shared identifier patterns;
- canonical authority and risk enums;
- device/runtime states;
- decision statuses;
- approval and execution states;
- common reason-code registries;
- core schemas for Action Contracts and Delegated Authority Mandates;
- compatibility and versioning rules.

## 2. Schema Standard

The repository adopts JSON Schema Draft 2020-12 for machine validation.

All schemas shall:
- set `$schema`;
- define a stable `$id`;
- use explicit versioned titles;
- set `additionalProperties: false` for security-sensitive objects unless extensibility is deliberately defined;
- avoid ambiguous numeric types for financial amounts;
- represent atomic financial values as integer-form strings;
- represent timestamps as RFC3339 `date-time`;
- represent hashes using versioned algorithm prefixes such as `sha256:`.

## 3. Authoritative Machine Artifacts

This API-01 baseline creates:

- `contracts/enums/ssw-enums.v1.json`
- `contracts/json-schema/ssw-common.v1.schema.json`
- `contracts/json-schema/ssw-action-contract.v1.schema.json`
- `contracts/json-schema/ssw-mandate.v1.schema.json`

Later API artifacts shall build on these definitions rather than re-declare them independently.

## 4. Shared Identifier Rules

Canonical string patterns are defined for:

- Holder DID: `^did:soul:[a-z0-9._:-]+$`
- SERA Agent DID: `^did:soul:agent:[a-z0-9._:-]+$`
- Runtime ID: `^sera-runtime:[A-Za-z0-9._:-]+$`
- Device ID: `^device:[A-Za-z0-9._:-]+$`
- Session ID: `^sera-session:[A-Za-z0-9._:-]+$`
- UUID fields: RFC 4122-compatible UUID strings
- Hashes: `^sha256:[0-9a-f]{64}$`

Exact DID method normalization remains governed by the did:soul profile.

## 5. Canonical Enums

The first enum registry includes:

### Authority
A0, A1, A2, A3, A4, A5

### Risk
R0, R1, R2, R3, R4, R5

### Device Trust
UNREGISTERED, REGISTERED, ATTESTED, TRUSTED, LIMITED, SUSPENDED, REVOKED

### Runtime State
UNREGISTERED, REGISTERED, ATTESTED, ELIGIBLE, LIMITED, SUSPENDED, REVOKED

### Trust / REV Status
NOT_REQUIRED, PENDING, PASS, FAIL, UNAVAILABLE, EXPIRED

### Approval Status
NOT_REQUIRED, REQUIRED, PENDING, APPROVED, REJECTED, EXPIRED, INVALIDATED

### Execution Status
NOT_READY, READY, SUBMITTING, SUBMITTED, CONFIRMED, FAILED, EXECUTION_STATUS_UNKNOWN, CANCELLED, BLOCKED

### Mandate Lifecycle
DRAFT, REVIEWED, AUTHORIZED, ACTIVE, SUSPENDED, REVOKED, EXPIRED, EXHAUSTED, TERMINATED

## 6. Common Reason Codes

Reason codes are strings from a controlled registry. Initial families include:

- ambiguity;
- device/runtime;
- mandate;
- policy;
- Trust Protocol;
- REV;
- approval;
- authentication;
- signer;
- execution;
- recovery;
- SAEL integrity.

Services may emit explanatory text, but control-plane behavior shall use typed reason codes.

## 7. Financial Numeric Rules

Financial values shall use:

```json
{
  "atomic": "50000000",
  "decimals": 6
}
```

Floating-point numbers are prohibited for authoritative financial quantities.

## 8. Versioning

A breaking schema change requires a new schema identifier and version.

Examples:
- `ssw.action-contract.v1`
- `ssw.action-contract.v2`

Services may support multiple versions only through explicit compatibility profiles.

A client may not downgrade to a disabled or weaker schema version.

## 9. Validation Order

Consumers shall validate:

1. transport envelope;
2. declared schema ID/version;
3. JSON Schema;
4. semantic cross-field rules;
5. policy constraints;
6. cryptographic bindings where applicable.

JSON Schema validity alone is not sufficient authorization.

## 10. Cross-Field Rules Outside JSON Schema

Some rules remain semantic and must be enforced by service logic, including:

- A3/A4 requires mandate reference;
- A2 consequential action requires approval;
- R5 cannot be autonomously executed under baseline policy;
- material-term changes invalidate approval;
- mandate limit arithmetic;
- Trust/REV freshness;
- device/runtime eligibility;
- replay consumption;
- state-transition legality.

## 11. CI Requirements

The repository should add automated checks that:

- every JSON file validates syntactically;
- every schema validates against Draft 2020-12 meta-schema;
- example contracts validate;
- invalid security fixtures fail;
- enum references resolve;
- schema IDs are unique;
- no production service introduces undeclared security-critical enums.

## 12. Security Invariants

1. Enums are controlled vocabulary, not free-form policy.
2. Unknown authority or risk classes fail validation.
3. Unknown device states fail validation.
4. Financial values never use floating-point authority.
5. Unknown schema versions fail closed for consequential actions.
6. JSON Schema validation does not substitute for authority evaluation.
7. Machine-readable contracts become normative for implementation.

## 13. Next Machine Contracts

API-02 shall define the Internal OpenAPI Contract Set using these schemas.

Subsequent artifacts shall add:
- intent envelope schema;
- resolved intent schema;
- presentation schema;
- approval schema;
- Trust Protocol/REV decision schemas;
- SAEL event schema;
- runtime/session schemas;
- recovery schemas.

## 14. Controlled Statement

From this point forward, architecture prose explains the system.

Machine contracts define what implementations are allowed to accept.
