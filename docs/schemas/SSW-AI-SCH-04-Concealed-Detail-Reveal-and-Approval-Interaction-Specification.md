# SSW-AI-SCH-04: Concealed Detail / Reveal / Approval Interaction Specification

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-SCH-04  
**Status:** Controlled Draft  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-01, SSW-AI-02, SSW-AI-CF-A01, SSW-AI-SCH-01, SSW-AI-SCH-02, SSW-AI-SCH-03  
**Repository:** Kavithakanaparthi/SSW-SERA

---

## 1. Purpose

This specification defines the canonical interaction and control semantics for concealing, revealing, reviewing and approving sensitive transaction, credential and security details across Soul Super Wallet and SERA.

The governing invariant is:

> Reveal is not approval.

Concealment is a presentation-control mechanism. Approval is an authority-control event. They are related but never interchangeable.

---

## 2. Scope

This specification defines:

- concealed-detail states;
- reveal semantics;
- authenticated reveal;
- re-concealment;
- approval eligibility;
- material-term review;
- notification behavior;
- voice behavior;
- wearable behavior;
- cross-device behavior;
- timeout and lifecycle behavior;
- degraded-mode behavior;
- accessibility constraints;
- evidence requirements;
- policy inheritance;
- field-level masking;
- failure handling;
- report/export handling.

It does not define visual design language, exact mobile UI components or typography.

---

## 3. Canonical Interaction States

A sensitive interaction may move through:

```
CONCEALED
   ↓
REVEAL_REQUESTED
   ↓
AUTH_REQUIRED (optional)
   ↓
REVEALED
   ↓
REVIEWED
   ↓
APPROVAL_PENDING
   ↓
APPROVED / REJECTED / EXPIRED / INVALIDATED
```

Re-concealment may occur from REVEALED or REVIEWED without changing approval state.

---

## 4. Canonical Presentation Object

```json
{
  "schema": "ssw.presentation-state.v1",
  "presentation_id": "uuid",
  "action_id": "uuid",
  "device_id": "device:...",
  "runtime_id": "sera-runtime:...",
  "state": "CONCEALED",
  "concealed_fields": [
    "amount",
    "recipient",
    "balance"
  ],
  "reveal": {
    "required": true,
    "authenticated": true,
    "requested_at": null,
    "revealed_at": null,
    "expires_at": null
  },
  "review": {
    "material_terms_hash": "sha256:...",
    "reviewed_at": null
  },
  "approval": {
    "eligible": false,
    "approval_id": null
  },
  "policy_ref": "policy:...",
  "sael_correlation_id": "uuid"
}
```

---

## 5. Concealed Detail

Concealment may apply to any sensitive presentation field.

Examples include:

- account balance;
- transaction amount;
- recipient name;
- recipient address;
- merchant;
- asset;
- chain;
- wallet address;
- transaction memo;
- credential claim;
- verifier identity;
- security-event detail;
- device identifier;
- mandate details;
- fee amount.

Concealment may be:

- global;
- device-specific;
- surface-specific;
- action-specific;
- field-specific.

---

## 6. Default Policy

Default behavior should be privacy-conservative.

Recommended baseline:

- lock-screen notifications: concealed;
- wearable notifications: concealed;
- high-risk approval sheets: concealed until reveal;
- low-risk in-app views: holder preference;
- voice output in public/uncertain environments: concealed;
- sensitive credential details: concealed by default.

The holder may configure stricter behavior.

Policy may enforce concealment even if holder preference is more permissive.

---

## 7. Reveal

Reveal is the act of exposing concealed information for a defined interaction instance.

Reveal:

- does not approve the action;
- does not create a mandate;
- does not authenticate future actions;
- does not persist across devices by default;
- does not remove evidence requirements.

Reveal scope must be bounded.

Example:

```json
{
  "scope": {
    "action_id": "uuid",
    "device_id": "device:primary",
    "fields": ["amount", "recipient"]
  }
}
```

---

## 8. Authenticated Reveal

Policy may require authentication before sensitive information is displayed.

Typical triggers:

- R4 action;
- credential claim disclosure;
- high-value transfer;
- security-event detail;
- device in LIMITED state;
- wearable-to-phone handoff;
- recent app unlock absent;
- holder configured "always authenticate to reveal."

