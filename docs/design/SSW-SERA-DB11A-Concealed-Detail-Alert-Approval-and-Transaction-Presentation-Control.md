# SSW-SERA-DB11A: Concealed Detail Alert, Approval & Transaction Presentation Control

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-SERA-DB11A  
**Status:** Controlled Design Addendum  
**Date:** 2026-09-17  
**Relationship:** Extends DB03, DB05, DB09, DB10, DB11 and informs DB12+

## 1. Purpose

Define a privacy-preserving presentation control that allows a holder to conceal sensitive transaction, alert, approval, credential and account details on-screen while still receiving the notification or action request. The holder may reveal details for that individual instance when desired.

This feature is a presentation and privacy control. It must not alter the underlying action, authority, policy evaluation, risk classification, approval object, transaction payload or execution evidence.

## 2. Design Principle

A holder may need to know that something requires attention without wanting the surrounding environment, lock screen, wearable display, nearby person, meeting room or shared device surface to reveal what the action concerns.

Therefore:

> Awareness may be visible while sensitive context remains concealed.

The wallet must preserve the holder's ability to inspect full details before approving consequential actions.

## 3. Core User Experience

A concealed alert may display only a minimal shell such as:

- "SERA needs your attention"
- "Approval requested"
- "Transaction requires review"
- "Security alert"
- "Credential action pending"

Sensitive fields remain hidden until the holder explicitly reveals them.

The reveal control is per instance. Revealing one alert or transaction must not automatically reveal subsequent alerts unless the holder has explicitly configured a broader presentation preference.

## 4. Covered Surfaces

The control should apply consistently across:

- in-app SERA conversations;
- transaction approval sheets;
- lock-screen notifications;
- notification center;
- Dynamic Island / Live Activities where applicable;
- Android notification surfaces and bubbles where applicable;
- widgets and glanceable surfaces;
- Apple Watch and Wear OS notifications, cards, complications, tiles and approval surfaces;
- transaction history preview rows;
- credential presentation requests;
- security and fraud alerts;
- proactive intelligence alerts;
- recurring or delegated-action approval requests.

## 5. Presentation States

### H0 — Fully Visible
Normal presentation according to wallet privacy settings.

### H1 — Sensitive Fields Concealed
The holder sees the action type and urgency but sensitive values are masked.

Examples of concealed fields include:

- asset and token name where revealing it is sensitive;
- amount;
- balance;
- recipient or counterparty;
- wallet address;
- chain or network when context could reveal activity;
- merchant;
- credential name or claim;
- organization identity;
- news item linked to a private holding;
- transaction memo;
- location-linked context;
- account identifiers.

### H2 — Minimal Attention Signal
Only the fact that an action or alert exists is shown.

Example: "Approval required."

### H3 — Hidden Until Authenticated
The existence of the event may be displayed generically, but details can only be revealed after device authentication or wallet authentication.

## 6. Reveal Behavior

Reveal must be intentional and scoped to the current object.

A reveal action may use:

- tap or press-and-hold;
- swipe-to-reveal where platform conventions permit;
- biometric authentication;
- device PIN/passcode fallback;
- wallet-specific authentication for higher-risk items.

A reveal event should not itself authorize the underlying action.

`REVEAL != APPROVE`

The holder must still separately approve or reject the transaction, credential disclosure, mandate or sensitive action.

## 7. Per-Instance Control

Every alert, approval request and transaction object should support presentation metadata such as:

```json
{
  "presentation_privacy": {
    "default_state": "concealed",
    "reveal_scope": "single_instance",
    "authentication_required": true,
    "auto_rehide_seconds": 30,
    "allow_wearable_reveal": false
  }
}
```

The exact schema is illustrative and should be finalized in the API/data specification stage.

## 8. Auto-Rehide

After reveal, sensitive information should automatically return to the concealed state when one or more of the following occurs:

- the user dismisses the object;
- the app moves to background;
- the screen locks;
- the wearable lowers or sleeps;
- a configurable timeout expires;
- the holder explicitly hides it again;
- the active device changes;
- privacy risk increases.

High-sensitivity objects should favor short reveal windows.

## 9. Global Preference and Per-Instance Override

The wallet may support holder preferences such as:

- Always show details
- Hide financial details by default
- Hide all sensitive details by default
- Hide details on lock screen only
- Hide details on wearables
- Hide details when device is not unlocked
- Hide details when screen sharing is detected where platform support exists

However, global preferences must not prevent the holder from revealing a specific item when authorized.

A future adaptive option may allow SERA to recommend concealment based on context, but SERA must not silently weaken a holder's privacy preference.

## 10. Risk-Aware Presentation

Presentation privacy can be stricter for higher-risk actions.

Examples:

| Action | Suggested default |
|---|---|
| General news alert | H0/H1 |
| Portfolio movement alert | H1 |
| Transaction approval | H1/H3 |
| New recipient payment | H3 |
| Credential disclosure | H1/H3 |
| Security incident | H2/H3 |
| Seed/private-key related recovery flow | No sensitive detail on external surfaces |

