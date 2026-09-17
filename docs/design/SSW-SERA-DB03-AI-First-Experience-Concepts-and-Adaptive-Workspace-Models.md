# SSW-SERA-DB03
## AI-First Experience Concepts & Adaptive Workspace Models

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB03  
**Status:** Working Design Board  
**Date:** 2026-09-17  
**Purpose:** Explore and compare AI-first interaction models for transforming the existing Soul Super Wallet into a SERA-led wallet in which conversation, voice, context and intent become the primary interface and conventional wallet screens become inspectable, context-sensitive surfaces.

---

## 1. Design Premise

Soul Super Wallet is not being rebuilt from zero. The existing wallet already contains valuable identity, credential, transaction, multi-chain, security, intelligence and integration capabilities. The design problem is therefore not "what screens should a new wallet have?" but:

> **How should an already-capable wallet behave when SERA becomes the primary coordinator of the holder's intent?**

The transformation objective is to move from navigation-led interaction to intent-led interaction while preserving inspectability, control, reversibility, security and access to underlying state.

Current paradigm:

```text
Open wallet
  ↓
Find feature
  ↓
Choose chain / asset / credential / service
  ↓
Enter data
  ↓
Review
  ↓
Approve
  ↓
Execute
```

Target paradigm:

```text
Invoke SERA
  ↓
State intent
  ↓
SERA resolves context
  ↓
SERA retrieves relevant wallet capabilities
  ↓
SERA prepares the action / answer / view
  ↓
Risk and authority checks
  ↓
Holder inspects or approves where required
  ↓
Execution / evidence / result
```

The interface becomes adaptive rather than menu-driven.

---

## 2. Core Experience Principles

### 2.1 SERA is the shell, not a tab

SERA should not be placed inside a conventional navigation bar as an optional AI feature. The target state is that SERA becomes the holder's principal access layer to wallet capabilities.

### 2.2 Navigation becomes secondary

Traditional navigation remains available for inspection, manual control, recovery, accessibility, expert use and fallback, but it should no longer be the default route to common actions.

### 2.3 UI appears when information deserves inspection

Visual surfaces should materialize when a task benefits from comparison, confirmation, evidence, structured detail or user control.

Examples:

- balance query: answer conversationally, visual detail on request;
- send transaction: show transaction card before consequential authorization;
- credential proof: show disclosed claims before release;
- portfolio comparison: generate a visual asset/chain table;
- travel: show boarding pass or credential when needed;
- risk alert: present explanation and remediation options.

### 2.4 SERA may simplify access, never obscure state

The holder must always be able to ask:

> "Show me."

and inspect the underlying data, assumptions, transaction, credential, route, fee, trust signal, source or policy.

### 2.5 Voice and text are peer interfaces

Voice is not a convenience wrapper over text. It is a primary interaction modality with holder-specific adaptation and command-safety controls defined in SSW-AI-VOICE-01.

### 2.6 Context must reduce friction, not create silent assumptions

SERA may use context to narrow choices, but ambiguity affecting money, identity, disclosure or authority must trigger confirmation rather than hidden inference.

### 2.7 Existing wallet capability remains authoritative

The AI should orchestrate wallet functions through defined capabilities and services. It should not simulate wallet state or bypass cryptographic/security controls.

---

## 3. Candidate Experience Model A: Conversational Shell

The application opens directly into SERA.

```text
┌─────────────────────────────────────┐
│ SERA                                │
│                                     │
│ What would you like to do?          │
│                                     │
│ [ Speak ]                           │
│                                     │
│ Suggestions                         │
│ • Anything I should know?           │
│ • Show my balances                  │
│ • Present my Soul ID                │
│ • Send / Receive                    │
│                                     │
└─────────────────────────────────────┘
```

Traditional wallet areas remain reachable through generated or compact controls.

### Strengths

- simple conceptual transition from existing SERA;
- strong AI-first message;
- suitable for text and voice;
- easy to prototype against current wallet services;
- minimizes navigation hierarchy.

