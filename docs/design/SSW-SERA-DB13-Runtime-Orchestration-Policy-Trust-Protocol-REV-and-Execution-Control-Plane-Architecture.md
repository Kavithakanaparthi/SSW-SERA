# SSW-SERA-DB13: Runtime Orchestration, Policy, Trust Protocol, REV & Execution Control Plane Architecture

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB13  
**Status:** Controlled Design Board / Pre-Architecture  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA  

## 1. Purpose

This document defines the runtime control plane that binds SERA's reasoning and interaction layer to Soul Super Wallet's deterministic trust, policy, authorization, signing, execution, evidence, privacy, and recovery controls.

The objective is to ensure that SERA can coordinate wallet capabilities without becoming the wallet's authority boundary.

The governing principle is:

> SERA may interpret, reason, recommend, prepare, coordinate and invoke. Deterministic control services decide whether a consequential action may proceed.

The runtime architecture therefore separates:

1. Experience Plane
2. Intelligence Plane
3. Control Plane
4. Trust and Authorization Plane
5. Execution Plane
6. Evidence Plane
7. Presentation Privacy Plane
8. Recovery and Resilience Plane

## 2. Architectural Position

DB13 binds the prior design-board work into an operational runtime.

It depends on:

- DB05 Privacy, Trust, Authority & Risk Boundary Design;
- DB07 Intent, Capability, Tool & Execution Contract Design;
- DB08 Memory, Context Broker & Personalization Architecture;
- DB09 Proactive Intelligence, Monitoring & Notification Architecture;
- DB10 Delegated Authority, Automation & Bounded Autonomy Architecture;
- DB11 Execution Evidence, Auditability, Receipts & Explainability Architecture;
- DB11A Concealed Detail Alert, Approval & Transaction Presentation Control;
- DB12 Resilience, Failure Recovery, Offline & Degraded-Mode Architecture;
- SSW-AI-VOICE-01 voice safety architecture.

DB13 does not replace these documents. It defines how their components operate together at runtime.

## 3. Runtime Control Plane Overview

```text
Holder / Event / Wearable / External Trigger
                    |
                    v
            SERA Experience Layer
                    |
                    v
             Intent Interpreter
                    |
                    v
          Capability / Tool Resolver
                    |
                    v
              Context Broker
                    |
                    v
          Action Plan / Draft Request
                    |
                    v
+--------------------------------------------------+
|              RUNTIME CONTROL PLANE               |
|                                                  |
|  Contract Validator                              |
|  Authority Resolver                              |
|  Device Trust Evaluator                         |
|  Risk Classifier                                 |
|  Policy Engine                                   |
|  Trust Protocol                                  |
|  REV Runtime Gate                                |
|  Authentication Coordinator                     |
|  Signing Request Controller                     |
|  Idempotency / Replay Guard                     |
|  Execution Router                               |
+--------------------------------------------------+
                    |
                    v
              Secure Signer
                    |
                    v
     Chain / API / Credential / Service Rail
                    |
                    v
           Execution Result / Receipt
                    |
                    v
               Evidence Graph
                    |
                    v
       Holder-visible Result / Explanation
```

SERA does not bypass or directly own any component below the Action Plan boundary.

## 4. Runtime Request Envelope

Every material request entering the control plane must be converted into a typed Runtime Action Request.

Illustrative schema:

```json
{
  "request_id": "rar_...",
  "session_id": "...",
  "holder_ref": "did:soul:...",
  "agent_ref": "did:soul:agent:...",
  "origin": "text|voice|tap|automation|wearable|external_event",
  "device_ref": "device_...",
  "intent": "SEND",
  "capability": "transfer.asset",
  "tool": "wallet.transfer.prepare",
  "parameters": {
    "asset": "USDC",
    "amount": "500",
    "recipient_ref": "contact_...",
    "preferred_chain": null
  },
  "context_manifest_ref": "ctx_...",
  "authority_ref": "auth_...",
  "risk_hint": "R3",
  "privacy_presentation": "CONCEALED",
  "created_at": "..."
}
```

The request is immutable after entering the control plane. Corrections create a superseding request rather than mutating the prior one silently.

## 5. Contract Validator

