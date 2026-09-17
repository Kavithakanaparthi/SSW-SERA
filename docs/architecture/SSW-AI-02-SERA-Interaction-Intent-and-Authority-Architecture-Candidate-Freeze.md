# SSW-AI-02: SERA Interaction, Intent & Authority Architecture — Candidate Freeze

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-AI-02  
**Status:** Candidate Freeze  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA  
**Depends on:** SSW-AI-01; DB05; DB06; DB07; DB08; DB09; DB10; DB11; DB11A; DB12; DB13; DB14; DB15; DB16; DB17; DB17A; DB17B; DB18

---

## 1. Purpose

This document freezes the candidate interaction, intent, authority and execution-boundary architecture for SERA within Soul Super Wallet.

It defines how human language, voice, contextual assistance, proactive prompts, approvals, delegated authority, device trust, concealed-detail presentation and deterministic execution interact without allowing AI interpretation to become authority.

The governing principle is:

> SERA may interpret, explain, recommend, prepare and orchestrate. Authority is created only by the holder, a valid delegated mandate, and the deterministic control plane.

---

## 2. Scope

This specification covers:

- conversational and voice interaction;
- intent capture and normalization;
- ambiguity resolution;
- entity resolution;
- typed action contracts;
- contextual data minimization;
- risk classification;
- authority tiers;
- holder approval;
- delegated authority;
- device-specific authority;
- cross-device handoff;
- concealed-detail review;
- proactive prompts;
- credential presentation;
- payments and transaction preparation;
- WalletConnect and external service interaction;
- Trust Protocol and REV placement;
- signing isolation;
- execution evidence;
- failure and degraded-mode behavior.

It does not define model internals, chain-specific transaction formats, DID method cryptography, wallet key implementation, or final production API schemas.

---

## 3. Interaction Model

SERA is the primary interaction shell for the AI-first wallet, but not the only way to access wallet state.

The Phase 1 interaction model is:

**Ambient SERA + Conversational Shell + Adaptive Workspace + Inspectable Wallet State**

The holder can interact through:

1. text;
2. voice;
3. contextual action cards;
4. adaptive workspaces;
5. notifications and proactive prompts;
6. deterministic fallback wallet views;
7. device-native entry points permitted by the operating system.

There shall be no requirement that the holder converse with SERA to inspect assets, credentials, history, security state or pending actions.

---

## 4. SERA Identity in Interaction

SERA has a persistent `did:soul:agent` identity linked to the holder's Soul ID.

The SERA DID identifies the persistent agent relationship. It does not itself grant execution authority.

Runtime instances on different devices or environments are subordinate runtime identities associated with the SERA DID.

Examples:

- primary phone runtime;
- secondary phone runtime;
- tablet runtime;
- wearable runtime;
- protected cloud reasoning runtime.

Authority is evaluated per runtime instance, device state, action, context and mandate.

---

## 5. Intent Pipeline

Every consequential interaction shall pass through the following logical sequence:

```
Holder Input
   ↓
Capture
   ↓
Interpretation
   ↓
Intent Normalization
   ↓
Entity Resolution
   ↓
Context Resolution
   ↓
Typed Action Contract
   ↓
Capability Validation
   ↓
Authority Validation
   ↓
Risk Classification
   ↓
Trust Protocol
   ↓
REV
   ↓
Approval / Delegated Authority
   ↓
Authentication
   ↓
Signing
   ↓
Execution
   ↓
Evidence
```

The AI layer shall not directly invoke signing or execution.

---

## 6. Typed Intent Requirement

Natural language is never executable authority.

A natural-language request shall be transformed into a typed, deterministic intent object before it can enter the control plane.

A normalized intent shall minimally include:

- intent identifier;
- holder DID;
- SERA DID;
- runtime instance identifier;
- device identifier;
- intent type;
- action type;
- resolved entities;
- asset;
- amount where applicable;
- chain/network;
- counterparty;
- credential or claim scope where applicable;
- source modality;
- interpretation confidence;
- ambiguity indicators;
- requested authority mode;
- expiry;
- correlation identifier.

No execution-capable downstream service may rely on free-form natural language as its authoritative input.

