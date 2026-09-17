# SSW-SERA-DB01
## AI-First Wallet Drawing Board, Experience Concepts & Advanced Capability Exploration

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB01  
**Status:** Active Drawing Board  
**Date:** 2026-09-16  
**Repository:** Kavithakanaparthi/SSW-SERA  
**Document Type:** Controlled design exploration document  

---

## 1. Purpose

This document establishes the design-board phase for transforming the existing Soul Super Wallet (SSW) into an AI-first wallet in which SERA becomes the primary interface and orchestration layer, while traditional wallet views remain available when the holder needs to inspect, verify, compare, authorize, or manage underlying state.

The program is not a greenfield wallet build. Soul Super Wallet already contains significant identity, asset, transaction, intelligence, security, and external-integration capabilities. The purpose of this phase is therefore to determine how the existing wallet should be reinterpreted, reorganized, and extended when the agent becomes the primary operating interface.

This document is intentionally broader and more exploratory than a frozen architecture specification. It records candidate product directions, technical possibilities, experience concepts, advanced capabilities to research, risk boundaries, open questions, and ideas that may later be promoted into controlled architecture and implementation specifications.

---

## 2. Core Product Thesis

The future Soul Super Wallet should not be conceptualized as a wallet with an AI feature.

It should be conceptualized as an identity-bound AI agent with wallet capabilities.

The operating model changes from:

```text
Open Wallet
   ↓
Navigate
   ↓
Find Feature
   ↓
Select Asset / Credential / Chain / Action
   ↓
Review
   ↓
Execute
```

into:

```text
Invoke SERA
   ↓
Express Intent
   ↓
SERA understands context
   ↓
SERA retrieves relevant wallet capability
   ↓
SERA prepares / reasons / recommends
   ↓
Trust, policy and authority checks
   ↓
Holder approval where required
   ↓
Execution
   ↓
Evidence / receipt / inspectable state
```

The wallet remains authoritative. SERA becomes the coordinator.

---

## 3. Existing Soul Super Wallet Capability Baseline

The existing wallet must be treated as the substrate for the AI-first transformation rather than something to replace wholesale.

### 3.1 Existing capability inventory

| Existing SSW capability | Current role | AI-first reinterpretation |
|---|---|---|
| SERA | Existing conversational assistant | Primary wallet interface, orchestrator and intent router |
| Soul ID | Decentralized identity | Root identity for holder context, authentication, delegation and agent authority |
| Verifiable credentials | Store, view and present credentials | Conversational retrieval, selective disclosure and policy-aware presentation |
| Soulogram | Zero-knowledge credential sharing | SERA-invoked privacy-preserving proof generation |
| SoulScan | Biometric identity binding | Identity onboarding / recovery / assurance input where applicable |
| Asset balances | Dashboard and chain-specific holdings | Conversationally queryable financial context and decision input |
| Multi-chain support | User selects network and asset context | SERA evaluates network suitability and prepares chain-aware execution |
| Send | Manual transaction flow | SERA-prepared transfer with recipient, chain, fee and policy reasoning |
| Receive | Manual address / QR flow | SERA-generated receive request, chain-aware endpoint and proof context |
| Swap | Manual asset swap | SERA-mediated route discovery and user-authorized execution |
| WalletConnect | External dApp connectivity | Agent-mediated external execution and session control |
| QR verification / proof | Manual credential interaction | SERA-triggered proof / scan / verification flow |
| Transaction history | Historical list | Conversational memory, anomaly detection and behavioral context |
| Spam token filters | Hide or suppress suspicious tokens | Security signal, SERA warning input and possible Trust / REV risk input |
| News APIs | News content inside wallet | Proactive portfolio, protocol, issuer, chain and counterparty intelligence |
| LinkedIn APIs | Professional / external context integration | Optional entity, organization and professional-context enrichment subject to privacy and policy |
| Notifications | Event surfacing | SERA proactive surface with importance classification |
| Wallet settings | Manual configuration | Mostly hidden configuration, invoked conversationally when needed |
| Biometric / device authentication | Holder authentication | Execution authorization and elevated-risk confirmation |
| Gas / network checks | Transaction precondition | Input into SERA chain / route evaluation |

### 3.2 Design principle: preserve capability, change coordination

The program should preserve valuable working capabilities but change the way they are coordinated.

