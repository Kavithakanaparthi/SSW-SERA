

---

## SOURCE 11
**Path:** `docs/design/SSW-SERA-DB10-Delegated-Authority-Automation-and-Bounded-Autonomy-Architecture.md`  
**Blob SHA:** `78cb8ae9a5694a6da9b17892c09a7a7b46ddfd15`

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


---

## SOURCE 12
**Path:** `docs/design/SSW-SERA-DB11-Execution-Evidence-Auditability-Receipts-and-Explainability-Architecture.md`  
**Blob SHA:** `e233470c217cb3d039674f03357bf7a534e825b7`

# SSW-SERA-DB11: Execution Evidence, Auditability, Receipts & Explainability Architecture

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB11  
**Status:** Controlled Design Board / Pre-Architecture  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA  

## 1. Purpose

This document defines how every material SERA-assisted or SERA-initiated action can be reconstructed after the fact without exposing private key material, hidden model internals, or unnecessary personal data.

The objective is to create a deterministic evidence chain connecting holder intent, SERA interpretation, authority, context, policy evaluation, Trust Protocol, REV, authentication, signing, execution, external-system acknowledgement, and post-execution state.

The governing principle is:

> Every consequential action must leave enough evidence to explain what was requested, what SERA understood, what authority existed, what controls evaluated it, what was signed, what happened, and what changed.

This is not merely an activity log. It is an execution evidence architecture.

## 2. Scope

DB11 covers:

- evidence generation for holder-initiated and autonomous actions;
- decision reconstruction;
- user-facing receipts;
- machine-verifiable receipts;
- Trust Protocol and REV evidence;
- signing evidence without exposing keys;
- cross-device and wearable evidence;
- voice-originated intent evidence;
- multi-chain transaction evidence;
- credential presentation evidence;
- delegated authority evidence;
- external intelligence provenance where it influenced an action;
- privacy-preserving retention;
- dispute and incident reconstruction;
- explainability boundaries.

DB11 does not define the cryptographic key-management architecture itself. It defines the evidence emitted around that architecture.

## 3. Evidence Is a First-Class Product Capability

In a conventional wallet, a blockchain transaction hash often acts as the final proof of action. In an AI-first wallet, that is insufficient.

A transaction hash may prove that an on-chain action occurred, but it does not answer:

- what the holder originally asked;
- whether the request was spoken or typed;
- what SERA inferred;
- what recipient SERA resolved;
- which chain SERA selected and why;
- whether a mandate authorized the action;
- what Trust Protocol inputs were considered;
- whether REV passed or failed;
- which device approved or initiated the action;
- whether a wearable was involved;
- whether an external API or data source influenced the recommendation;
- what confirmation the holder actually saw;
- what changed after execution.

Therefore, SSW-SERA must create an execution evidence record before, during, and after every material action.

## 4. Evidence Graph

The canonical evidence graph is:

```text
Holder / Trigger
      |
      v
Intent Capture
      |
      v
Interpretation Record
      |
      v
Resolved Entities + Context
      |
      v
Authority / Mandate Evidence
      |
      v
Risk Classification
      |
      v
Trust Protocol Evaluation
      |
      v
REV Decision
      |
      v
Authentication Evidence
      |
      v
Signing Request + Signing Evidence
      |
      v
Execution Request
      |
      v
Network / Provider / Counterparty Result
      |
      v
Post-Execution State
      |
      v
Receipt + Evidence Bundle
```

Each node receives a unique evidence identifier and links to the preceding evidence node rather than duplicating all prior content.

## 5. Core Evidence Objects

### 5.1 Intent Evidence Object

Captures what initiated the action.

Minimum fields:

```json
{
  "intent_evidence_id": "ie_...",
  "session_id": "...",
  "holder_id_ref": "did:soul:...",
  "origin": "voice|text|tap|automation|wearable|external_event",
  "device_id_ref": "...",
  "timestamp": "...",
  "raw_input_ref": "optional-protected-reference",
  "normalized_intent": "SEND",
  "intent_confidence": 0.98,
  "holder_confirmation_required": true
}
```

Raw voice audio should not be retained by default. When voice is used, the evidence object should normally retain the transcript, confidence envelope, correction events, and cryptographic hashes or protected references rather than raw audio.

### 5.2 Interpretation Evidence Object

Captures what SERA believed the holder meant.

Example:

```json
{
  "interpretation_id": "int_...",
  "intent_evidence_id": "ie_...",
  "action": "send_asset",
  "asset": "USDC",
  "amount": "500",
  "recipient_resolved_ref": "contact_...",
  "candidate_chains": ["polygon", "ethereum"],
  "selected_chain": "polygon",
  "ambiguities": [],
  "reason_codes": [
    "RECIPIENT_COMPATIBLE",
    "LOWER_ESTIMATED_FEE",
    "HOLDER_PREVIOUSLY_USED_CHAIN"
  ]
}
```

This object records structured interpretation, not hidden model chain-of-thought.

### 5.3 Context Evidence Object

Records the specific context actually used in a material decision.

Possible inputs include:

- balances;
- token metadata;
- gas estimates;
- recent counterparty history;
- credential state;
- holder preferences;
- device trust status;
- network health;
- spam-token signals;
- external intelligence;
- mandate state.

The Context Broker should emit a context manifest listing only material inputs, their origin, timestamp, confidence, and retention class.

### 5.4 Authority Evidence Object

Records why SERA was allowed to proceed.

```json
{
  "authority_evidence_id": "auth_...",
  "authority_class": "A2",
  "holder_direct_approval": true,
  "mandate_id": null,
  "device_scope": "phone",
  "capability": "SEND",
  "scope_check": "PASS"
}
```

For autonomous execution, the object must reference the exact mandate version and all applicable constraints.

### 5.5 Risk Evidence Object

Records action risk classification and the controls required because of it.

```json
{
  "risk_evidence_id": "risk_...",
  "risk_class": "R3",
  "risk_factors": [
    "VALUE_TRANSFER",
    "EXTERNAL_COUNTERPARTY"
  ],
  "required_controls": [
    "REV_PASS",
    "HOLDER_AUTHENTICATION"
  ]
}
```

### 5.6 Trust Protocol Evidence Object

Trust Protocol should return both its machine decision and sufficient structured inputs to support later reconstruction.

Evidence may include:

- identity state;
- authority state;
- delegation state;
- policy state;
- trust score where relevant;
- trust-policy version;
- input timestamps;
- decision timestamp.

The evidence object should not expose hidden proprietary scoring internals unless explicitly needed for governance or internal audit.

### 5.7 REV Decision Evidence Object

REV is the final runtime control gate.

```json
{
  "rev_evidence_id": "rev_...",
  "request_id": "...",
  "decision": "PASS|FAIL",
  "policy_version": "...",
  "reason_codes": ["AUTHORITY_VALID", "DEVICE_TRUSTED"],
  "decision_timestamp": "...",
  "decision_signature_ref": "..."
}
```

A failed REV decision is itself an important evidence event and must be retained according to incident/audit policy.

## 6. Authentication Evidence

Authentication evidence records that the required holder authentication occurred without storing biometric templates or secret factors.

Possible evidence:

- platform biometric success;
- passcode fallback success;
- hardware-backed key assertion;
- FIDO assertion;
- wearable presence confirmation where allowed;
- trusted-device state.

Example:

```json
{
  "authentication_id": "aevt_...",
  "method": "platform_biometric",
  "device_id_ref": "device_...",
  "result": "PASS",
  "timestamp": "...",
  "assurance_level": "high"
}
```

The actual biometric sample is never part of the execution evidence bundle.

## 7. Signing Evidence

Signing must remain isolated from SERA.

The signing evidence object records:

- signing request hash;
- payload hash;
- signer key identifier or public-key reference;
- secure hardware / keystore class where available;
- signing device;
- signature verification result;
- timestamp;
- relevant policy/authorization references.

It must never contain:

- private keys;
- seed phrases;
- recovery secrets;
- unencrypted raw key material.

## 8. Execution Evidence

Execution evidence records the actual call to the destination rail.

For blockchain transactions:

- chain;
- chain ID;
- sender address reference;
- recipient address;
- asset;
- amount;
- fee estimate;
- signed transaction hash;
- transaction hash;
- block number when known;
- confirmation state;
- execution status.

For off-chain APIs:

- provider;
- operation;
- request ID;
- response ID;
- status;
- timestamps;
- canonical receipt/proof reference.

For credential presentation:

- verifier;
- requested claims;
- disclosed claims or proof type;
- presentation format;
- holder approval record;
- verifier acknowledgement.

## 9. Post-Execution State Evidence

The system should capture relevant state after execution.

Examples:

- updated balance;
- credential status;
- mandate usage counter;
- changed allowance;
- revoked session;
- counterparty interaction state;
- notification closure;
- automation next-run state.

This prevents the evidence chain from ending at “request submitted.”

## 10. User-Facing Receipts

The holder should receive a concise receipt, not a forensic dump.

A user receipt may show:

- what happened;
- amount / asset;
- recipient;
- network;
- fee;
- approval method;
- whether SERA acted under direct approval or a mandate;
- transaction / provider reference;
- final status;
- “Why this happened” summary;
- “Show evidence” affordance.

Example:

```text
Sent 500 USDC to Jane
Network: Polygon
Fee: $0.03
Approved by you on this iPhone
REV: Passed
Transaction: Confirmed
```

For autonomous execution:

```text
Paid Acme Hosting $42.00
Authority: Monthly hosting mandate
Mandate limit: $50/month
This payment used $42.00 of the September allowance
REV: Passed
```

## 11. Explainability Without Exposing Hidden Reasoning

SERA should explain material decisions through reason codes and user-facing rationale rather than exposing internal chain-of-thought.

Examples:

- “Polygon was selected because Jane can receive USDC there and the estimated fee was lower than Ethereum.”
- “I did not execute the transaction because the recipient did not match the mandate.”
- “I asked for confirmation because the amount exceeded your wearable approval limit.”

A useful explainability model is:

```text
Decision
  +
Material facts considered
  +
Applicable rules / mandate
  +
Reason codes
  +
Outcome
```

## 12. Evidence Integrity

Evidence objects should be tamper-evident.

Recommended design properties:

- immutable event IDs;
- canonical serialization;
- object hashes;
- hash chaining between related evidence objects;
- signed critical control decisions;
- secure timestamps;
- append-only audit storage for high-value actions;
- integrity verification tooling.

An evidence bundle may be represented by a Merkle root or equivalent integrity structure so that selective disclosure is possible without exposing the full private record.

## 13. Privacy-Preserving Evidence

Auditability must not become surveillance.

Evidence should follow four rules:

1. **Data minimization:** retain only what is needed for reconstruction.
2. **Reference sensitive data:** use protected references rather than repeating sensitive values.
3. **Separate holder-visible and internal evidence:** not all operational evidence should appear in normal UI.
4. **Selective disclosure:** where a regulator, merchant, issuer or counterparty needs proof, disclose only the relevant evidence subset.

Sensitive evidence may require different retention and encryption policies.

## 14. Evidence Retention Classes

Suggested classes:

| Class | Example | Retention |
|---|---|---|
| E0 | ephemeral reasoning context | session only |
| E1 | low-risk interaction evidence | short-term |
| E2 | holder preference changes | until replaced/deleted |
| E3 | credential presentation | policy-defined |
| E4 | financial execution | long-term / compliance-defined |
| E5 | security incident / disputed execution | extended / legal hold capable |

Exact periods should be jurisdiction and product-policy specific rather than hard-coded globally.

## 15. Voice Evidence

For voice-originated actions, retain structured safety evidence:

- transcript used for interpretation;
- speech confidence;
- holder adaptation confidence;
- numeric confidence;
- recipient/entity confidence;
- correction events;
- ambiguity prompts;
- final confirmed values.

Raw audio should not be the default audit artifact.

If the holder corrects:

> “No, fifty dollars, not fifteen.”

The evidence chain must record the corrected value as authoritative and the earlier value as superseded.

## 16. Wearable Evidence

Wearable actions need distinct evidence because the approval surface is constrained.

Record:

- wearable device ID;
- paired phone / wallet relationship;
- device trust state;
- wearable authority scope;
- content actually shown on the wearable;
- holder approval gesture / biometric state where available;
- handoff to phone where required;
- final execution device.

A watch approval must never be recorded as equivalent to a phone approval unless policy explicitly grants that assurance level.

## 17. Cross-Device Evidence

A task may begin on one device and finish on another.

Example:

```text
Voice on watch
  -> SERA interprets request
  -> action exceeds wearable limit
  -> phone receives handoff
  -> holder reviews transaction
  -> phone biometric approval
  -> secure signer signs
  -> execution completes
```

The evidence graph must preserve the complete lineage rather than treating each device interaction as a separate unrelated session.

## 18. Multi-Chain Evidence

If SERA selects a blockchain network, evidence should record both the selected route and material alternatives considered.

Example reason codes:

- `RECIPIENT_SUPPORTS_CHAIN`
- `SUFFICIENT_BALANCE`
- `LOWER_NETWORK_FEE`
- `FASTER_EXPECTED_SETTLEMENT`
- `NO_BRIDGE_REQUIRED`
- `HOLDER_CHAIN_PREFERENCE`
- `POLICY_DISALLOWS_CHAIN`

The objective is not to store every internal computation, but to preserve enough facts to explain the route decision.

## 19. Spam Token Evidence

If spam-token filtering affects an action, retain:

- token identifier;
- spam/risk signal source;
- signal confidence;
- classification timestamp;
- policy consequence;
- whether the holder overrode a warning.

A later reclassification should not rewrite historical evidence. It should create a new evidence event.

## 20. External Intelligence Evidence

If news, LinkedIn, market data or another external source influences a recommendation or risk assessment, the evidence record should retain:

- provider;
- source identifier;
- retrieval timestamp;
- confidence or trust rating;
- material fact extracted;
- whether the source was advisory or control-relevant.

External intelligence should normally influence recommendation and risk awareness, not independently authorize execution.

## 21. Delegated Authority Evidence

For autonomous action, evidence must include:

- mandate ID and version;
- issuer / holder;
- capability granted;
- amount limits;
- cumulative usage;
- asset scope;
- chain scope;
- counterparty scope;
- time scope;
- device scope;
- condition that triggered execution;
- mandate status at execution time;
- resulting mandate usage state.

The evidence bundle must make it possible to prove that SERA acted inside, not merely near, the mandate boundary.

## 22. Failed and Blocked Actions

Failures are evidence-bearing outcomes.

Examples:

- REV fail;
- expired mandate;
- biometric failure;
- insufficient gas;
- suspicious recipient;
- spam token;
- unavailable chain;
- policy violation;
- tool error;
- provider rejection;
- network timeout.

Failure evidence should record reason codes and remediation guidance without leaking sensitive system internals.

## 23. Dispute Reconstruction

A disputed action should be reconstructable through an ordered timeline:

1. triggering event;
2. holder request or automation condition;
3. SERA interpretation;
4. entity resolution;
5. context inputs;
6. authority state;
7. risk class;
8. Trust Protocol output;
9. REV decision;
10. authentication;
11. signing request;
12. execution;
13. network/provider result;
14. receipt delivered;
15. post-execution state.

The system should support forensic export of this chain under appropriate authorization.

## 24. Evidence Access Model

Different actors require different evidence scopes.

### Holder
Can inspect actions, receipts, authority use and understandable reasons.

### Support / Operations
Can inspect operational metadata subject to privacy controls.

### Security / Incident Response
Can inspect detailed control and device evidence.

### Auditor / Regulator
May receive selectively disclosed evidence according to jurisdiction and legal basis.

### Counterparty / Verifier
Receives only transaction- or proof-specific evidence relevant to the interaction.

No actor should receive unrestricted access merely because the evidence exists.

## 25. Evidence API Model

Illustrative endpoints:

```text
GET /evidence/actions/{action_id}
GET /evidence/actions/{action_id}/timeline
GET /evidence/actions/{action_id}/receipt
GET /evidence/actions/{action_id}/reasons
GET /evidence/actions/{action_id}/integrity
POST /evidence/actions/{action_id}/export
```

Exports should support redaction and selective disclosure profiles.

## 26. Evidence Events

Illustrative event types:

```text
intent.captured
intent.corrected
interpretation.completed
context.materialized
authority.validated
risk.classified
trust.evaluated
rev.passed
rev.failed
authentication.passed
authentication.failed
signing.requested
signing.completed
execution.submitted
execution.confirmed
execution.failed
receipt.issued
mandate.usage.updated
alert.issued
handoff.started
handoff.completed
```

## 27. Controlled Explainability Vocabulary

Reason codes should be normalized and stable.

Examples:

```text
AUTHORITY_VALID
AUTHORITY_EXPIRED
MANDATE_LIMIT_EXCEEDED
DEVICE_NOT_ALLOWED
RECIPIENT_NOT_ALLOWED
ASSET_NOT_ALLOWED
CHAIN_NOT_ALLOWED
IDENTITY_VERIFIED
POLICY_PASS
POLICY_FAIL
REV_PASS
REV_FAIL
HOLDER_CONFIRMED
HOLDER_DECLINED
LOWER_ESTIMATED_FEE
RECIPIENT_CHAIN_COMPATIBLE
SPAM_SIGNAL_HIGH
VOICE_NUMERIC_CONFIDENCE_LOW
VOICE_ENTITY_CONFIDENCE_LOW
WEARABLE_LIMIT_EXCEEDED
```

Stable reason codes are critical for UX, testing, analytics and audit.

## 28. Production Acceptance Criteria

DB11 should be considered successfully implemented when:

- every R2+ material action produces an evidence graph;
- autonomous actions always reference a valid mandate version;
- Trust Protocol and REV decisions are reconstructable;
- signing evidence proves signing occurred without exposing secrets;
- voice-originated actions preserve confidence and correction evidence;
- wearable approvals retain device and scope lineage;
- cross-device flows remain one traceable action lineage;
- user-facing receipts are understandable without exposing internal model reasoning;
- critical evidence is integrity-protected;
- sensitive evidence follows retention and access policy;
- failed actions generate evidence as reliably as successful actions;
- the holder can inspect why a material action occurred;
- forensic export supports selective disclosure.

## 29. Controlled Design Decisions

**DB11-D01**  
Execution evidence is a first-class wallet capability, not a logging afterthought.

**DB11-D02**  
Every consequential action receives a linked evidence graph from intent through post-execution state.

**DB11-D03**  
Explainability is based on structured facts, rules and reason codes rather than disclosure of hidden model reasoning.

**DB11-D04**  
Private keys, seed phrases, raw biometric data and secret authentication factors never enter evidence records.

**DB11-D05**  
Raw voice audio is not retained by default for transaction evidence.

**DB11-D06**  
Trust Protocol and REV emit signed or integrity-protected machine-readable decision evidence.

**DB11-D07**  
Wearable and phone approvals are distinct assurance events unless policy explicitly equates them.

**DB11-D08**  
Cross-device actions maintain one continuous evidence lineage.

**DB11-D09**  
External intelligence that materially influences a decision retains source provenance.

**DB11-D10**  
Historical evidence is append-only. Later reclassification or correction creates a new event rather than rewriting history.

**DB11-D11**  
Holder-facing receipts remain concise while deeper evidence stays available through inspectability controls.

**DB11-D12**  
Selective disclosure is preferred over wholesale evidence export.

## 30. Relationship to Prior Design Board Documents

DB11 consumes and operationalizes:

- DB01: AI-first drawing board and capability exploration;
- DB02: existing wallet capability inventory;
- DB03: adaptive experience models;
- DB04: technical feasibility radar;
- DB04A: wearable Phase 2 foundations;
- DB05: privacy, trust, authority and risk boundaries;
- DB06: end-to-end user journeys;
- DB07: intent/capability/tool execution contracts;
- DB08: memory and Context Broker architecture;
- DB09: proactive intelligence architecture;
- DB10: delegated authority and bounded autonomy.

## 31. Next Logical Design Step

The next controlled artifact should define failure, recovery and continuity across the AI, wallet, chain, device and external-service layers:

**SSW-SERA-DB12: Resilience, Failure Recovery, Offline & Degraded-Mode Architecture**

That document should define what happens when SERA is unavailable, AI confidence is insufficient, the device is offline, a blockchain RPC fails, a tool provider is unavailable, a wearable is disconnected, a mandate service cannot be reached, Trust Protocol/REV is degraded, or an execution outcome is uncertain.


---

## SOURCE 13
**Path:** `docs/design/SSW-SERA-DB11A-Concealed-Detail-Alert-Approval-and-Transaction-Presentation-Control.md`  
**Blob SHA:** `43a0b3c456f4d3dd888cf093c87675be3b5d74cc`

# SSW-SERA-DB11A: Concealed Detail Alert, Approval & Transaction Presentation Control

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-SERA-DB11A  
**Status:** Controlled Design Addendum  
**Date:** 2026-09-17  
**Relationship:** Extends DB03, DB05, DB09, DB10, DB11 and informs DB12+

## 1. Purpose

Define a privacy-preserving presentation control that allows a holder to conceal sensitive transaction, alert, approval, credential and account details on-screen while still receiving the notification or action request. The holder may reveal details for that individual instance when desired.

This feature is a presentation and privacy control. It must not alter the underlying action, authority, policy evaluation, risk classification, approval object, transaction payload or execution evidence.

## 2. Design Principle

A holder may need to know that something requires attention without wanting the surrounding environment, lock screen, wearable display, nearby person, meeting room or shared device surface to reveal what the action concerns.

Therefore:

> Awareness may be visible while sensitive context remains concealed.

The wallet must preserve the holder's ability to inspect full details before approving consequential actions.

## 3. Core User Experience

A concealed alert may display only a minimal shell such as:

- "SERA needs your attention"
- "Approval requested"
- "Transaction requires review"
- "Security alert"
- "Credential action pending"

Sensitive fields remain hidden until the holder explicitly reveals them.

The reveal control is per instance. Revealing one alert or transaction must not automatically reveal subsequent alerts unless the holder has explicitly configured a broader presentation preference.

## 4. Covered Surfaces

The control should apply consistently across:

- in-app SERA conversations;
- transaction approval sheets;
- lock-screen notifications;
- notification center;
- Dynamic Island / Live Activities where applicable;
- Android notification surfaces and bubbles where applicable;
- widgets and glanceable surfaces;
- Apple Watch and Wear OS notifications, cards, complications, tiles and approval surfaces;
- transaction history preview rows;
- credential presentation requests;
- security and fraud alerts;
- proactive intelligence alerts;
- recurring or delegated-action approval requests.

## 5. Presentation States

### H0 — Fully Visible
Normal presentation according to wallet privacy settings.

### H1 — Sensitive Fields Concealed
The holder sees the action type and urgency but sensitive values are masked.

Examples of concealed fields include:

- asset and token name where revealing it is sensitive;
- amount;
- balance;
- recipient or counterparty;
- wallet address;
- chain or network when context could reveal activity;
- merchant;
- credential name or claim;
- organization identity;
- news item linked to a private holding;
- transaction memo;
- location-linked context;
- account identifiers.

### H2 — Minimal Attention Signal
Only the fact that an action or alert exists is shown.

Example: "Approval required."

### H3 — Hidden Until Authenticated
The existence of the event may be displayed generically, but details can only be revealed after device authentication or wallet authentication.

## 6. Reveal Behavior

Reveal must be intentional and scoped to the current object.

A reveal action may use:

- tap or press-and-hold;
- swipe-to-reveal where platform conventions permit;
- biometric authentication;
- device PIN/passcode fallback;
- wallet-specific authentication for higher-risk items.

A reveal event should not itself authorize the underlying action.

`REVEAL != APPROVE`

The holder must still separately approve or reject the transaction, credential disclosure, mandate or sensitive action.

## 7. Per-Instance Control

Every alert, approval request and transaction object should support presentation metadata such as:

```json
{
  "presentation_privacy": {
    "default_state": "concealed",
    "reveal_scope": "single_instance",
    "authentication_required": true,
    "auto_rehide_seconds": 30,
    "allow_wearable_reveal": false
  }
}
```

The exact schema is illustrative and should be finalized in the API/data specification stage.

## 8. Auto-Rehide

After reveal, sensitive information should automatically return to the concealed state when one or more of the following occurs:

- the user dismisses the object;
- the app moves to background;
- the screen locks;
- the wearable lowers or sleeps;
- a configurable timeout expires;
- the holder explicitly hides it again;
- the active device changes;
- privacy risk increases.

High-sensitivity objects should favor short reveal windows.

## 9. Global Preference and Per-Instance Override

The wallet may support holder preferences such as:

- Always show details
- Hide financial details by default
- Hide all sensitive details by default
- Hide details on lock screen only
- Hide details on wearables
- Hide details when device is not unlocked
- Hide details when screen sharing is detected where platform support exists

However, global preferences must not prevent the holder from revealing a specific item when authorized.

A future adaptive option may allow SERA to recommend concealment based on context, but SERA must not silently weaken a holder's privacy preference.

## 10. Risk-Aware Presentation

Presentation privacy can be stricter for higher-risk actions.

Examples:

| Action | Suggested default |
|---|---|
| General news alert | H0/H1 |
| Portfolio movement alert | H1 |
| Transaction approval | H1/H3 |
| New recipient payment | H3 |
| Credential disclosure | H1/H3 |
| Security incident | H2/H3 |
| Seed/private-key related recovery flow | No sensitive detail on external surfaces |

The actual policy remains holder-configurable within safe bounds.

## 11. Wearables

Wearables require especially conservative defaults because the display is exposed and glanceable.

Recommended Phase 2 behavior:

- default to H2 for sensitive financial and identity requests;
- reveal only after local wearer/device authentication where supported;
- avoid displaying full wallet addresses;
- avoid displaying complete credential claims;
- avoid exposing high-value balances by default;
- auto-rehide when wrist detection is lost or device locks;
- optionally force phone handoff for high-risk detail review.

A watch being paired with the wallet does not imply permission to reveal all wallet information.

## 12. Voice and Spoken Output

Concealment must also apply to SERA's spoken responses.

If the holder has enabled hidden-detail mode, SERA should not read sensitive details aloud unless explicitly asked and the applicable authentication/context policy permits it.

Example:

Instead of:

"You are about to send 5,000 USDC to Jane on Polygon."

SERA may say:

"I have a transaction ready for your review. Details are hidden."

The holder may then request: "Reveal the details."

## 13. Screenshot and Screen-Recording Considerations

Where platform APIs permit, high-sensitivity surfaces should use available secure-content protections to reduce accidental capture. Platform limitations must be respected.

The design should also avoid assuming that screenshots can always be prevented. Concealment remains useful even where platform-level capture blocking is unavailable.

## 14. Notification Privacy

Notifications must separate:

1. event existence;
2. event category;
3. sensitive content;
4. executable action.

The system may deliver the first two while withholding the third until reveal. Action buttons should be evaluated carefully so that an approval cannot occur without adequate inspection for the relevant risk level.

## 15. Approval Integrity

For consequential actions, hidden-detail presentation must never create blind approval.

Before final authorization, policy may require the holder to reveal and inspect a minimum set of canonical transaction fields, particularly for:

- amount;
- asset;
- recipient;
- network;
- fee;
- credential claims being disclosed;
- mandate limits;
- recurring authorization terms.

This can be expressed as `required_review_fields` in the action contract.

## 16. Evidence and Auditability

Evidence records should capture presentation-state events without unnecessarily storing displayed sensitive content twice.

Useful evidence events include:

- alert delivered concealed;
- reveal requested;
- reveal authentication succeeded/failed;
- fields revealed;
- details rehidden;
- approval or rejection occurred after reveal;
- device used for reveal;
- cross-device handoff triggered.

These events help reconstruct whether the holder had an opportunity to inspect material facts before authorization.

## 17. SERA Interaction Rules

SERA should understand direct commands such as:

- "Hide the details."
- "Show me the details."
- "Keep transaction alerts private."
- "Don't show amounts on my watch."
- "Hide balances on the lock screen."
- "Show this one."
- "Hide it again."

Changing persistent privacy preferences should be confirmed clearly because it affects future presentation behavior.

## 18. Data and Architecture Rule

The presentation layer receives a privacy-filtered representation of an underlying action object.

Recommended pattern:

```text
Authoritative Action Object
        |
        v
Presentation Privacy Policy
        |
        +--> Concealed View Model
        |
        +--> Authenticated Revealed View Model
```

The concealed view must not require deletion or mutation of the authoritative transaction data.

## 19. Relationship to Trust Protocol and REV

Hide/reveal status is not itself an authorization decision. However, presentation state may become an input to an authorization workflow when policy requires evidence that the holder reviewed material information before approval.

Example:

`REV` may require `material_fields_reviewed = true` for a high-risk action before PASS.

This remains a deterministic policy input, not an AI judgment.

## 20. Accessibility

Concealment must work with screen readers, haptics and voice accessibility.

Accessibility output should avoid accidentally speaking concealed values. The holder should receive an accessible indication that information is hidden and that a reveal action is available.

## 21. Initial Product Decisions

1. Hidden-detail mode is a privacy control, not a transaction-data mutation.
2. Reveal is per instance by default.
3. Reveal never equals approval.
4. High-risk approvals may require authenticated reveal before authorization.
5. Concealment applies to visual and spoken output.
6. Wearables use stricter defaults than the phone.
7. Sensitive details automatically rehide after context changes or timeout.
8. Holder preferences can set default concealment behavior by surface and data type.
9. SERA cannot weaken concealment settings without explicit holder instruction.
10. Evidence records capture reveal/review events without exposing secret material.

## 22. Downstream Requirements

This addendum must be incorporated into:

- DB03 adaptive workspace and UI behavior;
- DB05 privacy/risk boundaries;
- DB09 proactive notification policy;
- DB10 approval and delegated-authority UX;
- DB11 evidence and explainability;
- DB12 offline/degraded behavior;
- future phone and wearable UI specifications;
- notification schemas;
- approval object schemas;
- accessibility specifications;
- QA and security test matrices.

## 23. Acceptance Direction

The feature is acceptable only if the holder can receive a meaningful alert or request without involuntary disclosure of sensitive context, can reveal that context when desired, can reliably re-conceal it, and cannot accidentally convert concealment into blind authorization.


---

## SOURCE 14
**Path:** `docs/design/SSW-SERA-DB12-Resilience-Failure-Recovery-Offline-and-Degraded-Mode-Architecture.md`  
**Blob SHA:** `35ef8e59b550397f2d4c432a3da8a8bb65d1dfa7`

# SSW-SERA-DB12: Resilience, Failure Recovery, Offline & Degraded-Mode Architecture

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB12  
**Status:** Controlled Design Board / Pre-Architecture  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA  
**Normative companion controls:** SSW-SERA-DB11A Concealed Detail Alert, Approval & Transaction Presentation Control

## 1. Purpose

This document defines how Soul Super Wallet and SERA behave when one or more required systems are unavailable, degraded, delayed, contradictory, partially synchronized, or uncertain.

The objective is to ensure that loss of AI capability, network connectivity, chain access, RPC providers, external APIs, device continuity, wearable connectivity, Trust Protocol, REV, voice services, or execution acknowledgements does not cause unsafe execution, silent data loss, duplicated transactions, privacy leakage, or ambiguous holder state.

The governing principle is:

> Degradation may reduce convenience, speed, context, or automation. It must not silently reduce authority, privacy, integrity, or transaction safety.

## 2. Scope

DB12 covers:

- AI runtime failure;
- network loss and intermittent connectivity;
- blockchain/RPC/provider outages;
- external data-source failure;
- Trust Protocol failure;
- REV unavailability;
- biometric/authentication failure;
- secure signer failure;
- partial execution and uncertain finality;
- duplicated or replayed requests;
- phone/watch disconnects;
- cross-device state divergence;
- offline credential presentation;
- offline or deferred wallet operations where technically valid;
- voice recognition degradation;
- notification and alert delivery failure;
- concealed-detail behavior during degraded states;
- recovery and reconciliation;
- evidence continuity;
- safe fallback to conventional wallet controls.

DB12 does not authorize any new action. It defines how existing authority and controls behave under failure.

## 3. Resilience Model

SSW-SERA should classify runtime state across five operating modes:

| Mode | Description | Permitted posture |
|---|---|---|
| M0 Normal | All required services healthy | Full policy-permitted functionality |
| M1 Degraded | One or more non-critical dependencies impaired | Continue with reduced features and explicit disclosure |
| M2 Restricted | Critical context or control service unavailable | Read, inspect, prepare, or queue only where safe |
| M3 Offline | No usable network path | Local-only capabilities and offline-verifiable operations |
| M4 Safety Lock | Integrity, authority, execution state, or device trust uncertain | Block consequential execution until reconciled |

The wallet must surface the current operating posture when it materially affects what the holder can safely do.

## 4. Failure Domains

Failures must be isolated by domain rather than treated as a single generic error.

Canonical domains:

```text
AI / Reasoning
Voice
Context / Memory
Device
Wearable
Network
Chain / RPC
Market / News / LinkedIn / External Intelligence
Credential Issuer / Verifier
Trust Protocol
REV
Authentication
Signer / Keystore
Execution Provider
Notification
Evidence / Audit
Synchronization
```

Every domain should expose health, freshness, last-success timestamp, confidence, and failover state to the orchestration layer.

## 5. AI Runtime Failure

SERA must not be a single point of wallet failure.

If the AI runtime becomes unavailable:

- the wallet remains accessible;
- balances and local wallet state remain inspectable;
- conventional transaction preparation flows remain available where dependencies permit;
- credential access and presentation remain available where safe;
- previously issued mandates remain governed by deterministic policy, not by model improvisation;
- no new autonomous plan should be created;
- ambiguous natural-language requests should not be guessed;
- the holder should be told that SERA reasoning is temporarily unavailable.

The fallback should be a compact deterministic wallet interface rather than a dead screen.

## 6. On-Device vs Cloud AI Failure

SERA may eventually use a hybrid model of on-device and cloud reasoning.

If cloud reasoning fails but approved on-device capability remains available:

- low-risk interpretation may continue;
- private/local summarization may continue;
- cloud-dependent tools are disabled;
- action scope is reduced to capabilities supported by the local model and deterministic control plane;
- no cloud-only context should be implied as current.

If the on-device AI component fails but cloud AI remains available, private-context rules still apply. Sensitive local data must not be expanded into cloud context merely to compensate for local-model failure.

## 7. Network Loss

When the device loses connectivity, SERA should distinguish between:

1. actions that can complete locally;
2. actions that can be prepared but not submitted;
3. actions that require online validation;
4. actions that must be blocked.

Examples:

| Capability | Offline behavior |
|---|---|
| View cached balances | Allowed with stale-data label |
| View local credentials | Allowed |
| Generate locally verifiable presentation | Potentially allowed if protocol supports it |
| Prepare transaction | Allowed as unsigned/unsent draft where safe |
| Broadcast transaction | Blocked until network returns |
| Query current gas | Not available; do not fabricate |
| Current news/market intelligence | Unavailable/stale label |
| Trust/REV-dependent execution | Block unless valid offline policy package exists |

## 8. Offline Freshness Labels