### Risks

- can become "chatbot with wallet functions" if the interface remains static;
- visual tasks may feel cramped;
- conversation history can become noisy;
- repeated structured information may not be efficient in chat form.

### Design conclusion

Conversational Shell is likely necessary but not sufficient. It should be combined with an adaptive visual workspace.

---

## 4. Candidate Experience Model B: Adaptive Workspace

The top layer is SERA, while the rest of the interface becomes a temporary workspace generated for the current intent.

```text
┌─────────────────────────────────────┐
│ SERA                                │
│ "Show my USDC across all chains."  │
├─────────────────────────────────────┤
│ USDC                                │
│                                     │
│ Ethereum          2,500             │
│ Polygon           1,850             │
│ Base                700             │
│                                     │
│ Total             5,050 USDC        │
│                                     │
│ [Transfer] [Compare fees] [Details] │
└─────────────────────────────────────┘
```

The workspace disappears or transforms when the task changes.

### Workspace types

- asset view;
- transaction review;
- credential disclosure;
- identity view;
- news/intelligence briefing;
- chain comparison;
- contact/counterparty resolution;
- boarding pass / voucher;
- QR presentation;
- WalletConnect approval;
- policy/REV explanation;
- activity evidence;
- settings panel.

### Strengths

- combines natural conversation with high-information visual surfaces;
- avoids turning every interaction into prose;
- makes complex multi-chain or credential tasks comprehensible;
- fits existing wallet capabilities well;
- allows progressive disclosure.

### Design conclusion

This is the strongest candidate for the main in-app model.

---

## 5. Candidate Experience Model C: Zero-Dashboard Wallet

The conventional home dashboard is removed or reduced to a minimal SERA state.

```text
┌─────────────────────────────────────┐
│                                     │
│                SERA                 │
│                                     │
│        What can I do for you?       │
│                                     │
│               ◉ Speak               │
│                                     │
│  2 items need your attention        │
│                                     │
└─────────────────────────────────────┘
```

No permanent balance cards, token lists, credential tiles or news feed dominate the initial screen.

Instead, the holder asks or SERA surfaces relevant information.

### Strengths

- most radical expression of an AI-first wallet;
- extremely low visual clutter;
- reduces cognitive burden;
- strong differentiation from conventional crypto wallets.

### Risks

- some users rely on glanceable balances;
- can feel opaque if inspectability is weak;
- discovering capabilities may become harder;
- users may not trust an interface that hides too much financial state.

### Design conclusion

Use zero-dashboard principles, but retain optional glanceable state and easy visual inspection. Do not force every user into total conversational dependence.

---

## 6. Candidate Experience Model D: Ambient Companion

SERA exists beyond the main application surface.

### iOS

- Home Screen widget;
- Lock Screen widget;
- Control Center control;
- Live Activities;
- Dynamic Island task state;
- Siri/App Intents;
- notifications;
- Action Button entry points;
- Apple Watch companion surfaces.

### Android

- Home Screen widget;
- notification bubble;
- Quick Settings / notification actions;
- optional overlay where policy and permission permit;
- voice invocation;
- Wear OS surfaces.

### Principle

The full wallet should not need to be opened for every interaction.

SERA becomes the wallet's distributed presence across OS-supported surfaces.

---

## 7. Recommended Composite Model

The current leading concept combines four ideas:

```text
                AMBIENT SERA
        widgets / bubble / OS surfaces
                       │
                       ▼
              CONVERSATIONAL SHELL
                       │
                       ▼
              ADAPTIVE WORKSPACE
                       │
                       ▼
           INSPECTABLE WALLET STATE
```

This provides a coherent hierarchy:

1. invoke SERA anywhere practical;
2. state intent naturally;
3. generate the required visual workspace;
4. inspect details where relevant;
5. authorize consequential actions through wallet security controls.

---

## 8. Adaptive Workspace State Model