Today, the holder coordinates wallet functions through navigation.

In the future, SERA coordinates wallet functions on behalf of the holder, subject to identity, authority, policy, Trust Protocol, REV, explicit consent, and transaction-specific controls.

This creates a critical distinction:

> **Existing wallet capabilities remain the authoritative execution substrate. SERA becomes the operating shell and orchestration layer.**

---

## 4. Primary Design Question

For every existing screen, control, flow, menu item, and action, ask:

> **Does the holder still need to navigate to this, or should SERA retrieve and present it when relevant?**

This question should drive the future UI rather than preserving navigation for historical reasons.

A second question follows:

> **When SERA presents a result, what underlying state must remain inspectable by the holder?**

The AI-first design must simplify access without reducing verifiability.

---

## 5. AI-First Experience Concepts

The following concepts are candidates for exploration. They are not mutually exclusive.

### 5.1 Concept A: Conversational Shell

The wallet opens directly into SERA.

Traditional views appear only when requested or required.

Example:

```text
┌──────────────────────────────┐
│             SERA             │
│                              │
│      What can I do?          │
│                              │
│        [ Speak ]             │
│                              │
│  recent context / alerts     │
└──────────────────────────────┘
```

The holder says:

> Show me my credentials.

The credential surface appears.

The holder says:

> Back to SERA.

The conversational shell resumes.

### 5.2 Concept B: Ambient Companion

SERA remains visually present as a small persistent element where the operating system permits it.

Android may support a bubble / overlay style presence.

iOS would use a distributed presence through widget, Lock Screen, Control Center, Dynamic Island, Live Activities, notifications and intents.

### 5.3 Concept C: Command Canvas

SERA occupies the persistent top or central interface while the remaining screen becomes a dynamic workspace.

Examples of temporary workspaces:

- transaction preview,
- credential,
- boarding pass,
- news summary,
- portfolio view,
- contact / counterparty,
- invoice,
- form,
- identity proof,
- chain comparison.

### 5.4 Concept D: Zero-Dashboard Wallet

The traditional dashboard may disappear as the default home.

The default state becomes:

> **What do you need?**

with a small contextual briefing beneath it.

The holder does not need to understand information architecture before asking for an outcome.

### 5.5 Concept E: Adaptive Workspace

The visible interface changes according to context rather than manual mode switching.

Travel context may surface:

```text
SERA
Passport
Boarding pass
Travel credential
Flight status
Currency / payment context
```

Finance context may surface:

```text
SERA
Balances
Payments
Invoices
Gas / network state
Relevant market / issuer intelligence
```

Identity context may surface:

```text
SERA
Soul ID
Credentials
Proof requests
Pending verification
Trust state
```

These need not become fixed modes. They may be generated dynamically from context.

---

## 6. SERA Interaction Primitive Set

Before designing detailed screens, the system should define the primary interaction vocabulary SERA must support.

Initial candidate primitive set:

```text
ASK
SHOW
FIND
SEARCH
COMPARE
EXPLAIN
SUMMARIZE
PREPARE
SEND
RECEIVE
SWAP
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
UNLOCK
RECOVER
REPORT
```

Complex experiences should be composed from these primitives.

This creates an architecture in which screens are downstream of intent rather than the reverse.

---

## 7. Multi-Chain Intelligence as a Native SERA Capability

Multi-chain support is already present and should become one of the most valuable AI-native capabilities.

The future experience should not force the holder to manually choose a network in every flow where the system can reason safely.

Example holder request:

> Send Jane $500 USDC.

Potential SERA reasoning inputs:

- holder's USDC balances by chain,
- recipient chain compatibility,
- previous recipient behavior,
- gas / fee estimate,
- settlement time,
- bridge requirement,
- chain availability,
- token contract verification,
- spam / risk signals,
- holder preferences,
- network policy,
- Trust Protocol result,
- REV result,
- regulatory or jurisdictional constraints where relevant.

Possible response:

> You have USDC on Polygon and Ethereum. Polygon is currently the lower-cost route, and Jane has previously received USDC there. I can prepare $500 on Polygon for your approval.

SERA must distinguish between:

- recommending a chain,
- preparing a transaction,
- obtaining authorization,
- executing the transaction.

Chain selection must never silently bypass holder-defined policy.

---

## 8. Spam Token Filters as Intelligence and Security Inputs

