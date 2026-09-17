# SSW-SERA-DB04A
## Wearables Phase 2 Foundation Considerations

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB04A  
**Status:** Design Board / Foundation Constraint  
**Phase:** Phase 1 architecture obligation for Phase 2 wearable launch  
**Date:** 2026-09-17  

---

## 1. Decision

Wearable support is a **Phase 2 launch objective**, but it is a **Phase 1 architectural requirement**.

The Phase 1 phone-first architecture SHALL therefore avoid decisions that make watchOS, Wear OS, and later wearable surfaces expensive or structurally incompatible additions.

The design assumption is:

> SERA is not an iPhone or Android-phone feature. SERA is the holder's identity-bound agent, with the phone as the first full-capability surface and wearables as a second-phase trusted interaction surface.

---

## 2. Why this must be designed now

Adding watch support later without foundation planning typically forces expensive changes in:

- state synchronization,
- authentication boundaries,
- intent/action definitions,
- UI assumptions,
- notification architecture,
- background execution,
- device trust,
- key handling,
- credential presentation,
- voice interaction,
- offline behavior,
- transaction approval,
- and recovery flows.

For SSW-SERA this risk is greater because SERA is intended to become the primary wallet interface rather than a secondary assistant.

Phase 1 must therefore define capabilities as reusable actions and data contracts rather than as phone-screen logic.

---

## 3. Target wearable platforms

### 3.1 Phase 2 primary targets

- Apple Watch / watchOS
- Wear OS watches

### 3.2 Later research targets

- smart glasses,
- hearables / earbuds with assistant interaction,
- rings and other authentication-oriented wearables,
- vehicle-integrated wearable interactions,
- future ambient devices.

No dependency on any single future form factor should enter core SERA architecture.

---

## 4. Wearable product philosophy

The wearable is not a miniature wallet dashboard.

The wearable should primarily provide:

1. **SERA access**
2. **glanceable wallet state**
3. **notifications and approvals**
4. **voice-first commands**
5. **identity and credential presentation shortcuts**
6. **transaction confirmation**
7. **security actions**
8. **continuity with the phone and cloud agent runtime**

The phone remains the richer inspection and management surface.

---

## 5. Candidate Phase 2 wearable capabilities

### 5.1 Conversational SERA

Examples:

- "SERA, what's my USDC balance?"
- "Did Acme pay us?"
- "Show my boarding pass."
- "What needs my approval?"
- "Lock my wallet."

Voice should be the primary wearable interaction channel where platform capability permits.

### 5.2 Glanceable wallet state

Potential watch complications / tiles / widgets:

- total wallet value,
- selected asset balance,
- pending approval count,
- credential expiry warning,
- security state,
- active agent task,
- payment status,
- trusted network / chain status,
- high-priority SERA alert.

Sensitive information must be configurable and privacy-aware.

### 5.3 Transaction approval

A wearable may act as a high-friction confirmation surface for prepared transactions, subject to platform and security policy.

Example:

```text
SERA prepared
250 USDC
→ Acme Treasury
Polygon
Fee: $0.04

[Approve] [Reject]
```

The wearable MUST NOT bypass wallet policy, Trust Protocol, REV, signing controls, or required biometric/device authentication.

### 5.4 Identity / credential presentation

Potential actions:

- present boarding credential,
- show membership credential,
- initiate verifiable presentation,
- select proof request,
- approve selective disclosure,
- present QR / NFC-derived handoff where platform support permits.

### 5.5 Security controls

Examples:

- emergency wallet lock,
- revoke active agent session,
- reject pending transaction,
- pause delegated automation,
- flag suspicious activity,
- invoke recovery workflow entry point.

These should be exposed through the same SERA capability/action layer used by the phone.

---

## 6. Architectural obligations for Phase 1

### 6.1 Capability-first APIs

Every important wallet operation should exist as a reusable capability independent of a specific phone screen.

Examples:

```text
GetBalance
GetAssetPosition
GetPendingApprovals
PrepareTransfer
ReviewTransfer
ApproveTransfer
RejectTransfer
GetCredential
PresentCredential
GetCredentialStatus
GetSecurityState
LockWallet
PauseDelegation
ResumeDelegation
AskSERA
GetAgentTaskStatus
```

A watch, phone widget, voice surface, or future device should call the same capability contracts.

### 6.2 Device-neutral SERA intent model

