# SSW-SERA-DB02
## Existing Wallet Capability, Screen, Service & Integration Inventory

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB02  
**Status:** Working Baseline  
**Purpose:** Establish the current Soul Super Wallet substrate and classify each capability for the AI-first transformation.

---

## 1. Objective

Soul Super Wallet is not a greenfield product. It already contains identity, credential, asset, multi-chain, intelligence, filtering, transactional, and conversational capabilities. The purpose of this inventory is to prevent unnecessary rebuilding and to identify how each current capability should evolve when SERA becomes the primary interface to the wallet.

The governing transformation principle is:

> Preserve valuable existing capabilities, but change who coordinates them. Today, the holder coordinates the wallet by navigating screens. In the AI-first model, SERA coordinates capabilities on behalf of the holder, subject to policy, authority, visibility, and confirmation.

---

## 2. Classification Framework

Each current capability is assigned one or more transformation dispositions.

| Classification | Meaning |
|---|---|
| **KEEP** | Preserve substantially as-is because it remains foundational or already fits the target architecture. |
| **ADAPT** | Preserve the capability, but modify APIs, data models, UX, policy, or execution behavior for SERA orchestration. |
| **MOVE BEHIND SERA** | Retain the feature, but remove it from primary navigation and expose it through SERA intent handling or on-demand views. |
| **GENERATE DYNAMICALLY** | Replace static navigation or static screens with context-generated surfaces assembled by SERA. |
| **DEPRECATE** | Remove or retire because the AI-first model makes the interaction redundant or creates a cleaner alternative. |
| **RESEARCH** | Capability requires technical, regulatory, platform, safety, or product research before a final disposition is set. |

These classifications are not mutually exclusive. For example, a capability can be **KEEP + ADAPT + MOVE BEHIND SERA**.

---

## 3. Current Capability Baseline

### 3.1 Identity and Credentials

| Current capability | Current role | AI-first target role | Classification | Notes |
|---|---|---|---|---|
| Soul ID™ | Holder DID and identity root | Primary holder identity anchor for SERA and delegated agent authority | KEEP + ADAPT | SERA should never replace the identity root. |
| did:soul | DID method / identifier | Machine-resolvable identity reference for holder, organization, and agent interactions | KEEP | Foundation dependency. |
| SoulScan | Biometric DID generation / binding | Identity assurance input and high-trust recovery / verification capability | KEEP + ADAPT | Must remain isolated from general AI context. |
| Verifiable Credentials | Store and present credentials | SERA-queryable credential graph with selective disclosure | KEEP + ADAPT + MOVE BEHIND SERA | Credential browsing remains inspectable on demand. |
| Soulogram™ | ZKP / credential sharing | SERA-triggered proof preparation and selective presentation | KEEP + ADAPT + MOVE BEHIND SERA | SERA should explain requested claims before disclosure. |
| QR proof / credential presentation | Manual verifier interaction | Contextual SERA action: “Show my boarding pass”, “Prove age”, etc. | KEEP + ADAPT | Preserve a visible proof surface. |
| KYC/KYB credentials | Compliance identity evidence | SERA-accessible verification state and service eligibility signal | KEEP + ADAPT | Must remain minimally exposed. |

### 3.2 Current SERA Capability

| Current capability | Current role | AI-first target role | Classification | Notes |
|---|---|---|---|---|
| SERA in current wallet | Existing conversational AI surface | Primary wallet shell, orchestrator, intent resolver, contextual assistant, and agent interface | KEEP + ADAPT | Existing implementation must be audited before replacement decisions. |
| Current chat UI | User asks questions / receives responses | Base for multimodal conversation, voice, dynamic views and action planning | ADAPT + GENERATE DYNAMICALLY | Avoid treating SERA as a tab. |
| Existing AI service integrations | Current reasoning / response generation | Tool-mediated orchestration over wallet functions | ADAPT + RESEARCH | Need inventory of models, prompts, context, logging, and data exposure. |

### 3.3 Multi-Chain and Asset Infrastructure