Existing spam-token filtering should evolve from a purely visual suppression capability into an intelligence signal.

Potential uses:

- suppressing suspicious assets from conversational balances unless requested,
- warning before interacting with unknown assets,
- feeding token reputation into SERA recommendations,
- preventing spam-token interaction from being treated as ordinary user intent,
- informing Trust Protocol or REV where appropriate,
- avoiding malicious token metadata / phishing surfaces,
- distinguishing dusting / unsolicited token events from legitimate activity.

Candidate SERA behavior:

> I excluded 14 unsolicited tokens from your spendable balance. Three match known spam patterns. You can review them separately if needed.

The AI layer should never promote suspicious assets merely because they exist on-chain.

---

## 9. News Intelligence Reinterpretation

The existing news integration can become contextual intelligence rather than a passive content feed.

Potential SERA use cases:

- summarize material news affecting current holdings,
- surface protocol incidents,
- identify issuer announcements,
- detect chain outages or congestion,
- detect security events,
- explain unusual asset movement,
- connect news to pending transactions,
- identify counterparty-relevant information,
- provide an optional daily holder briefing.

A critical requirement is source quality and provenance.

SERA should distinguish:

- reported fact,
- unverified report,
- opinion,
- market speculation,
- conflicting sources.

News should inform reasoning but should not automatically authorize financial action.

---

## 10. LinkedIn and External Professional Context

Existing LinkedIn integration may support optional business / entity context, subject to API terms, user consent, privacy, data minimization and reliability constraints.

Potential uses include:

- organization identity context,
- counterparty disambiguation,
- professional relationship context,
- business contact enrichment,
- optional KYB-supporting context,
- holder-requested research.

It must not be treated as authoritative identity proof.

Verified credentials, Soul ID, organization DIDs, regulated data sources and cryptographic evidence remain higher-trust inputs.

---

## 11. Voice as a Foundation Capability

Voice is expected to become a primary operating channel for SERA.

The controlled voice architecture is defined separately in:

**SSW-AI-VOICE-01: Holder Voice Adaptation, Understanding & Command Safety Architecture**

Drawing-board implications include:

- holder-specific voice learning,
- accent and pronunciation adaptation,
- correction-driven learning,
- multilingual and code-switch support,
- personal vocabulary,
- entity aliases,
- dedicated numeric safety controls,
- risk-weighted confirmation,
- distinction between voice understanding and authorization.

Voice should be treated as a primary interaction surface, not a later accessibility feature.

---

## 12. Capability Radar

### 12.1 Horizon A: Available now or largely available

- conversational AI,
- voice interaction,
- holder-specific vocabulary adaptation,
- wallet balance queries,
- transaction preparation,
- multi-chain access,
- credential retrieval,
- biometric confirmation,
- spam filtering,
- news integration,
- LinkedIn integration,
- notifications,
- iOS widgets / Live Activities / App Intents,
- Android widgets / bubbles,
- local embeddings,
- structured tool calling,
- WalletConnect,
- QR / credential presentation.

### 12.2 Horizon B: Buildable with current engineering

- persistent holder context,
- personal semantic memory,
- transaction reasoning,
- chain / route recommendation,
- context-aware recipient resolution,
- proactive wallet monitoring,
- transaction anomaly explanation,
- delegated execution policies,
- bounded automation,
- multilingual voice adaptation,
- privacy-aware context broker,
- local / hybrid AI inference,
- tool permissions,
- agent action planner,
- risk-aware confirmation,
- contextual credential selection,
- agent evidence trail.

### 12.3 Horizon C: Ecosystem-dependent

- airline booking,
- travel ecosystem integrations,
- banking APIs,
- merchant APIs,
- agentic commerce interfaces,
- AP2 / AP3 integrations,
- exchange / liquidity provider integrations,
- regulated payment rails,
- insurer / healthcare / government credential interfaces,
- advanced KYB / business data networks.

### 12.4 Horizon D: Frontier / strategic research

- agent-to-agent economic interaction,
- autonomous negotiation within bounded authority,
- continuous multimodal context,
- richer on-device reasoning,
- trusted ambient identity exchange,
- wearable-first wallet interactions,
- privacy-preserving personal models,
- dynamic trust-aware service discovery,
- multi-agent orchestration,
- local sovereign personal AI models.

---

## 13. AI Context and Data Classification