Any cached information shown while offline must include freshness metadata.

Examples:

```text
Balance last updated: 12 minutes ago
Credential status last checked: 3 hours ago
Gas estimate unavailable offline
News intelligence unavailable offline
```

SERA must never present cached state as current merely because it is the latest locally available state.

## 9. Chain and RPC Failure

Multi-chain support creates both resilience and complexity.

If a selected chain or RPC endpoint fails:

- retry against approved secondary RPCs where policy permits;
- distinguish provider outage from chain outage;
- do not silently switch chains for a prepared transaction;
- if an alternative chain is proposed, treat it as a new route requiring fresh review where material details change;
- preserve the original intent and route evidence;
- re-run fee, recipient-compatibility, policy, Trust Protocol, and REV checks for the alternate route.

A chain change is not a transport retry. It is a material transaction change.

## 10. Uncertain Broadcast State

One of the most dangerous failure conditions is uncertainty after signing or submission.

Example:

```text
Transaction signed
-> broadcast request sent
-> provider times out
-> final network acceptance unknown
```

The wallet must not automatically create and send a replacement transaction unless replay/nonce rules prove it is safe.

State should become:

`EXECUTION_STATUS_UNKNOWN`

Required behavior:

- preserve signed payload hash;
- query multiple trusted sources where available;
- inspect nonce/state where applicable;
- suppress duplicate submission until reconciled;
- clearly tell the holder that completion is not yet known;
- reconcile before permitting conflicting follow-up actions.

## 11. Duplicate and Replay Protection

All consequential execution requests require unique idempotency and replay controls.

Recommended controls:

- execution_request_id;
- intent_id;
- nonce/sequence tracking;
- mandate-use counters;
- time-bound authorization token;
- signed payload hash;
- provider idempotency key where supported;
- transaction nonce or equivalent chain mechanism;
- consumed-authorization registry.

A retry should retry the same authorized action, not silently create a second authorization.

## 12. Trust Protocol Failure

If Trust Protocol is required by policy and unavailable:

- the action must not be treated as implicitly trusted;
- high-risk execution moves to restricted state;
- low-risk informational functions may continue;
- cached trust information may inform UI but not replace a required current decision unless an explicitly defined offline trust policy permits it;
- the holder receives a clear explanation.

Example:

> “I can prepare this transaction, but I cannot authorize execution until the required trust check is available.”

## 13. REV Failure

REV is a runtime execution gate.

Where REV is mandatory, inability to obtain a valid REV decision means execution fails closed.

Permitted fallback actions may include:

- inspect;
- explain;
- prepare;
- save draft;
- retry later;
- cancel.

REV unavailability must never be interpreted as PASS.

## 14. Authentication Failure

If biometric authentication fails:

- follow approved platform fallback policy;
- do not lower assurance simply because the biometric attempt failed;
- track repeated failures as a possible risk signal;
- retain transaction state without silently changing material details;
- require fresh review if the approval window expires.

If no acceptable authentication method is available, the action remains unexecuted.

## 15. Secure Signer Failure

If the secure signer, keystore, Secure Enclave, StrongBox, HSM-backed service, or equivalent signing boundary is unavailable:

- SERA may continue to explain and prepare;
- the action cannot cross into execution;
- private key material must never be exported into the AI or application layer as a workaround;
- the holder receives a signing-system status rather than a generic “AI error.”

## 16. External Intelligence Failure

News, LinkedIn, market, analytics, reputation, or third-party intelligence can enrich SERA, but must not become hidden hard dependencies for core wallet availability.

If an external source fails:

- indicate source unavailability when relevant;
- retain last-known data only with freshness disclosure;
- do not infer missing current facts;
- do not reduce execution safety controls;
- if a control decision depends on the unavailable source, move the action to restricted state.

## 17. Spam Token Filter Degradation

If the spam-token filtering service is stale or unavailable:

- previously known risk classifications may remain visible with freshness state;
- unknown tokens should not be promoted as safe;
- interactions with unclassified assets may require stronger warning or block depending on policy;
- SERA must not claim a token is safe simply because the filter is unavailable.

## 18. Voice Recognition Degradation

Voice reliability depends on environment, speech confidence, holder adaptation, device microphones, and language-model availability.

If confidence drops below the action-specific threshold:

- SERA asks for repetition;
- offers visual confirmation;
- switches to touch/text input if needed;
- treats amounts, recipients, negation, chain names, and addresses with heightened thresholds;
- never converts uncertain speech into execution authority.

For high-risk voice requests, degraded voice confidence should move the holder to an inspectable confirmation surface.

## 19. Concealed-Detail Control During Failures

SSW-SERA-DB11A is a normative requirement for degraded-state presentation.

Failure or recovery conditions must not cause sensitive transaction or alert details to become exposed accidentally.

Rules:

- if concealed-detail mode is enabled, degraded-state screens inherit it;
- error messages must not reveal hidden amounts, recipients, balances, addresses, credential claims, merchants, or other concealed fields;
- lock-screen and wearable notifications remain concealed according to holder policy;
- recovery/retry screens do not automatically reveal previously hidden details;
- a per-instance reveal remains separate from approval;
- revealed details automatically re-hide according to timeout, lock, backgrounding, device transition, or holder policy;
- if the device changes during recovery, concealment state defaults to the stricter applicable policy;
- spoken SERA responses obey the same conceal/reveal policy as visual surfaces.

Example concealed failure alert:

```text
Transaction status needs your attention.
[Show details]
```

rather than:

```text
Your $8,500 USDC transfer to Jane failed on Ethereum.
```

unless the holder explicitly permits that disclosure on the current surface.

## 20. Approval Safety Under Concealment

The holder may choose to receive an approval request with details hidden.

However, concealment must not weaken informed authorization.

For actions whose policy requires material review:

```text
Alert arrives concealed
-> holder opens approval
-> holder chooses Show details
-> authentication if required for reveal
-> material transaction details displayed
-> holder reviews
-> approval control enabled
-> separate authorization action
```

For lower-risk actions, policy may allow concealed approval if the holder has explicitly configured that capability and the authority model permits it. Such cases must be narrowly scoped.

“Reveal” and “Approve” remain distinct events in the evidence graph.

## 21. Wearable Failure and Disconnect

Wearables are Phase 2 surfaces but Phase 1 architectural constraints.

If phone-watch connectivity fails:

- the watch should retain only capabilities explicitly supported offline;
- stale data must be marked;
- watch authority does not expand because the phone is unavailable;
- high-risk actions that require phone handoff remain pending or blocked;
- queued approvals expire according to policy;
- reconnect triggers state reconciliation before action continuation.

A disconnected watch is not a substitute signer unless explicitly designed and certified as such.

## 22. Cross-Device State Divergence

SERA may operate across phone, watch, and future surfaces.

If devices disagree on task state:

- execution-critical state is resolved from the authoritative control/evidence layer;
- client UI state never overrides signed execution evidence;
- stale pending approvals are invalidated when the action has already completed, failed, expired, or changed;
- each device receives a reconciled state event.

Example:

```text
Watch shows “Awaiting approval”
Phone completes cancellation
-> authoritative state = CANCELLED
-> watch receives reconciliation event
-> approval UI becomes invalid
```

## 23. Notification Delivery Failure

A failed notification is not equivalent to failed execution.

The system must separate:

- action outcome;
- notification delivery outcome;
- holder acknowledgement.

If a critical alert cannot be delivered through one surface, approved fallback channels may be attempted according to policy.

The system should not repeatedly expose sensitive content across multiple surfaces merely to maximize delivery.

## 24. Offline Credentials

Where credential standards and verifier capabilities permit offline verification, the architecture should support it without assuming constant cloud access.

Potential offline flow:

```text
Holder credential store
-> local presentation generation
-> selective disclosure / proof
-> verifier validation against cached/offline trust material
-> evidence record
-> later reconciliation if required
```

Revocation freshness and issuer-status requirements must be explicit. If a verifier requires a current online status check, SERA should not pretend offline proof is sufficient.

## 25. Deferred Actions

Some actions can safely be prepared while offline or degraded and executed later.

Deferred-action object should include:

```json
{
  "deferred_action_id": "da_...",
  "original_intent_id": "ie_...",
  "prepared_at": "...",
  "expires_at": "...",
  "material_terms_hash": "...",
  "requires_reprice": true,
  "requires_fresh_rev": true,
  "requires_fresh_authentication": true,
  "status": "PENDING_REVALIDATION"
}
```

A deferred action is not a stored approval unless the authority policy explicitly says so.

Before later execution, material facts must be revalidated.

## 26. Recovery Workflow

Canonical recovery sequence:

```text
Failure detected
      |
      v
Classify failure domain
      |
      v
Freeze unsafe transitions
      |
      v
Preserve evidence + intent state
      |
      v
Inform holder at appropriate privacy level
      |
      v
Attempt approved failover
      |
      v
Revalidate stale inputs
      |
      v
Re-run policy / Trust / REV where required
      |
      v
Reconcile execution state
      |
      v
Resume, cancel, or escalate
      |
      v
Emit recovery evidence
```

## 27. Safe Failover

Failover must be pre-declared, not improvised.

Examples:

- RPC A -> approved RPC B;
- cloud AI -> approved on-device reduced mode;
- voice -> visual/text confirmation;
- watch -> phone handoff;
- push notification -> in-app alert;
- market data provider A -> approved provider B.

Failover rules must identify whether switching dependencies changes risk, data handling, jurisdiction, price, privacy, or authority requirements.

## 28. Recovery Evidence

Every material failure and recovery event should create structured evidence:

- failure domain;
- detection time;
- dependency/provider;
- last known good state;
- pending action IDs;
- failover attempted;
- failover result;
- holder notification state;
- concealment state;
- revalidation performed;
- Trust Protocol/REV result after recovery;
- final action disposition.

Recovery evidence links into DB11’s execution evidence graph.

## 29. User-Facing Failure Language

SERA should distinguish between uncertainty, failure, delay, and block.

Preferred patterns:

- “I haven’t sent it. The network is unavailable.”
- “The transaction was submitted, but I cannot yet confirm whether the network accepted it.”
- “I can prepare this, but REV is currently unavailable, so I cannot execute it.”
- “Your balance shown here is 18 minutes old.”
- “I can’t reliably distinguish fifteen from fifty. Please confirm on screen.”

Avoid vague messages such as “Something went wrong” for material financial states.

## 30. Conventional Wallet Fallback

The AI-first design must retain an inspectable deterministic fallback.

If SERA is unavailable, the holder should still be able, subject to policy and dependency health, to:

- inspect assets;
- inspect credentials;
- inspect transaction history;
- access security controls;
- review pending actions;
- cancel drafts;
- revoke mandates;
- lock the wallet;
- view evidence/receipts;
- use conventional send/receive flows where permitted.

This fallback does not mean preserving the old dashboard unchanged. It means preserving direct holder agency independent of the AI layer.

## 31. Emergency Safety Actions

Certain actions should remain reachable through deterministic controls even when SERA is impaired:

- lock wallet;
- pause SERA execution;
- revoke all active mandates;
- revoke a device;
- disable wearable approvals;
- disable voice execution;
- hide sensitive details globally;
- disconnect WalletConnect/session integrations;
- require full reauthentication.

These controls should have minimal dependency chains.

## 32. Recovery From Lost Phone

A lost-phone scenario must assume the device may be hostile.

Required design considerations:

- remote device revocation;
- mandate suspension;
- session invalidation;
- wallet recovery through defined Soul ID / wallet recovery controls;
- re-binding of trusted devices;
- wearable authority reduction or suspension where appropriate;
- preserved execution evidence;
- re-establishment of SERA personalization without blindly restoring high-risk device state.

## 33. Recovery From Lost Wearable

A lost watch or other wearable should be independently revocable.

Revocation should terminate:

- wearable approval rights;
- wearable notification secrets;
- device-specific SERA session state;
- offline tokens/credentials beyond their allowed validity;
- cached sensitive content according to platform capability.

Losing a wearable should not require rotating the holder’s entire wallet identity unless threat analysis determines otherwise.

## 34. Dependency Health Contract

Each external or internal dependency should expose a health contract such as:

```json
{
  "dependency": "rev",
  "status": "HEALTHY|DEGRADED|UNAVAILABLE|UNKNOWN",
  "last_success": "...",
  "freshness_seconds": 3,
  "failover_available": false,
  "execution_impact": "BLOCK_HIGH_RISK",
  "data_confidence": "HIGH"
}
```

SERA should reason over these structured states rather than inferring health from tool-call errors alone.

## 35. Circuit Breakers

The architecture should support circuit breakers for repeated or systemic failure.

Examples:

- repeated RPC inconsistencies;
- abnormal signer errors;
- repeated REV disagreement;
- spam-filter outage combined with unknown-token interaction;
- provider returning inconsistent transaction states;
- evidence-store failure;
- high rate of failed autonomous actions.

Circuit breakers can suspend a capability without disabling the entire wallet.

## 36. Evidence-Store Failure

If required execution evidence cannot be written reliably:

- high-risk actions should fail closed;
- lower-risk actions follow policy;
- the system must not execute first and hope to reconstruct later where evidence is a mandatory control;
- evidence buffering is allowed only if integrity, ordering, encryption, and eventual persistence are guaranteed.

## 37. Time and Clock Integrity

Time influences:

- mandate validity;
- credential validity;
- authorization windows;
- notification age;
- price freshness;
- replay protection;
- evidence ordering.

The system should detect significant clock drift and avoid trusting local time blindly for high-risk enforcement.

## 38. Reconciliation

After connectivity or a critical service returns, reconciliation should occur before silently resuming automation.

Reconcile:

- balances;
- nonce/sequence state;
- submitted transactions;
- mandate counters;
- credential status;
- device state;
- notification acknowledgements;
- wearable state;
- pending approvals;
- deferred actions;
- evidence persistence.

If reconciliation changes material terms, re-approval may be required.

## 39. Automation During Degradation

Bounded autonomy must become more conservative, not more permissive, when dependencies degrade.

Rules:

- no expansion of mandate scope;
- no skipping Trust Protocol/REV requirements;
- no use of stale price or counterparty data outside policy thresholds;
- no silent route substitution;
- no autonomous retry that could duplicate value transfer;
- automatic pause when state becomes uncertain.

## 40. Phase 1 / Phase 2 Implications

### Phase 1 must build

- dependency health model;
- deterministic fallback UI;
- evidence-preserving failure states;
- chain/RPC failover controls;
- uncertain-execution handling;
- idempotency/replay protections;
- Trust Protocol and REV fail-closed behavior;
- concealed-detail-safe error surfaces;
- device-specific authority state;
- cross-device task identifiers;
- offline freshness metadata;
- emergency pause/revoke controls.

### Phase 2 wearable launch can then add

- watch-specific offline capability;
- watch reconnect/reconciliation flows;
- watch-specific approval expiration;
- wearable-safe concealed notifications;
- constrained on-watch credential presentation;
- device-specific recovery and revocation.

The architecture therefore avoids retrofitting resilience when wearables arrive.

## 41. Controlled Design Decisions

**DB12-D01** — AI failure must not make the wallet unusable.  
**DB12-D02** — Degradation may reduce capability but never silently reduce safety controls.  
**DB12-D03** — Mandatory REV unavailability fails closed.  
**DB12-D04** — Chain switching is a new material route decision, not a transparent retry.  
**DB12-D05** — Unknown transaction submission state blocks unsafe duplicate execution until reconciled.  
**DB12-D06** — Cached information must carry freshness state.  
**DB12-D07** — Wearable authority never expands because the phone is unavailable.  
**DB12-D08** — Concealed-detail policy persists through errors, retries, recovery, and cross-device handoff.  
**DB12-D09** — Reveal and approval remain separate events in every operating mode.  
**DB12-D10** — External intelligence failure must not silently weaken wallet security.  
**DB12-D11** — Autonomous actions become more conservative under degraded conditions.  
**DB12-D12** — Failure and recovery events form part of the execution evidence graph.  
**DB12-D13** — Emergency lock, pause, revocation, and direct wallet access must have minimal dependency paths.  
**DB12-D14** — Deferred actions must be revalidated before later execution unless an explicit authority policy says otherwise.  
**DB12-D15** — If mandatory evidence cannot be reliably produced, affected high-risk execution fails closed.

## 42. Relationship to Prior Documents

DB12 consumes and extends:

- DB01 AI-First Wallet Drawing Board;
- DB02 Existing Wallet Capability Inventory;
- DB03 AI-First Experience & Adaptive Workspace;
- DB04 Advanced Technical Capability & Feasibility Radar;
- DB04A Wearables Phase 2 Foundation Considerations;
- DB05 Privacy, Trust, Authority & Risk Boundaries;
- DB06 End-to-End Journeys;
- DB07 Intent, Capability, Tool & Execution Contracts;
- DB08 Memory, Context Broker & Personalization;
- DB09 Proactive Intelligence, Monitoring & Notifications;
- DB10 Delegated Authority, Automation & Bounded Autonomy;
- DB11 Execution Evidence, Auditability, Receipts & Explainability;
- DB11A Concealed Detail Alert, Approval & Transaction Presentation Control.

## 43. Next Design Question

With resilience defined, the next drawing-board layer should specify the actual production control plane that binds these concepts together:

**SSW-SERA-DB13: Runtime Orchestration, Policy, Trust Protocol, REV & Execution Control Plane Architecture**

DB13 should map the services, runtime states, APIs, events, queues, policy evaluation sequence, signing boundary, execution adapters, context interfaces, evidence emission, degraded-mode controls, and device/wearable handoff into one technical runtime architecture.


---