The actual policy remains holder-configurable within safe bounds.

## 11. Wearables

Wearables require especially conservative defaults because the display is exposed and glanceable.

Recommended Phase 2 behavior:

- default to H2 for sensitive financial and identity requests;
- reveal only after local wearer/device authentication where supported;
- avoid displaying full wallet addresses;
- avoid displaying complete credential claims;
- avoid exposing high-value balances by default;
- auto-rehide when wrist detection is lost or device locks;
- optionally force phone handoff for high-risk detail review.

A watch being paired with the wallet does not imply permission to reveal all wallet information.

## 12. Voice and Spoken Output

Concealment must also apply to SERA's spoken responses.

If the holder has enabled hidden-detail mode, SERA should not read sensitive details aloud unless explicitly asked and the applicable authentication/context policy permits it.

Example:

Instead of:

"You are about to send 5,000 USDC to Jane on Polygon."

SERA may say:

"I have a transaction ready for your review. Details are hidden."

The holder may then request: "Reveal the details."

## 13. Screenshot and Screen-Recording Considerations

Where platform APIs permit, high-sensitivity surfaces should use available secure-content protections to reduce accidental capture. Platform limitations must be respected.

The design should also avoid assuming that screenshots can always be prevented. Concealment remains useful even where platform-level capture blocking is unavailable.

## 14. Notification Privacy

Notifications must separate:

1. event existence;
2. event category;
3. sensitive content;
4. executable action.

The system may deliver the first two while withholding the third until reveal. Action buttons should be evaluated carefully so that an approval cannot occur without adequate inspection for the relevant risk level.

## 15. Approval Integrity

For consequential actions, hidden-detail presentation must never create blind approval.

Before final authorization, policy may require the holder to reveal and inspect a minimum set of canonical transaction fields, particularly for:

- amount;
- asset;
- recipient;
- network;
- fee;
- credential claims being disclosed;
- mandate limits;
- recurring authorization terms.

This can be expressed as `required_review_fields` in the action contract.

## 16. Evidence and Auditability

Evidence records should capture presentation-state events without unnecessarily storing displayed sensitive content twice.

Useful evidence events include:

- alert delivered concealed;
- reveal requested;
- reveal authentication succeeded/failed;
- fields revealed;
- details rehidden;
- approval or rejection occurred after reveal;
- device used for reveal;
- cross-device handoff triggered.

These events help reconstruct whether the holder had an opportunity to inspect material facts before authorization.

## 17. SERA Interaction Rules

SERA should understand direct commands such as:

- "Hide the details."
- "Show me the details."
- "Keep transaction alerts private."
- "Don't show amounts on my watch."
- "Hide balances on the lock screen."
- "Show this one."
- "Hide it again."

Changing persistent privacy preferences should be confirmed clearly because it affects future presentation behavior.

## 18. Data and Architecture Rule

The presentation layer receives a privacy-filtered representation of an underlying action object.

Recommended pattern:

```text
Authoritative Action Object
        |
        v
Presentation Privacy Policy
        |
        +--> Concealed View Model
        |
        +--> Authenticated Revealed View Model
```

The concealed view must not require deletion or mutation of the authoritative transaction data.

## 19. Relationship to Trust Protocol and REV

Hide/reveal status is not itself an authorization decision. However, presentation state may become an input to an authorization workflow when policy requires evidence that the holder reviewed material information before approval.

Example:

`REV` may require `material_fields_reviewed = true` for a high-risk action before PASS.

This remains a deterministic policy input, not an AI judgment.

## 20. Accessibility

Concealment must work with screen readers, haptics and voice accessibility.

Accessibility output should avoid accidentally speaking concealed values. The holder should receive an accessible indication that information is hidden and that a reveal action is available.

## 21. Initial Product Decisions

1. Hidden-detail mode is a privacy control, not a transaction-data mutation.
2. Reveal is per instance by default.
3. Reveal never equals approval.
4. High-risk approvals may require authenticated reveal before authorization.
5. Concealment applies to visual and spoken output.
6. Wearables use stricter defaults than the phone.
7. Sensitive details automatically rehide after context changes or timeout.
8. Holder preferences can set default concealment behavior by surface and data type.
9. SERA cannot weaken concealment settings without explicit holder instruction.
10. Evidence records capture reveal/review events without exposing secret material.

## 22. Downstream Requirements

This addendum must be incorporated into:

- DB03 adaptive workspace and UI behavior;
- DB05 privacy/risk boundaries;
- DB09 proactive notification policy;
- DB10 approval and delegated-authority UX;
- DB11 evidence and explainability;
- DB12 offline/degraded behavior;
- future phone and wearable UI specifications;
- notification schemas;
- approval object schemas;
- accessibility specifications;
- QA and security test matrices.

## 23. Acceptance Direction

The feature is acceptable only if the holder can receive a meaningful alert or request without involuntary disclosure of sensitive context, can reveal that context when desired, can reliably re-conceal it, and cannot accidentally convert concealment into blind authorization.