Authentication methods are implementation-specific but must meet the action's required assurance.

---

## 9. Review

Review means the holder has had a meaningful opportunity to inspect the exact material terms.

Review state must bind to the current material terms hash.

```json
{
  "material_terms_hash": "sha256:...",
  "reviewed_at": "RFC3339"
}
```

If material terms change:

- review state becomes invalid;
- approval eligibility is revoked;
- new reveal/review may be required.

---

## 10. Approval

Approval is a separate deterministic event.

Approval is valid only when:

1. the action is current;
2. the material terms hash matches;
3. required reveal/review has occurred;
4. device/runtime eligibility passes;
5. required authentication passes;
6. Trust Protocol/REV state remains valid;
7. action has not expired.

Approval may never be inferred from:

- opening an alert;
- revealing details;
- scrolling;
- voice acknowledgment;
- previous similar behavior;
- SERA confidence;
- passive screen presence.

---

## 11. Approval Eligibility

Approval eligibility is a derived state.

Example:

```json
{
  "eligible": true,
  "requirements": {
    "revealed": true,
    "reviewed": true,
    "device_trust": "TRUSTED",
    "authentication": "PASS",
    "trust_protocol": "PASS",
    "rev": "PASS"
  }
}
```

A change in any requirement can revoke eligibility.

---

## 12. Material-Term Change

The following changes invalidate prior review and approval:

- amount;
- recipient;
- asset;
- chain;
- route;
- fee where material;
- merchant;
- contract;
- credential claim set;
- verifier;
- mandate scope;
- execution destination;
- expiration if policy treats it as material.

The system must generate a new terms hash.

---

## 13. Re-Concealment

Re-concealment may occur on:

- timeout;
- app background;
- screen lock;
- device sleep;
- wearable wrist-down;
- cross-device transition;
- session expiry;
- holder command;
- security policy;
- device trust downgrade;
- environment-risk trigger.

Re-concealment does not automatically invalidate a previously valid approval unless policy requires renewed review.

---

## 14. Re-Conceal Timeout

Each revealed instance should carry an expiry.

Example:

```json
{
  "revealed_at": "2026-09-17T20:00:00Z",
  "expires_at": "2026-09-17T20:00:30Z"
}
```

Timeout duration may vary by:

- risk class;
- device;
- surface;
- field sensitivity.

---

## 15. Phone Behavior

On a trusted primary phone:

- notifications may remain concealed;
- in-app reveal may require authentication;
- material terms may be displayed before approval;
- approval remains separate;
- backgrounding re-conceals by default.

For R4/R5 actions, policy should strongly favor authenticated reveal and direct review.

---

## 16. Wearable Behavior

Wearables default to stricter concealment.

Typical behavior:

- show "Action requires attention";
- hide amount and recipient;
- allow "Show summary" only if policy permits;
- require phone handoff for full detail;
- prohibit high-risk approval by default.

A wearable may not inherit reveal state from the phone automatically.

---

## 17. Voice Behavior

Voice output must obey the same concealment policy as visual output.

Examples:

If concealed:

> "A transaction needs your attention."

Not:

> "You are sending 2,000 USDC to Alex."

Reveal by voice may require:

- explicit holder request;
- environment policy;
- authentication;
- trusted audio route;
- device eligibility.

Voice reveal remains separate from approval.

---

## 18. Notification Behavior

Notifications should use privacy tiers.

### Tier N0

No sensitive detail.

Example:
"Action requires your attention."

### Tier N1

Low-sensitivity summary.

Example:
"SERA prepared a payment."

### Tier N2

Partial detail.

Example:
"Payment prepared for an approved contact."

### Tier N3

Full detail.

Permitted only when holder policy and platform security allow.

Default lock-screen level should be N0 or N1.

---

## 19. Cross-Device Handoff

Handoff must preserve concealment metadata.

Reference behavior:

```
Device A: CONCEALED
   ↓
Handoff
   ↓
Device B receives action
   ↓
Device B applies own policy
   ↓
Usually CONCEALED again
```

A reveal on Device A does not automatically reveal on Device B.

---

## 20. Device Trust Interaction

Concealment policy may depend on device state.

Suggested baseline:

- TRUSTED: reveal allowed per policy;
- ATTESTED: reveal with stronger restrictions;
- LIMITED: partial reveal or handoff;
- REGISTERED: conceal sensitive data;
- SUSPENDED: no sensitive reveal;
- REVOKED: no access.

---

## 21. Risk-Class Interaction

Suggested baseline:

- R0: no concealment required unless user prefers;
- R1: low-sensitivity concealment;
- R2: holder preference;
- R3: action-sensitive concealment;
- R4: authenticated reveal recommended/required;
- R5: direct full review on strongest trusted device.

---

## 22. Credential Presentation

Sensitive credential disclosures shall default to concealed review.

The holder should be able to see:

- verifier;
- purpose;
- requested claims;
- actual claims disclosed;
- proof method.

Selective disclosure and ZKP presentations should clearly distinguish:

- data requested;
- data disclosed;
- data proven without disclosure.

---

## 23. Transaction Approval

A transaction approval sheet must make the material terms available before approval.

Concealment may hide them initially, but policy must not allow approval without meaningful review where review is required.

Canonical sequence:

```
Alert
 ↓
CONCEALED
 ↓
Reveal
 ↓
Review
 ↓
Approve
 ↓
Authenticate
 ↓
Sign
```

For some flows, authentication may precede reveal.

---

## 24. Delegated Actions

A3/A4 delegated execution may occur without per-action approval.

However:

- post-action notifications may be concealed;
- holder reports must allow later reveal;
- mandate details must be inspectable;
- high-risk escalation can force A2 review.

Concealment never expands delegated authority.

---

## 25. Security Alerts

Security alerts may need to conceal exact details if public display could worsen risk.

Example:

Visible:
"Security action required."

Concealed:
- device identifier;
- attack vector;
- wallet address;
- recovery details.

Holder can reveal after authentication.

---

## 26. Degraded Mode

If presentation services fail:

- do not fall back to displaying full sensitive details;
- default to concealed summary;
- block approval if material review cannot be established;
- preserve evidence;
- allow deterministic fallback review where safe.

Degradation must not weaken privacy.

---

## 27. Offline Mode

Offline reveal may be allowed only if:

- device is eligible;
- local data is current enough;
- authentication requirements pass;
- policy permits.

If exact terms cannot be verified locally, approval must remain blocked.

---

## 28. Accessibility

Concealment must remain compatible with accessibility.

Requirements:

- screen readers must respect concealment state;
- concealed fields must not leak through accessibility labels;
- haptic or voice cues must not expose hidden values;
- reveal state must be announced safely;
- approval action must remain distinct.

---

## 29. Screenshots and Screen Recording

Where platform support allows, high-risk revealed views may:

- request screenshot suppression;
- obscure app previews;
- re-conceal on app switcher;
- notify holder of capture where possible.

These are defense-in-depth controls, not primary confidentiality guarantees.

---

## 30. App Lifecycle

Recommended triggers:

- app background -> re-conceal;
- screen lock -> re-conceal;
- session expiry -> re-conceal;
- trust downgrade -> re-conceal;
- device switch -> re-evaluate;
- app foreground -> remain concealed until policy permits reveal.

---

## 31. Reveal Evidence

SAEL should record:

- presentation ID;
- action ID;
- device ID;
- reveal requested;
- authenticated reveal result;
- fields revealed by category;
- reveal timestamp;
- review timestamp;
- re-conceal event.

SAEL should not duplicate sensitive field values solely to prove reveal occurred.

---

## 32. Approval Evidence

Approval evidence should include:

- approval ID;
- action ID;
- material terms hash;
- device ID;
- authentication reference;
- approval timestamp;
- expiry;
- presentation/review reference.

This proves what terms were approved without requiring full plaintext duplication.

---

## 33. Export and Audit Reports

Audit reports may support disclosure levels:

- summary only;
- action metadata;
- financial details;
- counterparty details;
- credential details;
- full audit evidence.

Export disclosure level must be explicit.

Concealed-detail preferences apply to interactive report views but exported reports may use separate export authorization.

---

## 34. Holder Preferences

Holder-configurable preferences may include:

- conceal balances by default;
- conceal recipients;
- conceal amounts;
- conceal credential claims;
- conceal on wearables;
- require authentication to reveal;
- auto re-conceal timeout;
- voice privacy mode.

