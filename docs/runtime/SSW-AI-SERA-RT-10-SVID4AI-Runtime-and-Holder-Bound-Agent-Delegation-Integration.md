# SSW-AI-SERA-RT-10: SVID4AI Runtime & Holder-Bound SERA Agent DID / Delegation Integration

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-SERA-RT-10  
**Status:** Controlled Runtime Baseline — IN PROGRESS  
**Date:** 2026-09-19  
**Parent:** SSW-AI-SERA-RT-09  
**Normative Inputs:** SSW-SERA-DB10, SSW-SERA-DB17A, SSW-AI-CF-A02, SSW-AI-SCH-02

## 1. Purpose

RT-10 operationalizes SVID4AI for the holder-bound SERA agent.

SVID4AI establishes who the agent is, who governs and operates that agent, and whether the identity relationship is current.

It does not itself create execution authority.

The only valid delegated execution authority source remains a holder-issued controlled mandate.

## 2. Identity and Authority Separation

```text
Holder Soul ID
  -> governs / operates
SVID4AI SERA Agent DID
  -> may reference
Holder-Issued Mandate
  -> evaluated by
Mandate Runtime + Policy + Device + Trust Protocol + REV
  -> exact signing / execution path
```

An ACTIVE SVID4AI identity has `authority_effect: NONE`.

## 3. SVID4AI Agent Context

RT-10 records:

- Holder DID;
- SERA Agent DID;
- Operator DID;
- agent DID-document reference and version;
- verification-method references;
- SVID4AI integrity provenance;
- governing Holder DID;
- Holder/agent binding reference and version;
- freshness;
- delegation invariants;
- Trust Protocol / REV requirements for consequential operations.

For the SSW-SERA profile, the operator is the Holder DID.

## 4. Delegation Rules

The runtime machine-enforces:

- authority source = `HOLDER_ISSUED_MANDATE`;
- SERA cannot self-expand authority;
- SERA cannot self-renew authority;
- consequential delegation requires a mandate;
- SVID4AI identity status does not authorize execution;
- mandate principal must exactly match the SVID4AI Holder/SERA pair.

## 5. Mandate Binding

RT-10 binds an existing controlled mandate to a verified agent context only when:

- SVID4AI context is fresh;
- Holder DID matches;
- SERA Agent DID matches;
- mandate is ACTIVE;
- current time is inside mandate validity;
- self-renewal is false;
- exact mandate terms hash exists;
- holder authorization/signature reference exists.

The resulting binding explicitly states:

`executionAuthorized = false`

and

`requiresExecutionTimeControlPlane = true`.

The existing mandate runtime remains responsible for scope, limits, conditions, risk, device/runtime restrictions and action-time evaluation.

## 6. Trust Protocol, REV and AURION

SVID4AI identity and a valid mandate are necessary but not sufficient for consequential execution.

The action-time control plane must still apply the mandate's required:

- Trust Protocol evaluation;
- REV evaluation;
- AURION continuous attestation where required;
- device/runtime trust;
- policy;
- risk;
- usage/cumulative limits;
- exact signing boundary.

SERA cannot override a failure.

## 7. Revocation

The runtime fails closed on:

- revoked or suspended SVID4AI identity;
- revoked/suspended/expired/exhausted/terminated mandate;
- stale agent identity state;
- wrong Holder DID;
- wrong Operator DID;
- wrong SERA Agent DID;
- invalid identity/binding versions;
- missing provenance.

A stale cached SVID4AI record cannot preserve authority.

## 8. Recovery

Recovering SERA identity does not automatically reactivate a mandate.

After recovery, the system must freshly resolve:

- Holder Soul ID;
- SVID4AI SERA Agent DID;
- governance/operator binding;
- mandate status;
- Trust Protocol;
- REV;
- device/runtime eligibility.

## 9. External Protocols

Future AP2/AP3 and other agent-commerce bindings may consume the verified SVID4AI agent identity and mandate references.

They must not reinterpret the SVID4AI identity itself as payment authority.

Any external protocol request must map back to the same deterministic Holder/SERA/mandate/control-plane chain.

## 10. Live Integration Handoff

The live SVID4AI provider must supply:

- SERA Agent DID resolution;
- current SVID4AI ACTIVE/SUSPENDED/REVOKED status;
- governing Holder DID;
- Operator DID;
- DID-document reference/version;
- verification-method references;
- Holder/agent binding reference/version;
- integrity provenance;
- freshness metadata.

Provider-specific transport details remain outside the controlled runtime.

## 11. Next Runtime Artifact

The next item will be determined from the living build tracker after RT-10 CI closure.
