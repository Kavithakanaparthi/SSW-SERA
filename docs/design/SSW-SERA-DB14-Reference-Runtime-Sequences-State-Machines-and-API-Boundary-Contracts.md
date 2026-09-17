# SSW-SERA-DB14: Reference Runtime Sequences, State Machines & API Boundary Contracts

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB14  
**Status:** Controlled Design Board / Pre-Architecture  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA  

## 1. Purpose

This document converts the runtime control-plane architecture defined in DB13 into concrete, testable runtime sequences, state machines, and service boundary contracts.

Its objective is to ensure that SERA-assisted and SERA-initiated actions move through the same deterministic control sequence regardless of whether they originate from text, voice, proactive intelligence, delegated automation, the phone UI, or a future wearable surface.

The governing principle is:

> SERA may initiate and coordinate work, but every consequential action must traverse explicit machine states and deterministic authority, policy, trust, review, signing, execution, and evidence boundaries.

## 2. Scope

DB14 defines reference flows for:

- holder-initiated payments;
- multi-chain route selection;
- concealed-detail approval;
- wearable initiation and handoff;
- credential presentation;
- WalletConnect and external dApp actions;
- delegated automation;
- REV rejection;
- network or provider uncertainty;
- transaction reconciliation;
- proactive alerts that become actionable flows;
- voice ambiguity recovery;
- cross-device continuation;
- fail-closed runtime behavior.

It also defines canonical runtime state machines and API boundary patterns between SERA and deterministic wallet services.

## 3. Canonical Runtime Actors

The reference architecture uses the following logical actors:

1. **Experience Surface**  
   Phone UI, voice surface, notification, widget, wearable, or external trigger.

2. **SERA Orchestrator**  
   Interprets holder intent, plans the task, requests context, selects capabilities, and coordinates non-authoritative steps.

3. **Intent Service**  
   Converts holder input into typed intents and resolved entities.

4. **Context Broker**  
   Supplies scoped context according to data class, privacy rules, device, task, and retention policy.

5. **Capability Registry**  
   Describes what the wallet can do and the tools available for each capability.

6. **Authority Service**  
   Resolves direct holder authority, mandates, delegation, device scope, and capability limits.

7. **Risk & Policy Service**  
   Classifies action risk and determines required controls.

8. **Trust Protocol**  
   Evaluates identity, authority, delegation, policy, and trust context.

9. **REV**  
   Performs the final runtime pass/fail authorization decision.

10. **Presentation Service**  
    Renders reviewable transaction or credential details, including concealed-detail behavior.

11. **Authentication Service**  
    Performs platform-supported holder authentication.

12. **Signer**  
    Isolated cryptographic signing boundary.

13. **Execution Router**  
    Routes approved actions to blockchain networks, WalletConnect, credential verifiers, or external APIs.

14. **Reconciliation Service**  
    Resolves uncertain outcomes and final status.

15. **Evidence Service**  
    Writes the append-only execution evidence graph.

## 4. Canonical Action State Machine

Every material runtime action should map to a shared state machine.

```text
RECEIVED
   |
   v
INTERPRETING
   |
   v
RESOLVING_CONTEXT
   |
   v
CAPABILITY_RESOLVED
   |
   v
AUTHORITY_CHECK
   |
   +----> BLOCKED_AUTHORITY
   |
   v
RISK_POLICY_CHECK
   |
   +----> BLOCKED_POLICY
   |
   v
TRUST_EVALUATION
   |
   +----> BLOCKED_TRUST
   |
   v
REV_EVALUATION
   |
   +----> BLOCKED_REV
   |
   v
REVIEW_REQUIRED?
   | yes
   v
AWAITING_REVIEW
   |
   v
AUTHENTICATION_REQUIRED?
   | yes
   v
AWAITING_AUTHENTICATION
   |
   v
READY_TO_SIGN
   |
   v
SIGNED
   |
   v
SUBMITTING
   |
   +----> SUBMISSION_UNCERTAIN
   |
   v
SUBMITTED
   |
   v
CONFIRMING
   |
   +----> RECONCILIATION_REQUIRED
   |
   v
CONFIRMED
   |
   v
EVIDENCE_FINALIZED
```

Terminal states include:

- `CONFIRMED`
- `FAILED`
- `BLOCKED_AUTHORITY`
- `BLOCKED_POLICY`
- `BLOCKED_TRUST`
- `BLOCKED_REV`
- `CANCELLED_BY_HOLDER`
- `EXPIRED`
- `RECONCILIATION_REQUIRED`

No consequential execution may skip authority, policy, Trust Protocol, REV, and signing boundaries simply because SERA has already reasoned about the action.