## SOURCE 15
**Path:** `docs/design/SSW-SERA-DB13-Runtime-Orchestration-Policy-Trust-Protocol-REV-and-Execution-Control-Plane-Architecture.md`  
**Blob SHA:** `e6c42b5a3775fd7d2cbbe06fef6a0f1ccc60b714`

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


---

## SOURCE 16
**Path:** `docs/design/SSW-SERA-DB14-Reference-Runtime-Sequences-State-Machines-and-API-Boundary-Contracts.md`  
**Blob SHA:** `fd2ee8dc352091a41b529d7e31d48ef80ef2d14a`

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


---

## SOURCE 17
**Path:** `docs/design/SSW-SERA-DB15-Logical-Service-Topology-Trust-Zones-Data-Stores-and-Deployment-Boundary-Architecture.md`  
**Blob SHA:** `207d94bebe51c992bcf610eed3d95f07db1e904b`

# SSW-SERA-DB15: Logical Service Topology, Trust Zones, Data Stores & Deployment Boundary Architecture

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB15  
**Status:** Controlled Design Board / Pre-Architecture  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

This document converts the runtime control-plane design into an implementation-oriented logical topology. It defines where major services execute, which trust zone owns each responsibility, what data each zone may hold, how information crosses boundaries, and where failures or compromises must be contained.

The governing principle is:

> SERA may coordinate across zones, but no single zone should possess enough authority, context, and key material to bypass the wallet's security model.

The architecture must preserve the separation between understanding, context, authority, policy, runtime control, signing, execution, evidence, and external intelligence.

## 2. Architectural Goals

The topology must support:

- an AI-first wallet experience without moving key material into AI infrastructure;
- local-first handling of sensitive holder context where practical;
- deterministic control between SERA reasoning and execution;
- explicit Trust Protocol and REV runtime gates;
- multi-chain execution and routing;
- credential retrieval and selective disclosure;
- bounded delegated authority;
- concealed-detail presentation controls;
- cross-device phone and wearable operation;
- offline and degraded modes;
- tamper-evident execution evidence;
- replaceable external AI and intelligence providers;
- failure containment between services;
- production deployment, observability, and incident isolation.

## 3. Top-Level Logical Topology

```text
+-------------------------------------------------------------+
| HOLDER DEVICES                                              |
|                                                             |
| Phone / Tablet                 Wearable                     |
| ----------------------------  ----------------------------  |
| SERA Experience               SERA Companion Surface        |
| Voice / Text / Tap            Alerts / Voice / Approval     |
| Local Context Cache           Scoped Local Context          |
| Local Policy Cache            Device Authority Cache        |
| Credential Wallet             Selected Credentials          |
| Secure Key Store              Device Credentials            |
| Concealed Detail UI           Concealed Detail UI           |
+---------------------------+---------------------------------+
                            |
                            | authenticated wallet channel
                            v
+-------------------------------------------------------------+
| WALLET CONTROL PLANE                                        |
|                                                             |
| Session & Device Trust   Intent / Capability Gateway        |
| Context Broker           Authority / Delegation Resolver    |
| Risk Engine              Policy Engine                      |
| Trust Protocol           REV Runtime Gate                   |
| Action State Machine     Idempotency / Replay Control       |
| Handoff Coordinator      Evidence Coordinator               |
+---------------------------+---------------------------------+
                            |
            +---------------+-------------------+
            |                                   |
            v                                   v
+---------------------------+      +---------------------------+
| INTELLIGENCE PLANE        |      | EXECUTION PLANE           |
|                           |      |                           |
| SERA Orchestrator         |      | Transaction Builder       |
| AI Model Adapters         |      | Credential Presenter      |
| Retrieval / Reasoning     |      | WalletConnect Gateway     |
| News / Market Intelligence|      | Multi-chain Router        |
| Entity Resolution         |      | External Service Adapter  |
+---------------------------+      +------------+--------------+
                                                |
                                                v
                                  +---------------------------+
                                  | SIGNING / KEY ZONE        |
                                  |                           |
                                  | Secure Enclave/Keystore   |
                                  | Signing Policy Adapter    |
                                  | Key References            |
                                  +------------+--------------+
                                               |
                                               v
+-------------------------------------------------------------+
| EXTERNAL NETWORKS & SERVICES                                |
| Blockchains | RPCs | DApps | Issuers | Verifiers | APIs     |
+-------------------------------------------------------------+
                            |
                            v
+-------------------------------------------------------------+
| EVIDENCE & ASSURANCE PLANE                                  |
| Evidence Store | Receipts | Audit | Reconciliation          |
+-------------------------------------------------------------+
```

## 4. Trust Zone Model

The reference architecture defines eight logical trust zones.

### Z0: Holder Interaction Zone

Contains the user-facing wallet experience.

Typical components:

- SERA conversational shell;
- adaptive workspace;
- voice and text input;
- approval surfaces;
- concealed-detail controls;
- device-specific notifications;
- transaction and credential inspection views.

Trust assumptions:

- holder-controlled device;
- potentially exposed to screen observation, malicious apps, device theft, and notification leakage;
- must never display more sensitive data than the presentation policy permits.

Z0 may request action but cannot directly authorize sensitive execution without passing the required control path.

### Z1: Device Security & Key Zone

Contains device-local cryptographic and security primitives.

Typical components:

- secure enclave / hardware-backed keystore;
- biometric authentication interface;
- wallet signing key references;
- device registration credential;
- protected local credential keys;
- encrypted local authorization cache where permitted.

Critical rule:

> Generative AI components never receive private key material or unrestricted signing handles from Z1.

Z1 exposes narrow signing and assertion interfaces only.

### Z2: Wallet Control Plane Zone

The most important deterministic server-side control zone.

Contains:

- session manager;
- device trust registry;
- intent action gateway;
- capability registry;
- tool registry;
- Context Broker;
- authority resolver;
- delegation evaluator;
- risk engine;
- policy engine;
- Trust Protocol;
- REV;
- action state machine;
- idempotency service;
- replay prevention;
- cross-device handoff coordinator;
- runtime evidence coordinator.

Z2 is the enforcement bridge between reasoning and execution.

A request from SERA becomes executable only after Z2 converts it into validated deterministic control objects.

### Z3: SERA Intelligence Zone

Contains probabilistic or AI-mediated functions.

Typical components:

- SERA orchestrator;
- language model adapters;
- intent interpretation assistance;
- task planning;
- recommendation engine;
- natural language generation;
- source synthesis;
- entity disambiguation;
- voice-language adaptation services where cloud processing is permitted.

Z3 is explicitly non-authoritative.

It may:

- understand;
- infer;
- rank;
- explain;
- recommend;
- prepare.

It may not:

- sign;
- create authority;
- expand a delegation;
- bypass REV;
- alter deterministic policy outcomes.

### Z4: Execution Adapter Zone

Contains deterministic adapters that translate validated action objects into external requests.

Examples:

- transaction builders;
- chain RPC adapters;
- token transfer adapters;
- swap adapters;
- WalletConnect adapters;
- OpenID4VC / VP adapters;
- credential proof presentation;
- merchant APIs;
- payment APIs;
- travel or service APIs;
- future AP2/AP3 compatible adapters.

Z4 receives only approved structured action objects.

### Z5: External Intelligence Zone

Contains information providers that may be inaccurate, stale, manipulated, or unavailable.

Examples:

- news APIs;
- LinkedIn APIs;
- market data;
- chain analytics;
- token intelligence;
- spam-token intelligence;
- issuer registries;
- fraud sources;
- counterparty metadata;
- public web or API data.

Z5 is always treated as untrusted input.

External content may influence context and risk, but cannot independently confer authority.

### Z6: Evidence & Assurance Zone

Stores execution evidence and integrity records.

Typical components:

- append-only action event store;
- evidence graph service;
- user receipt service;
- integrity hashes;
- signed REV decision records;
- audit records;
- reconciliation records;
- dispute evidence;
- policy/version references;
- retention and legal-hold controls.

Z6 must not become a duplicate repository for secrets.

### Z7: Operations & Administration Zone

Contains operational tooling separated from holder execution paths.

Examples:

- observability;
- service health;
- deployment controls;
- configuration management;
- policy publishing;
- incident response tooling;
- feature flags;
- runtime metrics;
- security monitoring.

Administrative access must never directly create or approve holder transactions.

## 5. Service Inventory

### 5.1 Device Services

Reference services include:

- `sera-ui-runtime`
- `voice-capture-adapter`
- `holder-context-local`
- `concealed-detail-controller`
- `device-auth-adapter`
- `wallet-key-adapter`
- `credential-local-store`
- `device-policy-cache`
- `handoff-client`
- `local-degraded-runtime`

### 5.2 Control Plane Services

Reference services include:

- `wallet-session-service`
- `device-trust-service`
- `intent-gateway`
- `capability-registry`
- `tool-registry`
- `context-broker`
- `authority-service`
- `delegation-service`
- `risk-service`
- `policy-service`
- `trust-protocol-service`
- `rev-service`
- `action-orchestrator`
- `idempotency-service`
- `reconciliation-service`
- `handoff-service`
- `evidence-coordinator`

These names are logical service roles, not mandatory microservice boundaries.

Some may be combined operationally during Phase 1 while preserving logical separation in code and interfaces.

### 5.3 Intelligence Services

Possible services:

- `sera-agent-runtime`
- `model-router`
- `intent-assist-service`
- `entity-resolution-service`
- `recommendation-service`
- `knowledge-retrieval-service`
- `holder-personalization-service`
- `news-intelligence-service`
- `chain-intelligence-service`

### 5.4 Execution Services

Possible services:

- `transaction-builder`
- `chain-route-service`
- `rpc-gateway`
- `credential-presentation-service`
- `walletconnect-gateway`
- `external-service-gateway`
- `execution-status-service`

## 6. Data Store Architecture

No single database should contain the complete holder identity, behavioral model, authorization state, keys, and transaction history in one unrestricted domain.

### 6.1 Local Holder Store

Stores on-device:

- encrypted wallet state;
- holder preferences;
- short-term SERA session state;
- voice adaptation profile where supported;
- local aliases;
- device policy cache;
- selected credentials;
- concealed-detail preferences;
- offline-required metadata.

Never store unencrypted seeds or sensitive raw biometric material in a general app database.

### 6.2 Device Registry Store

Stores:

- device identifier;
- holder relationship;
- device class;
- device trust status;
- attestation references;
- capability scope;
- registration date;
- revocation state;
- wearable pairing relationship.

### 6.3 Authority & Delegation Store

Stores structured authorization objects:

- delegation IDs;
- principal;
- agent;
- permitted capabilities;
- asset scope;
- value limits;
- frequency limits;
- counterparty constraints;
- time bounds;
- device scope;
- policy references;
- current status;
- cumulative usage.

This store is security-sensitive and must not be merged into ordinary conversational memory.

### 6.4 Policy Store

Stores versioned deterministic control policies.

Examples:

- risk-to-authentication mappings;
- wearable execution limits;
- concealed-detail rules;
- supported-chain policy;
- token-risk policies;
- credential-disclosure policy;
- REV rules;
- degraded-mode policy;
- jurisdiction-specific rules where applicable.

Policy changes must be versioned and auditable.

### 6.5 Context Metadata Store

Stores holder-relevant metadata that is safe for controlled server-side retrieval.

Examples:

- aliases;
- preferred chains;
- non-secret interaction preferences;
- recipient metadata references;
- personalization metadata;
- notification settings;
- model context retrieval indexes.

Sensitive values should remain referenced rather than copied where possible.

### 6.6 Evidence Store

Stores append-only structured action evidence.

Requirements:

- tamper-evident;
- canonical serialization;
- integrity hashes;
- retention policies;
- selective retrieval;
- encryption;
- legal hold where applicable;
- holder-accessible receipt projection.

### 6.7 Intelligence Cache

Stores temporary external data and derived intelligence.

Examples:

- news articles;
- market snapshots;
- token metadata;
- spam signals;
- RPC health;
- chain fee estimates;
- issuer metadata.

External intelligence must carry:

- source;
- retrieval time;
- freshness;
- confidence/trust score;
- expiry.

## 7. Key Material Placement

Private signing keys must remain within approved cryptographic boundaries.

Preferred Phase 1 model:

- holder transaction keys remain device-controlled where the current Soul Super Wallet design permits;
- server-side services receive only public-key references, unsigned payloads, signed assertions, or signatures;
- SERA model infrastructure has no key access;
- runtime control services cannot export key material;
- key rotation, recovery, and wallet-root operations use separate high-assurance workflows.

If future institutional or autonomous wallet variants require HSM-backed signing, those become separate signer trust domains rather than extensions of the AI service.

## 8. Context Boundary

The Context Broker is the mandatory bridge between raw data sources and SERA context.

```text
Source Data
   |
   v
Classification
   |
   v
Purpose Check
   |
   v
Holder Permission / Policy
   |
   v
Minimization
   |
   v
Redaction / Transformation
   |
   v
Context Package
   |
   v
SERA
```

No model adapter should directly query unrestricted wallet databases.

## 9. Concealed-Detail Boundary

DB11A becomes a topology-level presentation requirement.

The concealed-detail controller resides primarily on-device, with server-generated presentation metadata indicating sensitivity.

Example presentation object:

```json
{
  "presentation_id": "pres_...",
  "sensitivity": "financial_sensitive",
  "default_visibility": "concealed",
  "reveal_requires_auth": true,
  "approval_requires_reveal": true,
  "auto_rehide_seconds": 30,
  "allow_wearable_detail": false
}
```

The raw transaction object should not be replicated into notification infrastructure merely to support a lock-screen alert.

Notifications may instead contain:

```json
{
  "title": "Action requires your attention",
  "detail_state": "concealed",
  "action_ref": "action_123"
}
```

The holder can reveal details after opening a trusted surface.

## 10. Multi-Device Topology

A holder may have:

- primary phone;
- secondary phone;
- Apple Watch;
- Wear OS watch;
- future hardware NFC companion;
- desktop/web surface.

Each device has:

- independent registration;
- independent trust state;
- independent capability scope;
- revocation state;
- presentation policy;
- synchronization state.

The wallet does not assume that devices share equal authority.

## 11. Wearable Deployment Boundary

Wearables remain Phase 2 launch surfaces but Phase 1 architectural constraints.

Wearables should normally contain:

- presentation shell;
- narrow SERA interaction client;
- notification receiver;
- low-risk approval interface;
- selected credential presentation support;
- scoped device credential;
- emergency lock control;
- minimal local state.

Wearables should not contain:

- unrestricted wallet state;
- unrestricted delegation store;
- full transaction history cache;
- root recovery secrets;
- unrestricted signing authority unless specifically designed later.

## 12. Execution Boundary

A structured action must cross the following logical boundary before external execution:

```text
SERA Proposal
   |
   v
Intent Gateway
   |
   v
Capability Validation
   |
   v
Authority Validation
   |
   v
Risk + Policy
   |
   v
Trust Protocol
   |
   v
REV
   |
   v
Required Holder Authentication
   |
   v
Canonical Execution Object
   |
   v
Signer
   |
   v
Execution Adapter
```

The execution adapter must reject free-form natural-language requests.

## 13. API Boundary Categories

All APIs should be categorized by trust level.

### Internal Deterministic Control APIs

Examples:

- action validation;
- authority resolution;
- policy evaluation;
- REV decision;
- signing request.

Requirements:

- authenticated service identity;
- schema validation;
- versioned contracts;
- request IDs;
- idempotency;
- structured reason codes.

### Intelligence APIs

Examples:

- language models;
- news synthesis;
- entity resolution;
- recommendation.

Requirements:

- minimized context;
- no key material;
- no unrestricted data access;
- no direct execution privileges.

### External Execution APIs

Examples:

- chain RPC;
- DEX/router;
- verifier;
- issuer;
- merchant;
- travel provider.

Requirements:

- provider isolation;
- timeouts;
- retries governed by idempotency policy;
- execution evidence;
- reconciliation.

## 14. Network Segmentation

Recommended production segmentation:

```text
Public/API Edge
    |
    v
Wallet API Gateway
    |
    +----> Intelligence Services Network
    |
    +----> Control Plane Network
                  |
                  +----> Policy / Trust / REV
                  |
                  +----> Execution Adapter Network
                               |
                               +----> External Networks

Evidence Network <---- append-only events from control/execution

Administrative Network ---- isolated operational access
```

Signer infrastructure should be isolated further where server-side signing is ever introduced.

## 15. Service Identity

Each internal service requires a machine identity.

Preferred properties:

- short-lived credentials;
- mutual service authentication;
- explicit service authorization;
- rotation;
- revocation;
- minimal network reachability;
- auditable service-to-service calls.

No service should authenticate solely by network location.

## 16. Secret Management

Application secrets include:

- API credentials;
- provider tokens;
- database credentials;
- service certificates;
- webhook secrets;
- encryption keys.

Secrets should use a controlled secret-management system and must never be stored in source repositories or model prompts.

Wallet signing keys remain outside ordinary secret-management stores unless a dedicated HSM custody architecture explicitly requires otherwise.

## 17. External Provider Isolation

External providers should be accessed through adapter services rather than directly from SERA.

```text
SERA
  |
  v
Controlled Tool Contract
  |
  v
Provider Adapter
  |
  v
External Provider
```

This allows:

- provider substitution;
- response validation;
- rate limiting;
- data minimization;
- redaction;
- evidence capture;
- provider-specific failure isolation.

## 18. Model Provider Abstraction

The architecture must not hardwire SERA's product identity to one AI provider.

A model router should support:

- local models where available;
- platform models;
- approved cloud models;
- task-specific models;
- fallback models.

Routing decisions consider:

- data sensitivity;
- task type;
- latency;
- cost;
- availability;
- privacy policy;
- holder preference where applicable.

