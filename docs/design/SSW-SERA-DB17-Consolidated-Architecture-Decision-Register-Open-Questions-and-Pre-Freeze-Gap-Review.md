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
