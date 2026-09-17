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
