# SSW-SERA-DB08: SERA Memory, Context Broker & Personalization Architecture

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB08  
**Status:** Drawing Board / Controlled Design Exploration  
**Date:** 2026-09-17  
**Repository:** Kavithakanaparthi/SSW-SERA  

---

## 1. Purpose

This document defines the memory, context, and personalization architecture required for SERA to become the primary interface of Soul Super Wallet without turning the wallet into a centralized behavioral data warehouse.

The architecture must allow SERA to feel persistent, holder-specific, context-aware, and increasingly useful over time while preserving the following boundaries:

1. wallet keys and signing material remain outside model context,
2. sensitive credentials are minimized before model exposure,
3. memory is purpose-bound and inspectable,
4. holder-specific learning remains portable and revocable,
5. device-specific context does not automatically imply cross-device authority,
6. cloud inference receives only the context necessary for a specific task,
7. SERA personalization must never silently expand transactional authority.

The design builds on SSW-SERA-DB05 and SSW-SERA-DB07.

---

## 2. Core Design Principle

> SERA should remember enough to understand the holder, but not enough to become an uncontrolled copy of the holder's digital life.

The system therefore separates **memory** from **live wallet state**, **context** from **authority**, and **personalization** from **permission**.

---

## 3. Conceptual Architecture

```text
                          HOLDER
                             │
                    Voice / Text / UI
                             │
                             ▼
                    SERA EXPERIENCE
                             │
                             ▼
                  ┌────────────────────┐
                  │   CONTEXT BROKER   │
                  └─────────┬──────────┘
                            │
          ┌─────────────────┼──────────────────┐
          │                 │                  │
          ▼                 ▼                  ▼
   Live Wallet State   Personal Memory   External Context
          │                 │                  │
          │                 │                  │
 Assets / TX / VC     Preferences /      News / LinkedIn /
 chains / spam       aliases / habits     service APIs
 signals / devices   / voice profile
          │                 │                  │
          └─────────────────┼──────────────────┘
                            ▼
                     Context Policy
                            │
                minimize / redact / rank
                            │
                            ▼
                     MODEL CONTEXT
                            │
                            ▼
                        SERA PLAN
                            │
                            ▼
                DB07 EXECUTION CONTRACT
                            │
                   Trust Protocol / REV
```

The Context Broker is the only component that may assemble information for SERA reasoning. Models should not directly query raw wallet databases, credential stores, or unrestricted personal-memory stores.

---

## 4. Memory Is Not One Thing

SERA memory should be divided into controlled classes rather than implemented as one large embedding store.

### M0 — Ephemeral Conversation Context

Examples:
- current utterance,
- current conversation turn,
- recently resolved recipient,
- current task state,
- temporary comparison.

Retention: minutes to session duration.

Default: discarded when no longer required.

### M1 — Explicit Holder Preferences

Examples:
- preferred fiat display currency,
- preferred default chain policy,
- preferred response brevity,
- preferred voice speed,
- notification preferences,
- allowed languages.

Retention: persistent until holder changes or deletes.

### M2 — Personal Language & Voice Memory

Examples:
- pronunciations,
- aliases,
- names,
- code-switch patterns,
- recurrent speech corrections,
- holder vocabulary,
- voice adaptation features.

Governed by SSW-AI-VOICE-01 / future VOICE-02.

### M3 — Relationship & Entity Memory

Examples:
- “Mira” maps to a known contact,
- “treasury” maps to the Soulverse treasury wallet,
- “ops wallet” maps to the configured operating wallet,
- preferred merchant/account aliases.

This class helps resolve conversational references but does not itself grant authority.

### M4 — Behavioral Convenience Memory

Examples:
- user usually pays a specific invoice from a particular wallet,
- user often asks for balances in USD,
- user frequently views a credential before travel,
- user commonly chooses the lower-fee chain.

This class must be used to improve recommendations, not silently automate consequential actions.

### M5 — Delegation & Policy Memory

Examples:
- recurring payment mandate,
- transaction limit,
- approved counterparty,
- execution window,
- delegated SERA authority,
- wearable scope.