| Current capability | Current role | AI-first target role | Classification | Notes |
|---|---|---|---|---|
| Multiple chain integrations | User chooses network and transacts | SERA evaluates chain suitability and presents recommended route | KEEP + ADAPT | Core differentiator for AI-first transaction planning. |
| Chain-specific balances | Displayed per network | Unified conversational and contextual asset graph | KEEP + ADAPT | SERA must retain network provenance. |
| Send | Manual transfer flow | SERA-prepared, policy-gated transfer | KEEP + ADAPT + MOVE BEHIND SERA | Inspectable transaction review remains mandatory. |
| Receive | Address / QR presentation | SERA-generated receive request or payment intent | KEEP + ADAPT + MOVE BEHIND SERA | Chain and asset ambiguity must be resolved safely. |
| Swap | Manual swap workflow | SERA route preparation through eligible provider / integration | KEEP + ADAPT + RESEARCH | Regulatory/provider boundaries remain explicit. |
| WalletConnect | dApp connection | SERA-mediated external interaction and intent explanation | KEEP + ADAPT | Agent must not blindly approve external requests. |
| Gas / fee checks | Transaction preparation input | Chain-selection, timing and execution-cost reasoning input | KEEP + ADAPT | Should contribute to route recommendation. |
| Token / NFT / RWA holdings | Portfolio presentation | SERA-queryable asset context and generated portfolio views | KEEP + ADAPT + GENERATE DYNAMICALLY | Underlying ownership state remains inspectable. |

### 3.4 Spam Token and Asset Safety

| Current capability | Current role | AI-first target role | Classification | Notes |
|---|---|---|---|---|
| Spam token filters | Hide or flag suspicious tokens | Trust/risk signal for SERA, asset visibility, warnings and execution gating | KEEP + ADAPT | Important input into AI reasoning. |
| Suspicious asset suppression | Prevent clutter / accidental interaction | SERA may suppress unsafe actions and explain why | KEEP + ADAPT | Must distinguish hidden from removed. |
| Token reputation signals | Asset screening | Input to transaction risk, discovery, and trust evaluation | ADAPT + RESEARCH | Determine source quality and confidence handling. |

### 3.5 News and External Intelligence

| Current capability | Current role | AI-first target role | Classification | Notes |
|---|---|---|---|---|
| News APIs | General or wallet-related news | Proactive contextual intelligence tied to holdings, protocols, counterparties, chains and events | KEEP + ADAPT | Requires relevance, veracity and materiality filtering. |
| LinkedIn APIs | Professional / organization context | Optional entity enrichment and professional / business context | KEEP + ADAPT + RESEARCH | Must define privacy, terms-of-use and reliance boundaries. |
| External market / network data | Informational support where available | SERA decision context for routes, fees, risk and recommendations | KEEP + ADAPT | Data provenance must be visible in high-risk decisions. |

### 3.6 Transaction and Activity Data

| Current capability | Current role | AI-first target role | Classification | Notes |
|---|---|---|---|---|
| Transaction history | Historical activity list | Conversational memory, anomaly context, recipient resolution and generated views | KEEP + ADAPT + MOVE BEHIND SERA | History must not become opaque AI-only memory. |
| Activity feed | Static or chronological wallet events | SERA briefing and contextual activity view | ADAPT + GENERATE DYNAMICALLY | User should be able to inspect full chronology. |
| Approvals / pending actions | Manual review | SERA surfaces pending authority decisions in context | KEEP + ADAPT | High-value proactive surface. |

### 3.7 Security, Trust and Authorization