The workspace should not be a fixed set of tabs. It should be generated from intent and context.

### 8.1 Finance State

Possible surfaced capabilities:

- balances by asset;
- balances by chain;
- send / receive / swap;
- gas estimation;
- chain comparison;
- spam/risk filtering;
- recent activity;
- recurring or pending payments;
- route recommendation;
- WalletConnect requests;
- portfolio context;
- relevant financial news.

Example:

> "Send Priya $200 in USDC."

SERA workspace may display:

```text
Recipient: Priya Shah
Amount: 200 USDC

Available routes
1. Polygon   fee ~$0.03   expected <1 min
2. Base      fee ~$0.05   expected <1 min
3. Ethereum  fee ~$2.80   expected ~1 min

Recommended: Polygon
Reason: recipient compatibility + lowest current cost

[Review transaction]
```

The recommendation is explanatory, not silent.

### 8.2 Identity State

Possible surfaced capabilities:

- Soul ID;
- credentials;
- issuer information;
- proof requests;
- Soulogram selective disclosure;
- revocation/status;
- biometric binding status;
- proof history;
- verifier context.

Example:

> "Prove I am over 21."

Workspace:

```text
Credential available
Government Identity Credential

Requested proof:
Age >= 21

Not disclosed:
Name
DOB
Address
Document number

[Present proof]
```

### 8.3 Travel State

Potential dynamic workspace:

- boarding passes;
- travel credentials;
- passport-derived proofs;
- loyalty credentials;
- itinerary;
- flight status;
- destination currency / wallet capability;
- time-sensitive notifications.

The state should arise from explicit request or strong contextual triggers, not invasive continuous surveillance.

### 8.4 Security State

Possible surfaced capabilities:

- suspicious token alerts;
- risky transaction warnings;
- WalletConnect session review;
- unusual recipient / chain change;
- credential request anomaly;
- emergency lock;
- REV decision explanation;
- SoulShield protection actions.

### 8.5 Intelligence State

Uses existing news and external information integrations.

Possible outputs:

- holder-requested briefing;
- asset/protocol news relevant to holdings;
- chain incident warnings;
- issuer or counterparty news;
- regulation or service-impact notices;
- source-attributed summaries.

External information must remain distinguishable from wallet-authoritative state.

---

## 9. Context Layers

SERA should reason over multiple context layers without collapsing them together.

```text
CURRENT UTTERANCE
       │
CONVERSATION CONTEXT
       │
WALLET STATE
       │
HOLDER PREFERENCES
       │
HISTORICAL INTERACTION
       │
IDENTITY / AUTHORITY CONTEXT
       │
EXTERNAL INFORMATION
       │
OS / DEVICE CONTEXT
```

Each layer must have separate privacy and trust treatment.

External news must never be treated with the authority of signed wallet state.

Historical behavior can inform recommendations but must not silently create transaction authority.

---

## 10. Core Interaction Primitives

The AI-first experience should normalize wallet actions around a controlled vocabulary of intent primitives.

### Informational

- ASK
- SHOW
- FIND
- EXPLAIN
- SUMMARIZE
- COMPARE
- CHECK

### Identity and credential

- IDENTIFY
- VERIFY
- PROVE
- PRESENT
- REQUEST
- REVOKE

### Financial and asset

- SEND
- RECEIVE
- SWAP
- PREPARE
- ROUTE
- ESTIMATE
- SIGN
- AUTHORIZE

### Agent and automation

- MONITOR
- REMIND
- DELEGATE
- AUTOMATE
- PAUSE
- CANCEL

### Protection

- LOCK
- BLOCK
- REPORT
- REVIEW
- RECOVER

These primitives should map to explicit service capabilities rather than arbitrary AI-generated operations.

---

## 11. Voice-First Journey Patterns

### Pattern A: Read-only query

> "SERA, how much USDC do I have?"

SERA answers immediately and optionally generates a visual balance card.

### Pattern B: Ambiguous financial command

> "Send fifty to Mira."

