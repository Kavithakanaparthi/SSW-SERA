# SSW-AI-MOB-03: Voice/Text Interaction & Concealed Detail Presentation Binding

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-MOB-03  
**Status:** Controlled Mobile Integration Baseline — IN PROGRESS  
**Date:** 2026-09-19  
**Parent:** SSW-AI-MOB-02  
**Normative Inputs:** SSW-SERA-DB11A, SSW-AI-SERA-RT-04, SSW-SERA-DB12, SSW-SERA-DB14

## 1. Purpose

MOB-03 binds text and voice interaction to the mobile shell/workspace model while enforcing concealed-detail privacy and strict separation between Reveal, Review and Approval.

The governing rule is:

`REVEAL != REVIEW != APPROVE`

No presentation event creates execution authority.

## 2. Text / Voice Parity

Text and voice may initiate the same supported wallet intents.

Voice adds an additional safety envelope from SERA-RT-04.

A voice interaction that is consequential or classified for independent authorization must remain subject to the same deterministic approval/authentication path as text.

Voice clarity does not create authority.

## 3. Concealment Levels

MOB-03 implements DB11A levels:

- H0: visible;
- H1: sensitive fields concealed;
- H2: minimal attention signal;
- H3: hidden until authenticated.

The presentation decision is independent from the authoritative action object.

## 4. Reveal

Reveal is per presentation instance.

Where authentication is required, reveal fails closed until authentication succeeds.

Reveal has `authorityEffect: NONE`.

Reveal does not mean:

- approve;
- sign;
- disclose a credential;
- accept a WalletConnect request;
- activate a mandate.

## 5. Required Review Fields

Consequential approvals may define required review fields such as:

- amount;
- asset;
- recipient;
- network;
- fee;
- credential claims;
- mandate scope/limits.

Approval eligibility at the presentation layer requires that the required fields have been reviewed after an allowed reveal.

This remains a presentation prerequisite only. Final authorization still occurs in the approval/authentication runtime.

## 6. Auto-Rehide

A revealed presentation returns to CONCEALED on:

- explicit hide;
- app background;
- screen lock;
- active-device change;
- configured timeout.

Native implementations may add stricter platform events but may not weaken these baseline triggers.

## 7. Spoken Privacy

Concealment applies to SERA spoken output.

H2/H3 content is not spoken as sensitive detail by the shared decision contract.

Native accessibility and voice implementations must announce that details are hidden and provide a safe reveal affordance without leaking the hidden values.

## 8. Evidence Separation

Reveal and approval must produce distinct evidence references.

The same event reference cannot represent both actions.

Expected SAEL lineage includes:

- presented concealed;
- reveal requested;
- reveal authentication;
- detail review;
- rehide;
- approval/rejection.

## 9. Security Invariants

1. Voice input is not standalone authorization.
2. Text input is not standalone authorization.
3. Reveal never equals approval.
4. Revealed content automatically re-conceals on privacy context changes.
5. Required material review cannot be skipped by presentation UI.
6. Concealed spoken output must not leak sensitive fields.
7. Presentation state never mutates the underlying action terms.
8. Reveal/approval evidence remain distinct.
9. Native UI may be stricter but may not weaken concealment.
10. Final authority remains in the deterministic approval/authentication/control path.

## 10. Next

After MOB-03 closure, the mobile phase can move into cross-device handoff and OS-native proactive surfaces while preserving the same authority and privacy semantics.