## 19. Failure Domains

Each of the following should be treated as a separate failure domain:

- phone client;
- wearable client;
- AI/model provider;
- Context Broker;
- Trust Protocol;
- REV;
- policy service;
- chain RPC;
- execution adapter;
- external API;
- evidence store;
- notification provider;
- cross-device synchronization.

Failure in one domain should not silently mutate authority in another.

## 20. Degraded Deployment Modes

### AI unavailable

Retain:

- wallet inspection;
- deterministic send/receive interfaces;
- credentials;
- emergency controls;
- stored policies;
- receipt access.

Disable or reduce:

- advanced conversation;
- autonomous planning;
- external intelligence synthesis.

### Control Plane unavailable

Consequential actions requiring server-side Trust Protocol or REV fail closed unless a predefined offline policy explicitly authorizes them.

### External intelligence unavailable

Continue core wallet functionality without treating absence of intelligence as evidence of safety.

### Evidence service unavailable

Execution policy determines whether the action may proceed. High-risk operations should normally require durable evidence availability or a local signed evidence buffer with later reconciliation.

## 21. Event Architecture

Important state changes should produce immutable events.

Example event classes:

- `intent.received`
- `intent.normalized`
- `authority.resolved`
- `risk.classified`
- `trust.evaluated`
- `rev.decided`
- `presentation.concealed`
- `presentation.revealed`
- `holder.approved`
- `signing.completed`
- `execution.submitted`
- `execution.confirmed`
- `execution.uncertain`
- `delegation.revoked`
- `device.revoked`
- `reconciliation.completed`

Events support evidence, state recovery, analytics, and incident reconstruction.

## 22. Logging Boundary

Operational logs must not casually contain:

- seed phrases;
- private keys;
- raw credentials;
- full identity documents;
- biometric data;
- full SERA prompts containing unrestricted wallet context;
- sensitive transaction details where metadata is sufficient.

Structured logging should use IDs and references.

## 23. Data Encryption

At minimum:

- encrypted device storage;
- encrypted database storage;
- TLS for network transport;
- separate encryption domains for highly sensitive stores;
- key rotation;
- backup encryption;
- encrypted evidence archives.

Sensitive holder data should have stricter key-management boundaries than generic telemetry.

## 24. Backup and Recovery

Backend stores require distinct recovery policies.

Examples:

- device registry: recoverable and auditable;
- authority store: point-in-time recovery and append-only change history;
- policy store: immutable version history;
- evidence store: tamper-evident backups;
- intelligence cache: disposable/rebuildable;
- conversational cache: short-lived and disposable where possible.

Wallet key recovery remains governed by the wallet's dedicated recovery design, not ordinary server backups.

## 25. Data Residency and Jurisdiction

The topology should permit future regional deployment.

Service and store placement should be configurable for:

- jurisdiction-specific privacy requirements;
- enterprise deployments;
- sovereign deployments;
- regional data residency;
- regulatory evidence retention.

The architecture should avoid unnecessary coupling that forces all holder data into one region.

## 26. Deployment Shapes

### Phase 1 Reference Deployment

A pragmatic initial deployment may combine logical services while preserving interface separation.

Example:

```text
Mobile Apps
    |
API Gateway
    |
Wallet Core Application Cluster
    |-- Context / Authority / Risk / Policy
    |-- Trust Protocol / REV
    |-- Action Orchestration
    |
SERA Intelligence Cluster
    |
Execution Adapter Cluster
    |
Evidence Store
```

### Future Scaled Deployment

Services can separate by risk and load:

- control plane;
- Trust Protocol;
- REV;
- intelligence;
- external adapters;
- evidence;
- notifications;
- device synchronization.

## 27. Zero-Trust Direction

Long-term architecture should assume:

- no implicit trust from network position;
- explicit service identity;
- least privilege;
- short-lived credentials;
- fine-grained authorization;
- device posture checks;
- continuous attestation where AURION applies;
- complete auditability of privileged operations.

## 28. AURION Placement

AURION may provide continuous attestation inputs into runtime policy and REV.

Reference path:

```text
Device / Session / Service Signals
       |
       v
AURION
       |
       v
Attestation State
       |
       v
Trust Protocol / REV
```

AURION does not replace device registration, authentication, policy, or REV. It enriches assurance.

## 29. Threat Containment Examples

### Model compromise

Impact should be limited to interpretation/recommendation quality. It must not grant signing access or bypass REV.

### External news API compromise

May inject false context. Source-validation, risk weighting, and authority separation prevent direct execution.

### Wearable theft

Device can be revoked independently. Wearable scope limits exposure.

### Notification interception

Concealed-detail policy prevents sensitive transaction details from appearing by default.

### RPC compromise

Multi-source validation, chain-state verification, risk controls, and reconciliation reduce impact.

### Control service compromise

Service identities, segmented privileges, signed decisions, and evidence enable containment and detection. High-value control components require stronger hardening.

## 30. Preliminary Data Ownership Matrix

| Data | Primary Owner | Preferred Location | AI Access |
|---|---|---|---|
| Private keys | Holder / wallet | Secure device zone | Never |
| Seed/recovery secret | Holder | Dedicated recovery boundary | Never |
| Raw biometric | Holder/device | Secure local processing | Never by default |
| Voice adaptation profile | Holder | Local-first | Minimized/controlled |
| Wallet balances | Holder | Wallet + chain-derived | Contextual/minimized |
| Credentials | Holder | Wallet credential store | Claim-selective only |
| Delegated authority | Holder | Protected authority store | Structured scope only |
| Policy | Wallet platform | Control plane | Read-only structured |
| SERA session context | Holder/session | Ephemeral/local or controlled | Yes, minimized |
| News/market data | External provider | Intelligence cache | Yes |
| Execution evidence | Holder/platform | Evidence zone | Limited structured access |
| Concealment preference | Holder | Device + preference store | Presentation only |

## 31. Preliminary Service-to-Zone Matrix

| Service | Zone | Consequential Authority |
|---|---|---|
| SERA UI | Z0 | No |
| Local signer | Z1 | Executes approved signatures only |
| Intent Gateway | Z2 | Validation only |
| Authority Service | Z2 | Resolves existing authority |
| Trust Protocol | Z2 | Trust evaluation |
| REV | Z2 | Runtime pass/fail |
| SERA Agent Runtime | Z3 | No |
| Model Router | Z3 | No |
| Transaction Builder | Z4 | No independent authority |
| Chain Adapter | Z4 | Executes approved object |
| News API | Z5 | No |
| Evidence Store | Z6 | No |
| Operations Console | Z7 | No holder transaction authority |

## 32. Architectural Invariants

The following are now proposed as non-negotiable invariants:

1. AI infrastructure never holds unrestricted signing authority.
2. Private keys never enter SERA context.
3. Natural language never crosses directly into a signer or chain adapter.
4. The Context Broker mediates model access to sensitive wallet context.
5. Trust Protocol and REV sit outside the model zone.
6. Delegated authority is held in a protected structured store, not conversational memory.
7. Concealed-detail policy applies across phone, wearable, notifications, and voice.
8. External intelligence is always treated as untrusted input.
9. Wearables receive device-scoped authority, never implicit full-wallet authority.
10. Evidence is generated across trust boundaries without copying secrets.
11. Every external execution uses a deterministic canonical action object.
12. Failure in an intelligence component cannot grant additional authority.
13. Administrative tooling cannot directly approve or originate holder transactions.
14. Service identity and least privilege are required across production zones.
15. Sensitive execution remains reconstructable through evidence and receipts.

## 33. Open Design Questions

The following should be resolved during controlled architecture freeze and implementation planning:

- exact local-versus-cloud split for SERA reasoning on iOS and Android;
- whether Phase 1 Trust Protocol and REV deploy as independent services or modules within a hardened control-plane service;
- database technologies for authority, policy, context, and evidence stores;
- how much holder context can be synchronized encrypted across devices;
- exact recovery mechanism for SERA personalization after wallet restoration;
- secure wearable session establishment and revocation;
- whether evidence requires a Merkle structure from Phase 1 or later hardening;
- regional deployment requirements for enterprise and sovereign customers;
- provider strategy for RPC redundancy and chain validation;
- HSM requirements if any server-managed signing use case is introduced later.

## 34. Relationship to Prior Documents

DB15 operationalizes:

- DB03 adaptive AI-first experience;
- DB04 technical feasibility;
- DB04A wearable foundation;
- DB05 trust and risk boundaries;
- DB06 user journeys;
- DB07 intent/capability/tool contracts;
- DB08 memory and Context Broker;
- DB09 proactive intelligence;
- DB10 delegated authority;
- DB11 execution evidence;
- DB11A concealed-detail control;
- DB12 resilience and degraded mode;
- DB13 runtime control plane;
- DB14 state machines and API boundaries.

## 35. Design Board Decision

The working topology for the SSW-SERA architecture is:

```text
Holder Devices
   |
   v
Wallet Control Plane
   |
   +---- SERA Intelligence Plane
   |
   +---- Trust / Policy / REV
   |
   +---- Signing Boundary
   |
   +---- Execution Adapters
   |
   v
External Networks & Services

All consequential paths emit evidence into a separate assurance plane.
```

This structure is sufficiently defined to proceed from drawing-board exploration toward controlled system architecture.

## 36. Recommended Next Artifact

The next design artifact should be:

**SSW-SERA-DB16: Phase 1 Product Scope, MVP Boundary, Migration Strategy & Release Sequencing**

DB16 should determine which capabilities enter the first AI-first SSW release, which remain behind feature flags, which require backend prerequisites, which belong to Phase 2 wearables, and how the current production Soul Super Wallet transitions to the SERA-first experience without breaking existing wallet functionality.

---

## SOURCE 18
**Path:** `docs/design/SSW-SERA-DB16-Phase-1-Product-Scope-MVP-Boundary-Migration-Strategy-and-Release-Sequencing.md`  
**Blob SHA:** `a62f06b3f6c7cccb7b3bea53b9e49b7a68660d2d`

# SSW-SERA-DB16: Phase 1 Product Scope, MVP Boundary, Migration Strategy & Release Sequencing

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB16  
**Status:** Controlled Design Board / Release Planning Input  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

This document converts the SSW-SERA design-board work into a practical product release boundary for Phase 1 and a controlled migration path from the existing Soul Super Wallet to a SERA-first wallet experience.

The objective is not to replace a functioning wallet with an experimental shell. The objective is to preserve working wallet capabilities while progressively moving coordination, discovery, preparation and context into SERA.

The governing product principle is:

> Preserve capability, change orchestration.

The user should gain a more intelligent wallet without losing deterministic access to balances, credentials, transaction history, WalletConnect, send, receive, swap, settings, security controls or recovery.

## 2. Release Strategy

The release model is divided into four controlled layers:

1. **Phase 1 Core:** production release target.
2. **Phase 1 Feature-Flagged:** technically integrated but limited to controlled cohorts or explicit opt-in.
3. **Phase 2:** planned expansion, including wearables and broader bounded autonomy.
4. **Research / Deferred:** capabilities that require ecosystem maturity, further validation or stronger governance.

This structure allows the architecture to remain future-compatible without making the first release unnecessarily broad.

## 3. Phase 1 Product Objective

Phase 1 should establish SERA as the primary interaction layer for the wallet while preserving the current wallet as an inspectable and deterministic substrate.

The release should demonstrate five things clearly:

- SERA can understand holder intent.
- SERA can use wallet and identity context safely.
- SERA can prepare and explain consequential actions.
- SERA can route those actions through Trust Protocol, REV, authentication and signing controls.
- The holder can always inspect and directly control the underlying wallet state.

Phase 1 should not depend on autonomous execution to prove the product thesis.

## 4. Phase 1 Core Scope

### 4.1 SERA-First Home Experience

The existing wallet home becomes a SERA-first conversational and adaptive workspace.

Required capabilities:

- text interaction;
- voice interaction;
- contextual wallet questions;
- dynamic action cards;
- adaptive finance, identity, security and activity workspaces;
- direct navigation to conventional wallet views;
- clear separation between recommendation, preparation and execution.

The wallet should not remove traditional screens. It should stop making them the primary coordination mechanism.

### 4.2 Wallet State Queries

SERA should support deterministic, read-only questions such as:

- “What is my USDC balance?”
- “Which chain has most of my ETH?”
- “What did I send Jane last month?”
- “Which credentials expire soon?”
- “Show my transactions on Polygon.”
- “What tokens are being hidden as spam?”

Answers should come from wallet state and approved services rather than model inference.

### 4.3 Send / Receive / Swap Preparation

Phase 1 includes SERA-assisted preparation of existing wallet execution capabilities.

SERA may:

- resolve asset;
- resolve recipient;
- inspect supported chains;
- compare routes;
- estimate fees;
- identify compatibility;
- prepare a transaction;
- explain the proposed route;
- request holder approval.

SERA does not bypass the existing signing boundary.

### 4.4 Multi-Chain Route Assistance

Multi-chain support becomes a SERA reasoning input.

The holder should not be forced to choose a chain before SERA has determined whether a better route is available.

Phase 1 route logic may consider:

- asset availability;
- recipient compatibility;
- network availability;
- fee estimate;
- whether bridging is required;
- previous holder preference;
- chain policy;
- token legitimacy and risk signals.

The selected route must remain inspectable before approval.

### 4.5 Credential Discovery and Presentation Preparation

SERA should support:

- finding credentials;
- explaining verifier requests;
- identifying requested claims;
- preparing selective-disclosure or proof flows where supported;
- warning when a request asks for more information than required;
- requesting holder approval before disclosure.

Credential disclosure remains holder-controlled unless a future explicit mandate authorizes otherwise.

### 4.6 Concealed Detail Control

DB11A becomes a Phase 1 core privacy feature.

The holder can conceal sensitive details in:

- alerts;
- transaction requests;
- approval cards;
- credential requests;
- lock-screen notifications;
- proactive intelligence;
- transaction receipts;
- SERA spoken responses where privacy mode applies.

Reveal and Approve remain separate actions.

High-risk actions may require authenticated reveal before approval.

### 4.7 SERA Holder Voice Profile

Phase 1 should include the foundational voice adaptation layer:

- accent adaptation;
- name and alias pronunciation;
- wallet and token vocabulary;
- code-switching support where technically available;
- correction learning;
- number and amount confidence handling;
- personal language profile.

Raw voice recordings are not a Soulverse data asset by default.

Voice remains an interaction channel, not a sufficient execution authority.

### 4.8 Spam Token Intelligence

The current spam-token filter should become available to SERA as a contextual risk signal.

Phase 1 behavior:

- suspicious assets remain hidden or clearly marked;
- SERA does not recommend flagged assets as normal portfolio holdings;
- transactions involving flagged contracts receive elevated review;
- risk reasons should be explainable where possible.

### 4.9 News and External Intelligence

Existing news APIs may be used for contextual intelligence.

Phase 1 should support:

- portfolio-relevant news summaries;
- chain or protocol alerts;
- issuer or token developments;
- security-event correlation;
- contextual answers to holder questions.

External intelligence must not independently authorize a financial transaction.

LinkedIn-derived information, where used, should remain optional contextual enrichment and should not become a hidden identity or risk-scoring dependency.

### 4.10 Proactive Alerts

Phase 1 should include governed proactivity from DB09.

Priority classes:

- CRITICAL;
- ACTION REQUIRED;
- RELEVANT;
- INFORMATIONAL;
- LOW VALUE / SILENT.

Initial alert types may include:

- suspicious token detection;
- credential expiration;
- failed transaction;
- unusual approval request;
- chain disruption affecting a pending action;
- material security or protocol event affecting held assets;
- mandate or device-security changes.

The default product behavior should favor relevance over volume.

### 4.11 Trust Protocol and REV Binding

Phase 1 consequential actions should use the defined control path where applicable:

```text
Holder Intent
  -> SERA Interpretation
  -> Deterministic Action Object
  -> Authority / Policy / Risk
  -> Trust Protocol
  -> REV
  -> Holder Authentication
  -> Signing Boundary
  -> Execution
  -> Evidence / Receipt
```

If Trust Protocol or REV is unavailable for an action that requires them, the action should fail closed or follow an explicitly defined degraded-mode policy.

### 4.12 Execution Evidence and Receipts

Phase 1 must produce structured evidence for consequential actions.

The holder-facing experience should remain concise while retaining enough structured evidence for later reconstruction.

Minimum user-facing receipt elements:

- what happened;
- asset / amount where applicable;
- recipient or verifier;
- network or service;
- approval basis;
- execution result;
- reference / transaction ID;
- optional “Why?” and “Show evidence” affordances.

## 5. Existing Wallet Capabilities to Preserve

The following should remain fully accessible during and after migration:

- Soul ID;
- credentials;
- balances;
- send;
- receive;
- swap;
- WalletConnect;
- QR proof flows;
- transaction history;
- chain selection and direct chain views;
- gas visibility;
- settings;
- security controls;
- spam-token management;
- recovery and backup functions;
- account and device management.

No SERA-first release should make a critical existing wallet capability inaccessible merely because it has not yet been conversationalized.

## 6. Migration UX Principle

The migration should not feel like the wallet disappeared.

The recommended Phase 1 experience is:

**Ambient SERA + Conversational Shell + Adaptive Workspace + Inspectable Wallet State**

The holder may begin with SERA, but can always inspect the underlying wallet directly.

A useful structural model is:

```text
SERA
  -> asks / prepares / explains
  -> opens adaptive workspace
  -> holder can inspect underlying wallet object
  -> holder approves or edits
  -> controlled execution
```

The wallet remains the source of truth. SERA becomes the preferred coordinator.

## 7. Screen Migration Strategy

