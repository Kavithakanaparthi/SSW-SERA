# SSW-SERA-DB10: Delegated Authority, Automation & Bounded Autonomy Architecture

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-SERA-DB10  
**Status:** Exploratory Design Baseline  
**Date:** 2026-09-17  
**Owner:** Soulverse  
**Repository:** `Kavithakanaparthi/SSW-SERA`

## 1. Purpose

This document defines how SERA may perform actions on behalf of a holder without requiring a fresh approval for every individual step. It establishes a bounded-autonomy model in which authority is explicit, scoped, revocable, inspectable, time-limited, device-aware, risk-aware, and enforced outside the language model.

The governing principle is:

> **SERA may automate only what the holder has explicitly authorized, within deterministic limits that SERA cannot expand for herself.**

Autonomy is therefore not a property of the AI model. It is a property of a holder-issued authority object evaluated by policy, Trust Protocol, REV, device trust, capability controls, and execution safeguards.

## 2. Design Goals

The architecture shall:

1. support recurring, scheduled, threshold-based, event-driven, and conditional actions;
2. allow holders to delegate limited authority without surrendering control of the wallet;
3. separate recommendation, preparation, approval, signing, and execution;
4. prevent SERA or any model from enlarging its own authority;
5. make every autonomous act reconstructable from evidence;
6. support immediate pause, revocation, and emergency kill mechanisms;
7. support cross-device and future wearable surfaces without automatically inheriting full phone authority;
8. preserve holder inspectability before, during, and after automation;
9. fail safely when context, network, trust, device, or policy state is ambiguous;
10. provide a deterministic bridge from natural-language intent to machine-enforceable authority.

## 3. Autonomy Is a Control-Plane Function

The architectural separation is:

```text
Holder Intent
    ↓
SERA Interpretation / Recommendation
    ↓
Automation Proposal
    ↓
Holder Approval
    ↓
Delegated Authority Object
    ↓
Policy + Trust Protocol + REV + Device Rules
    ↓
Execution Engine / Signing Boundary
    ↓
External Network / Service
    ↓
Evidence / Receipt / Monitoring
```

SERA can create and explain an automation proposal, but only deterministic control-plane components can determine whether an action is authorized at execution time.

## 4. Authority Classes

The autonomy model extends the DB05 authority model with execution behavior.

| Class | Name | Description | Example |
|---|---|---|---|
| A0 | Observe | No action authority | Monitor USDC balance |
| A1 | Recommend | SERA may suggest an action | Recommend lower-cost chain |
| A2 | Prepare | SERA may construct unsigned action | Prepare swap route |
| A3 | Approve-per-action | Holder must approve each consequential action | Send $500 USDC |
| A4 | Bounded delegation | SERA may execute within explicit mandate | Pay approved vendor up to $200/month |
| A5 | Conditional bounded autonomy | SERA may execute when explicit conditions are satisfied | Rebalance if allocation deviates >5%, capped at $1,000 |

No automation may silently elevate from A0-A4 to A5.

## 5. Delegated Authority Object

Every autonomous or semi-autonomous action shall be backed by a signed, machine-readable mandate.

### 5.1 Core fields

```json
{
  "mandate_id": "uuid",
  "holder_did": "did:soul:holder",
  "agent_did": "did:soul:agent",
  "capability": "payment.send",
  "authority_class": "A4",
  "allowed_actions": ["prepare", "execute"],
  "asset_scope": ["USDC"],
  "chain_scope": ["polygon", "ethereum"],
  "counterparty_scope": ["did:soul:vendor"],
  "amount_limit_per_action": "200.00",
  "amount_limit_period": "1000.00",
  "period": "P1M",
  "valid_from": "2026-09-17T00:00:00Z",
  "valid_until": "2026-12-31T23:59:59Z",
  "device_scope": ["primary_phone"],
  "context_constraints": [],
  "risk_ceiling": "R3",
  "revocation_ref": "rev://...",
  "holder_signature": "..."
}
```

The final production schema may differ, but these semantics are mandatory.