This is not AI memory in the ordinary sense. It is controlled policy state and must live in a deterministic authority store with explicit expiry, revocation, provenance, and signatures.

### M6 — Audit / Evidence Memory

Examples:
- prepared transaction details,
- REV decision,
- device used,
- approval method,
- evidence receipt,
- execution hash.

This must be immutable or append-only according to the relevant audit model.

### M7 — Sensitive Vault Data

Examples:
- seed phrase,
- private keys,
- raw biometric templates,
- signing secrets,
- recovery secrets.

**Never model memory. Never retrieval memory. Never conversational context.**

These remain isolated within secure wallet/key-management boundaries.

---

## 5. Memory Storage Model

SERA should not use a single universal persistence layer.

Recommended segmentation:

```text
Holder Preference Store
Personal Language Store
Entity Alias Store
Behavioral Convenience Store
Delegation / Policy Store
Audit Evidence Store
Secure Key Vault
```

Each store has different encryption, retention, replication, and access rules.

This separation prevents a compromise of one personalization subsystem from exposing transactional authority or cryptographic material.

---

## 6. Context Broker Responsibilities

The Context Broker is a policy-enforcing mediator between SERA and all wallet information sources.

For every SERA request it must determine:

1. what information is necessary,
2. what data class each item belongs to,
3. whether the active model is local or external,
4. whether the data may leave the device,
5. whether the data can be represented as an abstraction rather than raw content,
6. how long the derived context may survive,
7. whether holder consent is required,
8. whether the context could influence a consequential action,
9. whether stale information must be refreshed before use.

---

## 7. Minimum Necessary Context

The Context Broker should construct the smallest useful context package.

Example request:

> “Do I have the right credential for this airline?”

Do not send the entire credential wallet to the model.

Instead expose:

```json
{
  "requested_domain": "air_travel",
  "available_credentials": [
    {
      "type": "passport",
      "status": "valid",
      "issuer_status": "verified",
      "expiry_bucket": "12-24_months"
    },
    {
      "type": "boarding_pass",
      "status": "valid",
      "carrier": "requested_carrier"
    }
  ]
}
```

The raw credential remains in the credential subsystem until the holder explicitly requests presentation or detailed inspection.

---

## 8. Model Context Tiers

### Tier C0 — No Model Context

Used for deterministic wallet functions where AI adds no value.

Examples:
- cryptographic signing,
- key retrieval,
- low-level chain serialization,
- signature verification.

### Tier C1 — Public / Non-Sensitive Context

Examples:
- market news,
- public chain metadata,
- token metadata,
- public company information.

### Tier C2 — Abstracted Personal Context

Examples:
- preferred currency,
- wallet alias,
- balance category,
- credential type/status,
- language preference.

### Tier C3 — Sensitive Task Context

Examples:
- exact transaction amount,
- intended recipient,
- selected credential claim,
- specific account relationship.

Requires stricter policy and preferably local/on-device inference where practical.

### Tier C4 — Restricted Context

Examples:
- full credential payload,
- detailed identity attributes,
- high-sensitivity financial history.

Only exposed when necessary for an explicit holder task and under policy controls.

### Tier C5 — Prohibited Context

Examples:
- private keys,
- seed phrases,
- signing secrets,
- raw recovery secrets.

Never exposed to models.

---

## 9. Local vs Cloud Context Policy

SERA should support a hybrid inference architecture.

### Prefer local processing for:

- voice adaptation,
- pronunciation matching,
- entity alias resolution,
- basic intent classification,
- sensitive wallet summarization,
- credential categorization,
- spam/risk signal pre-processing,
- short-term memory retrieval,
- offline interaction.

### Cloud processing may be used for:

- complex research,
- large-context reasoning,
- external news synthesis,
- planning across multiple public services,
- long-form explanation,
- non-sensitive semantic search.

### Cloud context rule

Before any external model call:

```text
raw context
   ↓
classification
   ↓
minimization
   ↓
redaction / abstraction
   ↓
policy check
   ↓
external model
```