### 7.1 Keep as Deterministic Screens

Initially preserve:

- detailed asset views;
- full transaction history;
- credential vault;
- wallet settings;
- device management;
- recovery;
- advanced security controls;
- WalletConnect session management;
- network configuration.

### 7.2 Move Behind SERA as Primary Entry

Primary entry may move to SERA for:

- send;
- receive;
- swap;
- balance questions;
- chain selection;
- credential lookup;
- credential sharing preparation;
- transaction explanation;
- security alerts;
- news/context intelligence.

### 7.3 Generate Dynamically

SERA may create temporary context-specific surfaces such as:

- transaction preview;
- route comparison;
- credential request summary;
- alert explanation;
- approval card;
- evidence summary;
- mandate status;
- “why this route?” explanation.

Dynamic surfaces should not become hidden state. They should link back to canonical wallet objects.

## 8. Phase 1 Feature-Flagged Scope

The following capabilities may be integrated but should launch behind controlled flags:

### 8.1 Bounded Delegated Payments

Examples:

- recurring fixed payment;
- known merchant payment below a defined limit;
- scheduled transfer;
- narrowly scoped conditional transaction.

Requirements:

- explicit mandate;
- hard amount / frequency / counterparty limits;
- expiration;
- revocation;
- REV check;
- evidence;
- visible mandate dashboard.

### 8.2 Conditional Automation

Examples:

- prepare, but do not execute, when balance falls below threshold;
- alert when a credential is close to expiry;
- prepare a gas refill when a chain balance falls below threshold;
- prepare a known recurring payment.

Autonomous execution should remain more restricted than autonomous preparation.

### 8.3 Advanced Proactive Intelligence

Feature-flagged areas may include:

- correlated risk alerts across news, chain and holdings;
- protocol-risk monitoring;
- counterparty context enrichment;
- more sophisticated portfolio event interpretation.

These require careful false-positive measurement before broad release.

### 8.4 External Agent / Merchant Protocol Integrations

AP2, AP3 or other agent-commerce integrations should remain controlled until their execution contracts, provider behavior and risk boundaries are validated.

## 9. Explicitly Out of Phase 1 Core

The following should not be required for the first SERA-first production release:

- full autonomous portfolio management;
- unrestricted autonomous spending;
- broad AI authority over wallet settings;
- autonomous seed / recovery actions;
- general third-party app clicking;
- Accessibility-based automation;
- arbitrary external website execution without supported contracts;
- full wearable product release;
- broad multi-device delegated execution;
- unbounded external agent-to-agent commerce.

These exclusions protect the release from becoming architecture-by-ambition.

## 10. Phase 2: Wearables

Wearables are a Phase 2 product release but a Phase 1 architecture constraint.

Phase 2 target capabilities may include:

- SERA on Apple Watch and Wear OS;
- balance glance views;
- private alerts;
- concealed-detail approval prompts;
- selected credential presentation;
- low-risk approval flows;
- task initiation and phone handoff;
- emergency wallet lock;
- voice interaction;
- persistent task continuation;
- device-scoped authority.

Wearables must not inherit unrestricted phone authority.

## 11. Phase 2: Expanded Bounded Autonomy

Phase 2 may expand:

- recurring mandates;
- conditional mandates;
- merchant-specific authority;
- agent commerce;
- trusted counterparty automation;
- contextual transaction preparation;
- cross-device autonomous workflows.

Expansion should occur by increasing the scope of formal mandates, not by making the model itself more privileged.

## 12. Migration Stages

### Stage M0: Baseline and Instrumentation

Before interface migration:

- inventory current screens and services;
- instrument current usage;
- establish feature flags;
- establish telemetry that excludes sensitive contents;
- define rollback paths;
- baseline crash, transaction-success and support metrics.

### Stage M1: SERA as Enhanced Assistant

SERA remains visibly additive.

Enable:

- read-only wallet queries;
- voice adaptation;
- contextual news;
- spam-token explanation;
- transaction explanation;
- credential lookup.

Existing navigation remains unchanged.

### Stage M2: SERA as Primary Coordinator

Make SERA the default starting surface for selected users.

Enable:

- send preparation;
- receive flows;
- swap preparation;
- multi-chain recommendation;
- credential-sharing preparation;
- contextual action cards;
- concealed-detail controls.

Traditional wallet screens remain one action away.

### Stage M3: SERA-First Default

SERA becomes the default wallet shell.

The adaptive workspace replaces static dashboard coordination, while detailed screens remain accessible.

This stage requires evidence that M2 did not reduce:

- transaction success;
- recoverability;
- user comprehension;
- access to security controls;
- supportability.

### Stage M4: Controlled Delegation

Introduce feature-flagged delegated authority and automation for qualified cohorts.

### Stage M5: Phase 2 Cross-Device / Wearables

Add wearable surfaces after device trust, handoff, authority and evidence abstractions have been proven on the phone.

## 13. Rollback Principle

Every migration stage must have a deterministic rollback path.

If SERA fails, the wallet should degrade to a usable conventional wallet rather than a broken AI interface.

Rollback controls should support:

- disable SERA-first home;
- disable voice;
- disable proactive intelligence;
- disable delegated execution;
- disable specific external providers;
- force read-only SERA mode;
- revert to standard wallet navigation.

The ability to disable SERA orchestration is a reliability feature, not an admission of failure.

## 14. Release Gates

Phase 1 should not move to full default until the following gates are met.

### Gate G1: Wallet Functional Parity

No critical existing capability is lost.

### Gate G2: Intent Accuracy

SERA can reliably classify supported intents and detect ambiguity.

### Gate G3: Transaction Safety

Transaction preparation, review, authentication and signing behave deterministically.

### Gate G4: Privacy

Context minimization, concealed-detail mode, voice-data handling and external-model boundaries are verified.

### Gate G5: Trust / REV Binding

Consequential actions use the expected control path and fail safely.

### Gate G6: Recovery

AI, network, RPC, provider and backend failures do not trap the holder.

### Gate G7: Evidence

Material actions are reconstructable.

### Gate G8: Accessibility

The SERA-first UI does not reduce accessibility relative to the current wallet.

### Gate G9: Performance

SERA does not introduce unacceptable latency into routine wallet operations.

### Gate G10: Supportability

Support teams can diagnose issues without requiring access to private conversational or key material.

## 15. Success Metrics

Suggested Phase 1 measures:

### Product

- percentage of wallet tasks initiated through SERA;
- completion rate by task class;
- number of manual navigation steps avoided;
- successful multi-chain route acceptance;
- successful credential request completion;
- concealed-detail feature use;
- SERA fallback rate.

### Safety

- wrong-recipient prevention events;
- ambiguity catch rate;
- REV-blocked unsafe actions;
- spam-token warning effectiveness;
- duplicate transaction prevention;
- failed or uncertain execution recovery rate.

### Voice

- recognition correction rate;
- numeric ambiguity rate;
- holder vocabulary adaptation improvement;
- voice-to-completed-task rate.

### Reliability

- transaction success rate;
- wallet crash-free sessions;
- SERA service availability;
- fallback success;
- RPC failover success.

### Trust and Privacy

- percentage of sensitive alerts concealed by policy;
- authenticated-reveal success;
- number of external context packages by data class;
- data-minimization policy violations;
- mandate revocation latency.

## 16. Feature Flag Architecture

Feature flags should exist at least for:

- `sera_primary_home`;
- `sera_voice`;
- `sera_voice_profile_learning`;
- `sera_send_prepare`;
- `sera_swap_prepare`;
- `sera_chain_recommendation`;
- `sera_credential_prepare`;
- `sera_proactive_alerts`;
- `sera_external_news_context`;
- `sera_linkedin_context`;
- `concealed_detail_default`;
- `delegated_payments`;
- `conditional_automation`;
- `autonomous_execution`;
- `wearable_handoff`;
- `wearable_approval`.

Flags should support cohort, platform, app-version and jurisdiction controls where required.

## 17. Compatibility Requirements

Phase 1 migration must remain compatible with:

- existing Soul ID state;
- existing wallet keys;
- existing token and chain integrations;
- existing credential storage;
- existing transaction history;
- current WalletConnect behavior;
- spam-token classifications;
- user preferences where safely portable.

The SERA-first migration should not require a holder to create a new identity, new wallet or new keys solely because the interface changes.

## 18. Data Migration

Only the minimum new state required for SERA should be introduced.

New Phase 1 state may include:

- holder voice profile;
- alias / pronunciation map;
- SERA preference profile;
- presentation privacy preferences;
- contextual memory classes;
- device trust records;
- evidence references;
- proactive monitoring grants.

Sensitive state should be separated from general conversational memory.

## 19. User Education

The migration should teach the holder three distinctions clearly:

1. **SERA can suggest.**
2. **SERA can prepare.**
3. **SERA can only act when authority exists.**

The product should avoid anthropomorphic UI patterns that imply SERA has independent ownership of the wallet.

The holder remains the principal.

## 20. Phase 1 Reference Product Flow

A representative Phase 1 interaction:

```text
Holder:
“Send Jane $500 in USDC.”

SERA:
1. resolves Jane;
2. finds USDC across supported chains;
3. checks recipient compatibility;
4. compares fees and route risk;
5. prepares Polygon route;
6. presents a concealed approval card if privacy mode is active;
7. holder reveals details;
8. holder reviews amount, recipient and network;
9. Trust Protocol / REV evaluate;
10. holder authenticates;
11. isolated signer signs;
12. transaction executes;
13. receipt and evidence are recorded.
```

The AI improves orchestration without replacing deterministic controls.

## 21. Phase 1 Reference Credential Flow

```text
Verifier requests age eligibility proof
  -> SERA identifies request
  -> credential engine finds eligible credential
  -> SERA explains what is requested
  -> minimum disclosure is prepared
  -> concealed-detail mode applies if configured
  -> holder reveals / reviews
  -> holder approves
  -> proof generated
  -> verifier receives proof
  -> evidence record generated
```

## 22. Release Sequencing

Recommended release order:

### R0: Internal Architecture Prototype

- typed intents;
- Context Broker;
- capability registry;
- simulated policy / REV;
- transaction preparation;
- evidence chain;
- no production execution changes.

### R1: Internal Wallet Integration

- existing wallet state connected to SERA;
- read-only queries;
- voice profile;
- contextual workspace;
- spam/news signals.

### R2: Controlled Execution Preparation

- send / swap preparation;
- multi-chain recommendation;
- credential presentation preparation;
- concealed-detail approval UI.

### R3: Controlled Production Cohort

- real signing path;
- Trust Protocol / REV;
- evidence;
- limited user cohort;
- aggressive monitoring and rollback.

### R4: SERA-First Opt-In

- user-selectable SERA-first home;
- conventional home remains available.

### R5: SERA-First Default

- only after release gates are passed.

### R6: Delegation Pilot

- limited bounded mandates;
- explicit cohort enrollment.

### R7: Phase 2 Wearables

- Apple Watch and Wear OS deployment using already-established cross-device contracts.

## 23. Working Decisions

**D01.** Phase 1 does not require broad autonomous execution.  
**D02.** SERA becomes the primary coordinator without removing deterministic wallet access.  
**D03.** Existing wallet keys, identity, credentials and history must survive the migration unchanged.  
**D04.** Concealed-detail presentation is a Phase 1 core feature.  
**D05.** Voice adaptation is Phase 1, but voice is not standalone authorization.  
**D06.** Multi-chain intelligence is Phase 1 because the wallet already supports multiple chains.  
**D07.** Spam filtering becomes a SERA risk signal in Phase 1.  
**D08.** Existing news integrations may support Phase 1 contextual intelligence.  
**D09.** Delegated payments and conditional automation begin feature-flagged.  
**D10.** Wearables remain a Phase 2 product launch but Phase 1 architecture requirement.  
**D11.** Every migration stage must preserve rollback to a usable deterministic wallet.  
**D12.** SERA-first default is gated by safety, reliability, privacy and functional-parity evidence.  
**D13.** The holder remains the principal; SERA does not acquire authority through use or personalization.  
**D14.** Phase 1 should prove orchestration quality before expanding autonomy.  
**D15.** Architecture-by-ambition is explicitly rejected as a release strategy.

## 24. Inputs to the Next Architecture Stage

DB16 provides controlled input to:

- SSW-AI-01 Platform Capability & Constraint Architecture;
- SSW-AI-02 SERA Interaction, Intent & Authority Architecture;
- production backlog definition;
- UX prototype scope;
- integration plan for the current Soul Super Wallet;
- release-gate definition;
- Phase 1 engineering plan;
- Phase 2 wearable architecture.

## 25. Recommended Next Artifact

The drawing-board series has now covered experience, feasibility, privacy, journeys, contracts, memory, proactivity, autonomy, evidence, resilience, runtime control, API/state sequences, deployment topology and release scope.

The next logical artifact should be:

**SSW-SERA-DB17: Consolidated Architecture Decision Register, Open Questions & Pre-Freeze Gap Review**

Its purpose should be to consolidate decisions from DB01 through DB16, identify contradictions, list unresolved architecture questions, mark assumptions that still require validation, and determine whether the program is ready to freeze the first formal architecture documents `SSW-AI-01` and `SSW-AI-02`.

---

## SOURCE 19
**Path:** `docs/design/SSW-SERA-DB17-Consolidated-Architecture-Decision-Register-Open-Questions-and-Pre-Freeze-Gap-Review.md`  
**Blob SHA:** `382554d79c93a2821458568d583c03e355e1a521`

# SSW-SERA-DB17: Consolidated Architecture Decision Register, Open Questions & Pre-Freeze Gap Review

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB17  
**Status:** Pre-Freeze Architecture Review  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA  

## 1. Purpose

This document consolidates the controlled design-board work from DB01 through DB16 and determines whether the SSW-SERA program is ready to move from exploratory design into formal architecture freeze.

The immediate freeze targets are:

- **SSW-AI-01: Platform Capability & Constraint Architecture**
- **SSW-AI-02: SERA Interaction, Intent & Authority Architecture**

The objectives of DB17 are to:

1. establish one consolidated architecture decision register;
2. identify contradictions, overlaps and unresolved assumptions;
3. classify open questions by architectural impact;
4. distinguish Phase 1 blockers from implementation detail and Phase 2 concerns;
5. define pre-freeze closure criteria;
6. identify which design-board outputs become normative inputs to SSW-AI-01 and SSW-AI-02.

DB17 does not replace DB01-DB16. It governs how they are interpreted together.

## 2. Consolidated System Direction

The program has converged on the following system-level direction:

> Soul Super Wallet evolves from a navigation-led wallet with an embedded assistant into a SERA-first wallet in which SERA is the primary interaction and orchestration layer, while cryptographic authority, policy enforcement, Trust Protocol, REV, authentication, signing and execution remain deterministically separated from the AI layer.

The resulting product model is:

```text
Holder
  |
  v
SERA Experience Layer
  |
  v
Intent + Context + Planning
  |
  v
Deterministic Action Object
  |
  v
Authority + Device Trust + Risk + Policy
  |
  v
Trust Protocol
  |
  v
REV
  |
  v
Holder Review / Mandate Validation
  |
  v
Authentication + Signing Boundary
  |
  v
Execution
  |
  v
Evidence + Receipt + Post-State
```

SERA may coordinate the system. SERA is not the security root.

## 3. Consolidated Architecture Decision Register

The following decisions are treated as stable unless explicitly reopened.