## 5. Sequence A: Holder-Initiated Multi-Chain Payment

Example holder request:

> “Send Jane 500 USDC.”

Reference sequence:

```text
Holder
  -> SERA: Send Jane 500 USDC
SERA
  -> Intent Service: normalize SEND intent
Intent Service
  -> Context Broker: resolve Jane, balances, supported chains, recent counterparty context
Context Broker
  -> SERA: Jane resolved + balances + chain candidates
SERA
  -> Capability Registry: SEND_ASSET
Capability Registry
  -> SERA: required tool and control requirements
SERA
  -> Route Evaluator: compare Polygon / Ethereum / other supported routes
Route Evaluator
  -> SERA: ranked route facts
SERA
  -> Authority Service: check direct authority / mandate
Authority Service
  -> Risk & Policy: evaluate value transfer risk
Risk & Policy
  -> Trust Protocol
Trust Protocol
  -> REV
REV
  -> Presentation Service: review payload
Presentation Service
  -> Holder: show prepared transaction
Holder
  -> Authentication Service: approve
Authentication Service
  -> Signer: approved signing request
Signer
  -> Execution Router: signed transaction
Execution Router
  -> Chain
Chain
  -> Reconciliation Service
Reconciliation Service
  -> Evidence Service
Evidence Service
  -> Holder: receipt
```

### 5.1 Multi-Chain Route Object

A route should be represented as a deterministic object rather than free-form model text.

```json
{
  "route_id": "route_...",
  "asset": "USDC",
  "amount": "500",
  "recipient_ref": "contact_jane",
  "candidates": [
    {
      "chain": "polygon",
      "recipient_compatible": true,
      "balance_sufficient": true,
      "estimated_fee": "0.03 USD",
      "bridge_required": false,
      "policy_allowed": true
    },
    {
      "chain": "ethereum",
      "recipient_compatible": true,
      "balance_sufficient": true,
      "estimated_fee": "3.90 USD",
      "bridge_required": false,
      "policy_allowed": true
    }
  ],
  "selected_chain": "polygon",
  "reason_codes": [
    "RECIPIENT_COMPATIBLE",
    "SUFFICIENT_BALANCE",
    "LOWER_ESTIMATED_FEE",
    "NO_BRIDGE_REQUIRED"
  ]
}
```

The selected route is advisory until control-plane authorization completes.

## 6. Sequence B: Concealed-Detail Approval

Concealed-detail mode is a presentation control, not an authority control.

Example notification:

```text
SERA needs your approval for a transaction.
[Show details]
[Dismiss]
```

No amount, recipient, credential claim, merchant, or asset needs to appear until the holder reveals the instance.

Reference sequence:

```text
Action reaches AWAITING_REVIEW
  -> Presentation Service checks holder privacy preference
  -> create concealed presentation token
  -> send generic alert
Holder selects Show details
  -> optional authentication if policy requires
  -> reveal material review payload
  -> log reveal evidence
Holder selects Approve
  -> approval is treated as a separate event
  -> authentication/signing flow continues
```

### 6.1 Concealed Presentation State Machine

```text
CONCEALED
   |
   +----> DISMISSED
   |
   v
REVEAL_REQUESTED
   |
   v
REVEALED
   |
   +----> RECONCEALED
   |
   +----> CANCELLED
   |
   v
APPROVAL_REQUESTED
```

`REVEALED` does not imply `APPROVED`.

Automatic reconceal conditions may include:

- application backgrounding;
- screen lock;
- wearable sleep state;
- inactivity timeout;
- device change;
- user-selected hide action.

## 7. Sequence C: Wearable-Initiated Payment

Wearables are Phase 2 surfaces but Phase 1 architecture constraints.

Example:

> Holder on watch: “Pay the coffee shop 8 dollars.”

Reference sequence:

```text
Wearable
  -> SERA Edge Surface: voice intent
  -> Intent Service: normalize request
  -> Device Trust Service: identify wearable and authority scope
  -> Context Broker: merchant / recent interaction context
  -> Authority Service: check wearable action limits

IF inside wearable scope:
  -> Risk & Policy
  -> Trust Protocol
  -> REV
  -> wearable review surface
  -> holder confirmation / permitted local authentication
  -> phone or secure execution device signs
  -> execute

IF outside wearable scope:
  -> create cross-device handoff
  -> phone receives concealed or full review according to preference
  -> holder reviews and authenticates on phone
  -> signer executes
```

The watch should not inherit full phone authority merely because it is paired.

## 8. Sequence D: Credential Presentation

Example:

> “Show this hotel proof that I’m over 21.”

Reference sequence:

```text
SERA
  -> Intent Service: PRESENT_CREDENTIAL
  -> Context Broker: locate eligible credentials
  -> Credential Selector: choose minimum-disclosure proof
  -> Authority Service
  -> Risk & Policy
  -> Trust Protocol
  -> REV
  -> Presentation Service: show what will be disclosed
  -> Holder approval
  -> Credential Engine: construct VP / proof
  -> Verifier endpoint
  -> Evidence Service
  -> Holder receipt
```

The UI should show the disclosed claims or proof semantics, not merely the credential title.

## 9. Sequence E: WalletConnect / External dApp Action

WalletConnect requests must be treated as externally supplied intents, not trusted actions.

```text
dApp
  -> WalletConnect Adapter: transaction / signature request
  -> Request Normalizer
  -> Context Broker: dApp identity, chain, contract, token approvals
  -> Risk & Policy
  -> Trust Protocol
  -> REV
  -> Presentation Service
  -> Holder review and authentication
  -> Signer
  -> WalletConnect Adapter
  -> dApp / chain
  -> Evidence Service
```

SERA may explain the request, but cannot silently convert a dApp request into holder authorization.

External content must be treated as untrusted input and isolated from system instructions and policy state.

## 10. Sequence F: Delegated Automation

Example mandate:

> “Pay Acme Hosting each month up to $50.”

Trigger sequence:

```text
Scheduled / event trigger
  -> Automation Engine
  -> Mandate Resolver
  -> check counterparty
  -> check time scope
  -> check cumulative limit
  -> check asset / chain scope
  -> Context Broker
  -> Risk & Policy
  -> Trust Protocol
  -> REV
  -> Signer
  -> Execution Router
  -> Reconciliation
  -> Evidence Service
  -> notify holder
```

The AI does not create new authority at runtime. It may propose an action only within the mandate object.

### 10.1 Automation State Machine

```text
SCHEDULED
   |
   v
TRIGGERED
   |
   v
MANDATE_CHECK
   |
   +----> MANDATE_INVALID
   |
   v
CONDITION_CHECK
   |
   +----> CONDITION_NOT_MET
   |
   v
CONTROL_PLANE_EVALUATION
   |
   +----> BLOCKED
   |
   v
EXECUTING
   |
   v
COMPLETED
```

Every run is independently re-evaluated. A prior successful run does not pre-authorize future runs.

## 11. Sequence G: REV Failure

REV failure is a terminal control-plane outcome unless the underlying conditions materially change.

```text
... -> Trust Protocol -> REV
REV -> decision = FAIL
  -> execution pipeline stops
  -> no signing request is generated
  -> no network submission occurs
  -> Evidence Service records reason codes
  -> SERA explains permitted remediation
```

Example holder-facing response:

```text
I didn’t submit this transaction because the device is outside the authority allowed by your mandate.
You can review the mandate or continue on your trusted phone.
```

SERA must not retry around REV or search for an alternate path that bypasses the failed control.

## 12. Sequence H: Submission Uncertain

A critical rule for financial execution:

> Unknown does not mean failed.

If the wallet loses connectivity after signing or submission, it must not blindly resubmit.

Reference sequence:

```text
SIGNED
  -> Execution Router submits transaction
  -> timeout / transport failure
  -> state becomes SUBMISSION_UNCERTAIN
  -> derive transaction hash if available
  -> check mempool / RPC / alternate RPC / explorer / provider receipt
  -> do not produce new signature unless reconciliation establishes non-submission
  -> transition to SUBMITTED, CONFIRMED, FAILED, or RECONCILIATION_REQUIRED
```

### 12.1 Idempotency Contract

All execution requests should include an idempotency key where the destination rail supports one.

```json
{
  "execution_id": "exec_...",
  "idempotency_key": "wallet_action_...",
  "signed_payload_hash": "...",
  "expected_destination": "polygon",
  "submission_attempt": 1
}
```

The system must never ask the model to decide whether a financial submission should simply be attempted again.

## 13. Sequence I: Voice Ambiguity

Example ambiguity:

> “Send fifty to Mira.”

Speech alternatives may include `fifty` and `fifteen`, or multiple recipients named Mira.

```text
Voice Surface
  -> Speech Recognition
  -> Holder Voice Profile adaptation
  -> Intent Service
  -> Confidence Envelope
  -> entity / number ambiguity detected
  -> state = NEEDS_CLARIFICATION
  -> SERA asks targeted clarification
  -> corrected intent supersedes prior candidate
  -> control-plane flow restarts from resolved intent
```