The Contract Validator verifies that the request conforms to the capability and tool definitions created in DB07.

It checks:

- capability exists;
- tool exists;
- tool is permitted for the capability;
- required parameters are present;
- parameter types are valid;
- values are within technical bounds;
- origin type is allowed;
- device class is supported;
- request version is supported;
- no prohibited data has leaked into the payload.

Malformed or unsupported requests fail before authority or execution is evaluated.

## 6. Capability and Tool Registry

The Capability Registry defines what SERA can ask the wallet to do.

Examples:

| Capability | Example tool | Consequential? |
|---|---|---|
| wallet.balance.read | balance.query | No |
| credential.find | credential.search | No |
| credential.present | credential.presentation.prepare | Yes |
| transfer.asset | wallet.transfer.prepare | Yes |
| swap.asset | wallet.swap.prepare | Yes |
| mandate.create | authority.mandate.prepare | Yes |
| notification.monitor | monitor.rule.create | Potentially |
| wallet.lock | security.wallet.lock | Yes |

SERA may only invoke registered tools. Arbitrary model-generated function names must never become executable paths.

## 7. Context Broker Boundary

The Context Broker supplies only the context required for the requested capability.

Examples:

For a balance query:

- relevant wallet addresses;
- selected chains;
- current balances.

For a payment route:

- asset balances;
- recipient compatibility;
- chain support;
- gas estimates;
- known policy restrictions;
- holder preferences;
- spam/risk signals;
- network health.

The Context Broker must enforce data minimization and classification before model or control-plane access.

## 8. Authority Resolver

The Authority Resolver determines whether the request relies on:

- direct holder intent;
- explicit holder approval;
- an existing bounded mandate;
- a recurring authorization;
- a device-scoped approval right;
- no authority at all.

It returns an authority object containing:

- authority class;
- mandate ID/version where relevant;
- capability scope;
- asset scope;
- counterparty scope;
- chain scope;
- amount limits;
- cumulative usage;
- time validity;
- device restrictions;
- revocation status.

SERA cannot author or expand this object during execution.

## 9. Device Trust Evaluator

Every consequential request must be bound to a device trust state.

Possible device states:

- TRUSTED_PRIMARY
- TRUSTED_SECONDARY
- WEARABLE_SCOPED
- RECOVERED_DEVICE
- DEGRADED
- UNTRUSTED
- REVOKED

Device trust may affect:

- whether the action can proceed;
- whether details may be revealed;
- whether approval is valid;
- whether signing may occur locally;
- whether the task must hand off to another device.

A wearable must never automatically inherit the primary phone's full authority.

## 10. Risk Classification

The Risk Classifier evaluates the action based on DB05 risk classes.

Illustrative factors:

- financial value;
- irreversible execution;
- new recipient;
- chain risk;
- bridge use;
- external contract interaction;
- credential sensitivity;
- delegated authority;
- unusual behavior;
- spam-token signals;
- stale context;
- degraded dependencies;
- wearable origin;
- voice ambiguity;
- external-intelligence dependency.

The risk class determines mandatory controls, not merely UI warnings.

## 11. Policy Engine

The Policy Engine translates risk and holder settings into deterministic requirements.

Example policy result:

```json
{
  "policy_result_id": "pol_...",
  "required_controls": [
    "TRUST_PROTOCOL",
    "REV",
    "HOLDER_REVIEW",
    "BIOMETRIC_AUTH",
    "SECURE_SIGNER"
  ],
  "presentation_mode": "CONCEALED_UNTIL_REVEAL",
  "handoff_required": false,
  "offline_allowed": false,
  "reason_codes": [
    "VALUE_TRANSFER",
    "NEW_COUNTERPARTY"
  ]
}
```

Policies must be versioned and auditable.

## 12. Trust Protocol Placement

Trust Protocol evaluates whether the parties and authority relationships satisfy trust requirements.

Inputs may include:

- identity;
- authority;
- delegation;
- policy;
- relationship state;
- device trust;
- optional trust score;
- relevant attestations;
- AURION signals where available.

Trust Protocol is advisory only if policy says so. For protected capabilities, its result becomes a required control input to REV.

## 13. REV Runtime Gate