SERA should not receive unrestricted access to all wallet data merely because it is the primary interface.

Initial context classification:

```text
PUBLIC
GENERAL PERSONAL
FINANCIAL
IDENTITY
CREDENTIAL
BIOMETRIC
AUTHORIZATION
KEY MATERIAL
```

Example treatment:

| Data | SERA access expectation |
|---|---|
| Public chain data | Allowed subject to relevance |
| Wallet balance | Contextual read access |
| Transaction history | Contextual read / analysis access |
| Contact aliases | Holder-controlled contextual use |
| Credential metadata | Minimal contextual access |
| Credential claims | Selective, purpose-bound access |
| Biometric template | No ordinary AI access |
| Signing material | Never exposed to SERA |
| Seed phrase | Never exposed to SERA |
| Private keys | Never exposed to SERA |
| Authorization secrets | Never exposed to general AI context |

A dedicated context broker should mediate access between wallet state and reasoning models.

---

## 14. Core Inspectability Principle

The AI-first wallet must not become an opaque wallet.

Design rule:

> **SERA may replace navigation, but she must not replace inspectability.**

If SERA says:

> You have $14,230 available.

The holder should be able to say:

> Show me.

and inspect the underlying balances.

If SERA says:

> I prepared a transaction.

The holder should be able to inspect:

```text
Asset
Amount
Recipient
Recipient identity / address
Network
Fee
Route
Policy
Delegated authority
Trust status
REV status
Risk warnings
Execution state
```

The system should reduce cognitive burden without hiding material facts.

---

## 15. Proactivity Model

SERA should be proactive, but not noisy.

Initial relevance classes:

```text
CRITICAL
Interrupt immediately

ACTION REQUIRED
Surface prominently

RELEVANT
Surface contextually

INFORMATIONAL
Place in briefing

LOW VALUE
Remain silent unless requested
```

Potential proactive signals:

- credential expiry,
- pending transaction approval,
- network outage,
- unusual transaction,
- recipient anomaly,
- token risk event,
- chain congestion,
- significant fee change,
- security alert,
- relevant issuer / protocol news,
- recurring payment variance,
- travel credential readiness,
- delegated authority approaching expiry.

---

## 16. Example Day-in-the-Life Journeys

### 16.1 Morning briefing

Holder:

> SERA, anything I should know?

SERA may summarize:

- pending approvals,
- credential expiry,
- relevant holdings news,
- transaction anomalies,
- network warnings,
- scheduled or delegated actions.

### 16.2 Airport

Holder:

> Show my boarding pass.

SERA presents the correct pass.

Holder:

> Do I need anything else for this trip?

SERA checks available travel credentials and relevant context.

### 16.3 Payment

Holder:

> Pay $42.

SERA resolves merchant / request / chain context, prepares the transaction and presents approval if required.

### 16.4 Business payment status

Holder:

> Did Acme pay us?

SERA checks transaction records and relevant account context.

### 16.5 Invoice action

Holder:

> Send John the invoice.

SERA identifies the intended John, prepares the applicable workflow and asks for clarification if entity confidence is insufficient.

### 16.6 Daily spending review

Holder:

> What did I spend today?

SERA summarizes and allows drill-down through natural language.

---

## 17. Capability-to-Risk Matrix

| Capability | Benefit | Failure consequence | Initial risk class |
|---|---|---|---|
| Balance query | Convenience | Low | Low |
| News summary | Intelligence | Misinformation / confusion | Low-Medium |
| Chain recommendation | Cost / speed optimization | Wrong network / loss risk | Medium |
| Credential retrieval | Speed | Wrong credential shown | Medium |
| Credential disclosure | Convenience | Privacy breach | High |
| Transaction preparation | Reduced friction | Wrong parameters prepared | Medium |
| Transaction execution | Automation | Asset loss | High |
| Recurring mandate | Autonomy | Repeated incorrect execution | High |
| Identity delegation | Agent capability | Authority misuse | Very High |
| Autonomous portfolio action | Efficiency | Financial loss | Very High |
| Wallet lock / emergency action | Security | Denial of access | High |

Risk classification must drive confirmation and authorization policy.

---

## 18. Agent Authority Model

SERA must distinguish between recommendation, preparation, authority and execution.

Initial action tiers:

### Tier 0: Read

Examples:

- balances,
- transaction history,
- credential status,
- news,
- network state.