---

## 7. Ambiguity Rule

The governing safety rule is:

> Ambiguity may inconvenience the holder. Ambiguity must never move money or disclose protected identity data.

If material ambiguity exists in any of the following, execution shall not proceed:

- amount;
- recipient;
- chain;
- asset;
- credential;
- claim scope;
- merchant;
- wallet;
- mandate;
- destination;
- fee-bearing route;
- action type.

SERA may resolve low-risk conversational ambiguity. Material execution ambiguity requires clarification or explicit holder review.

---

## 8. Voice Interaction

Voice is a first-class input modality, not an authorization mechanism.

Voice processing may include:

- transcription;
- holder-specific vocabulary adaptation;
- name and alias resolution;
- code-switching;
- number disambiguation;
- confidence scoring;
- context-aware interpretation.

Voice recognition or speaker recognition shall not replace required authentication.

For consequential actions, the system shall distinguish:

1. **voice command interpretation**;
2. **intent confirmation**;
3. **holder authorization**;
4. **cryptographic authentication/signing**.

These are separate events.

---

## 9. Voice Confidence Envelope

Voice-derived intents shall be evaluated using a confidence envelope that may include:

- acoustic confidence;
- holder adaptation confidence;
- vocabulary confidence;
- intent confidence;
- entity confidence;
- numeric confidence;
- contextual confidence;
- optional speaker confidence;
- environmental quality;
- action risk.

Numbers, recipients and asset identifiers receive elevated scrutiny.

Examples such as "15" versus "50" shall be treated as material ambiguity for value-bearing actions.

---

## 10. SERA Holder Voice Profile

The SERA Holder Voice Profile may contain:

- accent adaptation;
- pronunciation preferences;
- personal vocabulary;
- wallet aliases;
- recipient aliases;
- chain and token vocabulary;
- merchant aliases;
- correction history;
- code-switching preferences;
- historically ambiguous terms.

The profile is part of SERA's encrypted portable state, subject to the protections defined in DB17A.

Raw biometric audio is not portable SERA state by default.

---

## 11. Context Broker

SERA shall not receive unrestricted access to all wallet and identity data.

All context supplied to an AI runtime must pass through the Context Broker.

The Context Broker shall perform:

1. data classification;
2. purpose validation;
3. minimization;
4. redaction or transformation;
5. freshness evaluation;
6. source annotation;
7. approved context packaging.

The Context Broker may provide less information than the wallet itself possesses.

---

## 12. Data Classes

At minimum, the architecture recognizes:

- D0 Public;
- D1 General Personal;
- D2 Financial;
- D3 Identity;
- D4 Credential;
- D5 Behavioral;
- D6 Biometric;
- D7 Authorization;
- D8 Key Material.

AI model access becomes progressively more restricted as sensitivity increases.

D8 key material is never exposed to the model plane.

---

## 13. Authority Tiers

The candidate authority model is:

- **A0 Read / Explain**  
  No execution authority.

- **A1 Prepare / Retrieve**  
  SERA may prepare an action or retrieve permitted information.

- **A2 Explicit Approval Required**  
  SERA prepares; holder must explicitly approve.

- **A3 Bounded Delegation**  
  SERA may act within a holder-issued mandate with explicit constraints.

- **A4 Conditional Autonomous Execution**  
  SERA may execute only when predefined conditions and mandate boundaries are satisfied.

- **A5 Prohibited Autonomous Action**  
  The action requires direct holder involvement regardless of convenience.

SERA may never promote itself to a higher authority tier.

---

## 14. Mandates

Delegation is represented by a machine-enforceable mandate.

A mandate shall be bound to:

- mandate identifier;
- holder DID;
- SERA DID;
- permitted capabilities;
- permitted action types;
- asset scope;
- counterparty scope;
- chain/network scope;
- per-action value limits;
- cumulative value limits;
- time limits;
- frequency limits;
- contextual conditions;
- device/runtime restrictions;
- approval exceptions;
- expiry;
- revocation state;
- version;
- evidence requirements.

A mandate must be narrower than the holder's full wallet authority.

---