No value-moving request proceeds from unresolved numeric or recipient ambiguity.

## 14. Sequence J: Proactive Alert to Action

Example:

SERA identifies a credential expiring soon.

```text
Monitoring Service
  -> Signal Normalizer
  -> Relevance / urgency scoring
  -> SERA Proactivity Policy
  -> generic or detailed alert depending on privacy preference
Holder opens alert
  -> SERA explains issue
Holder asks to renew / act
  -> NEW intent created
  -> normal control-plane sequence begins
```

A proactive alert may inform or prepare, but never grants authority merely because SERA surfaced it.

## 15. Cross-Device Handoff Contract

Cross-device continuation should preserve one action lineage.

Example object:

```json
{
  "handoff_id": "handoff_...",
  "action_id": "act_...",
  "from_device": "watch_...",
  "to_device": "phone_...",
  "reason": "WEARABLE_AUTHORITY_LIMIT",
  "state": "AWAITING_PHONE_REVIEW",
  "created_at": "...",
  "expires_at": "..."
}
```

A handoff must not duplicate the action into two independent approval flows.

## 16. API Boundary Principles

All control-plane APIs should obey the following rules:

1. Typed request and response schemas.
2. Explicit versioning.
3. Deterministic reason codes.
4. No private key material crosses service boundaries.
5. AI-generated text is never accepted as an authorization object.
6. Every consequential request has an immutable action ID.
7. Every execution request references the exact authority and REV decision.
8. Sensitive context is passed by protected reference where possible.
9. Idempotency keys are mandatory for retryable side effects.
10. Every service writes material events to the evidence layer.

## 17. Reference API Contracts

### 17.1 Intent Resolution

`POST /runtime/intents/resolve`

Request:

```json
{
  "action_id": "act_...",
  "origin": "voice",
  "input_ref": "protected_input_...",
  "device_ref": "device_..."
}
```

Response:

```json
{
  "intent": "SEND",
  "entities": {
    "recipient_ref": "contact_jane",
    "amount": "500",
    "asset": "USDC"
  },
  "confidence": {
    "intent": 0.99,
    "recipient": 0.97,
    "amount": 0.99
  },
  "requires_clarification": false
}
```

### 17.2 Authority Evaluation

`POST /runtime/authority/evaluate`

```json
{
  "action_id": "act_...",
  "capability": "SEND_ASSET",
  "device_ref": "device_...",
  "holder_ref": "did:soul:...",
  "candidate_mandate_ref": null
}
```

Response:

```json
{
  "authority_class": "A2",
  "scope_result": "PASS",
  "holder_review_required": true,
  "authentication_required": true
}
```

### 17.3 Risk Evaluation

`POST /runtime/risk/evaluate`

```json
{
  "action_id": "act_...",
  "capability": "SEND_ASSET",
  "amount": "500",
  "asset": "USDC",
  "chain": "polygon",
  "recipient_ref": "contact_jane"
}
```

Response:

```json
{
  "risk_class": "R3",
  "reason_codes": ["VALUE_TRANSFER", "EXTERNAL_COUNTERPARTY"],
  "required_controls": ["TRUST_PROTOCOL", "REV", "HOLDER_AUTHENTICATION"]
}
```

### 17.4 REV Evaluation

`POST /runtime/rev/evaluate`

```json
{
  "action_id": "act_...",
  "authority_evidence_ref": "auth_...",
  "risk_evidence_ref": "risk_...",
  "trust_evidence_ref": "trust_...",
  "policy_version": "..."
}
```

Response:

```json
{
  "decision": "PASS",
  "reason_codes": ["AUTHORITY_VALID", "DEVICE_TRUSTED", "POLICY_SATISFIED"],
  "decision_ref": "rev_..."
}
```

### 17.5 Presentation Request

`POST /runtime/presentation/create`

```json
{
  "action_id": "act_...",
  "surface": "phone",
  "privacy_mode": "CONCEALED",
  "material_fields_ref": "review_payload_..."
}
```

Response:

```json
{
  "presentation_id": "present_...",
  "state": "CONCEALED",
  "reveal_allowed": true,
  "approval_allowed": false
}
```

Approval becomes available only after the required review state has been reached.

### 17.6 Signing Request

`POST /runtime/signing/request`

The signing service must accept a validated, immutable execution payload plus evidence references, not conversational text.

```json
{
  "action_id": "act_...",
  "payload_hash": "...",
  "rev_decision_ref": "rev_...",
  "authority_evidence_ref": "auth_...",
  "authentication_ref": "aevt_...",
  "execution_target": "polygon"
}
```