SERA resolves ambiguity:

```text
Did you mean:
$50 USDC to Mira Shah
or
$50 USDC to Meera Patel?
```

No consequential action proceeds until confidence and identity thresholds are met.

### Pattern C: Complex route selection

> "Move 1,000 USDC to my treasury wallet using the cheapest safe route."

SERA evaluates chain balances, fees, compatibility, policy and risk, then produces a reviewable route.

### Pattern D: Inspectability

> "Why did you choose Polygon?"

SERA must be able to answer using the actual route inputs:

- fee;
- recipient compatibility;
- liquidity / availability;
- chain status;
- wallet policy;
- user preference if applicable.

---

## 12. Proactive SERA Model

SERA should not behave as a continuous notification firehose.

### Priority classes

**P0 Critical**

Interrupt where permitted.

Examples:
- suspected compromise;
- active high-risk signing request;
- revoked critical credential in use;
- wallet protection event.

**P1 Action Required**

Surface prominently.

Examples:
- transaction approval;
- expiring credential needed for known task;
- WalletConnect request;
- recurring mandate failure.

**P2 Relevant**

Surface opportunistically.

Examples:
- lower-cost route available;
- relevant counterparty update;
- asset/network event materially affecting intended action.

**P3 Informational**

Add to briefing.

Examples:
- relevant news;
- general wallet summary;
- minor fee trend.

**P4 Low Value**

Do not interrupt.

### Rule

Proactivity must be configurable and explainable.

The user should be able to ask:

> "Why did you notify me about this?"

---

## 13. Multi-Chain Experience Model

The AI-first wallet should reduce unnecessary chain selection without hiding chain reality.

SERA may evaluate:

- asset availability by chain;
- destination support;
- recipient history;
- bridge requirement;
- estimated gas/fees;
- settlement speed;
- chain status;
- spam/risk signals;
- policy restrictions;
- transaction value;
- user preferences.

SERA should then:

1. produce candidate routes;
2. suppress obviously invalid options;
3. recommend a route where confidence is sufficient;
4. explain material trade-offs;
5. show the chosen chain before signing consequential transactions.

The chain may become incidental to the holder, but it must never become invisible to the authorization system.

---

## 14. Spam Token Filter Reinterpretation

Existing spam-token filtering should become an input into the SERA security model.

Today:

```text
Token detected
   ↓
Spam filter
   ↓
Hide / flag
```

AI-first:

```text
Token / contract / asset event
          ↓
      Spam filter
          ↓
   risk classification
          ↓
 SERA contextual reasoning
          ↓
┌─────────┼──────────┐
│         │          │
Hide     Warn      Block action
                    where policy
                    requires
```

SERA must not encourage the holder to interact with filtered assets merely because the user asks a generic question about "all tokens."

---

## 15. News and External Intelligence Experience

The existing news APIs and LinkedIn integrations can become contextual sources, but they must remain clearly separated from wallet truth.

### Example

Holder:

> "Anything affecting my wallet today?"

SERA may combine:

- wallet holdings;
- chain health;
- relevant protocol news;
- issuer announcements;
- external counterparty context;
- pending credential or transaction events.

But each information class should retain provenance.

Example response model:

```text
Wallet state
• 3 pending approvals

Network
• No current incidents detected on your active chains

Relevant news
• Article concerning Protocol X, source/date shown

Identity
• One credential expires in 12 days
```

SERA must distinguish verified wallet facts from third-party claims.

---

## 16. LinkedIn and Professional Context

LinkedIn-derived context, where API permissions and applicable policies permit, should be treated as optional enrichment rather than authoritative identity.

Potential uses:

- organization/name disambiguation;
- professional relationship context;
- user-requested business research;
- counterparty enrichment;
- contextual contact resolution.

Not permitted by design assumption:

- treating LinkedIn information as cryptographic identity proof;
- silently making financial or identity decisions solely from professional-network data;
- conflating third-party profile data with Soul ID or verified credentials.