## 15. Device Trust

Authority is not inherited merely because the user is signed in.

Device trust states are:

- UNREGISTERED;
- REGISTERED;
- ATTESTED;
- TRUSTED;
- LIMITED;
- SUSPENDED;
- REVOKED.

An action's available authority is a function of:

```
Holder Identity
+ SERA Identity
+ Runtime Identity
+ Device Trust
+ Mandate
+ Context
+ Risk
+ Policy
+ Trust Protocol
+ REV
```

A wearable or secondary device shall not automatically inherit primary-phone authority.

---

## 16. Risk Classes

The runtime shall classify actions using at least the following conceptual scale:

- R0 Informational;
- R1 Low impact;
- R2 Moderate;
- R3 High;
- R4 Critical;
- R5 Prohibited or exceptional.

Risk may be influenced by:

- value;
- recipient novelty;
- chain;
- contract;
- asset;
- credential sensitivity;
- device state;
- location/context signals where permitted;
- unusual behavior;
- spam or scam indicators;
- Trust Protocol signals;
- REV state;
- automation;
- external intelligence confidence.

Risk classification may increase requirements. It may not weaken them.

---

## 17. Approval Architecture

Approval is a deterministic control-plane event.

An approval shall reference the exact action contract being authorized.

The approval context must make material terms available for review.

If any material term changes after approval, the approval becomes invalid.

Material changes include:

- recipient;
- amount;
- asset;
- chain;
- route;
- fee;
- credential claim set;
- merchant;
- contract;
- mandate scope.

---

## 18. Concealed-Detail Presentation

Sensitive action details may be concealed by default or by holder preference.

Concealment may apply to:

- balances;
- amounts;
- recipients;
- addresses;
- merchants;
- credential claims;
- counterparties;
- transaction details;
- security alerts.

The holder may reveal details per instance.

Rules:

- reveal does not equal approval;
- approval does not imply future reveal;
- concealed details re-hide on timeout, lock, backgrounding, device change or policy;
- spoken output follows the same concealment policy;
- wearables use stricter defaults;
- high-risk actions may require authenticated reveal before approval is enabled.

The system must be capable of evidencing that material details were reviewable without duplicating protected data into the audit log.

---

## 19. Proactive Interaction

SERA may proactively surface information based on monitored signals.

Notification classes are:

- CRITICAL;
- ACTION REQUIRED;
- RELEVANT;
- INFORMATIONAL;
- LOW VALUE.

Proactivity may:

- create awareness;
- summarize;
- explain;
- prepare an action;
- suggest a next step.

Proactivity shall not create authority.

External news, social, chain or market data may inform recommendations but shall never independently authorize an action.

---

## 20. Multi-Chain Interaction

SERA may compare routes based on:

- asset availability;
- recipient compatibility;
- estimated fees;
- expected confirmation characteristics;
- bridge requirements;
- wallet policy;
- holder preferences;
- supported chains;
- risk;
- Trust Protocol/REV implications.

A chain or route change after review is a material change and requires revalidation.

The user shall not be silently switched to a materially different execution route.

---

## 21. Credential Presentation

Credential presentation follows the same authority principles as financial actions.

SERA may:

- identify relevant credentials;
- explain a request;
- prepare a selective disclosure;
- prepare a zero-knowledge proof;
- minimize claim disclosure.

SERA may not silently disclose protected credential claims.

The typed presentation contract must specify:

- verifier;
- credential type;
- requested claims;
- disclosed claims;
- proof mechanism;
- expiry;
- purpose;
- holder approval or mandate basis.

---

## 22. WalletConnect and External Requests

External dApps and services are treated as untrusted request sources until validated.

SERA may explain WalletConnect requests and contract interactions.

External content is data, not instruction.

Prompt injection or manipulative text from a website, message, transaction memo or dApp must not bypass the deterministic control plane.

---

## 23. Trust Protocol Placement

Trust Protocol evaluates identity, authority, delegation and policy signals.

Its outputs may inform:

- risk;
- route acceptance;
- counterparty assessment;
- device/runtime confidence;
- action eligibility.

Trust Protocol is not equivalent to holder approval.