Response:

```json
{
  "signing_result": "SIGNED",
  "signed_payload_ref": "signed_...",
  "signature_verification": "PASS"
}
```

## 18. Error Contract

Control-plane services should return structured failure objects.

```json
{
  "status": "BLOCKED",
  "reason_code": "REV_FAIL_DEVICE_SCOPE",
  "retryable": false,
  "holder_action_required": true,
  "safe_message_key": "rev.device_scope_failed"
}
```

The UI and SERA generate holder-facing language from safe reason codes rather than exposing raw infrastructure errors.

## 19. Degraded-Mode Rules

If a required control service is unavailable:

- Trust Protocol unavailable: block actions requiring Trust Protocol.
- REV unavailable: block actions requiring REV.
- signer unavailable: do not fall back to AI or software-only signing unless separately authorized architecture supports it.
- RPC unavailable: preserve signed state and reconcile safely.
- external news / LinkedIn API unavailable: continue wallet operation without enrichment.
- voice model unavailable: fall back to typed or constrained input.
- wearable disconnected: hand off to phone or defer.

Loss of convenience must not silently reduce security assurance.

## 20. Observability Requirements

Every runtime transition should emit structured telemetry separate from sensitive evidence.

Metrics should include:

- action latency by state;
- clarification rate;
- authority rejection rate;
- REV rejection rate;
- authentication failure rate;
- signer failure rate;
- RPC/provider failure rate;
- reconciliation duration;
- wearable handoff rate;
- concealed-detail reveal rate;
- holder cancellation rate;
- duplicate/retry suppression events.

Operational telemetry must not contain private keys, seed phrases, biometric material, full credential claims, or unnecessary personal data.

## 21. Acceptance Criteria

DB14 is satisfied when engineering can demonstrate that:

1. every consequential action maps to the canonical state machine;
2. each service boundary has a typed contract;
3. no model-generated text can directly reach the signing boundary;
4. authority, risk, Trust Protocol, and REV are separately observable controls;
5. hidden-detail review and approval remain distinct states;
6. wearable flows are explicitly scoped and hand off safely;
7. delegated automation is re-evaluated on every run;
8. WalletConnect is treated as untrusted external input;
9. ambiguous voice input cannot move value;
10. uncertain submissions do not cause blind retries;
11. execution requests are idempotent where possible;
12. every material transition produces reconstructable evidence.

## 22. Controlled Design Decisions

**DB14-D01**  
All material runtime actions SHALL use a shared explicit state machine.

**DB14-D02**  
SERA SHALL coordinate runtime services but SHALL NOT be the authorization or signing boundary.

**DB14-D03**  
Concealed-detail reveal and approval SHALL be separate state transitions.

**DB14-D04**  
Wearable-originated actions SHALL be evaluated against wearable-specific authority scope.

**DB14-D05**  
Cross-device handoff SHALL preserve one action lineage rather than duplicate execution sessions.

**DB14-D06**  
REV failure SHALL terminate the execution path unless control inputs materially change and a fresh evaluation is performed.

**DB14-D07**  
Uncertain submission SHALL enter reconciliation rather than automatic resubmission.

**DB14-D08**  
Delegated automation SHALL be independently re-evaluated on every execution attempt.

**DB14-D09**  
WalletConnect and other externally supplied requests SHALL be treated as untrusted input.

**DB14-D10**  
Ambiguous recipient, amount, asset, or chain intent SHALL be resolved before authorization.

**DB14-D11**  
Signing APIs SHALL consume immutable validated payloads and evidence references, never conversational instructions.

**DB14-D12**  
Loss of a control service SHALL fail closed for actions requiring that control.

## 23. Relationship to Prior Documents

DB14 operationalizes:

- DB05 Privacy, Trust, Authority & Risk Boundaries;
- DB06 User Journeys & Cross-Device Flows;
- DB07 Intent, Capability, Tool & Execution Contracts;
- DB08 Memory & Context Broker Architecture;
- DB09 Proactive Intelligence Architecture;
- DB10 Delegated Authority & Bounded Autonomy;
- DB11 Execution Evidence & Explainability;
- DB11A Concealed Detail Presentation Control;
- DB12 Resilience & Degraded Modes;
- DB13 Runtime Orchestration & Control Plane Architecture.

## 24. Next Logical Work

The next design artifact should define the service topology, deployment boundaries, persistence stores, event buses, device-resident components, cloud components, and trust-zone separation needed to implement the runtime model.

Recommended next document:

**SSW-SERA-DB15: Logical Service Topology, Trust Zones, Data Stores & Deployment Boundary Architecture**