### Tier 1: Prepare

Examples:

- draft transaction,
- draft proof,
- prepare swap,
- prepare payment request.

No execution.

### Tier 2: Explicit approval

SERA prepares the action and the holder explicitly authorizes execution.

### Tier 3: Delegated authority

The holder grants bounded authority, for example:

```text
recipient = AWS
maximum = 500 USD
frequency = monthly
expiry = 12 months
```

### Tier 4: Autonomous conditional authority

SERA may act within a tightly bounded policy envelope, with every execution still subject to applicable Trust / REV / policy gates.

---

## 19. Candidate System Architecture Sketch

```text
┌──────────────────────────────────────────────────────────┐
│                    SERA EXPERIENCE                       │
│ Conversation │ Voice │ Proactivity │ Dynamic Views      │
└──────────────────────────┬───────────────────────────────┘
                           │
                  SERA ORCHESTRATOR
                           │
        ┌──────────────────┼───────────────────┐
        │                  │                   │
        ▼                  ▼                   ▼
   Intent Engine      Context Broker      Agent Planner
        │                  │                   │
        └──────────────────┼───────────────────┘
                           │
                 Capability Router
                           │
      ┌────────────────────┼────────────────────┐
      │                    │                    │
      ▼                    ▼                    ▼
 Identity & VC        Assets / Chains      Intelligence
 Soul ID              Send / Receive       News
 Soulogram            Swap                 LinkedIn
 Credentials          WalletConnect        Risk signals
 SoulScan             Multi-chain          Spam filters
      │                    │                    │
      └────────────────────┼────────────────────┘
                           │
                    AUTHORITY LAYER
                           │
                  Soul ID / SVID4AI
                           │
                  Trust Protocol
                           │
                         REV
                           │
                  Execution / Evidence
```

---

## 20. UI/UX Transformation Principles

The existing UI may be retained, revised or progressively replaced as capabilities move behind SERA.

Initial principles:

1. Do not redesign every screen before understanding whether the screen still needs to exist.
2. Preserve inspectability for consequential state.
3. Optimize frequent tasks for voice and conversational access.
4. Use progressive disclosure rather than permanent dashboards.
5. Surface the minimum required controls for the current context.
6. Keep advanced controls accessible without making them the default.
7. Separate conversational convenience from execution authority.
8. Make high-risk actions visually explicit even in an AI-first flow.
9. Retain manual fallback paths.
10. Do not force users to use AI for actions they prefer to perform manually.

---

## 21. Technical Research Tracks

The drawing-board phase should research the following before freezing architecture:

### 21.1 Device and OS surfaces

- iOS widgets,
- Live Activities,
- Dynamic Island,
- App Intents,
- Control Center,
- Siri,
- Shortcuts,
- watchOS,
- Android widgets,
- bubbles,
- overlays,
- shortcuts,
- notifications,
- Wear OS,
- background execution constraints.

### 21.2 AI runtime

- on-device inference,
- hybrid inference,
- cloud inference,
- model routing,
- privacy-preserving prompts,
- tool calling,
- memory architecture,
- retrieval architecture,
- context minimization,
- fail-safe model behavior.

### 21.3 Voice

- holder adaptation,
- on-device STT,
- multilingual support,
- code-switching,
- speaker verification as a non-authoritative signal,
- numeric recognition,
- deepfake / replay defenses,
- noisy-environment testing.

### 21.4 Wallet orchestration

- chain recommendation,
- route calculation,
- gas optimization,
- asset compatibility,
- bridging policy,
- transaction simulation,
- malicious-contract detection,
- spam / dust handling,
- recipient verification.

### 21.5 Agent authority and security

- SVID4AI,
- delegated authority,
- Trust Protocol,
- REV,
- AURION inputs,
- revocation,
- action limits,
- expiration,
- kill switch,
- evidence generation.

### 21.6 External ecosystem

- AP2 / AP3,
- merchant APIs,
- travel APIs,
- banking APIs,
- identity issuer APIs,
- licensed financial providers,
- dApp interfaces,
- agent-to-agent protocols.

---

## 22. Open Design Questions

The following questions remain intentionally open in DB01:

1. What should the default visual representation of SERA be?
2. Should SERA appear as an orb, voice surface, minimal character, abstract presence or context-dependent form?
3. How much information should appear before the holder asks for it?
4. Which existing wallet screens should survive unchanged?
5. Which current wallet screens should become generated views?
6. Should the wallet maintain a conventional navigation fallback?
7. What percentage of common workflows should be completable without opening a traditional screen?
8. How should SERA explain chain recommendations?
9. How should spam-token intelligence interact with Trust Protocol / REV?
10. Which news events should trigger proactive alerts?
11. What external context may SERA retain persistently?
12. How should holder memory be encrypted, synchronized and recovered?
13. Which AI capabilities must remain on-device?
14. Which tasks may safely use external models?
15. How should agent autonomy be introduced gradually to users?
16. How should SERA behave when confidence is insufficient?
17. How should the UI expose manual override and inspection?
18. What should the first production MVP include versus defer?

---

## 23. Ideas Parked for Later Evaluation

The following are not committed scope but should remain visible for later research:

- agent-to-agent payments,
- autonomous commerce negotiation,
- wearable-only wallet interactions,
- continuous travel companion mode,
- AI-generated dynamic wallet layouts,
- on-device personal model,
- household / family delegation,
- enterprise policy wallet mode,
- multi-agent task delegation,
- private local news intelligence,
- agent reputation exchange,
- voice-only low-vision wallet mode,
- cross-device SERA continuity,
- context transfer between phone, watch, desktop and vehicle.

---

## 24. Proposed Program Sequence from DB01

```text
Existing Soul Super Wallet
          ↓
SSW-SERA-DB01
Drawing Board & Capability Exploration
          ↓
SSW-SERA-DB02
Existing Wallet Capability and Interface Inventory
          ↓
SSW-SERA-DB03
AI-First Experience Concept Set
          ↓
SSW-SERA-DB04
Advanced Technical Capability & Feasibility Radar
          ↓
SSW-SERA-DB05
Privacy, Trust, Risk and Authority Boundaries
          ↓
SSW-AI-01
Platform Capability & Constraint Architecture
          ↓
SSW-AI-02
SERA Interaction, Intent & Authority Architecture
          ↓
VOICE / CONTEXT / MEMORY / ORCHESTRATION specifications
          ↓
Prototype
          ↓
Integration with existing SSW
          ↓
Production hardening
```

SSW-AI-VOICE-01 already exists and feeds this program as a foundation workstream.

---

## 25. Drawing Board Decisions Established So Far

### DB01-D01
Soul Super Wallet is not being rebuilt as a greenfield wallet. Existing capabilities are the execution substrate.

### DB01-D02
SERA is intended to become the primary interface and orchestration layer.

### DB01-D03
Traditional wallet surfaces remain available for inspection, explicit control and manual fallback.

### DB01-D04
Existing SERA functionality will be assessed and evolved rather than replaced without cause.

### DB01-D05
Multi-chain support becomes an intelligence problem as well as an execution capability.

### DB01-D06
Spam-token filtering becomes a security and reasoning input, not only a display filter.

### DB01-D07
News APIs become contextual intelligence inputs rather than passive content feeds.

### DB01-D08
LinkedIn and other external professional context remain optional contextual inputs and do not replace verified identity evidence.

### DB01-D09
Voice is a foundation interaction mode and is governed by SSW-AI-VOICE-01.

### DB01-D10
SERA may replace navigation, but must not replace inspectability.

### DB01-D11
AI confidence does not confer execution authority.

### DB01-D12
Risk class must influence confirmation, authorization and execution policy.

### DB01-D13
Existing UI/UX may be updated progressively as the AI-first architecture is validated.

### DB01-D14
The drawing-board phase precedes frozen production architecture.

---

## 26. Immediate Next Work

The next recommended controlled artifact is:

**SSW-SERA-DB02: Existing Wallet Capability, Screen, Service & Integration Inventory**

Its purpose is to map the current wallet in detail before changing it:

- every existing screen,
- every existing service,
- every API,
- every chain,
- every transaction action,
- every identity action,
- every credential action,
- every security control,
- every current SERA capability,
- every integration,
- every background task,
- every notification path,
- every data source,
- every user setting.

Each item should then be classified as:

```text
KEEP
ADAPT
MOVE BEHIND SERA
GENERATE DYNAMICALLY
DEPRECATE
RESEARCH
```

That inventory will provide the factual baseline from which the future product can be designed without accidentally rebuilding, duplicating or discarding working capability.