---

## 24. REV Placement

REV is the final runtime pass/fail gate where required.

REV may consume inputs from:

- Trust Protocol;
- device trust;
- mandates;
- policy;
- risk;
- AURION where applicable;
- execution context.

If REV is mandatory and unavailable, the affected consequential action fails closed.

The holder may still inspect, prepare, save or cancel an action.

---

## 25. Authentication and Signing

Authentication and signing remain outside the AI plane.

SERA may request an authentication step.

SERA may not:

- access raw private keys;
- construct arbitrary signer commands outside the typed contract;
- bypass device security;
- reduce required authentication due to model confidence.

The signing gateway accepts only canonical, validated signing payloads.

---

## 26. Cross-Device Handoff

An interaction may begin on one device and continue on another.

Handoff shall preserve:

- intent ID;
- correlation ID;
- material terms hash;
- risk;
- authority context;
- evidence lineage;
- concealment state where applicable.

Authority is re-evaluated on the receiving device.

A handoff does not transfer the source device's authority.

---

## 27. Wearables

Wearables are Phase 2 product surfaces but Phase 1 architectural constraints.

Wearables may support:

- SERA interaction;
- notifications;
- selected asset views;
- selected credential presentations;
- low-risk approvals;
- emergency lock;
- transaction preparation;
- handoff.

High-risk execution may require escalation to a stronger device.

---

## 28. Degraded Interaction

If AI or voice services fail, the wallet remains usable through deterministic fallback interfaces.

Failures may reduce:

- convenience;
- personalization;
- recommendation quality;
- speed;
- automation.

Failures must not reduce:

- authority requirements;
- privacy;
- signing assurance;
- Trust Protocol requirements;
- REV requirements;
- evidence integrity.

---

## 29. Unknown Execution State

If submission status is uncertain, the system enters `EXECUTION_STATUS_UNKNOWN`.

In this state:

- duplicate submission is suppressed;
- the action is reconciled across available sources;
- nonce/sequence is inspected where relevant;
- the holder receives a privacy-safe status;
- re-execution requires deterministic proof that duplication will not occur.

---

## 30. Evidence

Every consequential interaction contributes to the SERA Activity & Evidence Ledger defined in DB17B.

Evidence shall capture, as appropriate:

- intent;
- normalized action;
- resolved entities;
- authority basis;
- mandate;
- risk;
- device;
- Trust Protocol result;
- REV result;
- approval;
- authentication;
- signing reference;
- execution result;
- failure state;
- recovery state;
- concealment/reveal events;
- resulting receipt.

Evidence is not conversational memory.

---

## 31. Audit Reporting

The holder may request reports such as:

- all SERA-assisted transactions;
- transactions prepared by SERA;
- transactions executed after approval;
- transactions executed under mandate;
- blocked actions;
- REV-denied actions;
- credential disclosures;
- WalletConnect actions;
- security events.

Reports shall query structured evidence, not reconstruct activity from model memory.

---

## 32. Interaction Memory

SERA interaction memory follows DB08 and DB17A.

Memory may influence:

- language;
- aliases;
- recommendations;
- workspace organization;
- notification preferences;
- concealment preferences.

Memory shall not create authority.

A remembered preference cannot replace a mandate or approval.

---

## 33. Model Neutrality

Interaction architecture is provider-neutral.

The model interface shall expose controlled functions such as:

- interpret;
- classify;
- summarize;
- plan;
- explain;
- extract entities;
- produce candidate actions.

It shall not expose direct signing, key access or unrestricted execution primitives.

---

## 34. Security Invariants

The following invariants are frozen at candidate level:

1. Natural language is not executable authority.
2. Voice is not authorization.
3. Memory is not authorization.
4. Proactivity is not authorization.
5. External content is not instruction.
6. Model confidence cannot lower security requirements.
7. A device cannot inherit another device's authority merely through session continuity.
8. Reveal and approval are separate events.
9. Route changes invalidate materially affected approvals.
10. AI failure cannot make the wallet unusable.
11. Trust Protocol and REV requirements cannot be bypassed through fallback.
12. Signing remains outside the model plane.
13. Delegation is explicit, bounded, revocable and evidencable.
14. SERA cannot enlarge a mandate.
15. Consequential actions must produce evidence.