External models must not be assumed to be trusted storage.

---

## 10. Personalization Layers

SERA personalization should be layered.

### P1 — Interaction Preferences

Tone, length, preferred language, preferred output modality.

### P2 — Vocabulary & Pronunciation

Holder-specific language, abbreviations, names, pronunciations.

### P3 — Entity Familiarity

Wallet names, contacts, organizations, merchants.

### P4 — Workflow Familiarity

Frequently used tasks and preferred workflow patterns.

### P5 — Decision Preferences

Examples:
- “prefer lower fee over faster settlement,”
- “always show fees before swaps,”
- “never use bridges without asking.”

These remain preferences, not authority.

### P6 — Delegated Authority

Explicit mandates only. Stored outside the ordinary memory system.

---

## 11. Learning From Corrections

Holder corrections are among the most valuable personalization signals.

Examples:

> “I meant Polygon, not Ethereum.”

> “When I say treasury, I mean the business treasury wallet.”

> “I said fifteen, not fifty.”

Correction processing should be explicit and typed:

```text
Correction Event
   │
   ├── speech correction
   ├── entity correction
   ├── preference correction
   ├── workflow correction
   └── authority correction
```

Only the appropriate store should update.

A speech correction should not silently create a transaction rule.

An entity alias correction should not silently establish delegated authority.

---

## 12. Memory Confidence

Not every remembered item should be treated as fact.

Each memory item should include at least:

```json
{
  "memory_id": "...",
  "type": "entity_alias",
  "source": "holder_explicit",
  "confidence": 1.0,
  "created_at": "...",
  "last_confirmed_at": "...",
  "expires_at": null,
  "scope": "holder",
  "device_scope": "all_authorized_devices"
}
```

Sources may include:

- holder explicit,
- holder correction,
- system observed,
- inferred,
- external imported.

Inferred memory should have lower authority than explicit holder statements.

---

## 13. Staleness & Revalidation

Memory can become wrong.

Examples:
- preferred wallet changes,
- employee leaves an organization,
- recipient changes address,
- credential expires,
- device is revoked,
- delegated mandate expires.

Therefore memory should have freshness rules.

The Context Broker must not rely on stale memory for consequential execution when live authoritative data is available.

---

## 14. Personalization Must Not Become Authorization

This is a hard boundary.

If SERA observes:

> The holder usually sends $500 USDC to Acme on Polygon.

SERA may use that to propose:

> “You usually use Polygon for Acme. Shall I prepare it there?”

SERA must not conclude:

> “The holder usually does this, therefore I am authorized to execute it.”

Behavioral memory can influence recommendations.

Only explicit policy/delegation objects can influence authority.

---

## 15. Cross-Device Memory

Phase 2 wearable support requires a device-neutral personalization model.

Memory should be divided into:

### Holder-global memory

Examples:
- preferred language,
- pronunciation dictionary,
- contact aliases,
- preferred display currency.

### Device-specific memory

Examples:
- notification mode,
- wearable quick actions,
- local biometric enrollment status,
- local voice model artifacts,
- device trust state.

### Device-restricted policy

Examples:
- watch may approve transactions below a defined threshold,
- phone required for credential disclosure class X,
- desktop may view but not sign.

A new device must not automatically receive all personalization artifacts or all authority.

---

## 16. Wearable Context Model

Wearables should receive compact context packages rather than full wallet state.

Example wearable payment approval package:

```json
{
  "intent": "send_asset",
  "amount": "250.00",
  "asset": "USDC",
  "recipient_label": "Acme Treasury",
  "chain": "Polygon",
  "fee_estimate": "0.02",
  "risk": "R2",
  "rev_state": "pass",
  "expires_at": "..."
}
```

The wearable does not need unrestricted transaction history, all credentials, all contact metadata, or raw model memory.

---

## 17. Voice Profile Integration

SERA's voice profile should integrate with memory through controlled interfaces.

Voice profile stores may contain:

- pronunciation patterns,
- preferred languages,
- code-switch behavior,
- vocabulary,
- acoustic adaptation features,
- correction-derived confusion mappings.

