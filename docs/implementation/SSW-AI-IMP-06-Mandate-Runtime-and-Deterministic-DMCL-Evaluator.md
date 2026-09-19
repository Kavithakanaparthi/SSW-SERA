# SSW-AI-IMP-06: Mandate Runtime & Deterministic DMCL Evaluator

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-IMP-06  
**Status:** Controlled Implementation Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-IMP-05

## 1. Purpose

IMP-06 makes A3 and A4 delegated authority machine-enforceable.

The governing rules are:

> A mandate grants only what its exact machine-readable scope permits.

> A4 conditions are evaluated by deterministic DMCL, never by generative interpretation at execution time.

> FALSE, INDETERMINATE or ERROR conditions do not authorize execution.

## 2. Evaluation Order

```
Validated Action Contract
  ↓
Validated Mandate
  ↓
Principal binding
  ↓
Lifecycle / temporal validity
  ↓
Authority-class compatibility
  ↓
Action scope
  ↓
Asset / chain / counterparty scope
  ↓
Risk ceiling / prohibited reasons
  ↓
Device / runtime restrictions
  ↓
Per-action and usage limits
  ↓
DMCL conditions
  ↓
Mandate Decision
```

## 3. Mandate Decision

IMP-06 introduces `ssw.mandate-evaluation-decision.v1`.

Statuses:

- PASS
- OUT_OF_SCOPE
- LIMIT_EXCEEDED
- CONDITION_FALSE
- CONDITION_INDETERMINATE
- INACTIVE
- EXPIRED
- IDENTITY_MISMATCH
- DEVICE_RUNTIME_MISMATCH
- RISK_EXCEEDED
- FAIL

Every decision binds:

- action ID;
- action version;
- mandate ID/version;
- material-terms hash;
- mandate-terms hash;
- evaluation time;
- reason codes.

## 4. A3

A3 requires a valid active mandate whose scope covers the action.

DMCL conditions may exist, but they are not required by class.

## 5. A4

A4 requires:

- active mandate;
- mandate authority class A4;
- at least one deterministic condition;
- every condition to evaluate TRUE.

Any FALSE denies the mandate.

Any missing/stale reference or unsupported expression produces INDETERMINATE and fails closed.

## 6. DMCL Runtime

Supported operators in this baseline:

- and / or / not;
- eq / neq;
- lt / lte / gt / gte;
- in / not_in;
- exists / not_exists;
- before / after;
- count_lte / cumulative_lte / frequency_lte.

Integer-string comparisons use BigInt.

Timestamp comparisons use RFC3339 timestamps.

No JavaScript `eval`, no dynamic code, no model interpretation and no arbitrary function execution are permitted.

`time_of_day_between` remains schema-valid but returns INDETERMINATE in IMP-06 until the production timezone profile is selected.

## 7. Reference Context

DMCL references are resolved from a read-only typed context namespace:

- action.*
- mandate.*
- usage.*
- device.*
- runtime.*
- trust.*
- rev.*
- aurion.*
- signal.*
- evaluation.*

Unknown paths return missing, not guessed values.

## 8. Scope Enforcement

The runtime initially enforces for `payment.send`:

- exact action type;
- asset ID;
- chain ID;
- canonical counterparty ID;
- per-action atomic amount where configured.

Empty scope arrays are interpreted as no grant for that dimension when the dimension is materially required.

## 9. Device and Runtime Constraints

If a mandate lists explicit device IDs or runtime IDs, the current Action Contract must match.

If allowed device states are supplied, the current eligibility context must match one of them.

Wearable or cloud execution remains denied unless the mandate explicitly permits it.

## 10. Risk

Action risk must not exceed `mandate.risk.max_class`.

Any action reason in `mandate.risk.prohibited_reasons` fails the mandate.

## 11. Usage and Limits

IMP-06 supports per-action amount enforcement.

Cumulative/frequency counters are exposed to DMCL via `usage.*` references but are not transactionally reserved in this artifact.

Atomic reservation and concurrency-safe usage accounting remain required before real execution.

## 12. Integrity

The mandate's stored `mandate_terms_hash` is carried into the decision.

IMP-06 does not yet cryptographically verify the holder signature. That remains part of the approval/authentication and signing-control work.

## 13. Tests

IMP-06 proves:

1. matching A3 mandate passes;
2. wrong holder/SERA binding fails;
3. expired mandate fails;
4. action type outside scope fails;
5. wrong asset/chain/counterparty fails;
6. per-action amount limit is enforced;
7. action risk above ceiling fails;
8. prohibited risk reason fails;
9. device/runtime restrictions fail closed;
10. A4 requires conditions;
11. TRUE A4 condition passes;
12. FALSE condition fails;
13. missing signal returns CONDITION_INDETERMINATE;
14. integer-string comparison uses exact integer semantics.

## 14. Next Controlled Artifact

**SSW-AI-IMP-07: Trust Protocol Adapter & Decision Binding Runtime**
