# SSW-AI-REL-02: Live Integration Evidence Registry & Gate Intake Baseline

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-REL-02  
**Status:** Controlled Evidence Automation Baseline — IN PROGRESS  
**Date:** 2026-09-20  
**Parent:** SSW-AI-REL-GATE-01

## 1. Purpose

REL-02 establishes a machine-readable intake and verification record for the live integration items DEV-OPEN-001 through DEV-OPEN-021.

The repository baseline is already complete.

REL-02 does not add a new production capability. It prevents a live integration from being marked complete merely because someone wrote that it was complete.

## 2. Governing Rule

`A DEV-OPEN ITEM CLOSES ON VERIFIED EVIDENCE, NOT ON ASSERTION.`

## 3. Evidence Lifecycle

Canonical states:

- OPEN;
- EVIDENCE_SUBMITTED;
- VERIFIED;
- REJECTED;
- WAIVED.

Only EVIDENCE_SUBMITTED items with valid evidence references may transition to VERIFIED.

## 4. Evidence References

Each reference records:

- evidence kind;
- reference identifier;
- environment;
- commit SHA when applicable;
- submission time;
- submitter.

Evidence may point to CI runs, staging tests, provider bindings, native tests, security tests, rollback drills, approvals, configuration attestations or controlled log excerpts.

## 5. Criticality

Items are classified as:

- RELEASE_BLOCKER;
- CONDITIONAL_BLOCKER;
- CAPABILITY_BLOCKER.

DEV-OPEN-007 remains conditional because the external-intelligence feature may be disabled for a release cohort.

Capability-specific items may still become release blockers when their corresponding capability is enabled in the active release configuration.

## 6. Verification

Verification records:

- verifier identity;
- verification timestamp;
- review notes.

A verification record does not alter unrelated gate state.

Each gate consumes the verified status of the items mapped to that gate.

## 7. Pilot Eligibility

The registry can report whether all applicable RELEASE_BLOCKER items are VERIFIED or explicitly WAIVED.

That summary is an input to REL-01.

It is not itself Pilot Gate approval.

## 8. Rejection

Evidence can be rejected without deleting it.

Rejected evidence remains part of the review history.

A corrected submission produces a new evidence reference and review event.

## 9. Waiver

WAIVED status is reserved for an explicit release-governance decision.

Waiving an item requires separate governance outside this baseline and should state scope, release cohort and expiry.

The runtime does not automatically create waivers.

## 10. Next

After REL-02 closure, live teams can begin attaching evidence to DEV-OPEN items in a uniform format. Gate status should change only after the relevant evidence is independently verified.