SERA intents must describe user intent, not UI navigation.

Wrong abstraction:

```text
OpenAssetsScreen
TapUSDC
TapSend
```

Correct abstraction:

```text
intent: transfer_asset
asset: USDC
amount: 250
recipient: Acme Treasury
```

This is required for wearable portability.

### 6.3 Shared context model

SERA should maintain a device-neutral interaction state so a task can move between devices.

Example:

```text
Watch:
"Prepare $500 for Acme"

Phone:
opens directly to prepared transaction review
```

Or:

```text
Phone:
SERA detects credential request

Watch:
shows approval / presentation prompt
```

### 6.4 Device trust registry

Each authorized device should have an explicit trust record.

Candidate properties:

```text
device_id
holder_id
platform
device_class
trust_level
paired_at
last_attested_at
allowed_capabilities
signing_authority
biometric_state
revocation_state
```

A wearable must never implicitly inherit all phone authority merely because it is paired.

### 6.5 Capability-scoped wearable authority

Different devices may receive different rights.

Example:

```text
Apple Watch
READ_BALANCE        yes
VIEW_ALERTS         yes
APPROVE_LOW_RISK    yes
PRESENT_CREDENTIAL  conditional
CREATE_DELEGATION   no
EXPORT_KEYS         never
RECOVERY_RESET      no
```

Authority should be explicit and policy-controlled.

### 6.6 Portable event model

Notifications, agent tasks, approvals, credential requests, security events, and transaction status changes should be modeled as reusable events rather than phone-only push payloads.

Candidate event classes:

```text
transaction.prepared
transaction.approval_required
transaction.executed
credential.requested
credential.expiring
security.alert
agent.task_update
agent.action_required
delegation.threshold_reached
wallet.locked
```

These events can then surface appropriately on phone, watch, widget, notification, or future device.

---

## 7. Apple Watch / watchOS implications

Current watchOS provides multiple native surfaces that align well with SERA:

- watchOS app,
- complications,
- Smart Stack widgets,
- interactive notifications,
- Siri / App Intents,
- Live Activities surfaced from iPhone,
- hardware-triggered shortcuts where supported.

Architecture implication:

- App Intents should be designed during Phase 1 as reusable capability descriptors.
- WidgetKit models should avoid phone-specific assumptions.
- transaction and credential actions must support locked/unlocked device constraints.
- watchOS should be able to display meaningful state without requiring a full phone UI transition.

Apple recommends planning shared widgets and watch complications early because doing so allows shared code and avoids costly later changes.

---

## 8. Wear OS implications

Wear OS should be considered across several surfaces:

- full wearable app,
- Tiles,
- complications,
- notifications,
- ongoing activities,
- phone-watch data synchronization,
- voice-driven actions,
- foreground and deferred background work.

Architecture implication:

- data contracts must remain small and battery-efficient,
- long-running work should remain in the appropriate phone/cloud runtime rather than being unnecessarily duplicated on the watch,
- the watch should act primarily as a context, command, notification, approval, and security surface,
- synchronization should tolerate temporary watch/phone/network disconnection.

---

## 9. Voice architecture implications

SSW-AI-VOICE-01 must be wearable-aware.

The holder's trained language profile should not need to be retrained independently on every wearable.

Required design direction:

```text
Holder Voice Profile
        │
        ├── phone
        ├── Apple Watch
        ├── Wear OS
        └── future wearable
```

However, microphone characteristics and environmental conditions vary by device.

The voice subsystem must therefore distinguish:

- holder language/adaptation profile,
- device-specific acoustic calibration,
- environmental confidence,
- speaker confidence,
- command confidence.

Wearable speech must remain subject to the same risk-based confirmation rules as phone speech.

---

## 10. Multi-device SERA continuity

SERA should have one holder-level identity and context, not separate disconnected personalities on each device.

Conceptual model:

```text
                 SERA HOLDER INSTANCE
                         │
             ┌───────────┼───────────┐
             │           │           │
           iPhone      Android     Cloud Runtime
             │           │           │
             └──────┬────┴────┬──────┘
                    │         │
               Apple Watch  Wear OS
```

Device-specific sessions remain distinct, but holder-level preferences, vocabulary, delegated policies, and task state should synchronize under privacy and trust controls.

---

## 11. Offline behavior

Wearables require explicit degraded-mode design.

Possible offline capabilities:

- display recently synchronized balances with freshness marker,
- show locally cached credentials where policy permits,
- reject/lock/pause commands,
- display pending items,
- queue low-risk commands for later processing,
- present limited proofs where cryptographic material and verifier protocol allow offline operation.

Actions requiring fresh network state or current REV policy evaluation should fail closed or defer safely.

---

## 12. Security model

A wearable is both convenient and physically exposed.

Phase 1 architecture must therefore assume:

- watch theft,
- unlocked-wrist edge cases,
- compromised paired phone,
- device cloning attempts,
- stale pairing state,
- lost device,
- replayed approval notifications,
- cross-device race conditions,
- network partition,
- spoofed SERA prompts.

Every consequential wearable action should bind:

```text
holder
+ device
+ intent
+ transaction/proof payload
+ timestamp / freshness
+ policy state
+ REV outcome
+ cryptographic confirmation
```

---

## 13. Privacy model

Wearable screens are highly visible in public.

The design must support privacy tiers such as:

- hidden amount,
- masked asset name,
- masked counterparty,
- generic "approval required" state,
- full detail only after wrist/device authentication,
- no credential claim exposure until user interaction.

The holder should control how much information appears in complications, tiles, widgets, and notifications.

---

## 14. Phase 1 implementation requirements created by Phase 2 wearables

Phase 1 SHALL:

1. expose wallet capabilities through device-neutral service contracts;
2. use reusable App Intent / action semantics rather than screen-specific logic;
3. implement a device trust model;
4. design event-driven notification and approval schemas;
5. separate holder context from device session state;
6. make SERA context synchronizable across trusted devices;
7. support capability-scoped device authority;
8. avoid embedding signing logic directly inside phone UI components;
9. design voice adaptation as holder-level data with device acoustic overlays;
10. define transaction and credential presentation objects independently from display surface;
11. include offline/degraded-state semantics;
12. make all state freshness explicit;
13. include wearable privacy controls in notification/event schemas;
14. keep long-running SERA reasoning in phone/cloud runtime unless explicitly suited for wearable execution.

---

## 15. Candidate Phase 2 release sequence

### W2-01 Foundation

- trusted device registration,
- SERA synchronization,
- notification mirror,
- wallet state summary.

### W2-02 Glance Surfaces

- Apple Watch complications,
- Smart Stack widgets,
- Wear OS complications,
- Wear OS Tiles.

### W2-03 SERA Voice

- voice query,
- conversational handoff,
- holder voice profile synchronization.

### W2-04 Approval Surface

- pending transaction review,
- approve/reject,
- security confirmation,
- REV-bound evidence.

### W2-05 Identity Surface

- credential retrieval,
- proof request review,
- selective-disclosure approval,
- boarding / access credential presentation.

### W2-06 Agent Continuity

- cross-device task continuation,
- active agent task status,
- delegated automation controls.

---

## 16. Design decision

**DB04A-DEC-01**  
Wearables are formally designated as a Phase 2 product surface and a Phase 1 architecture constraint.

**DB04A-DEC-02**  
The phone SHALL NOT be treated as the permanent architectural owner of SERA state or wallet capabilities.

**DB04A-DEC-03**  
Wearable functionality SHALL reuse the same intent, capability, policy, Trust Protocol, REV, and evidence layers as the phone.

**DB04A-DEC-04**  
Device-specific UI SHALL remain presentation logic; authoritative wallet actions SHALL remain device-neutral capabilities.

**DB04A-DEC-05**  
Wearables SHALL receive scoped authority rather than automatically inheriting full phone authority.

**DB04A-DEC-06**  
Holder voice adaptation SHALL be portable across trusted devices while allowing device-specific acoustic calibration.

**DB04A-DEC-07**  
The Phase 1 event architecture SHALL be capable of powering phone, watch, widget, notification, and future ambient surfaces.

---

## 17. Relationship to other SSW-SERA documents

This document is a companion to:

- SSW-SERA-DB01: AI-First Wallet Drawing Board
- SSW-SERA-DB02: Existing Wallet Capability Inventory
- SSW-SERA-DB03: AI-First Experience Concepts & Adaptive Workspace Models
- SSW-SERA-DB04: Advanced Technical Capability & Feasibility Radar
- SSW-AI-VOICE-01: Holder Voice Adaptation, Understanding & Command Safety Architecture

Its requirements must be incorporated into the later controlled platform architecture rather than treated as optional future enhancements.
