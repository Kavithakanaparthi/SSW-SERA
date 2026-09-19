# SSW-AI-IMP-04: Authority, Risk & Policy Evaluation Baseline

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-IMP-04  
**Status:** Controlled Implementation Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-IMP-03  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

IMP-04 implements the first deterministic control-plane evaluation of a validated Action Contract.

It produces three independent machine decisions:

1. Authority Decision;
2. Risk Decision;
3. Policy Decision.

The governing invariants are:

> Authority and risk are independent axes.

> Policy may restrict authority. Policy cannot create authority.

> An early-stage policy ALLOW means only that policy permits continuation to the next control. It is never permission to sign or execute.

## 2. Canonical Classes

Authority classes follow CF-A01:

- A0 Informational;
- A1 Prepare / Retrieve;
- A2 Explicit Approval;
- A3 Bounded Delegation;
- A4 Conditional Autonomous Execution;
- A5 Prohibited Autonomous Authority.

Risk classes follow CF-A01:

- R0 Informational / Public;
- R1 Personal Read-Only / Low Impact;
- R2 Preparatory / Reversible;
- R3 Consequential;
- R4 High / Critical Consequence;
- R5 Restricted / Exceptional.

## 3. Authority Evaluation

Authority evaluation consumes:

- validated Action Contract;
- material-terms hash;
- approval state already present on the Action Contract;
- mandate reference where present.

Initial behavior:

- A0: PASS;
- A1: PASS;
- A2 with no valid approval: REQUIRE_APPROVAL;
- A2 with approved terms hash unequal to current material-terms hash: FAIL;
- A2 with matching approved terms hash: PASS;
- A3/A4: REQUIRE_MANDATE_VALIDATION;
- A5: PROHIBITED.

IMP-04 does not validate a mandate. That belongs to IMP-06.

## 4. Risk Evaluation

Risk is recomputed deterministically from:

- action type baseline;
- declared contract risk;
- explicit normalized risk signals.

The evaluator never lowers risk below either the action-family baseline or the Action Contract's declared class.

Initial `payment.send` baseline is R3.

Supported initial risk signals include:

- NEW_COUNTERPARTY;
- SUSPICIOUS_ASSET;
- BRIDGE_REQUIRED;
- HIGH_VALUE_POLICY_HIT;
- EXTERNAL_REQUEST;
- UNTRUSTED_ORIGIN;
- RECOVERY_CONTEXT;
- DEGRADED_RUNTIME.

Each signal has a deterministic minimum risk floor.

No model score directly determines risk class.

## 5. Policy Evaluation

The initial policy evaluator combines:

- validated Action Contract;
- Authority Decision;
- Risk Decision;
- controlled policy profile.

It may return:

- ALLOW_CONTINUE;
- REQUIRE_AUTHORITY;
- REQUIRE_DEVICE_RUNTIME;
- REQUIRE_TRUST_REV;
- DENY;
- PROHIBITED.

Evaluation order:

```
A5 / prohibited authority
   ↓
risk ceiling
   ↓
authority status
   ↓
device/runtime eligibility
   ↓
Trust Protocol / REV requirement
   ↓
ALLOW_CONTINUE
```

Because IMP-04 does not implement Device Trust, Trust Protocol or REV, most consequential actions should stop at one of those later required controls rather than appear fully authorized.

## 6. Default Phase-1 Policy Profile

The baseline profile:

- permits A0-A4 subject to their own controls;
- prohibits A5;
- maximum risk class R4;
- rejects R5;
- requires device/runtime eligibility before consequential continuation;
- preserves Trust Protocol and REV requirements declared by the Action Contract.

This is an implementation baseline, not final product policy.

## 7. Decision Objects

All three decision types are machine-readable and separately schema validated.

Each decision binds to:

- action ID;
- Action Contract version;
- material-terms hash;
- evaluation time;
- reason codes.

This prevents a decision for one version or material state from being silently reused for another.

## 8. Fail-Closed Rules

Evaluation fails closed when:

- contract validation fails;
- material-terms hash is absent or malformed;
- A2 approval hash does not match current terms;
- A3/A4 mandate validation has not occurred;
- A5 is requested;
- risk exceeds policy ceiling;
- device/runtime eligibility is required but unavailable;
- required Trust/REV controls remain unresolved.

## 9. No Side Effects

IMP-04 does not:

- mutate the Action Contract;
- approve an action;
- activate a mandate;
- mark a device/runtime eligible;
- call Trust Protocol;
- call REV;
- sign;
- execute;
- broadcast.

Decision objects are advisory inputs to the next deterministic control-plane stage.

## 10. Tests

IMP-04 proves:

1. A2 without approval requires approval;
2. A2 with mismatched approved terms hash fails;
3. A2 with matching hash passes authority only;
4. A3/A4 require mandate validation;
5. A5 is prohibited;
6. payment.send cannot classify below R3;
7. risk signals elevate but never lower risk;
8. R5 is denied by baseline policy;
9. missing device/runtime eligibility stops continuation;
10. Trust/REV remain required after earlier controls pass;
11. all decisions bind the exact material-terms hash.

## 11. Next Controlled Artifact

**SSW-AI-IMP-05: Device Trust, Runtime Registry & Session Eligibility Implementation**

IMP-05 should make the current device/runtime eligibility fields real rather than static false values and bind eligibility evidence to the Action Contract evaluation path.