---

## 35. Candidate Reference Flow: Explicit Payment

```
Holder: "Send Alex 50 USDC"
      ↓
SERA interprets intent
      ↓
Recipient candidates resolved
      ↓
Amount/asset/recipient confidence checked
      ↓
Typed payment intent created
      ↓
Route candidates evaluated
      ↓
Authority = A2
      ↓
Risk classification
      ↓
Trust Protocol
      ↓
REV
      ↓
Concealed or visible review sheet
      ↓
Holder reveals if required
      ↓
Holder approves exact material terms
      ↓
Authentication
      ↓
Signing gateway
      ↓
Execution router
      ↓
Chain adapter
      ↓
Result
      ↓
SAEL evidence + holder receipt
```

---

## 36. Candidate Reference Flow: Delegated Payment

```
Trigger / scheduled condition
      ↓
SERA identifies valid mandate
      ↓
Typed action generated
      ↓
Mandate scope checked
      ↓
Value / counterparty / chain / frequency limits checked
      ↓
Risk classification
      ↓
Trust Protocol
      ↓
REV
      ↓
If within delegated authority:
      authentication policy
      ↓
Signing gateway
      ↓
Execution
      ↓
SAEL evidence
      ↓
Holder notification
```

No mandate match results in preparation or escalation, not autonomous execution.

---

## 37. Candidate Reference Flow: Credential Request

```
Verifier request
      ↓
Request parsed
      ↓
Requested claims identified
      ↓
Credential candidates resolved
      ↓
Minimum disclosure prepared
      ↓
Risk/sensitivity classification
      ↓
Authority check
      ↓
Trust Protocol / REV if policy requires
      ↓
Holder review
      ↓
Proof generated
      ↓
Presentation transmitted
      ↓
SAEL evidence
```

---

## 38. Candidate Reference Flow: Proactive Alert

```
Signal received
      ↓
Source confidence assessed
      ↓
Relevance / urgency assessed
      ↓
Notification class assigned
      ↓
Privacy presentation policy applied
      ↓
Holder sees alert
      ↓
Optional action requested
      ↓
New typed intent created
      ↓
Normal authority pipeline begins
```

The alert itself never becomes execution authority.

---

## 39. Candidate Freeze Boundary

The following are frozen for SSW-AI-02 Candidate Freeze:

- SERA-first interaction model;
- typed intent architecture;
- ambiguity rule;
- voice separation from authorization;
- Context Broker role;
- authority tiers A0-A5;
- mandate model;
- device-scoped authority;
- risk classification;
- concealed-detail behavior;
- proactive interaction constraints;
- Trust Protocol placement;
- REV placement;
- signing isolation;
- cross-device re-evaluation;
- Phase 2 wearable constraint;
- degraded-mode safety;
- evidence requirement;
- audit-reporting basis;
- model-neutral interaction boundary.

Implementation details may evolve without reopening the candidate architecture if they preserve these invariants.

---

## 40. Exit Criteria

SSW-AI-02 may progress from Candidate Freeze when:

1. SSW-AI-01 and SSW-AI-02 are jointly reviewed for contradiction;
2. canonical typed intent schemas are specified;
3. mandate schema is specified;
4. device trust transition rules are specified;
5. conceal/reveal interaction rules are prototyped;
6. payment, credential and delegated-action flows pass threat-model review;
7. model tool boundaries are validated against signing isolation;
8. SAEL evidence requirements are mapped to runtime events;
9. degraded-mode interaction behavior is tested;
10. no unresolved architecture issue permits AI interpretation to become authority.

---

## 41. Candidate Freeze Statement

SSW-AI-02 establishes the candidate interaction and authority architecture for the SERA-first Soul Super Wallet.

The architecture is intentionally asymmetric:

**SERA is allowed to understand more than she is allowed to do.**

This asymmetry is a security property, not a limitation.

The holder remains the root of authority. SERA remains the intelligent orchestration layer operating within explicit, inspectable and revocable boundaries.