| Current / adjacent capability | Current role | AI-first target role | Classification | Notes |
|---|---|---|---|---|
| Non-custodial key control | Holder controls wallet keys | Cryptographic execution boundary under SERA orchestration | KEEP | Non-negotiable. |
| Biometric approval | User authentication / approval | High-risk action authorization | KEEP + ADAPT | Voice understanding must never replace required cryptographic approval. |
| Trust Protocol | Trust score / trust engine | Evaluate identity, authority, delegation and policy before action | KEEP + ADAPT | Core SERA decision dependency. |
| REV | Runtime pass/fail gate | Final action authorization gate for SERA-mediated execution | KEEP + ADAPT | Must remain separate from LLM reasoning. |
| AURION | Continuous attestation | Ongoing runtime assurance where needed | KEEP + ADAPT | Important for delegated / persistent tasks. |
| SoulShield | Asset protection | SERA-accessible risk and emergency protection layer | KEEP + ADAPT | Potential Control Center / quick action integration. |

### 3.8 Navigation and UI

| Current capability | Current role | AI-first target role | Classification | Notes |
|---|---|---|---|---|
| Home/dashboard | Primary overview | Secondary contextual workspace behind SERA | ADAPT + GENERATE DYNAMICALLY | Likely one of the largest UX changes. |
| Static navigation | Primary feature discovery | Reduced, secondary, or generated navigation | MOVE BEHIND SERA + DEPRECATE PARTIALLY | Preserve fallback inspectability. |
| Asset screen | Manual asset inspection | On-demand generated asset view | KEEP + MOVE BEHIND SERA + GENERATE DYNAMICALLY | SERA answer first, view second. |
| Credential screen | Manual credential browser | On-demand credential workspace | KEEP + MOVE BEHIND SERA + GENERATE DYNAMICALLY | Do not remove inspectability. |
| News screen | Information feed | Contextual or proactive SERA intelligence surface | ADAPT + MOVE BEHIND SERA | Static feed may remain optional. |
| Settings | Manual configuration | Mostly secondary surface, with conversational configuration where safe | KEEP + MOVE BEHIND SERA | Sensitive settings still require explicit visible UI. |
| Transaction screen | User-driven execution | SERA-generated transaction review surface | KEEP + ADAPT + GENERATE DYNAMICALLY | Must show amount, recipient, chain, fee, policy, and approval state. |

### 3.9 Notifications and Proactivity

| Current capability | Current role | AI-first target role | Classification | Notes |
|---|---|---|---|---|
| Push notifications | Event alerts | SERA proactive communication surface | KEEP + ADAPT | Must use relevance and severity policy. |
| In-app alerts | Wallet warnings / information | Contextual SERA warnings and action prompts | KEEP + ADAPT | Avoid alert overload. |
| Scheduled / monitored conditions | Limited or future capability | Agent runtime conditions and proactive tasks | RESEARCH + BUILD | Example: gas threshold, credential expiry, payment condition. |

### 3.10 Platform Surfaces

| Surface | Current role | AI-first target role | Classification |
|---|---|---|---|
| Main iOS app | Wallet UI | Full SERA conversational shell + generated workspaces | ADAPT |
| iOS Home Screen widget | TBD / existing status unknown | SERA quick access, glanceable wallet context | RESEARCH + BUILD |
| iOS Lock Screen widget | TBD | Identity / pay / prove / ask entry surface | RESEARCH + BUILD |
| iOS Dynamic Island | TBD | Active task / authorization / transaction state | RESEARCH + BUILD |
| iOS Live Activities | TBD | Long-running agent task state | RESEARCH + BUILD |
| iOS App Intents | TBD | OS-visible wallet action vocabulary | RESEARCH + BUILD |
| Android Home widget | TBD / existing status unknown | SERA quick access and context | RESEARCH + BUILD |
| Android bubble | Not current | Ambient SERA conversation | RESEARCH + BUILD |
| Android overlay | Not current | Optional advanced companion mode | RESEARCH ONLY | Not default architecture. |
| Android notifications | Existing platform capability | Proactive SERA state and action entry | ADAPT |

---

## 4. AI-First Reinterpretation Rules

### 4.1 Navigation becomes intent

Current pattern:

```text
Open wallet → choose section → choose action → enter data → confirm
```

Target pattern:

```text
Invoke SERA → state intent → SERA gathers context → prepares action → presents inspectable result → user authorizes where required
```

Static navigation remains as a fallback and audit surface, not the primary interaction model.

