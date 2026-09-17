# SSW-SERA-DB06
## End-to-End User Journeys, Agent Actions & Cross-Device Interaction Flows

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB06  
**Status:** Working Design Baseline  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA  

---

## 1. Purpose

This document pressure-tests the SSW-SERA design against realistic holder journeys rather than isolated features.

The objective is to verify that the emerging architecture can support a wallet where SERA is the primary operating interface while preserving inspectability, deterministic execution, privacy, security, multi-chain operation, identity and credential functionality, and future wearable support.

The journeys in this document are not final UI specifications. They are scenario models used to expose missing capabilities, unsafe assumptions, unclear authority boundaries, cross-device inconsistencies, and implementation dependencies.

---

## 2. Core Journey Principle

The target interaction model is:

```text
Holder intent
   ↓
SERA understanding
   ↓
Context assembly
   ↓
Intent + entity resolution
   ↓
Authority + risk evaluation
   ↓
Plan / recommendation / action preparation
   ↓
Holder inspection where required
   ↓
Trust Protocol / REV decision where applicable
   ↓
Authentication / authorization
   ↓
Deterministic execution
   ↓
Evidence / receipt / updated state
```

SERA may simplify interaction, but SERA must not become an opaque execution boundary.

---

## 3. Surfaces Considered

Phase 1:

- iOS main app
- Android main app
- iOS widgets / Live Activities / Control Center / notifications
- Android widgets / notifications / bubbles / quick actions
- voice
- text

Phase 2 foundation-aware:

- Apple Watch
- Wear OS
- complications
- Tiles
- wearable notifications
- low-risk approvals
- credential presentation
- device-scoped voice invocation

---

## 4. Cross-Journey State Model

Each SERA interaction should track at minimum:

```text
session_id
holder_id
soul_id
sera_instance_id
source_device_id
source_surface
interaction_mode
intent
resolved_entities
context_snapshot
risk_class
required_authority
required_confirmation
rev_decision
signing_status
execution_status
evidence_refs
```

The same journey must remain coherent when it begins on one surface and completes on another.

Example:

```text
Watch notification
   ↓
Holder asks SERA for detail
   ↓
Phone opens adaptive workspace
   ↓
Holder authorizes
   ↓
Phone signs
   ↓
Watch receives completion status
```

---

# JOURNEY 1: Morning Wallet Briefing

## 5. Trigger

Holder asks:

> “SERA, anything I should know?”

or receives a permitted proactive briefing.

## 5.1 Context sources

- wallet balances
- recent transactions
- pending approvals
- spam token filter output
- credential expiry state
- news API
- market / protocol signals
- relevant LinkedIn-derived context if explicitly permitted
- Trust Protocol / security alerts

## 5.2 SERA behavior

SERA creates a prioritized summary:

```text
CRITICAL
ACTION REQUIRED
RELEVANT
INFORMATIONAL
```

Example:

> One credential expires in 12 days. Two pending approvals require review. A token in your wallet was flagged as spam and remains hidden. There is material news affecting one protocol you hold.

## 5.3 UI behavior

Default: conversational response.

“Show me” invokes an adaptive briefing workspace containing only relevant cards.

No permanent dashboard is required.

## 5.4 Authority

A0 read-only.

No transaction authorization.

## 5.5 Failure rule

Unverified external news must never be presented as authoritative wallet state.

---

# JOURNEY 2: Balance Query Across Multiple Chains

## 6. Holder request

> “How much USDC do I have?”

## 6.1 SERA process

1. identify asset
2. query balances across supported chains
3. distinguish native versus bridged / wrapped forms
4. normalize display value
5. retain chain-level inspectability

## 6.2 Response

> You have 8,240 USDC across three networks. Polygon holds 5,200, Ethereum 2,500, and Base 540.

Holder:

> “Show me.”

Adaptive workspace reveals chain detail.

## 6.3 Authority

A0.

## 6.4 Risk

R0 / R1.

---

# JOURNEY 3: Multi-Chain Payment with SERA Route Recommendation

## 7. Holder request

> “Send Jane $500 USDC.”

## 7.1 Context resolution

SERA resolves:

- intended Jane
- recipient wallet / Soul ID
- compatible chains
- holder balances
- recipient history
- current gas / fees
- network health
- chain policy
- spam / risk signals
- route availability

## 7.2 SERA recommendation

> Jane has previously received USDC from you on Polygon. You have sufficient balance there and it is currently the lower-cost route. I can prepare 500 USDC on Polygon.

## 7.3 Holder can inspect

```text
Recipient: Jane Smith
Recipient identifier: resolved Soul ID / wallet
Asset: USDC
Amount: 500
Network: Polygon
Estimated fee: ...
Alternative routes: Ethereum, Base
Risk status: clear / flagged
Authority requirement: explicit approval
```