REV is the final deterministic allow/disallow gate before execution proceeds.

REV receives a normalized execution decision request containing:

- holder identity;
- SVID4AI agent identity;
- capability;
- authority state;
- mandate state;
- device state;
- risk class;
- Trust Protocol result;
- policy version;
- transaction draft hash;
- relevant attestation state;
- degraded-mode state.

REV returns:

```json
{
  "decision": "PASS|FAIL",
  "reason_codes": [],
  "policy_version": "...",
  "decision_id": "rev_...",
  "valid_until": "..."
}
```

No material execution may proceed after REV FAIL.

## 14. REV Validity Window

A REV PASS is not permanently reusable.

The validity window must be limited by:

- time;
- exact action hash;
- exact recipient;
- exact amount;
- exact asset;
- exact chain;
- exact signer context;
- exact mandate version;
- device state.

Any material mutation requires re-evaluation.

## 15. Holder Review and Concealed Detail Control

DB11A is normative for all holder-facing approval surfaces.

The presentation layer supports:

- concealed-by-default alerts;
- concealed approval requests;
- per-instance reveal;
- automatic re-hide;
- stricter wearable concealment;
- voice-output concealment;
- category-specific masking.

Critical rule:

> Reveal is not approval.

A holder may reveal details, review them, then approve through a separate authorization step.

For high-risk actions, policy may require authenticated reveal before approval becomes available.

## 16. Authentication Coordinator

Authentication is invoked only after the control plane has determined the exact action to approve.

Supported methods may include:

- platform biometric;
- passcode fallback;
- hardware-backed assertion;
- FIDO assertion;
- device-local secure credential;
- wearable confirmation only where policy explicitly allows it.

Authentication success does not itself authorize a different action. It is bound to the reviewed action hash.

## 17. Signing Request Controller

The Signing Request Controller sits between the control plane and secure signer.

It verifies:

- REV PASS is valid;
- holder authentication requirement has been met;
- action hash matches the reviewed draft;
- mandate has not changed;
- request has not expired;
- nonce/idempotency guard permits execution;
- chain state has not invalidated assumptions;
- presentation/review requirements were satisfied.

Only then is the signing request emitted.

## 18. Secure Signer Isolation

The secure signer must remain isolated from SERA and the model runtime.

SERA must never receive:

- private keys;
- seed phrases;
- recovery secrets;
- raw signing keys;
- hardware key material.

The signer accepts a constrained signing request and returns a signature or failure.

## 19. Idempotency and Replay Guard

Every consequential action must have an idempotency key.

The guard prevents:

- accidental duplicate sends;
- retry-induced duplicate execution;
- repeated wearable approvals;
- replay of old voice approvals;
- reuse of stale REV decisions;
- duplicate API calls after network timeout.

If execution status is uncertain, the system reconciles before retrying.

## 20. Execution Router

The Execution Router dispatches the signed/authorized action to the correct rail.

Examples:

- EVM chain;
- non-EVM chain;
- exchange/liquidity provider;
- credential verifier;
- OpenID4VC endpoint;
- merchant API;
- banking/payment API;
- WalletConnect session;
- internal Soulverse service.

Each adapter must implement a common execution contract and evidence output format.

## 21. Multi-Chain Routing

Multi-chain selection occurs before REV and signing.

SERA may propose a route based on:

- balance availability;
- recipient support;
- gas/fee estimate;
- expected settlement;
- bridge requirement;
- policy restrictions;
- holder preferences;
- network health;
- risk signals.

The final selected route becomes part of the action hash and evidence bundle.

## 22. WalletConnect and External dApp Execution

WalletConnect must be treated as an external execution boundary.

The control plane should:

- inspect requested method;
- inspect chain;
- inspect target contract;
- classify risk;
- resolve approval policy;
- block unsupported or suspicious calls;
- prevent SERA from blindly approving external requests.

SERA can explain the request in human language, but deterministic controls govern approval.

## 23. Credential Presentation Runtime

Credential presentation follows the same runtime pattern as financial execution.

