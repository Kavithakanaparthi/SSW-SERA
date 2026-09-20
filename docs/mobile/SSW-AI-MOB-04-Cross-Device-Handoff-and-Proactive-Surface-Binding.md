# SSW-AI-MOB-04: Cross-Device Handoff & OS-Native Proactive Surface Binding

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-MOB-04  
**Status:** Controlled Mobile Integration Baseline — IN PROGRESS  
**Date:** 2026-09-19  
**Parent:** SSW-AI-MOB-03  
**Normative Inputs:** SSW-SERA-DB04A, SSW-SERA-DB05, SSW-SERA-DB06, SSW-SERA-DB09, SSW-SERA-DB11A

## 1. Purpose

MOB-04 establishes shared rules for task continuation across phone, desktop and future wearable surfaces, together with privacy-safe OS-native proactive presentation.

The central rule is:

`TASK STATE MAY MOVE; AUTHORITY DOES NOT MOVE WITH IT.`

Every consequential continuation must re-enter fresh device, policy, Trust/REV and authentication evaluation as applicable.

## 2. Cross-Device Handoff

A handoff contains references to:

- Holder DID;
- SERA Agent DID;
- task;
- optional action;
- source device;
- target device;
- requested capability;
- risk;
- freshness.

A valid handoff transfers task context only.

It never transfers:

- approval;
- signing authority;
- mandate authority;
- Trust PASS;
- REV PASS;
- device trust state.

## 3. Device Capability Scope

Each device declares an explicit allowed-capability set.

A paired wearable or secondary device cannot infer phone authority.

A target device must be eligible for the requested capability and possess fresh enough attestation where required.

High-risk tasks targeting wearable-class devices are redirected to a full trusted surface.

## 4. Fresh Control Evaluation

Every allowed handoff states:

- `authorityTransferred = false`;
- `freshControlPlaneRequired = true`.

High-risk and wearable handoffs additionally require fresh authentication.

## 5. OS-Native Proactive Surfaces

MOB-04 supports policy binding for:

- in-app surfaces;
- lock screen;
- notifications;
- widgets;
- Live Activities;
- Dynamic Island;
- wearables;
- desktop surfaces.

The portable event is not the OS push payload itself. Native implementations render from a privacy-filtered decision.

## 6. Proactive Priority

The existing SERA proactive classes remain authoritative.

P4 low-value material is suppressed.

P0-P3 delivery remains subject to device eligibility, freshness and holder policy.

## 7. Concealment

Locked or concealed surfaces receive generic attention text rather than sensitive wallet details.

A notification or widget may indicate that attention is required while withholding:

- amount;
- asset;
- counterparty;
- address;
- credential;
- chain;
- private holding context.

## 8. Actions on Ambient Surfaces

An ambient surface may expose a navigation or review affordance only when the device capability set permits it.

No OS-native surface action executes a consequential wallet action directly through this contract.

`actionExecutesDirectly = false`

Consequential execution re-enters the deterministic wallet control path.

## 9. Security Invariants

1. Pairing does not confer authority.
2. Handoff does not transfer authority.
3. Target capability must be explicit.
4. Stale attestation fails closed.
5. High-risk wearable continuation returns to a full trusted surface.
6. Locked ambient surfaces conceal sensitive details.
7. Proactive events expire rather than becoming stale actionable UI.
8. P4 low-value events are suppressed.
9. Native notification actions cannot bypass wallet approval/authentication.
10. Every consequential continuation re-evaluates the control plane.

## 10. Next

After MOB-04 closure, Phase F can complete the staged migration/rollback artifact and assemble the Mobile Integration Gate evidence package.
