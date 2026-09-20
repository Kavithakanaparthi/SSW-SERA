# SSW-AI-SERA-RT-06: Multi-Chain Routing & Existing SSW Capability Adapters

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-SERA-RT-06  
**Status:** Controlled Runtime Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-SERA-RT-05

## 1. Purpose

RT-06 implements a deterministic multi-chain route-selection runtime and typed adapter boundaries for existing Soul Super Wallet capabilities.

The governing rules are:

> Route recommendation is not execution authority.

> Existing SSW capabilities are wrapped behind typed interfaces rather than unnecessarily rebuilt.

## 2. Route Separation

A holder intent such as:

`Send 500 USDC to Jane`

is distinct from the execution route.

The route engine may evaluate:

- holder balance by chain;
- recipient compatibility;
- chain availability;
- asset verification;
- fee;
- expected settlement time;
- bridge requirement;
- route risk;
- holder preference.

## 3. Hard Eligibility

A candidate route is ineligible when:

- the chain is unavailable;
- the asset representation is not verified;
- the recipient is incompatible with the route;
- the available balance is lower than the requested atomic amount;
- route risk is BLOCKED;
- an explicitly requested chain does not match.

The engine does not silently fall back from an explicitly requested chain to another chain.

## 4. Ranking

After hard eligibility, ranking is deterministic.

Default priority:

1. lower route risk;
2. no bridge requirement;
3. holder preference;
4. lower fee;
5. faster settlement;
6. stable chain-ID tie-break.

Exact monetary values are compared using integer atomic-unit strings.

No floating-point arithmetic is used for balances or fees.

## 5. Holder Preferences

Supported route preferences:

- NONE;
- LOWER_FEE;
- FASTER_SETTLEMENT;
- LOWER_RISK.

A preference changes ordering only among otherwise eligible routes.

It cannot make an ineligible route eligible.

## 6. Material Route Change

If the holder has already reviewed one chain and the recommended chain differs, the decision is marked:

- `material_change: true`;
- `requires_fresh_review: true`.

A route change after review must therefore re-enter review/authorization.

## 7. Inspectability

The Route Decision contains:

- recommended route;
- eligible alternatives;
- excluded route reasons;
- deterministic recommendation basis;
- whether fresh review is required.

The model may explain the result but does not alter the ranking output.

## 8. Existing SSW Capability Adapters

RT-06 defines typed interfaces for existing wallet services:

- balance retrieval;
- fee quotes;
- payment preparation;
- receive request preparation;
- swap preparation;
- WalletConnect request inspection;
- credential listing;
- credential-presentation preparation;
- asset-risk lookup.

The interfaces do not provide a generic sign or broadcast function.

Consequential submission remains in the existing controlled execution path.

## 9. Capability Effects

Adapter capabilities are classified as:

- READ;
- PREPARE.

No RT-06 capability descriptor has an EXECUTE effect.

## 10. Developer Integration

The current production SSW implementations are not duplicated in this repository.

Developers shall bind the current wallet services to the interfaces defined in `@soulverse/ssw-capability-adapters`.

The handoff is recorded as DEV-OPEN-006 in the living Developer Notes & Instructions.

## 11. Exit Criteria

RT-06 is complete when:

- Route Request and Route Decision contracts exist;
- deterministic route evaluation exists;
- explicit-chain no-fallback behavior is tested;
- exact atomic balance/fee comparison is tested;
- material route changes require fresh review;
- typed SSW capability adapter interfaces exist;
- live bindings are documented as developer-owned open integration work;
- CI and strict TypeScript pass.

## 12. Next Runtime Artifact

**SSW-AI-SERA-RT-07: External Intelligence & Risk Context Adapters**
