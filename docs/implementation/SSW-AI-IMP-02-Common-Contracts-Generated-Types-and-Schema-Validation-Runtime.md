# SSW-AI-IMP-02: Common Contracts, Generated Types & Schema Validation Runtime

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-IMP-02  
**Status:** Controlled Implementation Baseline  
**Date:** 2026-09-18  
**Parent:** SSW-AI-IMP-01  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

IMP-02 binds the controlled JSON Schema corpus to executable runtime validation and a generated TypeScript contract layer.

The governing rule is:

> The controlled JSON Schema is authoritative. Generated types improve developer safety but never replace runtime validation.

## 2. Runtime Stack

The implementation uses:

- Ajv 8 with the JSON Schema 2020-12 validator;
- ajv-formats for UUID and date-time format validation;
- json-schema-to-typescript for reproducible TypeScript generation;
- tsx for contract-test execution during the implementation phase.

All production services must validate untrusted or cross-boundary payloads before using them as typed SSW contracts.

## 3. Contract Registry

The runtime registry covers:

- Action Contract;
- Delegated Authority Mandate;
- Offline Authorization Package;
- DMCL Expression;
- Device / Runtime Attestation Evidence;
- Recovery Proof;
- Wrapped SERA State Key;
- Counterparty Resolution.

The shared common schema is loaded as a dependency and is not directly accepted as a top-level runtime object.

## 4. Structural Validation

Ajv is configured for Draft 2020-12 with:

- all errors enabled;
- strict validation;
- format validation;
- union types enabled;
- no coercion;
- no default insertion;
- no removal of additional properties.

A malformed payload is rejected rather than normalized into validity.

## 5. Semantic Validation

JSON Schema cannot express every architecture invariant.

IMP-02 therefore adds a semantic validation stage after structural validation.

Initial semantic invariant:

**Holder DID / SERA Agent DID separation**

For every contract containing both identities:

- Holder DID must be a holder identity and must not use the `did:soul:agent:` namespace;
- SERA Agent DID must use `did:soul:agent:`;
- Holder DID and SERA Agent DID cannot be identical.

This directly implements SSW-AI-CF-A02 at the contract boundary.

Future semantic rules will be added only where the governing specifications require logic beyond JSON Schema.

## 6. Validation Result

The public validator returns:

```ts
type ContractValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: ContractValidationError[] }
```

Each error has:

- source: SCHEMA or SEMANTIC;
- path;
- code;
- message.

Callers that require fail-fast behavior use `assertContract()`, which throws `ContractValidationException`.

## 7. Type Generation

`npm run generate:types` compiles every controlled top-level JSON Schema into TypeScript output.

Generated output is developer tooling. Runtime trust remains with schema validation.

A checked-in generated snapshot provides immediate IDE/type coverage while the generator remains the reproducible source.

## 8. Service Consumption Rule

Services must not cast unknown payloads into contract interfaces.

Required pattern:

```ts
const result = validateContract("action-contract", payload);
if (!result.ok) {
  // reject at boundary
  return;
}
consumeTypedAction(result.value);
```

Forbidden pattern:

```ts
const action = payload as ActionContract;
```

for untrusted or cross-service input.

## 9. Failure Behavior

Validation failure is fail-closed.

A validation error:

- does not proceed to authority;
- does not proceed to Trust Protocol;
- does not proceed to REV;
- does not reach signing;
- may emit validation evidence/telemetry without secret payload leakage.

## 10. Contract Fixtures

IMP-02 introduces a canonical valid Action Contract fixture and mutation-based rejection tests.

The initial tests prove:

1. valid Action Contract passes;
2. missing required field fails;
3. unknown additional property fails;
4. SERA DID placed in Holder DID field fails semantic validation;
5. wrong SERA Agent DID namespace fails;
6. registry exposes every top-level controlled contract.

## 11. Package Boundaries

### `@soulverse/contracts`

Owns:

- contract names;
- schema IDs;
- checked-in generated TypeScript contract types.

Does not own runtime validation policy.

### `@soulverse/schema-validation`

Owns:

- schema loading;
- Ajv configuration;
- validator compilation;
- semantic invariants;
- validation result formatting;
- assertion helper.

Does not own business authority, risk, signing or execution.

## 12. Security Properties

IMP-02 deliberately disables:

- type coercion;
- implicit defaults;
- unknown-property removal;
- permissive fallback validation.

The runtime must reject an unexpected object rather than guess what the producer intended.

## 13. Acceptance Criteria

IMP-02 is complete when:

1. every controlled top-level schema is registered;
2. relative common-schema references resolve;
3. format validation is active;
4. generated contract types exist;
5. valid fixture passes;
6. malformed fixture mutations fail;
7. Holder DID / SERA DID namespace confusion fails;
8. validator exposes structured errors;
9. `assertContract` fails closed;
10. no signer/execution functionality is added.

## 14. Next Controlled Artifact

**SSW-AI-IMP-03: Action Contract Builder, Intent Normalization & Material-Term Binding**

IMP-03 should create the first real Action Contract construction path from a typed intent fixture, including material-term hashing inputs, ambiguity preservation and immutable contract versioning.
