# SSW-AI-REL-03: Automated Gate Status Derivation

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-REL-03  
**Status:** Controlled Evidence Automation Baseline — IN PROGRESS  
**Date:** 2026-09-20  
**Parent:** SSW-AI-REL-02

## 1. Purpose

REL-03 derives release-gate status directly from the verified live-integration evidence registry.

The governing rule is:

`GATE STATUS IS DERIVED FROM VERIFIED EVIDENCE, NOT MANUALLY DECLARED.`

## 2. Gate Mapping

The runtime maps DEV-OPEN items to:

- Signing Gate;
- Execution Gate;
- Recovery Gate;
- SAEL Gate;
- Mobile Integration Gate;
- Infrastructure Gate;
- Production Deployment Gate;
- Pilot Gate;
- Production Release Gate.

## 3. Satisfaction Rule

A mapped item satisfies a gate only when it is:

- VERIFIED; or
- WAIVED through valid release governance.

OPEN, EVIDENCE_SUBMITTED and REJECTED do not satisfy a gate.

## 4. Derived State

Each gate returns:

- COMPLETE;
- BLOCKED; or
- CONDITIONAL.

The result includes required items, unresolved items, conditional items, verified items and waived items.

## 5. Capability-Specific Release Profile

Some live integrations are capability-dependent.

REL-03 therefore accepts an explicit release capability profile for:

- external intelligence;
- credential presentation;
- Soul ID live holder context;
- SVID4AI delegation.

When a capability is enabled, its associated evidence item becomes a release-profile blocker until verified or waived.

When disabled, that capability-specific item does not block the release profile.

## 6. Pilot and Production Distinction

Pilot eligibility ignores the still-unexecuted Pilot Gate and Production Release Gate themselves, but requires all prerequisite gates and enabled capability dependencies to be complete.

Production release eligibility requires every derived gate to be complete.

## 7. Tracker Discipline

The project tracker remains a human-readable view.

REL-03 makes the evidence registry authoritative for machine-derived gate status.

Manual tracker edits must not override a contradictory derived result.

## 8. Next

After REL-03 closure, the program can add CI validation that compares the committed tracker/gate manifests against derived evidence and fails when they drift.
