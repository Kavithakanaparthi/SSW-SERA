# SSW-AI-REL-04: Evidence / Tracker Drift Guard

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-REL-04  
**Status:** Controlled Evidence Automation Baseline — IN PROGRESS  
**Date:** 2026-09-20  
**Parent:** SSW-AI-REL-03

## 1. Purpose

REL-04 makes evidence consistency a CI condition.

The governing rule is:

`A HUMAN-READABLE STATUS MAY NOT CONTRADICT THE VERIFIED EVIDENCE STATE.`

## 2. Inputs

The drift guard compares:

- the live integration evidence registry;
- the Phase I gate rows in the project tracker;
- the consolidated release gate evidence manifest.

## 3. Protected Claims

The guard validates mapped status for:

- Signing Gate;
- Execution Gate;
- Recovery Gate;
- SAEL Gate;
- Mobile Integration Gate;
- Infrastructure Gate;
- Pilot Gate;
- Production Release Gate.

It also verifies that the release manifest open-integration list matches the registry.

## 4. Safe Repository-Baseline Language

A tracker row may say that a repository baseline is complete while the live gate is blocked.

For example:

`REPOSITORY BASELINE COMPLETE — LIVE BLOCKED`

is compatible with unresolved live evidence.

A bare `COMPLETE` claim is not.

## 5. Release Safety Assertions

While applicable release blockers remain open, the consolidated release manifest must continue to assert:

- pilot candidate: false;
- production release candidate: false;
- production signing enabled: false;
- production asset movement enabled: false.

## 6. CI Binding

REL-04 adds a dedicated `verify:release-drift` script and a CI step after contract verification.

A contradictory tracker or release manifest causes CI failure.

## 7. Evidence Advancement

When live evidence becomes VERIFIED:

1. update the evidence registry;
2. update the release manifest derived gate state;
3. update tracker wording;
4. commit the changes together;
5. pass the drift guard.

The drift guard therefore turns evidence advancement into an atomic controlled change.

## 8. Next

After REL-04 closure, the repository-controlled evidence automation layer is complete. Further progress should come from actual live evidence submissions against DEV-OPEN items.