```text
Verifier request
 -> SERA interprets
 -> Context Broker finds candidate credential
 -> disclosure minimization
 -> holder/mandate authority check
 -> Trust Protocol / policy checks
 -> REV where required
 -> holder review
 -> cryptographic proof generation
 -> presentation
 -> evidence receipt
```

Sensitive claim disclosure must be explicit and inspectable.

## 24. Voice-Originated Runtime

Voice-originated consequential actions must include the VOICE-01 confidence envelope.

Required checks may include:

- speech confidence;
- entity confidence;
- numeric confidence;
- recipient confidence;
- negation detection;
- holder correction history;
- environment quality;
- action risk.

Low-confidence values cannot silently become execution parameters.

## 25. Wearable Runtime

Wearable requests enter the same control plane, but with scoped device authority.

Possible wearable outcomes:

- informational response on watch;
- concealed alert;
- low-risk approval;
- authenticated reveal;
- handoff to phone;
- refusal because device scope is insufficient.

Wearables must not host a parallel policy system. They consume the same authority, risk, Trust Protocol and REV logic.

## 26. Proactive and Automated Runtime

Proactive intelligence may generate a proposed action but does not create authority.

Automation flow:

```text
Monitoring signal
 -> rule/condition match
 -> mandate lookup
 -> context refresh
 -> risk evaluation
 -> Trust Protocol
 -> REV
 -> signer / execution if within mandate
 -> evidence / holder notification
```

If the mandate is absent, expired, exceeded or ambiguous, execution stops.

## 27. External Intelligence Boundary

News, LinkedIn, market data and other external intelligence sources may influence:

- recommendations;
- context;
- alerts;
- risk awareness;
- counterparty understanding.

They may not independently grant authority or cause irreversible execution.

Material external intelligence used in a decision must be provenance-linked in the evidence graph.

## 28. Spam Token and Malicious Asset Signals

Spam-token filtering must become a control-plane signal, not just a UI filter.

Potential policy outcomes:

- hide by default;
- warn holder;
- block interaction;
- require enhanced review;
- prohibit automated execution;
- require Trust Protocol/REV escalation;
- permit holder override only with explicit acknowledgement.

Historical evidence must preserve the classification that existed at decision time.

## 29. Degraded-Mode Integration

DB12 governs runtime behavior when dependencies fail.

Examples:

### AI unavailable
Conventional wallet surfaces remain available for supported actions.

### Trust Protocol unavailable
Protected actions fail closed unless a specific degraded policy exists.

### REV unavailable
Consequential execution must not silently bypass REV.

### Chain RPC unavailable
Use approved failover providers where configured; otherwise pause execution.

### External news/API unavailable
Remove advisory signal rather than fabricate certainty.

### Wearable disconnected
Handoff to phone or queue non-sensitive informational state.

### Network offline
Read cached state where safe; queue only explicitly allowed deferred actions.

## 30. Runtime State Machine

Suggested states:

```text
RECEIVED
VALIDATED
CONTEXT_RESOLVED
AUTHORITY_RESOLVED
RISK_CLASSIFIED
POLICY_EVALUATED
TRUST_EVALUATED
REV_PASSED
AWAITING_REVIEW
REVEALED
AWAITING_AUTHENTICATION
AUTHENTICATED
READY_TO_SIGN
SIGNED
SUBMITTED
PENDING_CONFIRMATION
CONFIRMED
FAILED
BLOCKED
CANCELLED
EXPIRED
UNCERTAIN
RECONCILING
```

Transitions must be explicit and evidence-bearing.

## 31. Cancellation Semantics

The holder must be able to cancel before irreversible submission where technically possible.

Cancellation must:

- invalidate the current REV decision;
- invalidate pending signer requests;
- mark the action state CANCELLED;
- prevent replay;
- create evidence;
- propagate across devices.

## 32. Expiry Semantics

Requests expire based on risk and dependency freshness.

Examples:

- gas quote expires quickly;
- recipient resolution may remain longer;
- wearable approval window may be short;
- Trust Protocol state may require refresh;
- mandate validity can expire independently.

An expired action must be regenerated rather than silently reused.

## 33. Evidence Emission

Every state transition emits evidence sufficient for DB11 reconstruction.

Critical evidence includes:

- original request;
- context manifest;
- authority result;
- risk class;
- policy decision;
- Trust Protocol output;
- REV decision;
- reveal/review state;
- authentication;
- signer request;
- execution response;
- final state.

## 34. Observability

Runtime observability should include:

- latency by stage;
- failure rates;
- REV fail reasons;
- Trust Protocol fail reasons;
- stale-context rejection counts;
- handoff rates;
- voice clarification rates;
- wearable escalation rates;
- duplicate/replay blocks;
- chain/RPC failures;
- external API degradation;
- concealed-detail reveal rates;
- abandoned approvals;
- uncertain execution counts.

Operational telemetry must be privacy-minimized and separated from holder-sensitive payload data.

## 35. Security Boundaries

The architecture must preserve at least the following hard boundaries:

1. model runtime cannot access private keys;
2. model runtime cannot grant authority;
3. model runtime cannot bypass policy;
4. model runtime cannot bypass Trust Protocol where required;
5. model runtime cannot bypass REV;
6. presentation reveal cannot equal approval;
7. wearable authority cannot exceed its assigned scope;
8. retries cannot duplicate execution;
9. stale decisions cannot be replayed;
10. evidence cannot be silently rewritten.

## 36. Recommended Service Decomposition

Potential runtime services:

- `sera-intent-service`
- `sera-context-broker`
- `sera-capability-registry`
- `sera-tool-registry`
- `sera-authority-service`
- `sera-device-trust-service`
- `sera-risk-engine`
- `sera-policy-engine`
- `trust-protocol-adapter`
- `rev-gateway`
- `sera-auth-coordinator`
- `sera-signing-controller`
- `sera-idempotency-service`
- `sera-execution-router`
- `sera-evidence-service`
- `sera-presentation-privacy-service`
- `sera-reconciliation-service`

These names are logical service boundaries, not yet frozen deployment units.

## 37. Production Acceptance Criteria

DB13 should not graduate to implementation baseline until the architecture can prove:

- every consequential action enters through a typed runtime request;
- all tools are registry-bound;
- authority is resolved deterministically;
- device scope is enforced;
- risk drives mandatory controls;
- Trust Protocol and REV cannot be bypassed by SERA;
- signing is cryptographically isolated;
- concealed-detail presentation does not weaken approval safety;
- voice uncertainty cannot silently become financial parameters;
- wearable approvals obey separate authority limits;
- retries are idempotent;
- execution state can be reconciled after uncertainty;
- all material transitions emit reconstructable evidence;
- degraded mode fails safely.

## 38. Controlled Design Decisions

**DB13-D01** — SERA is an orchestrator, not the authority boundary.  
**DB13-D02** — Every consequential action enters a typed runtime control plane.  
**DB13-D03** — Capability and tool registries constrain executable behavior.  
**DB13-D04** — Authority, device trust, risk and policy are deterministic control-plane functions.  
**DB13-D05** — Trust Protocol evaluates trust relationships and state before protected execution.  
**DB13-D06** — REV remains the final runtime pass/fail gate for protected actions.  
**DB13-D07** — REV decisions are short-lived and action-bound.  
**DB13-D08** — Secure signing remains isolated from SERA and model runtimes.  
**DB13-D09** — Reveal and approve are separate runtime events.  
**DB13-D10** — Wearables consume the same control plane with narrower device-scoped authority.  
**DB13-D11** — Proactivity and external intelligence may propose or inform actions but never create authority.  
**DB13-D12** — Retries require idempotency and reconciliation controls.  
**DB13-D13** — Runtime degradation must never silently bypass Trust Protocol, REV or signing policy.  
**DB13-D14** — Every material state transition must emit evidence.

## 39. Next Design Step

The next logical design document is:

**SSW-SERA-DB14: Reference Runtime Sequences, State Machines & API Boundary Contracts**

DB14 should convert this control-plane architecture into sequence-level specifications for key flows such as:

- read-only query;
- voice payment;
- multi-chain payment;
- credential proof;
- WalletConnect approval;
- delegated recurring payment;
- proactive recommendation;
- wearable approval and handoff;
- concealed-detail reveal and approval;
- REV failure;
- uncertain execution reconciliation;
- offline/degraded operation.
