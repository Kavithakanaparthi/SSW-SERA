# SSW-AI-POL-02: Deterministic Mandate Condition Language

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-POL-02  
**Status:** Controlled Security Specification  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-SCH-02, SSW-AI-TM-01, SSW-AI-ISC-01 through ISC-03, API-01, API-02, POL-01  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

This specification defines the Deterministic Mandate Condition Language (DMCL), the machine-evaluable rule language used for A4 conditional autonomous execution.

The governing invariant is:

> A4 conditions must be decidable from typed data, explicit operators and trusted inputs. Natural-language interpretation is not part of execution-time authorization.

## 2. Design Goals

DMCL shall be:

- deterministic;
- bounded;
- non-ambiguous;
- side-effect free;
- non-Turing-complete;
- versioned;
- machine-validatable;
- auditable;
- replayable;
- independent of model judgment.

## 3. Non-Goals

DMCL does not:

- execute arbitrary code;
- call arbitrary external APIs;
- run loops;
- define functions;
- mutate wallet state;
- create mandates;
- widen mandate scope;
- infer missing values from prose;
- evaluate subjective concepts such as "reasonable", "safe", "good price" or "trusted enough" without an explicit typed input.

## 4. Condition Model

A condition is a typed expression tree.

Example:

```json
{
  "op": "and",
  "args": [
    {
      "op": "lte",
      "left": {"ref":"action.amount.atomic"},
      "right": {"literal":"100000000"}
    },
    {
      "op": "eq",
      "left": {"ref":"action.asset.symbol"},
      "right": {"literal":"USDC"}
    },
    {
      "op": "in",
      "left": {"ref":"counterparty.id"},
      "right": {"set":["did:soul:merchant-a","did:soul:merchant-b"]}
    }
  ]
}
```

## 5. Expression Types

DMCL supports:

- boolean;
- integer-string;
- decimal metadata;
- string;
- timestamp;
- duration;
- identifier;
- enum;
- set of primitive typed values.

Floating-point numbers are prohibited.

## 6. Operator Families

### Boolean

- and
- or
- not

### Equality

- eq
- neq

### Ordered Comparison

- lt
- lte
- gt
- gte

### Membership

- in
- not_in

### Time

- before
- after
- within_window
- weekday_in
- time_of_day_between

### Counter / Limit

- count_lte
- cumulative_lte
- frequency_lte

### Presence

- exists
- not_exists

No regex or free-form expression evaluation is allowed in v1.

## 7. References

Every `ref` must point to an allowlisted typed data path.

Initial reference domains:

### Action

- action.type
- action.amount.atomic
- action.amount.decimals
- action.asset.id
- action.asset.symbol
- action.chain.id
- action.counterparty.id
- action.contract.id
- action.risk.class
- action.created_at

### Mandate

- mandate.id
- mandate.version
- mandate.valid_from
- mandate.valid_until

### Usage

- usage.actions_in_window
- usage.cumulative_atomic_in_window
- usage.last_action_at

### Device / Runtime

- device.id
- device.state
- runtime.id
- runtime.class
- runtime.state

### Trust

- trust.protocol.status
- rev.status
- aurion.status

### External Typed Signals

Only pre-registered signals with schema and provenance.

Example:

- signal.fx.usdc_usd
- signal.market.price.eth_usd
- signal.merchant.status
- signal.account.balance.atomic

External signals must never be identified by arbitrary URL in the condition itself.

## 8. Literal Values

Literals must declare values compatible with the referenced operand type.

Financial atomic values are strings:

```json
{"literal":"5000000","type":"integer_string"}
```

## 9. Data Sources

External inputs must come from a registered data-source descriptor containing:

- source_id;
- schema;
- provenance;
- freshness policy;
- trust classification;
- retrieval method;
- failure behavior.

The DMCL expression references logical signal names, not implementation URLs.

## 10. Freshness

Conditions relying on dynamic signals must define freshness limits.

If a required signal is stale or unavailable:

```
condition result = INDETERMINATE
```

For A4:

```
INDETERMINATE -> DO NOT EXECUTE
```

No optimistic assumption is permitted.

## 11. Evaluation Result

Canonical results:

- TRUE
- FALSE
- INDETERMINATE
- ERROR

Only TRUE permits the condition gate to pass.

FALSE, INDETERMINATE and ERROR block autonomous execution.

## 12. Evaluation Context

The evaluator receives an immutable context snapshot.

```json
{
  "evaluation_id": "uuid",
  "action_id": "uuid",
  "mandate_id": "uuid",
  "evaluated_at": "RFC3339",
  "inputs": {},
  "input_hash": "sha256:..."
}
```

All referenced inputs must resolve from that snapshot.

## 13. No Side Effects

Condition evaluation may not:

- submit transactions;
- update counters;
- reserve mandate allowance;
- call signer;
- create approvals;
- modify device state.

It returns only a result and evidence.

State mutation occurs later in the control plane.

## 14. Bounded Complexity

DMCL v1 limits:

- maximum expression depth: 16;
- maximum boolean children per node: 32;
- maximum set size: 256;
- maximum total nodes: 512;
- no recursion;
- no loops;
- no user-defined functions.

Exceeding a bound invalidates the condition.

## 15. Time Semantics

All timestamps use UTC RFC3339 internally.

Time-zone-sensitive rules must include explicit IANA timezone in the condition metadata.

Ambiguous local-time transitions must resolve according to documented policy.

## 16. Example: Scheduled Vendor Payment

```json
{
  "op":"and",
  "args":[
    {
      "op":"eq",
      "left":{"ref":"action.counterparty.id"},
      "right":{"literal":"did:soul:vendor-a"}
    },
    {
      "op":"lte",
      "left":{"ref":"action.amount.atomic"},
      "right":{"literal":"250000000"}
    },
    {
      "op":"time_of_day_between",
      "timezone":"America/Detroit",
      "start":"08:00",
      "end":"18:00",
      "value":{"ref":"evaluation.time"}
    }
  ]
}
```

## 17. Example: Balance Refill

```json
{
  "op":"and",
  "args":[
    {
      "op":"lt",
      "left":{"ref":"signal.account.balance.atomic"},
      "right":{"literal":"100000000"}
    },
    {
      "op":"lte",
      "left":{"ref":"usage.actions_in_window"},
      "right":{"literal":"3"}
    }
  ]
}
```

The model may explain this rule, but may not evaluate it authoritatively.

## 18. Example: Prohibited Subjective Rule

Invalid:

```
"Buy ETH when the price looks attractive."
```

Valid replacement:

```json
{
  "op":"lte",
  "left":{"ref":"signal.market.price.eth_usd"},
  "right":{"literal":"2500"}
}
```

## 19. Action Binding

A DMCL condition is part of the mandate terms hash.

Changing:

- operator;
- reference;
- literal;
- set;
- window;
- timezone;
- source requirement;

creates a new mandate version requiring authorization.

## 20. Evaluation Ordering

For an A4 action:

1. validate mandate;
2. validate condition schema;
3. resolve input snapshot;
4. verify source freshness;
5. evaluate DMCL;
6. record result;
7. continue to Risk/Policy/Trust/REV;
8. reserve usage;
9. sign;
10. execute.

Condition TRUE does not bypass any later control.

## 21. Condition Evidence

SAEL should record:

- evaluation ID;
- mandate ID/version;
- action ID;
- condition hash;
- input hash;
- result;
- reason codes;
- evaluated_at;
- evaluator version.

Sensitive raw values may remain referenced rather than duplicated.

## 22. Data Source Failure

If a required signal source fails:

- do not substitute model estimation;
- do not use stale value beyond freshness;
- do not infer from historical trend.

Result becomes INDETERMINATE.

## 23. Security Invariants

1. Natural language is never executable condition syntax.
2. Model output cannot directly satisfy a condition.
3. Conditions cannot call arbitrary tools.
4. Conditions cannot mutate state.
5. External inputs must be schema-registered.
6. Stale inputs do not pass.
7. INDETERMINATE does not execute.
8. R5 cannot be unlocked by DMCL.
9. Condition TRUE does not bypass Policy, Trust Protocol, REV or signer.
10. Condition changes require new mandate hash/version.

## 24. Error Codes

- DMCL_SCHEMA_INVALID
- DMCL_OPERATOR_UNSUPPORTED
- DMCL_REFERENCE_NOT_ALLOWED
- DMCL_TYPE_MISMATCH
- DMCL_SOURCE_UNAVAILABLE
- DMCL_SOURCE_STALE
- DMCL_COMPLEXITY_EXCEEDED
- DMCL_TIMEZONE_INVALID
- DMCL_RESULT_FALSE
- DMCL_RESULT_INDETERMINATE
- DMCL_EVALUATION_ERROR

## 25. Machine Schema

The canonical v1 schema is:

`contracts/json-schema/ssw-dmcl-expression.v1.schema.json`

## 26. Threat Model Gap Closure

This specification materially closes:

**SG-05 Deterministic condition language**

## 27. Conformance Tests

Minimum tests:

1. same inputs always return same result;
2. natural-language string condition rejected;
3. unsupported operator rejected;
4. stale signal returns INDETERMINATE;
5. unavailable signal returns INDETERMINATE;
6. type mismatch rejected;
7. expression depth > 16 rejected;
8. >512 nodes rejected;
9. condition mutation changes hash;
10. subjective phrase cannot be represented as executable operator;
11. TRUE still requires downstream control checks;
12. FALSE blocks A4;
13. INDETERMINATE blocks A4.

## 28. Exit Criteria

POL-02 advances when:

- schema validator exists;
- evaluator is deterministic across supported platforms;
- source registry is defined;
- freshness enforcement works;
- conformance fixtures pass;
- SAEL records condition evaluation evidence.

## 29. Controlled Statement

A4 autonomy is not "SERA decides when it feels appropriate."

It is a deterministic policy machine operating inside authority the holder already defined.