## 6. Mandatory Constraint Dimensions

A delegation shall support one or more of the following limits:

- capability;
- asset;
- chain;
- counterparty;
- individual amount;
- cumulative amount;
- frequency;
- time window;
- date range;
- geographic or jurisdictional context where legally relevant;
- device class;
- device trust state;
- authentication recency;
- risk ceiling;
- transaction type;
- merchant category where applicable;
- credential type;
- disclosure scope;
- network fee ceiling;
- slippage ceiling;
- price deviation ceiling;
- data-source confidence requirement;
- required Trust Protocol state;
- required REV outcome;
- human reapproval triggers.

A mandate with missing critical bounds must be treated as narrower, not broader.

## 7. Automation Types

### 7.1 Scheduled

Example: "Pay the hosting invoice on the first business day of every month, up to $250."

### 7.2 Recurring

Example: recurring stablecoin payment to a previously approved counterparty.

### 7.3 Threshold-based

Example: "Alert me if gas fees fall below X; prepare the transaction, but do not execute."

### 7.4 Event-driven

Example: when an invoice matching an approved vendor and amount range is received, prepare or execute according to the mandate.

### 7.5 Conditional financial action

Example: rebalance only if a defined allocation deviates beyond a threshold and all transaction limits remain within mandate.

### 7.6 Credential automation

Example: present a specific low-sensitivity credential to a previously approved verifier under a defined disclosure policy.

### 7.7 Safety automation

Example: automatically block interaction with assets or contracts that cross a predefined spam/risk threshold. Blocking is different from disposing of assets and should normally require lower authority.

## 8. Natural Language to Mandate Compilation

A holder may express a delegation conversationally, but the system shall not store natural language alone as authority.

Example:

> "SERA, pay Acme's cloud bill each month as long as it is under $300."

SERA must compile that request into explicit fields, surface the constraints to the holder, resolve ambiguity, and request confirmation before the authority object becomes active.

The holder-facing confirmation should expose at minimum:

- who can act;
- what action can occur;
- which asset or credential is involved;
- permitted counterparties;
- amount and cumulative limits;
- network or chain scope;
- frequency;
- expiry;
- device scope;
- conditions that force reapproval;
- how to pause or revoke.

## 9. Execution-Time Revalidation

A valid mandate does not guarantee execution. Every action must be re-evaluated at execution time.

The evaluation sequence is:

```text
Mandate exists
    ↓
Mandate active and unexpired?
    ↓
Capability and tool permitted?
    ↓
Counterparty / asset / chain in scope?
    ↓
Amount and cumulative limits valid?
    ↓
Device state permitted?
    ↓
Context constraints satisfied?
    ↓
Trust Protocol evaluation
    ↓
REV pass/fail
    ↓
Execution-specific checks
    ↓
Signing policy
    ↓
Execute
    ↓
Evidence
```

Any failed gate terminates or escalates the action.

## 10. REV Placement

REV remains the final runtime decision gate before consequential execution.

REV shall evaluate, as applicable:

- identity;
- authority;
- delegation validity;
- mandate status;
- device trust;
- policy;
- Trust Protocol signals;
- AURION signals when relevant;
- risk state;
- counterparty state;
- transaction context;
- emergency lock state;
- revocation state.

SERA may never override a REV fail outcome.

## 11. Trust Protocol Inputs

The Trust Protocol may contribute evaluation of:

- holder identity confidence;
- SVID4AI agent identity;
- delegation authenticity;
- permitted authority scope;
- counterparty identity;
- transaction policy;
- device trust;
- historical behavior when allowed;
- spam/risk intelligence;
- network or contract trust signals.

Trust is an input to authorization, not a replacement for explicit delegation.

## 12. Spend and Exposure Controls

Every financial mandate capable of execution should support both per-action and aggregate controls.

Examples:

- max $200 per payment;
- max $1,000 per month;
- max 3 executions per day;
- max 0.5 ETH total exposure;
- gas fee cap;
- price impact cap;
- slippage cap;
- no bridge transactions without fresh approval;
- no transactions to new counterparties without fresh approval.