| ID | Decision | Status | Primary Source |
|---|---|---|---|
| ADR-001 | SERA becomes the primary wallet interaction and orchestration layer rather than a separate AI tab. | Accepted | DB03, DB16 |
| ADR-002 | Existing wallet capabilities are preserved where practical; coordination moves from manual navigation to SERA orchestration. | Accepted | DB02, DB16 |
| ADR-003 | Generative AI is outside the cryptographic signing boundary. | Accepted | DB04, DB05, DB13 |
| ADR-004 | Free-form natural language must be converted into deterministic typed intents before consequential execution. | Accepted | DB05, DB07, DB13 |
| ADR-005 | AI confidence is never sufficient authorization. | Accepted | DB05 |
| ADR-006 | Voice is a first-class interaction channel but not a standalone authorization mechanism. | Accepted | VOICE-01, DB05 |
| ADR-007 | Ambiguity may delay an action but must not silently move money or disclose identity claims. | Accepted | VOICE-01, DB05 |
| ADR-008 | Delegated authority must be explicit, scoped, expiring where appropriate, revocable and machine-enforceable. | Accepted | DB05, DB10 |
| ADR-009 | Repeated holder behavior must not silently become delegated authority. | Accepted | DB10 |
| ADR-010 | Trust Protocol evaluates identity, authority, delegation and policy; REV remains the runtime pass/fail control gate for consequential actions where required. | Accepted | DB05, DB13 |
| ADR-011 | Device possession does not imply unrestricted authority. Authority is scoped per registered device. | Accepted | DB04A, DB05 |
| ADR-012 | Wearables are a Phase 2 product surface but a Phase 1 architecture constraint. | Accepted | DB04A, DB16 |
| ADR-013 | Wearables do not automatically inherit full phone authority. | Accepted | DB04A, DB05 |
| ADR-014 | Holder context is mediated by a Context Broker using classification, purpose checks, minimization and redaction. | Accepted | DB05, DB08 |
| ADR-015 | SERA personalization may influence interpretation and recommendations but cannot create authority. | Accepted | DB08 |
| ADR-016 | Raw private keys, seed phrases and signing secrets never enter SERA model context or conversational memory. | Accepted | DB05, DB15 |
| ADR-017 | Sensitive holder memory and authorization state are separated from conversational memory. | Accepted | DB05, DB08 |
| ADR-018 | Raw holder voice recordings are not a Soulverse data asset by default; local-first adaptation is preferred. | Accepted | VOICE-01, DB08 |
| ADR-019 | External intelligence may influence context, recommendations and risk, but cannot independently authorize execution. | Accepted | DB05, DB09 |
| ADR-020 | Spam-token filtering evolves from UI suppression into an explainable risk signal that may feed policy, Trust Protocol or REV. | Accepted | DB05, DB09 |
| ADR-021 | Multi-chain network selection is a material execution decision, not a cosmetic preference. | Accepted | DB05, DB07 |
| ADR-022 | Proactivity may create awareness and prepare action but does not create authority. | Accepted | DB09 |
| ADR-023 | SERA autonomy exists only through holder-issued bounded mandates, never as an inherent AI privilege. | Accepted | DB10 |
| ADR-024 | Every consequential action must generate reconstructable execution evidence. | Accepted | DB11 |
| ADR-025 | Explainability uses structured facts, reason codes and policy references rather than hidden model reasoning. | Accepted | DB11 |
| ADR-026 | Concealed-detail presentation is a Phase 1 privacy control across alerts, approvals, transaction previews, voice and wearables. | Accepted | DB11A, DB16 |
| ADR-027 | Reveal and Approve are separate actions. Revealing hidden transaction details does not imply consent. | Accepted | DB11A, DB12, DB14 |
| ADR-028 | High-risk actions may require authenticated reveal before approval. | Accepted | DB11A |
| ADR-029 | Uncertain execution must enter reconciliation, never blind retry. | Accepted | DB12, DB14 |
| ADR-030 | Where required safety dependencies such as REV are unavailable, protected actions fail closed unless an explicit offline policy permits otherwise. | Accepted | DB12 |
| ADR-031 | Existing wallet functionality must remain available during migration and serve as a controlled fallback. | Accepted | DB16 |
| ADR-032 | SERA-first migration is staged, feature-flagged and reversible. | Accepted | DB16 |
| ADR-033 | The system is divided into trust zones so no single zone holds AI context, authority state, execution path and signing capability together. | Accepted | DB15 |
| ADR-034 | Cross-device tasks preserve one action lineage and evidence graph rather than becoming independent sessions. | Accepted | DB06, DB11, DB14 |
| ADR-035 | Consequential actions use deterministic canonical action objects and idempotency controls. | Accepted | DB07, DB12, DB14 |
| ADR-036 | Emergency lock, device revocation, delegation revocation and read-only fallback must remain accessible even when SERA is degraded. | Accepted | DB05, DB12 |

## 4. Architecture Invariants

The following are stronger than implementation preferences. They are system invariants.

### INV-01: AI cannot sign

No SERA model, planner or conversational component receives unrestricted access to private keys or signing handles.

### INV-02: Natural language cannot directly execute

A free-form request must become a validated canonical action object before entering the control plane.

### INV-03: Recommendation is not consent

Recommendations, predictions, previous behavior and personalization never become holder authorization by implication.

### INV-04: Reveal is not approval

The conceal/reveal state is a presentation choice. Approval is a distinct authority event.

### INV-05: Delegation is explicit

Autonomous execution must reference a valid mandate or equivalent formal authority object.

### INV-06: Authority is device-aware

A trusted device is trusted only for the capabilities and assurance level explicitly granted to it.

### INV-07: Uncertainty cannot silently escalate authority

Lower model, voice, entity, route or execution confidence increases friction rather than increasing discretion.

### INV-08: Failure must be reconstructable

Blocked, failed, uncertain and successful actions all create evidence-bearing outcomes.

### INV-09: External content is data, not instruction

News, token metadata, dApps, websites, merchant data, credential metadata and other external content cannot elevate model or execution privileges.

### INV-10: Security-critical controls remain available without SERA

Emergency protections and deterministic wallet controls cannot depend solely on an AI runtime.

## 5. Consolidated Product Surface Model

The emerging interaction model is:

**Ambient SERA + Conversational Shell + Adaptive Workspace + Inspectable Wallet State**

The product therefore has four simultaneous surfaces:

1. **Ambient SERA** for alerts, summaries, contextual prompts and proactive intelligence.
2. **Conversational Shell** for voice and text interaction.
3. **Adaptive Workspace** for structured review, forms, transactions, proofs and context-specific actions.
4. **Inspectable Wallet State** for balances, assets, credentials, transaction history, settings and security state.

The wallet must not become chat-only. Structured state remains inspectable and directly accessible.

## 6. Consolidated Authority Model

Authority remains classified as:

| Class | Meaning | Example |
|---|---|---|
| A0 | Informational | explain balance, summarize news |
| A1 | Retrieval / preparation | locate credential, prepare transfer |
| A2 | Explicit approval execution | send, swap, present proof |
| A3 | Bounded delegated execution | recurring capped payment |
| A4 | Conditional autonomous execution | policy-constrained standing mandate |
| A5 | Prohibited autonomous authority | seed export, unrestricted recovery changes |

This model is sufficiently stable for SSW-AI-02.

## 7. Consolidated Risk Model

The current risk model is:

| Class | Meaning | Typical Controls |
|---|---|---|
| R0 | public informational | none / minimal |
| R1 | personal read-only | session/device checks |
| R2 | preparatory/reversible | validation, optional confirmation |
| R3 | moderate consequence | explicit approval or valid mandate |
| R4 | high consequence | stronger review, authentication, REV |
| R5 | critical/root authority | strongest controls, often non-delegable |

Risk remains dynamic. The same nominal action may move classes based on amount, novelty, recipient familiarity, chain risk, threat intelligence, device state and mandate context.

## 8. Consolidated Runtime Contract

The pre-freeze runtime contract is:

```text
Input
 -> Intent Resolution
 -> Entity Resolution
 -> Context Broker
 -> Action Normalization
 -> Capability Check
 -> Tool Selection
 -> Authority Resolution
 -> Device Trust Check
 -> Risk Classification
 -> Policy Evaluation
 -> Trust Protocol
 -> REV
 -> Presentation / Concealed Detail Policy
 -> Required Holder Review
 -> Authentication
 -> Signing Boundary
 -> Execution Adapter
 -> Reconciliation
 -> Evidence Bundle
 -> Receipt / Post-State
```

This sequence may short-circuit for low-risk A0/A1 actions, but no consequential action may skip its required gates.

## 9. Open Questions Requiring Closure Before Freeze

The following questions materially affect SSW-AI-01 or SSW-AI-02 and should be closed before candidate freeze.

### FQ-01: Canonical Phase 1 SERA Runtime Placement

**Question:** Which SERA functions are guaranteed on-device in Phase 1, and which may execute in a Soulverse-controlled cloud runtime?

**Why it matters:** Affects latency, privacy, degraded behavior, voice, context handling and deployment boundaries.

**Required closure:** Define minimum local runtime responsibilities and cloud-optional responsibilities.

**Blocks:** SSW-AI-01.

### FQ-02: Model Provider Abstraction

**Question:** Will Phase 1 formally support multiple AI model providers behind a provider-neutral abstraction, or ship with one provider while preserving abstraction?

**Why it matters:** Affects data routing, model fallback, privacy controls, observability and vendor dependency.

**Required closure:** Architecture must define the abstraction even if only one provider is initially active.

**Blocks:** SSW-AI-01 at interface level, not provider selection.

### FQ-03: Trust Protocol / REV Availability Contract

**Question:** What are the exact service availability and latency assumptions for Trust Protocol and REV in Phase 1?

**Why it matters:** Consequential actions depend on deterministic behavior when these services are unavailable or slow.

**Required closure:** Define fail-closed defaults, cached-policy boundaries and explicit operations permitted without live REV.

**Blocks:** SSW-AI-01 and SSW-AI-02.

### FQ-04: Canonical Mandate Format

**Question:** What becomes the normative schema and signature format for SERA delegated authority objects?

**Why it matters:** A3/A4 authority depends on interoperable, versioned mandate semantics.

**Required closure:** Freeze required fields, signature binding, versioning, revocation and evidence references.

**Blocks:** SSW-AI-02 for delegated authority sections; implementation can continue with provisional schema if clearly marked.

### FQ-05: Canonical Device Trust Model

**Question:** What exact attestation sources and assurance levels define REGISTERED, ATTESTED, TRUSTED, LIMITED, SUSPENDED and REVOKED device states?

**Why it matters:** Device-scoped authority is already a core invariant.

**Required closure:** Freeze state semantics even if platform-specific attestation adapters remain implementation-specific.

**Blocks:** SSW-AI-02.

### FQ-06: Concealed Detail Default Policy

**Question:** Is concealed-detail mode opt-in globally, opt-out globally, or risk/device-adaptive by default?

**Why it matters:** Affects notifications, lock screen, voice, wearables and approval UX.

**Required closure:** Freeze system behavior with holder overrides. Recommended design direction: risk/device-adaptive default with persistent holder preference and per-instance override.

**Blocks:** SSW-AI-02 presentation/privacy behavior.

### FQ-07: Phase 1 Delegated Execution Boundary

**Question:** Which A3/A4 use cases, if any, ship in the first public Phase 1 release?

**Why it matters:** Architecture supports them, but release scope and assurance requirements differ substantially.

**Required closure:** Separate architecture support from launch enablement. A3 may be feature-flagged; A4 should remain restricted until assurance gates are met unless explicitly approved.

**Blocks:** DB16 release plan, not core SSW-AI-01 architecture.

### FQ-08: Wallet Recovery Interaction with SERA Memory

**Question:** Which SERA preferences, voice-adaptation data, aliases, learned context and mandates recover with Soul ID/wallet recovery?

**Why it matters:** Recovery can accidentally restore stale authority or expose sensitive behavioral context.

**Required closure:** Separate recoverable preferences from sensitive authority state and device-bound secrets.

**Blocks:** SSW-AI-01 memory/recovery boundaries and SSW-AI-02 authority recovery.

## 10. Open Questions That Do Not Block Initial Architecture Freeze

These may remain controlled implementation questions after SSW-AI-01/02 freeze.

### IQ-01: Exact AI model/provider selection

Provider choice can remain implementation-configurable if the abstraction, data contract and privacy policy are frozen.

### IQ-02: Exact vector / semantic memory technology

The architecture should freeze memory classes and access rules, not a specific vector database.

### IQ-03: Exact RPC vendors per blockchain

Freeze adapter and health/failover requirements rather than individual providers.

### IQ-04: Exact notification delivery provider

Freeze notification privacy and presentation contracts rather than infrastructure vendor.

### IQ-05: Exact evidence storage engine

Freeze immutability, integrity, selective disclosure and retention properties rather than one database product.

### IQ-06: Exact wearable implementation details

Wearables remain Phase 2; Phase 1 must only preserve the required abstractions and trust model.

### IQ-07: Exact external news/LinkedIn enrichment policies

Provider-specific confidence and data-use policies can remain configurable if the external-intelligence boundary is frozen.

## 11. Contradiction Review

### 11.1 SERA-First vs Wallet Inspectability

**Potential conflict:** A SERA-first product could imply elimination of traditional wallet screens.

**Resolution:** No contradiction. SERA is the default coordinator, while balances, credentials, transaction history, security settings and deterministic wallet controls remain inspectable and directly accessible.

### 11.2 Voice-First vs Strong Authorization

**Potential conflict:** Voice convenience could imply voice authorization.

**Resolution:** Voice is an interaction and intent channel. Authentication and signing remain separate.

### 11.3 Proactive Intelligence vs User Control

**Potential conflict:** SERA monitoring could drift into autonomous behavior.

**Resolution:** Monitoring creates signals and recommendations. Authority requires holder approval or an explicit mandate.

### 11.4 Personalization vs Privacy

**Potential conflict:** A highly personal SERA could require centralized behavioral profiling.

**Resolution:** Personalization is partitioned into memory classes, mediated by the Context Broker and local-first where sensitive. Personalization does not imply unlimited storage.

### 11.5 Cross-Device Continuity vs Device-Specific Authority

**Potential conflict:** A task may move seamlessly between devices while authority differs by device.

**Resolution:** Task state is portable; authority is not. The receiving device must independently satisfy its required trust and authorization level.

### 11.6 Concealed Detail vs Informed Approval

**Potential conflict:** Hidden transaction details could undermine meaningful consent.

**Resolution:** High-risk actions may require reveal before authorization. Reveal and Approve remain separate recorded events.

### 11.7 Offline Resilience vs REV Dependency

**Potential conflict:** Resilience suggests continued operation; REV may be required online.

**Resolution:** Read-only and explicitly allowed offline operations continue. Protected consequential operations fail closed unless a pre-defined offline policy permits them.

### 11.8 AI Routing vs Deterministic Execution

**Potential conflict:** SERA may select chain/routes, but execution must be deterministic.

**Resolution:** AI may compare and recommend; route choice becomes a canonical structured object that is revalidated before signing.

## 12. Gap Review by Architecture Domain

### 12.1 Experience Architecture

**Status:** Mature enough for freeze.

Covered:
- SERA-first shell;
- adaptive workspaces;
- inspectable wallet state;
- voice/text interaction;
- proactive alerts;
- concealed details;
- fallback deterministic UI.

Remaining gap:
- final Phase 1 navigation/surface map should be created during detailed UX specification, not as a blocker to SSW-AI-01/02.

### 12.2 Intent and Tooling Architecture

**Status:** Mature enough for freeze.

Covered:
- typed intents;
- capability registry;
- tool registry;
- action contracts;
- ambiguity handling;
- idempotency.

Remaining gap:
- formal versioned schema package is implementation work after architectural freeze.

### 12.3 Authority Architecture

**Status:** Near freeze, with targeted closure required.

Covered:
- A0-A5;
- direct approval;
- delegated authority;
- device scope;
- risk-adaptive control;
- Trust Protocol;
- REV.

Required closure:
- canonical mandate schema;
- device trust assurance states;
- REV availability contract.

### 12.4 Memory and Privacy Architecture

**Status:** Mature enough for freeze with recovery clarification.

Covered:
- M0-M4 memory classes;
- Context Broker;
- local-first sensitive processing;
- voice adaptation;
- cloud minimization;
- data classification D0-D8.

Required closure:
- recovery/portability behavior for M2-M4 classes.

### 12.5 Execution Architecture

**Status:** Mature enough for freeze.

Covered:
- isolated signer;
- execution adapters;
- multi-chain routing;
- reconciliation;
- uncertain state;
- replay protection;
- WalletConnect boundaries.

Remaining gap:
- chain-specific adapter certification belongs to implementation assurance.

### 12.6 Evidence and Explainability Architecture

**Status:** Mature enough for freeze.

Covered:
- evidence graph;
- reason codes;
- receipts;
- selective disclosure;
- cross-device lineage;
- voice evidence;
- autonomous execution evidence.

Remaining gap:
- exact retention periods should remain policy/jurisdiction configurable.

### 12.7 Resilience Architecture

**Status:** Mature enough for freeze with REV contract closure.

Covered:
- AI failure;
- network loss;
- RPC/provider outage;
- stale data;
- uncertain submission;
- cross-device divergence;
- emergency controls;
- failover;
- circuit breakers.

### 12.8 Deployment Architecture

**Status:** Mature enough for SSW-AI-01 after local/cloud responsibility closure.

Covered:
- trust zones;
- service identities;
- data stores;
- execution boundary;
- intelligence isolation;
- evidence isolation;
- operational zone.

Required closure:
- minimum guaranteed on-device runtime;
- cloud-runtime responsibility split.

### 12.9 Wearables

**Status:** Correctly deferred as Phase 2 surface with Phase 1 obligations.

No freeze blocker if the device-neutral contracts remain in SSW-AI-01/02.

## 13. Inputs to SSW-AI-01

SSW-AI-01 should absorb and formalize the following:

- platform capability constraints from DB04;
- wearable foundation constraints from DB04A;
- privacy/trust boundaries from DB05;
- memory/context architecture from DB08;
- proactive monitoring boundaries from DB09;
- resilience/degraded mode from DB12;
- runtime control plane from DB13;
- API/state-machine constraints from DB14;
- service topology/trust zones from DB15;
- Phase 1 scope and migration boundaries from DB16;
- closed pre-freeze decisions from DB17.

SSW-AI-01 should become the formal system/platform architecture specification.

## 14. Inputs to SSW-AI-02

SSW-AI-02 should absorb and formalize:

- adaptive SERA experience from DB03;
- journey semantics from DB06;
- intent/capability/tool contract from DB07;
- authority classes from DB05/DB10;
- risk model from DB05;
- voice interpretation boundaries from VOICE-01;
- personalization boundaries from DB08;
- proactive alert interaction from DB09;
- delegated authority from DB10;
- evidence-visible interaction requirements from DB11;
- concealed-detail controls from DB11A;
- runtime gating and approval behavior from DB13/DB14;
- release scope from DB16;
- closed pre-freeze decisions from DB17.

SSW-AI-02 should become the formal interaction, intent, authority and execution-behavior specification.

## 15. Pre-Freeze Closure Plan

Before declaring Candidate Freeze for SSW-AI-01/02, close the following eight items:

1. minimum guaranteed on-device SERA runtime;
2. cloud-runtime responsibility boundary;
3. provider-neutral model abstraction contract;
4. REV / Trust Protocol degraded availability contract;
5. canonical delegated mandate schema;
6. canonical device trust state semantics;
7. concealed-detail default policy;
8. SERA memory recovery and portability behavior.

These are narrow enough that they should be resolved in one controlled pre-freeze closure artifact rather than reopening broad design exploration.

## 16. Recommended Next Artifact

Create:

**SSW-SERA-DB18: Pre-Freeze Closure Decisions & Candidate Architecture Baseline**