### 4.2 Screens become generated workspaces

Rather than permanently separating credentials, assets, transactions, news, and identity into independent primary tabs, SERA should assemble relevant views in response to user context.

Examples:

```text
"Show what I need for my flight"
→ boarding pass
→ passport credential
→ travel credential
→ relevant payment / currency context
```

```text
"Why is this token hidden?"
→ spam filter reason
→ contract / chain context
→ risk indicators
→ explicit unhide path if permitted
```

```text
"Send Jane $500 USDC"
→ eligible balances by chain
→ recipient network compatibility
→ gas / fee comparison
→ route recommendation
→ transaction review
```

### 4.3 Intelligence becomes contextual rather than feed-first

News and external information should be attached to the holder's actual context.

Examples:

- protocol security incident relevant to a held asset,
- chain outage affecting a pending transaction,
- issuer announcement affecting a credential,
- regulatory event materially affecting a connected service,
- counterparty or organization information relevant to an interaction.

A static feed may remain, but SERA should determine what is material.

### 4.4 Multi-chain becomes a reasoning problem

The user should not need to know the optimal chain every time.

SERA should consider:

- holder balance by network,
- recipient network support,
- asset contract / representation,
- fees,
- expected settlement time,
- current network state,
- bridging requirements,
- route complexity,
- spam / risk signals,
- holder preference,
- Trust Protocol policy,
- REV decision,
- transaction value and risk.

The output must remain explainable and user-inspectable.

---

## 5. Existing SERA Audit Requirements

Before implementing the future orchestrator, the current SERA implementation must be inventoried.

Required audit questions:

1. Which model providers are currently used?
2. What data is sent to each provider?
3. Is wallet context passed as raw data, summaries, or structured tools?
4. Are prompts / system instructions version-controlled?
5. What wallet functions can SERA currently invoke?
6. Can SERA prepare or execute transactions today?
7. How are tool calls authenticated?
8. What logging is retained?
9. What user-specific memory exists?
10. Does current SERA support voice?
11. What speech-to-text provider or OS API is used?
12. What error / hallucination controls exist?
13. Are responses grounded against wallet state?
14. What fallback behavior exists when SERA is uncertain?
15. Which APIs can be preserved and wrapped rather than rewritten?

Until this audit is complete, no assumption should be made that current SERA must be discarded.

---

## 6. Service and Integration Inventory to Capture from Engineering

The following implementation-level inventory is required from the existing wallet codebase.

### Core wallet
- supported chains,
- RPC providers,
- chain configuration registry,
- balance services,
- token metadata providers,
- NFT / RWA services,
- gas estimators,
- transaction builder,
- signer interfaces,
- WalletConnect version and configuration,
- swap / routing providers,
- explorer integrations.

### Identity and credentials
- Soul ID integration,
- DID resolver,
- credential store,
- credential presentation engine,
- Soulogram integration,
- ZKP libraries,
- issuer / verifier interfaces,
- revocation / status services,
- SoulScan dependencies.

### Intelligence
- current SERA model provider(s),
- SERA backend services,
- news APIs,
- LinkedIn APIs,
- market / chain data providers,
- spam-token data sources,
- risk / reputation services.

### Security
- key storage implementation,
- biometric gating,
- secure enclave / keystore usage,
- signing flow,
- session handling,
- device binding,
- recovery implementation,
- logging and telemetry,
- secret management.

### Application architecture
- iOS framework / architecture,
- Android framework / architecture,
- shared code strategy,
- backend services,
- API gateway,
- database use,
- push infrastructure,
- analytics,
- feature flags,
- release pipeline.

---

## 7. Transformation Priority Map

### Priority A: Preserve and expose safely to SERA

- Soul ID
- wallet balances
- transaction history
- credentials
- send / receive
- multi-chain state
- gas / fee data
- spam-token filtering
- WalletConnect
- notifications

### Priority B: Convert into SERA reasoning inputs

- chain selection
- recipient history
- token reputation
- spam-token risk
- credential status
- news relevance
- transaction history
- network health
- fee conditions