Voice data should not be merged into general behavioral memory without purpose.

Raw voice recordings should not become default persistent memory.

---

## 18. News & LinkedIn Context

Existing news and LinkedIn integrations may enrich SERA, but they must remain external-context sources rather than authoritative holder memory by default.

Example:

News says a token issuer has experienced an incident.

SERA may surface:

> “There is current reporting relevant to one of your holdings.”

But news alone must not rewrite wallet state or execute a transaction.

LinkedIn or other professional data may help disambiguate organizations or contacts, but external data should not override verified identity or holder-confirmed entity mappings.

---

## 19. Spam Token Memory

Spam-token signals should remain security intelligence, not ordinary personalization.

SERA may remember:

- that an asset was flagged,
- why it was flagged,
- whether the holder explicitly overrode the warning,
- whether the flag later changed.

But one user override should not globally teach SERA that the token is safe.

---

## 20. Explainable Memory

The holder should be able to ask:

> “Why did you think I meant Polygon?”

SERA should be able to answer from provenance:

> “You used Polygon for the last three Acme transfers, and you previously told me to prefer lower fees. I had not yet prepared the transaction.”

This requires provenance fields for memory-derived suggestions.

---

## 21. Memory Management UX

The user should eventually have a simple SERA-accessible memory control surface.

Examples:

> “What do you remember about my payment preferences?”

> “Forget the alias ‘treasury’.”

> “Stop remembering merchant preferences.”

> “Show me what you learned from my voice corrections.”

> “Do not use LinkedIn data for personalization.”

Memory controls should be understandable in ordinary language.

---

## 22. Retention Classes

Recommended retention classes:

| Class | Description | Default |
|---|---|---|
| RT0 | ephemeral task state | session only |
| RT1 | temporary convenience memory | days/weeks |
| RT2 | explicit preference | persistent until changed |
| RT3 | personal vocabulary / aliases | persistent until changed |
| RT4 | delegated authority | explicit expiry required |
| RT5 | execution evidence | retention by audit policy |
| RT6 | key material | secure vault lifecycle only |

---

## 23. Context Assembly Example

Holder says:

> “Send Mira the same amount as last time.”

Context Broker process:

```text
voice transcript
   ↓
voice profile resolves “Mira” candidates
   ↓
entity memory finds holder-confirmed contact alias
   ↓
transaction history retrieves last qualifying transfer
   ↓
chain availability and fee context refreshed
   ↓
risk engine classifies consequence
   ↓
model receives only necessary structured summary
   ↓
SERA proposes exact transaction
   ↓
holder confirms / policy evaluates
   ↓
DB07 execution contract
```

The model does not receive raw seed data, full transaction history, full contact graph, or unrestricted credentials.

---

## 24. Security Threats

The memory architecture must explicitly defend against:

- prompt injection through external content,
- malicious news or web content altering holder memory,
- poisoned personalization,
- false entity alias creation,
- voice spoofing that creates durable preferences,
- stale recipient memory,
- device compromise,
- unauthorized memory export,
- model-generated false memories,
- cross-account memory leakage.

External content must not be allowed to create durable holder memory without policy.

---

## 25. Memory Write Policy

Durable memory writes should require one of the following:

1. explicit holder statement,
2. explicit holder correction,
3. deterministic wallet event approved for retention,
4. controlled system observation under a defined policy.

A model inference alone should not create high-trust durable memory.

---

## 26. Context Broker Policy Object

Illustrative policy object:

```json
{
  "request_id": "ctx_...",
  "intent": "prepare_transfer",
  "model_location": "on_device",
  "required_context": [
    "recipient_alias",
    "last_transfer_amount",
    "available_chains"
  ],
  "prohibited_context": [
    "private_key",
    "seed_phrase",
    "unrelated_credentials"
  ],
  "retention": "ephemeral",
  "external_transmission": false
}
```

---

## 27. Relationship to Trust Protocol and REV

Memory helps SERA understand context.

Memory does not itself grant execution authority.

Trust Protocol and REV should receive deterministic, normalized inputs such as:

- holder identity,
- delegated authority,
- device trust,
- capability scope,
- policy status,
- action risk,
- counterparty trust,
- environment state.

Personal memory may help resolve a human-readable name into a candidate entity, but the final entity used in authorization must be cryptographically or otherwise deterministically resolved.

---

## 28. Failure Modes

When personalization is unavailable or corrupted:

- SERA should fall back to generic behavior,
- consequential actions should become more conservative,
- unresolved aliases should trigger clarification,
- holder authority should not disappear,
- wallet signing remains available through deterministic UI flows.

The wallet must remain functional without SERA memory.

---

## 29. Portability & Recovery

Holder-controlled personalization should be portable across authorized devices.

Portable items may include:

- preferences,
- aliases,
- voice pronunciation dictionary,
- language settings,
- selected workflow preferences.

Highly sensitive local model artifacts may need re-enrollment rather than raw transfer.

Delegated authority must be restored from its authoritative policy store, not reconstructed from AI memory.

---

## 30. Implementation Components

Candidate components:

1. `ContextBroker`
2. `MemoryPolicyEngine`
3. `HolderPreferenceStore`
4. `PersonalLanguageStore`
5. `EntityAliasStore`
6. `BehavioralConvenienceStore`
7. `DelegationPolicyStore`
8. `AuditEvidenceStore`
9. `MemoryProvenanceService`
10. `ContextMinimizer`
11. `ContextRedactor`
12. `DeviceContextService`
13. `MemorySyncService`
14. `MemoryInspectionAPI`
15. `MemoryDeletionAPI`

---

## 31. API Sketches

### Resolve context

```text
resolveContext(intent, holder, device, requestedCapability)
```

### Read memory

```text
getMemory(memoryType, scope, purpose)
```

### Write memory

```text
writeMemory(value, provenance, confidence, retentionClass, scope)
```

### Forget memory

```text
forgetMemory(memoryId)
```

### Explain memory use

```text
explainContextDecision(requestId)
```

---

## 32. Acceptance Principles

The architecture should not be considered ready until the following are true:

- models cannot directly query key stores,
- context is minimized before external inference,
- holder memory is separated by class and purpose,
- durable memory has provenance,
- inferred memory cannot silently become authority,
- users can inspect and remove personalization items,
- wearable context is scoped and minimal,
- voice corrections update only appropriate stores,
- external content cannot create durable high-trust memory by itself,
- corrupted memory cannot block deterministic wallet access,
- memory sync never automatically expands device authority,
- every consequential execution still flows through DB07, Trust Protocol and REV.

---

## 33. Controlled Design Decisions

### DB08-D01
SERA will use a dedicated Context Broker rather than unrestricted model access to wallet data.

### DB08-D02
Memory will be segmented by purpose and sensitivity rather than stored in one universal memory store.

### DB08-D03
Private keys, seed phrases and signing secrets are prohibited from model context and AI memory.

### DB08-D04
Personalization may influence recommendations but cannot itself establish transaction authority.

### DB08-D05
Holder corrections are high-value memory signals but must update only the relevant memory domain.

### DB08-D06
All durable memory requires provenance.

### DB08-D07
Cloud model context must be minimized, redacted and purpose-bound.

### DB08-D08
Wearables receive scoped context packages, not unrestricted wallet memory.

### DB08-D09
External news and professional-data integrations are contextual sources, not authoritative holder memory by default.

### DB08-D10
The wallet must remain operational if personalization or SERA memory is unavailable.

### DB08-D11
Memory portability and device authority are separate concerns.

### DB08-D12
Delegated authority lives in a deterministic policy store, never ordinary AI memory.

---

## 34. Next Design Step

The next logical document is:

**SSW-SERA-DB09: Proactive Intelligence, Monitoring & Notification Architecture**

It should define how SERA observes wallet state, chain events, credentials, news, spam/risk signals and delegated conditions; decides what deserves interruption; chooses phone vs wearable vs passive briefing; and prevents proactive intelligence from becoming notification noise or unauthorized autonomous action.