---

## 17. Inspectability Ladder

Every AI response should have an appropriate path to deeper inspection.

```text
LEVEL 0
Conversational answer

LEVEL 1
Summary card

LEVEL 2
Detailed workspace

LEVEL 3
Underlying wallet evidence / source / transaction / credential

LEVEL 4
Advanced technical details where appropriate
```

Examples:

"You have 5,050 USDC."  
→ Show balances  
→ Show balances by chain  
→ Show addresses / transaction history

"Polygon is the recommended route."  
→ Show comparison  
→ Show fee/risk inputs  
→ Show raw transaction before signing

---

## 18. Persistent Navigation: Candidate Direction

The existing wallet may ultimately need little or no traditional static bottom navigation.

Candidate compact access model:

```text
SERA
   │
   ├── Ask / Speak
   ├── Current workspace
   └── Reveal tray
          ├── Identity
          ├── Assets
          ├── Activity
          ├── Credentials
          ├── Connections
          └── Settings
```

The tray is a fallback/control surface, not the primary interaction architecture.

This direction is compatible with the existing Soul Super Wallet preference for a dynamic tray rather than a permanent static bottom bar.

---

## 19. Holder Control Modes

Different users may want different degrees of AI mediation.

### Guided Mode

SERA explains more, confirms more, exposes more UI.

### Standard Mode

SERA handles routine navigation and preparation while retaining normal confirmations.

### Expert Mode

SERA uses compact language, exposes advanced technical detail on demand and minimizes explanatory friction.

### Delegated Mode

Certain pre-authorized activities may execute within explicit mandates, limits, policy and REV controls.

These should alter interaction style and allowed automation, not weaken security boundaries.

---

## 20. Failure and Fallback Design

An AI-first wallet must remain usable when AI capability is degraded.

Fallback states must exist for:

- no network;
- AI service unavailable;
- speech recognition unavailable;
- low-confidence voice;
- model timeout;
- external API outage;
- unsupported chain operation;
- ambiguous intent;
- REV unavailable or fail-closed condition;
- user preference for manual control.

The wallet must retain deterministic access to critical functions.

AI-first must not mean AI-dependent for recovery or safety.

---

## 21. Experience Safety Rules

1. SERA must not sign transactions simply because natural-language intent appears clear.
2. High-impact actions require appropriate wallet authorization.
3. Ambiguous amounts, assets, recipients, chains or credentials must trigger clarification.
4. SERA must disclose the material transaction state before signing.
5. External information is advisory unless independently verified by an authoritative source.
6. AI recommendations must not override explicit user policy or REV decisions.
7. Sensitive credential disclosure must show the claims being released where practical.
8. Existing spam/risk controls must remain active even when SERA is the interaction layer.
9. Manual deterministic access must remain available for critical wallet functions.
10. "Show me" must remain a universal inspectability command.

---

## 22. Day-in-the-Life Design Board

### Morning briefing

Holder:

> "Anything I need to know?"

SERA:

- pending transaction approvals;
- expiring credential;
- unusual wallet activity;
- relevant network issue;
- selected news relevant to holder context.

### Travel

Holder:

> "Show my boarding pass."

SERA retrieves the relevant voucher/credential and presents the scannable surface.

### Payment

Holder:

> "Pay Acme's invoice."

SERA retrieves invoice context, identifies supported payment path, prepares route, presents material terms and obtains authorization.

### Identity

Holder:

> "Prove my address to this verifier."

SERA locates suitable credential, explains requested disclosure, uses selective disclosure where available and presents for approval.

### Security

SERA:

> "This token is flagged by your spam filter and the contract is not one you have previously interacted with. I will not prepare an approval unless you explicitly review the risk details."

### Evening

Holder:

> "What happened in my wallet today?"

SERA summarizes transactions, approvals, credential activity, network events and relevant changes.

---

## 23. Prototype Candidates

The following prototypes should be produced before final UX freeze:

### P1: Minimal SERA Home

A near-zero dashboard with voice/text invocation and attention items.

### P2: Adaptive Asset Workspace

Multi-chain asset query → dynamic balance/route display.

### P3: Voice Transaction Journey

Voice command → entity resolution → chain recommendation → review → biometric authorization.

### P4: Credential Proof Journey

Natural-language proof request → credential resolution → selective disclosure preview → presentation.

### P5: Proactive Risk Intervention

Spam token / risky transaction event → SERA warning → inspectability → block/review pathway.

### P6: External Intelligence Briefing

Wallet context + news/APIs → provenance-aware briefing.

### P7: Ambient OS Presence

Separate iOS and Android presence prototypes.

---

## 24. Design Questions to Resolve

1. Should the default wallet home be fully conversational or retain a compact balance/identity snapshot?
2. Should SERA have a persistent visual identity, minimal orb, waveform, avatar or primarily typographic presence?
3. How much conversation history should remain visible in the main wallet UI?
4. Should workspace cards persist as a task history or disappear after completion?
5. How should the holder switch between SERA-mediated and fully manual operation?
6. What actions can SERA execute without opening the full app on each OS?
7. How should contextual news be ranked without becoming distracting or investment persuasion?
8. Which multi-chain route signals are available today versus requiring new providers?
9. How should contact resolution work across Soul IDs, addresses, saved contacts and external context?
10. What minimum wallet functions must remain operable offline?
11. How should SERA expose sources, provenance and confidence without making the interface heavy?
12. How should accessibility users interact when voice, visual cards or gestures are unavailable?

---

## 25. Working Design Direction

At this stage the preferred product direction is:

> **Ambient SERA + Conversational Shell + Adaptive Workspace + Inspectable Wallet State**

This preserves the strengths of the existing wallet while replacing navigation as the primary coordinator.

The existing capabilities should remain modular services. SERA becomes the orchestration and interaction layer that determines which capability is relevant, gathers context, prepares the action, presents the necessary workspace and hands consequential execution to established wallet authorization controls.

---

## 26. Relationship to Other Controlled Documents

- **SSW-SERA-DB01**: AI-First Wallet Drawing Board, Experience Concepts & Advanced Capability Exploration
- **SSW-SERA-DB02**: Existing Wallet Capability, Screen, Service & Integration Inventory
- **SSW-SERA-DB03**: this document, experience concepts and adaptive workspace models
- **SSW-AI-VOICE-01**: Holder Voice Adaptation, Understanding & Command Safety Architecture

Expected follow-on work:

- **SSW-SERA-DB04**: Advanced Technical Capability & Feasibility Radar
- **SSW-SERA-DB05**: Privacy, Trust, Authority & Risk Boundary Design Board
- **SSW-AI-01**: AI-First Wallet Platform Capability & Constraint Architecture
- **SSW-AI-02**: SERA Interaction, Intent & Authority Architecture

---

## 27. Controlled Working Decisions

**DB03-D01** — SERA is the primary wallet shell, not a secondary AI tab.  
**DB03-D02** — The leading in-app model is conversational shell plus adaptive workspace.  
**DB03-D03** — Zero-dashboard principles are favored, but glanceable and manual wallet state must remain accessible.  
**DB03-D04** — Traditional UI is retained as an inspectability and control layer rather than the principal navigation model.  
**DB03-D05** — Multi-chain complexity should be reduced through contextual recommendation but remain visible before consequential signing.  
**DB03-D06** — Existing spam-token filtering becomes a SERA risk input rather than remaining only a display filter.  
**DB03-D07** — News and LinkedIn-derived context remain non-authoritative external information with clear provenance boundaries.  
**DB03-D08** — "Show me" is adopted as a universal inspectability pattern.  
**DB03-D09** — AI-first operation must retain deterministic fallback for safety, recovery and degraded-service conditions.  
**DB03-D10** — Ambient presence must be implemented differently for iOS and Android using OS-native surfaces.