### Priority C: Convert into SERA-generated actions

- transaction preparation
- credential presentation
- receive requests
- transaction review
- proof selection
- chain recommendation
- swap preparation
- wallet status explanation

### Priority D: Research before execution authority

- delegated execution
- autonomous recurring payments
- portfolio rebalancing
- autonomous swaps
- travel / commerce booking
- agent-to-agent transactions
- cross-app interactions
- external financial service execution

---

## 8. UX Preservation Rules

The AI-first redesign shall not remove the holder's ability to inspect foundational wallet state.

Mandatory inspectable surfaces include:

- balances,
- assets by chain,
- transaction history,
- credentials,
- credential issuer and status,
- recipient details,
- transaction amount,
- network,
- gas / fee,
- contract / token identity where relevant,
- approval state,
- Trust / REV result where exposed,
- connected applications / sessions,
- security settings,
- account recovery state.

Governing principle:

> SERA may replace navigation. SERA must not replace inspectability.

---

## 9. Candidate Deprecations

No existing feature is formally deprecated at DB02 stage. The following interaction patterns are candidates for partial retirement after prototype validation:

- permanent bottom navigation as the dominant interaction model,
- dashboard-first startup,
- manually selecting a chain before every transaction,
- requiring the user to navigate to a dedicated AI tab,
- static news as the primary intelligence surface,
- repeated manual discovery of credentials by category,
- duplicated manual transaction setup flows when intent can safely pre-fill them.

Any deprecation requires fallback accessibility and user testing before removal.

---

## 10. Known Unknowns

The following remain unresolved until the production wallet code and integrations are reviewed:

1. Exact current SERA implementation and tool scope.
2. Full supported-chain list and chain abstraction quality.
3. Current spam-token signal source and confidence model.
4. News-provider architecture and metadata quality.
5. LinkedIn API scope and current use cases.
6. Current transaction / swap provider boundaries.
7. Existing mobile framework decisions.
8. Existing voice capability, if any.
9. Current telemetry and privacy behavior.
10. Existing Trust Protocol / REV integration state in SSW.
11. Current SoulShield implementation status.
12. Existing notification architecture.
13. Current credential search / indexing model.
14. Existing local versus cloud data boundaries.

---

## 11. DB02 Output Decisions

### DB02-D01
Soul Super Wallet shall be treated as an existing production substrate, not a greenfield wallet.

### DB02-D02
Current SERA shall be audited and evolved where feasible rather than automatically replaced.

### DB02-D03
Multi-chain support becomes an AI decision input and route-planning capability rather than merely a manual network selector.

### DB02-D04
Spam-token filters become SERA trust and safety signals, not merely UI suppression rules.

### DB02-D05
News and LinkedIn integrations are retained as contextual intelligence sources subject to relevance, privacy, provenance, and platform-policy review.

### DB02-D06
Static wallet screens remain available for inspectability even where SERA becomes the primary navigation and orchestration layer.

### DB02-D07
No consequential transaction shall execute solely because SERA inferred an intent. Authorization remains governed by explicit policy, Trust Protocol, REV, cryptographic signing, and required holder confirmation.

### DB02-D08
The next design phase shall use this inventory to create explicit future-state SERA experience concepts and capability flows without prematurely changing production UI.

---

## 12. Next Controlled Artifacts

The recommended next sequence is:

1. **SSW-SERA-DB03: AI-First Experience Concepts & Adaptive Workspace Models**
2. **SSW-SERA-DB04: Advanced AI, OS & Agent Capability Research Radar**
3. **SSW-SERA-DB05: Privacy, Trust, Authority & Risk Boundary Board**
4. **SSW-AI-01: Platform Capability & Constraint Architecture**
5. **SSW-AI-02: SERA Interaction, Intent & Authority Architecture**

DB03 should begin translating this capability inventory into actual experience models such as conversational shell, adaptive workspace, ambient companion, zero-dashboard wallet, contextual travel / finance / identity states, and voice-first journeys.