Policy may override weaker settings.

---

## 35. Voice Commands

Supported semantic commands may include:

- "Hide the details."
- "Show this one."
- "Hide amounts on my watch."
- "Show only the recipient."
- "Don't read transaction amounts aloud."
- "Reveal the credential request."

Each command changes presentation state only.

It does not approve the action.

---

## 36. Error Handling

Typed errors may include:

- REVEAL_NOT_ALLOWED
- AUTH_REQUIRED_FOR_REVEAL
- DEVICE_NOT_ELIGIBLE_FOR_REVEAL
- PRESENTATION_EXPIRED
- MATERIAL_TERMS_CHANGED
- REVIEW_REQUIRED
- APPROVAL_NOT_ELIGIBLE
- CONCEALMENT_POLICY_BLOCK
- CROSS_DEVICE_REVEAL_RESET

Errors must not leak concealed data.

---

## 37. State Transition Object

```json
{
  "schema": "ssw.presentation-transition.v1",
  "transition_id": "uuid",
  "presentation_id": "uuid",
  "action_id": "uuid",
  "from_state": "CONCEALED",
  "to_state": "REVEALED",
  "reason": "HOLDER_REQUEST",
  "auth_ref": "auth-uuid|null",
  "device_id": "device:...",
  "created_at": "RFC3339",
  "sael_event_ref": "sael-event-uuid"
}
```

Transitions must be evidenced.

---

## 38. Allowed State Transitions

| From | To | Allowed |
|---|---|---|
| CONCEALED | REVEAL_REQUESTED | Yes |
| REVEAL_REQUESTED | AUTH_REQUIRED | Yes |
| REVEAL_REQUESTED | REVEALED | Yes |
| AUTH_REQUIRED | REVEALED | On auth PASS |
| AUTH_REQUIRED | CONCEALED | On fail/cancel |
| REVEALED | REVIEWED | Yes |
| REVEALED | CONCEALED | Yes |
| REVIEWED | APPROVAL_PENDING | Yes |
| REVIEWED | CONCEALED | Yes |
| APPROVAL_PENDING | APPROVED | Yes |
| APPROVAL_PENDING | REJECTED | Yes |
| APPROVAL_PENDING | INVALIDATED | Yes |
| Any non-terminal presentation state | CONCEALED | Yes, by policy |

---

## 39. Approval Invalidation

Approval eligibility or approval itself becomes invalid when:

- material terms hash changes;
- action expires;
- Trust Protocol/REV freshness expires;
- device state becomes ineligible;
- authentication expires;
- mandate basis changes;
- execution route changes materially.

Re-concealment alone does not necessarily invalidate approval.

---

## 40. Security Invariants

1. Reveal is not approval.
2. Opening a notification is not review.
3. Voice acknowledgment is not approval.
4. Concealment state does not alter authority.
5. Device handoff does not carry reveal state automatically.
6. Wearables default to stricter concealment.
7. Errors must not leak concealed fields.
8. Degraded mode must not expose more detail.
9. Material-term changes invalidate review/approval.
10. SAEL proves reveal/review without requiring duplicate plaintext.
11. Accessibility paths must preserve concealment.
12. Holder preference cannot weaken mandatory policy.

---

## 41. Open Implementation Items

Downstream work must define:

- exact field sensitivity registry;
- presentation policy engine;
- per-platform lock-screen capabilities;
- screenshot/screen-capture behavior;
- secure audio-route rules;
- reveal timeout defaults;
- UI component contracts;
- accessibility testing;
- report export authorization;
- wearable-specific reveal rules;
- SAEL presentation event schemas.

---

## 42. Exit Criteria

SSW-AI-SCH-04 is ready to advance when:

1. phone and wearable flows are prototyped;
2. reveal and approval are proven technically separate;
3. accessibility paths are tested;
4. cross-device handoff resets are validated;
5. material-term changes invalidate review correctly;
6. degraded-mode concealment is tested;
7. SAEL presentation events are mapped;
8. audit/export disclosure levels are defined.

---

## 43. Controlled Statement

This specification establishes privacy-preserving review without weakening execution control.

The holder may choose when sensitive details become visible.

The control plane decides when an action becomes approvable.

Those are deliberately different events.
