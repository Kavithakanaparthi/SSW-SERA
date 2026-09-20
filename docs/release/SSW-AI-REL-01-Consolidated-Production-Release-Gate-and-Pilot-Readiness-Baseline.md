# SSW-AI-REL-01: Consolidated Production Release Gate & Pilot Readiness Baseline

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-REL-01  
**Status:** Controlled Release Baseline — IN PROGRESS  
**Date:** 2026-09-20  
**Parent:** SSW-AI-INFRA-GATE-01  
**Normative Inputs:** PROD-08, MOB-GATE-01, INFRA-GATE-01, Phase I gate tracker

## 1. Purpose

REL-01 consolidates the previously separate production gates into a single machine-readable readiness decision without collapsing their authority boundaries.

The governing rule is:

`RELEASE READINESS AGGREGATES GATES; IT DOES NOT BYPASS THEM.`

## 2. Gate Set

Pilot candidacy requires COMPLETE state for:

- Contract Gate;
- Control-Plane Gate;
- Signing Gate;
- Execution Gate;
- Recovery Gate;
- SAEL Gate;
- Security Gate;
- Mobile Integration Gate;
- Infrastructure Gate.

Any non-complete gate blocks pilot candidacy.

## 3. Open Blockers

A pilot candidate requires zero open blockers.

The current DEV-OPEN registry remains authoritative.

A green repository build cannot override an open live integration blocker.

## 4. Pilot Readiness Evidence

Pilot readiness additionally requires:

- controlled cohort defined;
- cohort size greater than zero;
- rollback readiness;
- support readiness;
- telemetry readiness;
- privacy review complete;
- incident response readiness;
- transaction-success non-regression;
- recoverability non-regression;
- security-control-access non-regression;
- zero unresolved severity-1 incidents.

## 5. Decisions

Canonical decisions:

- `REPOSITORY_BASELINE_PASS_PRODUCTION_BLOCKED`;
- `PILOT_CANDIDATE`;
- `PRODUCTION_RELEASE_CANDIDATE`.

A pilot candidate is not a production release candidate.

## 6. Production Release Candidate

Production release candidacy requires:

- pilot readiness;
- Pilot Gate COMPLETE;
- production-candidate release evidence;
- manual final release approval.

This is a candidacy decision only.

## 7. Signing and Asset Movement

REL-01 never enables:

- production signing;
- production asset movement.

Even `PRODUCTION_RELEASE_CANDIDATE` keeps both values false.

Actual activation requires a separate controlled activation event after all applicable gates and approvals.

## 8. Current Program State

Current repository state is expected to remain:

`REPOSITORY_BASELINE_PASS_PRODUCTION_BLOCKED`

until live Signing, Execution, Recovery, SAEL, Security, Mobile and Infrastructure gates close and the open DEV-OPEN items are resolved.

## 9. Pilot Principle

A pilot is a controlled production-like cohort, not a shortcut around release discipline.

The pilot must be reversible and observable.

Pilot evidence must be sufficient to determine whether SERA-first behavior introduces regression in:

- transaction success;
- recoverability;
- security-control access;
- supportability;
- privacy and incident handling.

## 10. Next

After REL-01 closure, the repository can assemble a consolidated Release Gate evidence package showing the exact blockers that prevent pilot and production release.