Aggregate limits must account for already pending actions to prevent concurrency from bypassing ceilings.

## 13. Counterparty Controls

Counterparties should be classified as:

- explicitly approved;
- previously verified;
- known but not approved for autonomous action;
- new;
- flagged;
- blocked.

A mandate may reference a Soul ID, DID, verified account, merchant identity, contract address, or another deterministic identifier. Friendly names alone are insufficient for execution authority.

## 14. Chain Selection Under Delegation

SERA may optimize chain selection only within the mandate's chain scope and policy constraints.

If the mandate allows multiple chains, SERA may compare:

- supported asset availability;
- recipient compatibility;
- fees;
- confirmation expectations;
- network health;
- bridge requirement;
- contract risk;
- holder preference;
- historical success;
- policy restrictions.

If the optimal route requires a chain or bridge outside the mandate, the system must request fresh approval.

## 15. Automation and Voice

Voice may create, modify, pause, or revoke an automation only after high-confidence intent resolution and appropriate authentication.

Voice must receive stricter handling for:

- numbers;
- counterparty names;
- negation;
- expiry dates;
- frequencies;
- chain names;
- token symbols;
- words such as "only," "except," "until," "never," and "maximum."

A phrase such as "up to fifty" must never be interpreted as "up to fifteen" without clarification when the difference changes authority.

## 16. Wearable Authority

Wearables are a Phase 2 execution surface and a Phase 1 architectural constraint.

A paired wearable shall not automatically inherit phone mandates.

Wearable authority must be explicitly scoped by:

- device identity;
- device trust state;
- capability;
- risk ceiling;
- action amount;
- authentication state;
- proximity or continuity state where applicable.

Examples:

- wearable may acknowledge an informational alert;
- wearable may approve a low-value prepared payment;
- wearable may display a credential;
- wearable may not create or expand a recurring mandate unless policy explicitly permits it;
- high-risk actions may require phone or stronger authentication even when initiated on watch.

## 17. Cross-Device Continuation

An automation may be initiated, inspected, approved, or paused from different devices, but authority must remain bound to the canonical mandate state.

The system should support secure handoff:

```text
Watch alert
    ↓
Holder taps "Review"
    ↓
Phone opens exact mandate/action state
    ↓
Holder inspects details
    ↓
Approve / modify / revoke
```

No device may rely on stale cached authority for consequential execution.

## 18. Modification Rules

Mandate changes shall be classified as:

### 18.1 Narrowing change

Examples:

- reduce amount limit;
- shorten expiry;
- remove a chain;
- remove a counterparty;
- lower frequency.

These may be allowed through a simplified control path where policy permits.

### 18.2 Expanding change

Examples:

- increase amount limit;
- extend expiry;
- add a counterparty;
- add a chain;
- increase authority class;
- permit autonomous execution where only preparation was allowed.

These require fresh explicit holder approval and appropriate authentication.

SERA must never auto-accept an expanding change.

## 19. Pause, Revoke, and Kill Controls

Every mandate must support:

- pause;
- resume;
- revoke;
- expire;
- emergency global disable.

Emergency controls should support at least:

- stop all autonomous executions;
- stop specific capabilities;
- stop specific devices;
- stop specific counterparties;
- stop specific assets/chains;
- revoke all active SERA delegations;
- lock the wallet execution plane.

A revoked mandate must be unusable even if a device or SERA instance holds a stale copy.

## 20. Failure and Degraded Modes

Autonomous execution must fail closed when any of the following cannot be reliably determined:

- mandate status;
- REV state;
- device trust;
- cumulative spend state;
- counterparty resolution;
- asset/chain resolution;
- required risk signal;
- transaction finality prerequisites;
- signing policy.

Where safe, the system may degrade from execute to prepare, or from prepare to notify.

Example:

```text
A5 autonomous execution unavailable
    ↓
Downgrade to A2 prepare-only
    ↓
Notify holder for explicit approval
```

## 21. Evidence Requirements

Each autonomous action shall produce an evidence record containing at minimum:

- action ID;
- mandate ID;
- holder identity reference;
- SVID4AI identity reference;
- device reference;
- capability and tool;
- interpreted intent or trigger;
- relevant constraints;
- risk classification;
- Trust Protocol result/reference;
- REV result/reference;
- authorization mode;
- transaction or external-service request;
- execution result;
- timestamp;
- receipt or network reference;
- post-execution status.

The evidence chain must make it possible to answer:

> Why did SERA perform this action, under whose authority, within what limits, on what device, and what exactly happened?

## 22. Holder Inspectability

The holder should be able to ask:

- "What are you allowed to do for me?"
- "Show all active automations."
- "Which ones can move money?"
- "Which ones expire this month?"
- "What did you do automatically this week?"
- "Why did you make that payment?"
- "Pause all autonomous actions."

The UI shall provide equivalent inspectable views. Conversational access must complement, not replace, deterministic controls.

## 23. Proactive Intelligence and Automation

DB09 signals may trigger evaluation of an automation, but intelligence alone does not authorize execution.

Example:

```text
News / chain / market signal
    ↓
DB09 signal normalization and confidence
    ↓
Matches active mandate condition?
    ↓
DB10 mandate constraints
    ↓
Trust Protocol + REV
    ↓
Execute OR prepare OR notify
```

A news story, social post, LinkedIn signal, or model-generated conclusion must never directly move assets.

## 24. Spam Token Automation

Spam filtering may support automated suppression, warning, quarantine, or interaction blocking under low-risk policy.

However, autonomous transfer, burn, sale, or contract interaction involving a flagged token should require a higher authority path because the remediation itself can create financial or security exposure.

## 25. External Services and APIs

Automations may eventually invoke merchant APIs, banking APIs, travel systems, AP2/AP3-style commerce protocols, or other external services.

The same mandate principles apply:

- explicit capability;
- deterministic parameters;
- scoped credentials;
- bounded financial authority;
- counterparty/service identity;
- audit evidence;
- revocation;
- error handling;
- no hidden expansion of authority by a third-party API.

## 26. SVID4AI Role

SVID4AI should identify the SERA agent instance and express its delegated relationship to the holder.

A transaction or external action should be able to establish:

- which agent acted;
- which holder/operator authorized the agent;
- what authority was delegated;
- whether the delegation remained valid at execution time;
- whether the action fell within policy.

## 27. Signing Boundary

SERA shall not directly possess unrestricted signing keys.

The preferred model is:

```text
SERA proposal / mandate trigger
    ↓
Deterministic authorization engine
    ↓
REV pass
    ↓
Signing request with exact transaction payload
    ↓
Secure wallet signing component
    ↓
Broadcast / external execution
```

The signer receives an exact approved action, not a free-form model instruction.

## 28. Concurrency and Replay Protection

The control plane must prevent:

- duplicate execution;
- replay of old mandates;
- stale approvals;
- double-spend against cumulative limits;
- race conditions between devices;
- repeated trigger execution for one event.

Every mandate action should use idempotency keys or equivalent deterministic execution identifiers.

## 29. Audit and Review Modes

The holder should be able to switch any automation into:

- active;
- paused;
- prepare-only;
- notify-only;
- expired;
- revoked.

A global "Autonomy Off" state should immediately prevent A4/A5 execution while preserving visibility and evidence.

## 30. Example: Bounded Vendor Payment

Holder request:

> "Pay Acme's monthly cloud invoice automatically if it is under $300. Use the cheapest supported chain, but never bridge funds."

Compiled mandate:

- capability: payment.send;
- counterparty: verified Acme identity;
- asset: approved stablecoin;
- amount per action: <= $300;
- frequency: max once per billing period;
- allowed chains: chains where both parties already hold compatible asset;
- bridge: prohibited;
- expiry: defined;
- execution: A4 bounded delegation;
- REV: mandatory;
- evidence: mandatory.

If the invoice is $325, SERA may notify or prepare but may not autonomously execute.

## 31. Example: Portfolio Rebalancing

Holder request:

> "If my stablecoin allocation falls below 20%, rebalance it back to 25%, but never move more than $1,000 without asking me."

Because this is market-sensitive and potentially complex, the initial production policy may classify it as prepare-only or require a higher assurance class even if A5 architecture supports execution later.

The architectural point is that the authority object must encode:

- target allocation;
- trigger threshold;
- max movement;
- approved assets;
- approved venues/chains;
- slippage;
- price confidence;
- timing;
- risk ceiling;
- expiry;
- reapproval triggers.

## 32. Production Safety Requirements

Before A4/A5 autonomous execution is enabled in production, the program must have:

1. deterministic mandate schema;
2. secure mandate issuance and revocation;
3. cumulative limit enforcement;
4. exact capability/tool allowlists;
5. Trust Protocol binding;
6. REV binding;
7. device trust model;
8. secure signing isolation;
9. replay/idempotency controls;
10. auditable evidence;
11. emergency global kill control;
12. adversarial testing;
13. ambiguity and voice-number safety testing;
14. cross-device synchronization testing;
15. degraded-mode behavior;
16. clear holder-facing authority views.

## 33. Controlled Design Decisions

**DB10-D01.** Autonomy is represented as explicit delegated authority, not as an AI-model privilege.  
**DB10-D02.** SERA may never enlarge her own mandate.  
**DB10-D03.** Every autonomous consequential action requires execution-time policy evaluation and REV.  
**DB10-D04.** Financial delegations require per-action and aggregate exposure controls.  
**DB10-D05.** Natural-language delegation must be compiled into deterministic machine-readable constraints.  
**DB10-D06.** Expanding a mandate requires fresh explicit holder approval.  
**DB10-D07.** Wearables receive separate scoped authority and do not inherit full phone authority.  
**DB10-D08.** Autonomous actions fail closed when authority, trust, risk, or cumulative-state data are unavailable.  
**DB10-D09.** SERA remains outside the unrestricted signing boundary.  
**DB10-D10.** Every autonomous action must generate reconstructable evidence.  
**DB10-D11.** Proactive intelligence may trigger evaluation but never creates execution authority.  
**DB10-D12.** Holders must have immediate pause, revoke, and global autonomy-off controls.

## 34. Open Questions for Later Freeze

The following remain intentionally open for architecture freeze or implementation design:

- exact mandate serialization format;
- whether mandates are represented as VCs, signed policy objects, capabilities, or a hybrid;
- Trust Protocol scoring thresholds for A4/A5;
- REV evidence schema;
- device attestation requirements;
- wearable maximum transaction thresholds;
- offline mandate behavior;
- whether selected automations require periodic re-consent;
- whether regulated actions require jurisdiction-specific constraints;
- recovery behavior after device loss;
- safe migration of mandates when wallet keys rotate;
- external agent-to-agent delegation profiles.

## 35. Relationship to Prior Artifacts

DB10 depends on and extends:

- DB01 AI-First Wallet Drawing Board;
- DB02 Existing Wallet Capability Inventory;
- DB03 AI-First Experience Concepts;
- DB04 Advanced Technical Capability & Feasibility Radar;
- DB04A Wearables Phase 2 Foundation Considerations;
- DB05 Privacy, Trust, Authority & Risk Boundary Design;
- DB06 End-to-End User Journeys;
- DB07 Intent, Capability, Tool & Execution Contract Design;
- DB08 Memory, Context Broker & Personalization Architecture;
- DB09 Proactive Intelligence, Monitoring & Notification Architecture;
- SSW-AI-VOICE-01 Holder Voice Adaptation, Understanding & Command Safety Architecture.

## 36. Recommended Next Artifact

The next design-board artifact should be:

**SSW-SERA-DB11: Execution Evidence, Auditability, Receipts & Explainability Architecture**

DB11 should define the evidence graph that links holder intent, SERA interpretation, mandate, policy evaluation, Trust Protocol, REV decision, signing request, external execution, receipt, and post-execution state into a reconstructable record suitable for holder review, security operations, dispute handling, and future regulated use cases.