## 7.4 Execution path

```text
intent
 ↓
recipient resolution
 ↓
route evaluation
 ↓
transaction preparation
 ↓
REV / policy check
 ↓
holder confirmation
 ↓
biometric / wallet authorization
 ↓
signing boundary
 ↓
broadcast
 ↓
receipt
```

## 7.5 Failure paths

If Jane is ambiguous:

> I found two Janes. Which one?

If amount recognition is uncertain:

> Did you say five hundred or five thousand USDC?

If recipient is new and high risk:

Require stronger confirmation.

If network is degraded:

Do not silently reroute if the route materially changes recipient compatibility, fees, or risk.

---

# JOURNEY 4: Voice-Initiated Payment

## 8. Holder request

> “SERA, send fifteen hundred dollars to Acme.”

## 8.1 Voice processing

Holder Voice Profile evaluates:

- acoustic confidence
- holder pronunciation profile
- entity match
- number confidence
- intent confidence
- environment noise
- speaker confidence if enabled

## 8.2 High-risk numerical treatment

The UI should explicitly render:

```text
$1,500
ONE THOUSAND FIVE HUNDRED DOLLARS
```

before execution.

## 8.3 Authority

Voice may initiate and prepare.

Voice alone must not be treated as cryptographic authorization for a high-risk transfer.

## 8.4 Failure case

If “fifteen hundred” versus “fifty hundred” is uncertain:

SERA must ask.

No default guess.

---

# JOURNEY 5: Identity Credential Presentation

## 9. Holder request

> “Show my travel credential.”

or

> “Prove I am over 21.”

## 9.1 Context

- credential inventory
- issuer trust
- credential validity
- requested claim
- verifier request
- disclosure minimization

## 9.2 SERA behavior

For an age proof, SERA should prefer minimal disclosure rather than exposing the full credential.

Example:

> I can prove that you are over 21 without sharing your date of birth.

## 9.3 Execution

```text
request
 ↓
credential selection
 ↓
minimal proof construction
 ↓
verifier / policy validation
 ↓
holder confirmation if required
 ↓
presentation
 ↓
evidence record
```

## 9.4 Inspectability

Holder can always view exactly what claim or proof will be shared.

---

# JOURNEY 6: Spam Token Encounter

## 10. Trigger

A suspicious asset appears in an address.

## 10.1 Existing filter

Spam token filter marks asset as suspicious.

## 10.2 AI-first reinterpretation

SERA should not merely hide it.

SERA may say:

> A token received today was flagged by the wallet's spam filter. It remains hidden and no interaction is recommended.

## 10.3 Safety behavior

SERA must not:

- encourage approval
- fetch arbitrary execution instructions from the token metadata
- interact with attached links
- expose holder to malicious prompt content

## 10.4 Trust path

Spam classification becomes one input to the broader risk layer.

---

# JOURNEY 7: News + Holdings Context

## 11. Holder request

> “Anything happening with the protocols I hold?”

## 11.1 Context

SERA cross-references:

- current holdings
- protocol identities
- news API
- source quality
- article recency
- confidence / veracity layer when available

## 11.2 Response behavior

SERA distinguishes:

```text
wallet fact
external report
unverified claim
analysis
```

Example:

> You hold Token X on Ethereum. Two reports today concern Protocol X. One is from a primary source and one remains unverified.

## 11.3 Risk rule

External content cannot itself authorize or trigger a financial action.

If the holder says:

> “Sell it.”

that becomes a new transactional intent requiring the normal transaction path.

---

# JOURNEY 8: LinkedIn Context for Entity Resolution

## 12. Holder request

> “Who is this person asking me for a credential?”

## 12.1 Permitted use

If LinkedIn context is enabled and relevant, SERA may enrich identity context.

## 12.2 Boundary

LinkedIn-derived information is contextual, not authoritative identity proof.

## 12.3 Response example

> The request is associated with an identity claiming to represent Acme Corp. Public professional context is consistent with that role, but the credential request should still be verified through the identity and trust layer.

---

# JOURNEY 9: Recurring Delegated Payment

## 13. Holder request

> “Pay my AWS bill every month if it is under $500.”

## 13.1 SERA prepares delegation object

```text
beneficiary = AWS
asset = configured payment asset
max_amount = 500 USD equivalent
frequency = monthly
valid_from = ...
expiry = ...
allowed_networks = ...
required_conditions = ...
revocable = true
```

## 13.2 Holder inspection

SERA must show the rule in plain language and structured form.

## 13.3 Execution model

Every future payment remains subject to runtime verification.