DB18 should resolve the eight closure items in Section 15 and produce a formal statement of readiness for:

- **SSW-AI-01 Candidate Freeze Draft**
- **SSW-AI-02 Candidate Freeze Draft**

DB18 should not introduce new product concepts unless a blocking contradiction is discovered. Its purpose is closure.

## 17. Pre-Freeze Readiness Assessment

Current assessment:

- **Experience model:** Ready
- **Intent model:** Ready
- **Authority model:** Ready with targeted closure
- **Voice safety model:** Ready
- **Memory/context model:** Ready with recovery clarification
- **Proactive intelligence model:** Ready
- **Delegated autonomy model:** Ready with mandate-schema closure
- **Evidence model:** Ready
- **Concealed-detail privacy control:** Ready
- **Resilience model:** Ready with REV availability closure
- **Runtime control plane:** Ready
- **API/state-machine model:** Ready
- **Deployment topology:** Ready with local/cloud split closure
- **Wearable foundation:** Ready for Phase 1 architectural inclusion
- **Migration/release model:** Ready

The program is therefore **ready to enter pre-freeze closure**, but not yet ready to label SSW-AI-01 or SSW-AI-02 frozen until the Section 15 items are resolved.

## 18. Closing Principle

The design work has converged around one architectural principle:

> SERA should make the wallet feel increasingly intelligent, contextual and effortless while every consequential action becomes more explicit, bounded, inspectable and recoverable beneath the surface.

That balance between intelligence and enforceable authority is the defining architecture of the SSW-SERA program.


---

## SOURCE 20
**Path:** `docs/design/SSW-SERA-DB17A-SERA-DID-Identity-State-Manifest-and-Encrypted-Portable-State-Architecture.md`  
**Blob SHA:** `f7ace05f99f005c0fecd5097ac35258d897c9e1c`

# SSW-SERA-DB17A: SERA DID Identity, State Manifest & Encrypted Portable State Architecture

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB17A  
**Status:** Controlled Design Board / Pre-Freeze Closure Input  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

This document defines the persistent identity, recovery, portability, state versioning, encrypted backup and runtime-instance model for SERA.

It resolves a key pre-freeze question: whether SERA should be backed up to conventional cloud infrastructure, to IPFS, or against the holder's decentralized identity.

The architectural conclusion is that these are not equivalent choices and should not be collapsed into one storage decision.

The governing principle is:

> SERA is recovered through identity, not through an account.

SERA identity, SERA portable state, and SERA runtime instances are separate architectural objects with different trust, storage and recovery requirements.

## 2. Core Architectural Decision

SERA SHALL possess a persistent agent DID linked to and governed by the holder's Soul ID.

Conceptually:

```text
did:soul:holder
      |
      | controls / delegates to
      v
did:soul:agent:sera
```

The SERA DID SHALL be independent of:

- the physical device;
- mobile operating system;
- wearable platform;
- AI model provider;
- cloud provider;
- storage provider;
- application installation;
- local runtime process.

SERA's identity SHALL therefore survive device replacement, model-provider replacement, application migration and backend migration.

## 3. Holder DID and SERA DID Relationship

The holder remains the principal.

The holder DID establishes the root identity relationship. The SERA DID represents the holder-bound AI agent.

The relationship SHALL support:

- holder control or delegated control;
- explicit agent identity;
- cryptographic verification methods;
- capability references;
- device/runtime bindings;
- authority and delegation references;
- revocation;
- rotation;
- recovery;
- audit linkage.

The SERA DID MUST NOT itself imply unrestricted wallet authority.

Identity establishes who SERA is. Authority determines what a specific SERA runtime may do.

## 4. SERA Identity Is Not SERA Memory

The SERA DID SHOULD remain compact and identity-oriented.

It SHOULD NOT directly contain:

- conversational memory;
- financial history;
- balances;
- credential claims;
- voice recordings;
- voice biometrics;
- behavioral history;
- transaction details;
- raw personalization state;
- private wallet keys;
- seeds or recovery secrets.

These belong in separate protected state or evidence domains.

## 5. Three Separate Persistence Domains

The architecture SHALL distinguish:

### 5.1 Identity Domain

Persistent SERA identity and holder relationship.

Examples:

- `did:soul:agent:sera`;
- controller/delegation relationship;
- verification methods;
- service references;
- revocation state.

### 5.2 Portable State Domain

Holder-specific state required to restore SERA continuity.

Examples:

- preferences;
- aliases;
- pronunciation adaptations;
- language preferences;
- approved personalization;
- interaction preferences;
- notification preferences;
- concealed-detail preferences;
- non-secret runtime configuration;
- holder-approved memory classes.

### 5.3 Evidence Domain

Historical record of what SERA did.

This domain is governed by DB11 and DB17B and SHALL NOT be merged into portable conversational memory.

## 6. SERA State Manifest

Portable SERA state SHALL be referenced through a signed and versioned State Manifest.

Illustrative structure:

```json
{
  "type": "SERAStateManifest",
  "sera_did": "did:soul:agent:sera:...",
  "holder_did": "did:soul:...",
  "state_version": 27,
  "previous_state_cid": "bafy...",
  "current_state_cid": "bafy...",
  "created_at": "...",
  "encryption_profile": "SSW-SERA-STATE-ENC-1",
  "schema_version": "1.0",
  "authorized_recovery_policy_ref": "...",
  "signature": "..."
}
```

The manifest SHALL establish:

- SERA identity;
- holder relationship;
- current authorized state version;
- previous state lineage where retained;
- schema version;
- encryption profile;
- recovery policy reference;
- signature or equivalent integrity protection.

## 7. Content-Addressed Portable State

Portable state SHOULD use content-addressed storage so that modification produces a new immutable content identifier.

IPFS is an appropriate persistence mechanism for encrypted portable state because it supports content-addressed objects and location-independent retrieval.

However:

> IPFS is a storage and distribution substrate, not an authorization system and not a confidentiality boundary.

Therefore all holder-sensitive SERA state SHALL be encrypted before publication to IPFS or any equivalent content-addressed network.

## 8. Hybrid Persistence Model

The recommended persistence model is:

```text
Holder DID
   |
   v
SERA DID
   |
   v
Signed State Manifest
   |
   v
Encrypted State CID
   |
   +--> IPFS / content-addressed persistence
   +--> encrypted cloud replica
   +--> local device copy / cache
```

No single storage provider SHALL be authoritative for SERA identity.

Cloud persistence MAY be used for:

- availability;
- redundancy;
- low-latency restoration;
- synchronization;
- disaster recovery.

Cloud storage SHALL NOT become the source of identity or authority.

## 9. Persistence and Pinning

Content addressing does not itself guarantee long-term persistence.

The implementation SHALL therefore define a persistence policy that may include:

- Soulverse-operated IPFS pinning;
- multiple independent pinning providers;
- encrypted cloud object storage;
- holder-controlled local copies;
- recovery export packages;
- periodic availability verification.

Loss of a single persistence provider MUST NOT destroy the holder's SERA state where redundancy policy is satisfied.

## 10. Portable State Bundle

The encrypted state bundle SHOULD be logically compartmentalized.

Illustrative structure:

```text
sera-state/
    identity-metadata/
    preferences/
    language/
    voice-adaptation/
    aliases/
    approved-memory/
    wallet-context-preferences/
    counterparty-aliases/
    automation-preferences/
    notification-preferences/
    concealed-detail-preferences/
    ui-preferences/
```

The physical encoding MAY use CAR/IPLD or another canonical structured format suitable for content-addressed storage.

## 11. Data That MUST NOT Be Stored as Portable SERA State

The portable state bundle MUST NOT contain ordinary copies of:

- wallet private keys;
- seed phrases;
- raw recovery phrases;
- device Secure Enclave keys;
- Android keystore private keys;
- biometric templates;
- unrestricted signing handles;
- raw Trust Protocol secrets;
- privileged REV secrets;
- raw identity-document images unless separately governed;
- raw voice recordings by default.

These remain within their appropriate cryptographic, biometric, credential or evidence domains.

## 12. Memory Classes and Backup Policy

SERA memory SHALL be classified before inclusion in portable state.

Suggested classes:

| Class | Description | Portable Backup |
|---|---|---|
| M0 | Ephemeral reasoning / transient context | No |
| M1 | Session context | No, unless explicit continuation policy |
| M2 | Holder preferences | Yes, encrypted |
| M3 | Learned holder context such as aliases and pronunciations | Yes, encrypted |
| M4 | Sensitive structured context | Separate protected storage / policy governed |
| M5 | Execution evidence and audit history | No, separate evidence architecture |

This prevents conversational convenience from becoming uncontrolled data accumulation.

## 13. Voice Adaptation Portability

Voice adaptation SHOULD be portable where the holder enables it.

Portable voice state may include:

- pronunciation corrections;
- vocabulary adaptation;
- accent adaptation parameters;
- preferred language and code-switching patterns;
- holder-approved aliases;
- correction history summaries.

Raw voice recordings SHOULD NOT be required for normal SERA restoration.

Voice biometric material, if ever used, SHALL be governed separately from general voice adaptation.

## 14. SERA DID Is Not a Runtime Instance

A persistent SERA DID may have multiple runtime instances.

Example:

```text
SERA DID
   |
   +-- Primary phone runtime
   +-- Secondary phone runtime
   +-- Apple Watch runtime
   +-- Wear OS runtime
   +-- protected cloud reasoning runtime
```

Each runtime SHALL have its own:

- runtime identifier;
- device/environment binding;
- trust state;
- capability scope;
- authority scope;
- attestation state where supported;
- lifecycle state;
- revocation state.

No runtime inherits unrestricted authority merely because it is associated with the SERA DID.

## 15. Example Runtime Authority Model

```text
SERA Agent DID
      |
      +-- Runtime A
      |     Device: Primary Phone
      |     Authority: Full interactive within policy
      |
      +-- Runtime B
      |     Device: Watch
      |     Authority: Limited / wearable-scoped
      |
      +-- Runtime C
            Environment: Protected Cloud
            Authority: Reasoning only
            Signing: NONE
```

This preserves identity continuity without collapsing device trust into agent identity.

## 16. Recovery Flow

Reference recovery sequence:

```text
New Device
   |
   v
Holder recovers / authenticates Soul ID
   |
   v
Resolve SERA DID
   |
   v
Resolve current signed State Manifest
   |
   v
Retrieve encrypted state bundle
   |
   v
Verify CID + manifest signature + version lineage
   |
   v
Satisfy recovery / decryption policy
   |
   v
Decrypt approved portable state
   |
   v
Register new runtime/device
   |
   v
Assign device-scoped authority
   |
   v
Restore SERA continuity
```

Recovery of SERA state SHALL NOT automatically restore unrestricted transaction authority.

Device registration and authority must be re-established according to device-trust and policy requirements.

## 17. Recovery Security

Recovery SHALL defend against:

- stale-state rollback;
- unauthorized manifest substitution;
- CID substitution;
- compromised storage providers;
- replayed recovery requests;
- unauthorized device registration;
- cross-holder state confusion;
- malicious state injection.

Minimum controls SHOULD include:

- signed manifest verification;
- holder/SERA DID binding verification;
- monotonically increasing or otherwise protected state versioning;
- previous-state lineage checks;
- authenticated decryption;
- device-registration controls;
- recovery event evidence.

## 18. State Versioning and Rollback

Each durable SERA state update SHALL produce a new version.

The system SHOULD preserve enough lineage to:

- verify continuity;
- detect rollback;
- recover from corrupt state;
- support limited holder-selected rollback where policy allows;
- preserve auditability of state transitions.

Rollback SHALL NOT rewrite action evidence.

## 19. Synchronization

Multiple SERA runtimes may need synchronized non-sensitive state.

Synchronization SHALL be policy-scoped and conflict-aware.

Examples:

- language preferences may sync broadly;
- concealed-detail preference may sync by device class;
- wearable authority SHALL NOT sync merely as a preference;
- delegated authority objects SHALL remain in the authority domain;
- execution evidence SHALL remain in the evidence domain.

## 20. Cloud Reasoning Boundary

A cloud SERA runtime MAY process holder-approved context for reasoning.

It MUST NOT receive unrestricted signing capability merely because it is a SERA runtime.

A cloud runtime SHOULD be treated as:

- an intelligence endpoint;
- a planning endpoint;
- a contextual reasoning endpoint;
- optionally a notification/orchestration endpoint.

It SHALL remain outside the private-key boundary.

## 21. Model Provider Independence

SERA identity SHALL not depend on any one model provider.

The portable state format SHOULD therefore avoid provider-specific opaque memory constructs wherever practical.

Holder state SHOULD be represented using Soulverse-controlled canonical schemas so that SERA can move between:

- local models;
- cloud models;
- future model providers;
- hybrid reasoning stacks.

## 22. Privacy Model

Portable state SHALL follow:

- local-first handling for sensitive data;
- encryption before remote persistence;
- purpose limitation;
- memory-class separation;
- holder-controlled deletion/reset where technically and legally possible;
- minimized metadata leakage;
- no use of portable state for model training without explicit holder consent.

## 23. IPFS Privacy Caveat

Even when payloads are encrypted, content identifiers and network-level retrieval metadata may reveal that an object exists or is being accessed.

Therefore the implementation SHOULD evaluate:

- private or controlled IPFS networks where appropriate;
- gateway privacy;
- encrypted manifests;
- indirection layers;
- rotating state objects;
- limited metadata exposure;
- holder-controlled retrieval patterns.

## 24. Deletion and Revocation

Because content-addressed systems may retain copies outside the holder's control, deletion SHALL be implemented primarily through cryptographic revocation and key destruction where necessary.

A revoked state object SHALL no longer be considered authoritative even if its ciphertext remains retrievable.

The active signed manifest SHALL determine the current authorized state.

## 25. Lost Device Scenario

If a device is lost:

1. revoke or suspend the device runtime;
2. preserve the SERA DID;
3. preserve portable state;
4. rotate affected device/runtime credentials;
5. recover on a new trusted device;
6. re-establish device-scoped authority;
7. retain evidence of the revocation and recovery process.

Losing a phone MUST NOT mean losing SERA identity.

## 26. SERA Replacement and Rebinding

The architecture SHOULD support a holder choosing to:

- reset SERA personality/personalization;
- create a new SERA agent DID;
- archive a prior SERA DID;
- transfer selected portable state to a new SERA instance;
- preserve historical evidence independently.

This prevents the SERA DID from becoming an irreversible lifetime lock-in.

## 27. Relationship to DB08

DB08 defines memory, context and personalization policy.

DB17A defines how the durable subset of that state is:

- identified;
- encrypted;
- versioned;
- stored;
- recovered;
- moved between devices and runtimes.

## 28. Relationship to DB11 and DB17B

Portable state and audit evidence SHALL remain separate.

SERA memory MAY help the agent assist the holder.

SERA evidence SHALL prove what the agent did.

The activity/evidence ledger MUST NOT depend on conversational memory for historical reconstruction.

## 29. Relationship to DB05 and DB13

The SERA DID does not grant execution authority by itself.

DB05 defines authority boundaries. DB13 defines runtime control-plane enforcement.

Therefore:

```text
SERA Identity
   !=
SERA Authority
   !=
Device Authority
   !=
Signing Authority
```

These remain separate control domains.

## 30. Candidate Architecture Decisions

**D17A-01** SERA SHALL have a persistent `did:soul:agent` identity linked to the holder's Soul ID.

**D17A-02** SERA identity SHALL be independent of device, model provider, cloud provider and storage provider.

**D17A-03** SERA DID SHALL NOT contain holder memory, financial history or raw sensitive state.

**D17A-04** Portable SERA state SHALL be represented as encrypted, versioned state objects referenced through signed manifests.

**D17A-05** Content-addressed storage such as IPFS SHOULD be used for portable-state integrity and location-independent recovery.

**D17A-06** IPFS content SHALL be encrypted before publication when it contains holder-specific SERA state.

**D17A-07** Cloud storage MAY provide redundancy and availability but SHALL NOT constitute the authoritative SERA identity or authority record.

**D17A-08** Multiple persistence mechanisms SHOULD be supported to avoid single-provider dependence.

**D17A-09** SERA runtime instances SHALL be separately identified and device/environment scoped.

**D17A-10** SERA DID association SHALL NOT cause a runtime to inherit unrestricted authority.

**D17A-11** Recovery of SERA state SHALL NOT automatically restore unrestricted signing or transaction authority.

**D17A-12** Private keys, seeds, raw recovery secrets and biometric templates SHALL NOT be ordinary portable SERA state.

**D17A-13** Durable holder memory SHALL be explicitly classified before backup.

**D17A-14** Execution evidence and audit history SHALL remain separate from conversational/personalization state.

**D17A-15** Model-provider-specific memory formats SHALL not become the canonical SERA state model.

**D17A-16** State revocation SHALL be governed by the active signed manifest and cryptographic policy, not by assumed deletion from every storage node.

## 31. Pre-Freeze Closure Result

DB17 identified "SERA memory recovery and portability rules" as a pre-freeze blocker.

DB17A resolves that blocker at architectural level.

The remaining implementation work includes:

- exact `did:soul:agent` document profile;
- State Manifest JSON schema;
- encryption and key-wrapping profile;
- CID/CAR encoding profile;
- pinning and redundancy policy;
- recovery proof protocol;
- synchronization conflict rules;
- runtime registration schema;
- portability test vectors.

These can proceed as controlled specifications after the core architecture is frozen.

## 32. Final Architectural Principle

> SERA's identity lives in the DID relationship. SERA's continuity lives in encrypted portable state. SERA's accountability lives in the evidence ledger. Storage providers may preserve these objects, but they do not become the holder's authority.