Delegation does not mean unconditional permission.

## 13.4 REV

REV evaluates:

- mandate validity
- amount
- recipient
- timing
- policy
- device / runtime context
- revocation state

---

# JOURNEY 10: Conditional Autonomous Rebalancing

## 14. Holder request

> “Keep at least $5,000 USDC in my operating wallet.”

## 14.1 Planning

SERA must convert conversational intent into an explicit policy proposal.

Example:

```text
target_wallet = operating
minimum_balance = 5000 USD
approved_source_wallets = treasury
approved_assets = USDC
max_single_transfer = 2000
max_daily_transfer = 5000
allowed_networks = Polygon, Base
expiry = 90 days
```

## 14.2 Holder approval

Policy must be approved before activation.

## 14.3 Runtime

SERA monitors condition.

When triggered:

```text
condition true
 ↓
prepare action
 ↓
REV
 ↓
execute only within mandate
 ↓
record evidence
```

---

# JOURNEY 11: WalletConnect / External dApp Interaction

## 15. Trigger

Holder connects to an external application.

## 15.1 AI-first behavior

SERA should summarize the requested permissions or transaction.

Example:

> This application is requesting token approval for unlimited USDC spending on Ethereum.

## 15.2 Safety role

SERA may explain risk but must not replace the deterministic transaction decoder.

## 15.3 Holder decision

Inspect → approve / reject.

---

# JOURNEY 12: Emergency Wallet Lock

## 16. Trigger

Holder says:

> “Lock my wallet.”

or invokes a system control.

## 16.1 Required behavior

High priority.

SERA interprets request, but lock semantics are deterministic.

## 16.2 Effects

Potential policy:

- block outbound transactions
- invalidate active delegated execution
- reject new WalletConnect approvals
- preserve read-only access where safe
- raise REV denial state
- log emergency event

## 16.3 Cross-device

Lock status propagates to all enrolled devices and wearables.

---

# JOURNEY 13: Lost Phone, Watch Still Present

## 17. Scenario

Phone is missing; enrolled watch remains with holder.

## 17.1 Wearable scope

The watch must not automatically become a full signing wallet unless explicitly architected and provisioned for that purpose.

## 17.2 Safe capabilities may include

- emergency lock
- view limited wallet status
- view security alerts
- initiate recovery
- revoke lost device
- present selected low-risk credentials

## 17.3 High-risk operations

May require recovery / trusted device re-establishment.

---

# JOURNEY 14: Wearable Low-Risk Approval

## 18. Trigger

SERA detects a low-risk recurring action within an approved policy envelope.

Watch notification:

> AWS invoice: $82.40. Within approved monthly mandate.

Possible controls:

- approve
- view details on phone
- deny

## 18.1 Device policy

The wearable's approval capability is separately provisioned.

Paired status alone is insufficient.

---

# JOURNEY 15: Wearable Credential Presentation

## 19. Holder scenario

Holder approaches a verifier with watch available but phone not in hand.

## 19.1 Candidate flow

```text
watch request
 ↓
credential availability check
 ↓
device scope check
 ↓
holder authentication
 ↓
minimal proof generation / retrieval
 ↓
presentation
```

## 19.2 Architecture implication

Phase 1 credential architecture must support device-neutral presentation requests and scoped device authorization.

---

# JOURNEY 16: Conversation Begins on Watch, Continues on Phone

## 20. Example

Holder to watch:

> “SERA, why did my balance drop?”

SERA:

> There were three outgoing transactions today. One requires more detail than this screen can safely show. Open on phone?

Phone opens directly into the relevant transaction analysis workspace.

## 20.1 Required state portability

Conversation context and task state must be resumable without blindly copying sensitive content to every device.

---

# JOURNEY 17: Noisy Environment / Low Voice Confidence

## 21. Scenario

Holder speaks while driving or in a crowded terminal.

## 21.1 SERA behavior

Low-risk query:

May proceed if intent remains clear.

High-risk action:

Must request confirmation or defer.

## 21.2 Principle

Action risk changes the required confidence threshold.

---

# JOURNEY 18: Offline / Degraded Connectivity

## 22. Scenario

Device has no reliable network.

## 22.1 Available local functions may include

- view cached credential status
- display locally held credentials
- inspect known balances with stale timestamp
- view recent transaction history
- prepare but not broadcast actions
- use offline verification packages where supported

## 22.2 Required disclosure

SERA must distinguish stale from current state.

Example:

> Last confirmed balance was 2,450 USDC at 14:32. I cannot verify the current chain state while offline.

---

# JOURNEY 19: Model Failure or Unavailable AI Runtime

## 23. Requirement

The wallet must remain usable if the AI model fails.

## 23.1 Fallback

Deterministic wallet functions remain accessible.

Potential fallback surface:

```text
Assets
Send
Receive
Swap
Credentials
Activity
Security
Settings
```

## 23.2 Principle

AI-first must not mean AI-dependent for basic wallet survivability.

---

# JOURNEY 20: SERA Gives Wrong Recommendation

## 24. Scenario

SERA recommends a more expensive or less suitable route.

## 24.1 Safety expectation

Recommendation is not authority.

Holder can inspect alternatives.

## 24.2 System learning

If holder repeatedly prefers another route, that preference may become a contextual signal, but must not override hard policy or safety constraints.

---

# 25. Cross-Journey Interaction Modes

SERA should support:

```text
ASK
SHOW
FIND
COMPARE
EXPLAIN
PREPARE
SEND
RECEIVE
VERIFY
PROVE
SIGN
AUTHORIZE
MONITOR
REMIND
DELEGATE
AUTOMATE
CANCEL
REVOKE
LOCK
RECOVER
```

These interaction primitives should remain stable across phone, widgets, notifications and wearables.

---

# 26. UI Surface Rules

Traditional UI should appear when one or more of the following are true:

1. holder asks to inspect
2. action has material consequence
3. multiple entities require disambiguation
4. structured comparison is useful
5. credential disclosure must be reviewed
6. transaction details must be approved
7. policy or delegation is being created
8. AI confidence is insufficient
9. legal / compliance disclosure is required
10. system is in degraded or fallback mode

Otherwise, SERA may remain conversational.

---

# 27. Cross-Device Authority Rule

Authority is evaluated as:

```text
Holder
 + SERA instance
 + device identity
 + device trust level
 + requested capability
 + current context
 + risk class
 + policy / delegation
 + REV result
```

A paired device does not automatically inherit another device's authority.

---

# 28. Evidence Model

Every consequential action should produce a durable evidence object containing, at minimum:

```text
action_id
holder_id
sera_instance_id
source_device_id
intent
resolved_entities
risk_class
authority_basis
rev_result
holder_confirmation
signing_reference
network / chain
transaction_hash or external receipt
timestamp
```

This object must be inspectable without exposing prohibited secrets.

---

# 29. Failure Classes Exposed by the Journeys

The journeys identify the following major failure categories:

- speech ambiguity
- entity ambiguity
- chain ambiguity
- external-data unreliability
- model hallucination
- stale local state
- device authority confusion
- delegated authority overreach
- high-risk action under low confidence
- spam / malicious token interaction
- credential over-disclosure
- compromised or lost device
- offline mode
- AI runtime unavailable
- route recommendation error

These should feed formal validation and adversarial testing.

---

# 30. Architecture Gaps to Resolve Next

DB06 exposes several specifications still required:

1. SERA intent schema and action taxonomy
2. cross-device session and task-state model
3. deterministic execution contract
4. Context Broker schema
5. holder memory architecture
6. device trust and enrollment architecture
7. delegated authority schema
8. transaction route scoring model
9. proactive notification policy
10. credential disclosure policy engine
11. evidence object schema
12. fallback UI / AI-outage operating mode
13. wearable capability scope matrix

---

# 31. Working Decisions

**DB06-D01**  
User journeys, not feature lists, will be used to validate the architecture.

**DB06-D02**  
A journey may begin on one device and complete on another without losing authoritative state.

**DB06-D03**  
Conversation context is portable, but sensitive data is not blindly replicated across devices.

**DB06-D04**  
Voice initiates intent but does not automatically authorize consequential execution.

**DB06-D05**  
Chain selection should become a SERA-assisted routing decision, not a mandatory manual first step.

**DB06-D06**  
External information such as news and LinkedIn-derived context may inform reasoning but never independently authorize wallet action.

**DB06-D07**  
Wearables are Phase 2 surfaces but must be supported by Phase 1 state, identity, device-trust and authority abstractions.

**DB06-D08**  
Every consequential action must remain inspectable and produce evidence.

**DB06-D09**  
The wallet must retain deterministic fallback operation when the AI runtime is unavailable.

**DB06-D10**  
The required certainty threshold rises with action risk.

---

# 32. Recommended Next Document

The next logical design artifact is:

**SSW-SERA-DB07: SERA Intent, Capability, Tool & Execution Contract Design**

DB07 should convert the journeys into a formal machine-oriented vocabulary describing:

- intents
- entities
- capabilities
- tools
- permissions
- preconditions
- confidence requirements
- risk classes
- REV hooks
- user-confirmation rules
- execution contracts
- evidence outputs

This will provide the bridge between the drawing board and the first implementation architecture.
