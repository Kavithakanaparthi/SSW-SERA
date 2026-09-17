# SSW-AI-SCH-03: Device Trust State & Transition Specification

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-SCH-03  
**Status:** Controlled Draft  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-01, SSW-AI-02, SSW-AI-CF-A01, SSW-AI-SCH-01, SSW-AI-SCH-02  
**Repository:** Kavithakanaparthi/SSW-SERA

---

## 1. Purpose

This specification defines the canonical device trust state machine used by Soul Super Wallet and SERA to determine whether a device may participate in viewing, preparing, approving, signing, executing, delegating, presenting credentials or administering security controls.

The governing rule is:

> Device presence is not device trust, and device trust is not holder authority.

A device contributes one bounded assurance signal to the execution control plane. It does not independently create transaction authority.

---

## 2. Scope

This specification defines:

- canonical device trust states;
- device identity;
- enrollment;
- registration;
- attestation;
- trust promotion;
- trust limitation;
- suspension;
- revocation;
- recovery;
- state-transition guards;
- device capabilities by state;
- cross-device handoff;
- wearable constraints;
- cloud runtime distinction;
- trust freshness;
- compromise signals;
- emergency controls;
- mandate interaction;
- approval interaction;
- signing interaction;
- SAEL evidence requirements.

It does not define hardware-vendor attestation protocols, final Secure Enclave/TEE integration, or platform-specific mobile APIs.

---

## 3. Canonical Device Trust States

The architecture adopts seven canonical states:

1. UNREGISTERED
2. REGISTERED
3. ATTESTED
4. TRUSTED
5. LIMITED
6. SUSPENDED
7. REVOKED

These are control-plane states, not UI labels.

---

## 4. State Summary

| State | Meaning | Consequential Actions | Signing Eligibility | Typical Use |
|---|---|---:|---:|---|
| UNREGISTERED | Unknown device | No | No | discovery / onboarding only |
| REGISTERED | Known device identity | No | No | setup, low-risk continuity |
| ATTESTED | Device integrity attested | Limited | Policy-dependent | review, selected actions |
| TRUSTED | Fully eligible under policy | Yes | Yes | normal primary device use |
| LIMITED | Explicitly constrained | Restricted | Usually restricted | secondary/wearable/recovery |
| SUSPENDED | Temporarily blocked | No | No | investigation / anomaly |
| REVOKED | Permanently invalidated | No | No | lost/compromised/decommissioned |

---

## 5. Canonical Device Object

```json
{
  "schema": "ssw.device.v1",
  "device_id": "device:uuid",
  "holder_did": "did:soul:...",
  "sera_agent_did": "did:soul:agent:...",
  "device_type": "phone|tablet|wearable|desktop|hardware_card|other",
  "platform": "ios|android|watchos|wearos|macos|windows|linux|other",
  "state": "REGISTERED",
  "registered_at": "RFC3339",
  "last_attested_at": null,
  "trust_expires_at": null,
  "attestation": {
    "status": "NOT_EVALUATED",
    "provider": null,
    "evidence_ref": null,
    "freshness_seconds": null
  },
  "capabilities": [],
  "risk_flags": [],
  "revocation": {
    "revoked_at": null,
    "reason": null
  },
  "evidence": {
    "sael_correlation_id": "uuid"
  }
}
```

---

## 6. Device Identity

A Device ID is distinct from:

- Holder DID;
- SERA Agent DID;
- SERA Runtime ID.

Conceptual form:

```
device:<device-id>
```

A device may host one or more runtime components, but the device identity remains stable across runtime process restarts.

A factory reset, device re-provisioning event or equivalent trust-breaking event may require issuance of a new Device ID.

---

## 7. Runtime Relationship

The device trust engine evaluates the physical/logical device.

The SERA runtime layer evaluates the execution instance running on that device.

Therefore:

```
SERA Agent DID
   |
   +-- Device ID
         |
         +-- Runtime ID
```

Both device and runtime must be eligible for consequential actions.

---

## 8. UNREGISTERED

Definition:

A device not known to the holder's wallet trust domain.

Permitted:

- initiate enrollment;
- display public onboarding information;
- request pairing;
- receive non-sensitive bootstrap challenge.

Prohibited:

- wallet balance access;
- credential access;
- holder personalization retrieval;
- delegated execution;
- approval;
- signing;
- SERA portable-state decryption.

Transition options:

- UNREGISTERED → REGISTERED
- UNREGISTERED → remains UNREGISTERED

---

## 9. REGISTERED

Definition:

The device identity has been associated with the holder but has not yet satisfied full integrity/attestation requirements.

Permitted:

- basic wallet shell access subject to authentication;
- low-sensitivity preferences;
- enrollment continuation;
- local setup;
- selected R1 read-only functions if policy permits.

Prohibited by default:

- A2 consequential approval;
- A3/A4 delegated execution;
- signing;
- high-sensitivity credential presentation;
- mandate creation;
- root security changes.

Transition options:

- REGISTERED → ATTESTED
- REGISTERED → LIMITED
- REGISTERED → SUSPENDED
- REGISTERED → REVOKED

---

## 10. ATTESTED

Definition:

The device has passed current integrity attestation but has not necessarily been promoted to full trusted status.

Permitted:

- R1 and R2 actions;
- selected A2 actions if policy explicitly permits;
- review;
- concealed-detail reveal subject to authentication;
- credential retrieval;
- cross-device handoff receive.

Restrictions:

- high-risk R4/R5 actions may be blocked;
- A3/A4 mandates may require TRUSTED;
- signing may be limited by policy.

Transition options:

- ATTESTED → TRUSTED
- ATTESTED → LIMITED
- ATTESTED → SUSPENDED
- ATTESTED → REVOKED
- ATTESTED → REGISTERED if attestation expires and policy allows downgrade

---

## 11. TRUSTED

Definition:

The device has satisfied holder binding, integrity, authentication and policy requirements for full normal operation.

Permitted, subject to action-level controls:

- A0-A4 where policy permits;
- approval;
- signing;
- credential presentation;
- mandate creation;
- cross-device handoff origination;
- emergency controls;
- concealed-detail authenticated reveal;
- high-risk actions with required step-up controls.

TRUSTED does not override:

- risk policy;
- mandate limits;
- Trust Protocol;
- REV;
- authentication;
- signing policy.

Transition options:

- TRUSTED → LIMITED
- TRUSTED → SUSPENDED
- TRUSTED → REVOKED
- TRUSTED → ATTESTED if trust freshness expires but integrity remains valid

---

## 12. LIMITED

Definition:

A known device intentionally constrained below normal trusted capability.

Typical causes:

- wearable;
- secondary phone;
- partial recovery;
- insufficient attestation freshness;
- elevated risk;
- temporary policy restriction.

Permitted examples:

- view selected balances;
- receive notifications;
- prepare transactions;
- request handoff;
- selected credential presentation;
- low-risk approvals if policy permits;
- emergency lock.

Prohibited by default:

- high-risk signing;
- mandate creation;
- broad authority changes;
- recovery-root changes;
- unrestricted A3/A4 execution.

Transition options:

- LIMITED → TRUSTED
- LIMITED → ATTESTED
- LIMITED → SUSPENDED
- LIMITED → REVOKED

---

## 13. SUSPENDED

Definition:

Temporarily blocked due to security, anomaly, policy or investigation.

Permitted:

- security status view;
- device recovery workflow;
- revoke device;
- holder support/recovery operations;
- evidence review where safe.

Prohibited:

- signing;
- approval;
- delegated execution;
- credential disclosure;
- mandate creation;
- cross-device authority handoff.

Transition options:

- SUSPENDED → LIMITED
- SUSPENDED → TRUSTED
- SUSPENDED → REVOKED

Reactivation requires explicit policy satisfaction and evidence.

---

## 14. REVOKED

Definition:

The device has been permanently removed from the active trust domain.

Permitted:

- none for holder authority.

Historical SAEL evidence remains.

A revoked Device ID must not silently return to active status.

Recovery requires a new registration and, where appropriate, a new Device ID.

Terminal state:

- REVOKED → no direct active transition

---

## 15. Registration Flow

Reference flow:

```
New Device
  ↓
Generate Device Key / Identifier
  ↓
Holder Authentication
  ↓
Bind Device to Holder DID
  ↓
Register Device Metadata
  ↓
State = REGISTERED
  ↓
Attestation Process
```

Registration alone does not confer signing eligibility.

---

## 16. Attestation Flow

Reference flow:

```
REGISTERED
   ↓
Collect Platform/Hardware Attestation
   ↓
Validate Attestation
   ↓
Check Freshness
   ↓
Check Revocation / Compromise Signals
   ↓
ATTESTED
```

Attestation evidence should be referenced, not redundantly copied where sensitive.

---

## 17. Promotion to TRUSTED

Promotion requires policy-defined conditions, potentially including:

- successful holder authentication;
- valid attestation;
- no critical risk flags;
- device integrity;
- current OS/security posture;
- secure key availability;
- recovery status;
- device ownership confirmation;
- Trust Protocol pass where required.

Promotion must be deterministic and evidenced.

---

## 18. Downgrade Rules

TRUSTED may downgrade to:

### TRUSTED → ATTESTED

Typical cause:

- trust freshness expired;
- holder reauthentication required;
- low-severity security posture change.

### TRUSTED → LIMITED

Typical cause:

- policy restriction;
- elevated but non-critical anomaly;
- device-role restriction;
- temporary high-risk environment.

### TRUSTED → SUSPENDED

Typical cause:

- compromise indicator;
- suspicious approval behavior;
- failed attestation;
- security alert;
- holder-initiated suspension.

### TRUSTED → REVOKED

Typical cause:

- lost device;
- confirmed compromise;
- decommissioning;
- holder revocation.

---

## 19. Freshness

Device trust is time-bounded.

A TRUSTED state may require periodic renewal.

Canonical fields:

```json
{
  "last_attested_at": "RFC3339",
  "trust_expires_at": "RFC3339"
}
```

If trust expires:

- the device must not silently remain fully TRUSTED;
- the control plane must re-evaluate state;
- high-risk actions fail closed until required assurance is restored.

---

## 20. Risk Signals

Device risk flags may include:

- ATTESTATION_FAILED
- ROOT_OR_JAILBREAK_INDICATOR
- OS_OUTDATED
- DEVICE_KEY_CHANGED
- SECURE_HARDWARE_UNAVAILABLE
- UNUSUAL_GEO_CONTEXT
- UNUSUAL_NETWORK
- MULTIPLE_AUTH_FAILURES
- RAPID_DEVICE_SWITCHING
- RECOVERY_IN_PROGRESS
- MANUAL_SECURITY_HOLD
- MALWARE_SIGNAL
- DEBUG_ENVIRONMENT
- UNKNOWN_INTEGRITY_STATE

Risk signals influence state transitions and action eligibility.

They do not directly create authority.

---

## 21. Action Eligibility Matrix

Conceptual default:

| Action | REGISTERED | ATTESTED | TRUSTED | LIMITED | SUSPENDED | REVOKED |
|---|---:|---:|---:|---:|---:|---:|
| Public info | Yes | Yes | Yes | Yes | Yes | No |
| Personal read-only | Limited | Yes | Yes | Limited | Limited | No |
| Prepare transaction | No/Policy | Yes | Yes | Yes | No | No |
| A2 approval | No | Policy | Yes | Low-risk only | No | No |
| Sign transaction | No | Policy | Yes | Usually no | No | No |
| A3/A4 execution | No | Rare | Yes | No by default | No | No |
| Mandate creation | No | No/Policy | Yes | No | No | No |
| Emergency lock | Yes/Policy | Yes | Yes | Yes | Yes | No |
| Root recovery change | No | No | Strong TRUSTED only | No | No | No |

Final per-action policy remains risk-dependent.

---

## 22. Interaction with Risk Classes

Default coupling:

- R0 may be available broadly;
- R1 may be available on REGISTERED/ATTESTED/LIMITED subject to privacy;
- R2 typically requires ATTESTED or TRUSTED;
- R3 typically requires TRUSTED, with narrow ATTESTED exceptions;
- R4 requires TRUSTED with step-up controls;
- R5 requires strongest trusted-device posture and direct holder participation.

Device trust does not change the action's risk class.

---

## 23. Interaction with Authority Classes

Default coupling:

- A0 may run on lower trust states;
- A1 may run on ATTESTED, TRUSTED or LIMITED;
- A2 normally requires TRUSTED for consequential actions;
- A3 requires mandate + eligible device state;
- A4 requires mandate + strongest policy-compatible eligible path;
- A5 requires direct holder participation on the strongest eligible device.

---

## 24. Mandate Interaction

Mandates may define:

- allowed Device IDs;
- allowed device trust states;
- allowed Runtime IDs.

Example:

```json
{
  "allowed_device_ids": ["device:primary"],
  "allowed_device_states": ["TRUSTED"]
}
```

If a referenced device leaves the allowed state, the mandate cannot execute through that device.

A mandate never upgrades a device state.

---

## 25. Approval Interaction

Approval eligibility requires:

- device state permitted for the action;
- holder authentication as required;
- exact material terms;
- valid risk and policy state;
- valid Trust Protocol/REV where applicable.

If the device is downgraded after review but before approval, eligibility must be recalculated.

---

## 26. Signing Interaction

The signing boundary must verify:

- Device ID;
- current device state;
- trust freshness;
- runtime eligibility;
- action terms hash;
- approval or mandate reference;
- required Trust Protocol/REV references.

The signer must reject requests from SUSPENDED or REVOKED devices.

---

## 27. Cross-Device Handoff

A handoff does not transfer authority.

Reference flow:

```
Device A prepares action
   ↓
Create Handoff Object
   ↓
Device B receives
   ↓
Resolve Device B state
   ↓
Resolve Runtime B state
   ↓
Revalidate Trust / Risk / Policy
   ↓
Continue if eligible
```

The target device must independently satisfy its own trust requirements.

---

## 28. Wearable Devices

Wearables default to LIMITED unless explicitly promoted under policy.

Typical wearable permissions:

- receive concealed notifications;
- view selected low-sensitivity balances;
- request transaction preparation;
- approve narrowly permitted low-risk actions;
- present selected credentials;
- emergency lock;
- handoff to primary phone.

High-risk signing and broad delegation remain prohibited by default.

---

## 29. Primary Device

The architecture may designate a primary device for:

- strongest holder interaction;
- mandate creation;
- recovery operations;
- trust promotion decisions;
- high-risk approval.

Primary designation does not automatically mean TRUSTED.

Primary status and trust state are separate fields.

---

## 30. Secondary Devices

Secondary devices may be:

- ATTESTED;
- TRUSTED;
- LIMITED.

Their authority must be explicitly scoped.

A secondary device shall not silently inherit primary-device policy.

---

## 31. Recovery Mode

During recovery:

- existing devices may be SUSPENDED or LIMITED;
- new device registration may be restricted;
- A3/A4 execution may be paused;
- high-risk actions may be blocked;
- SAEL evidence is mandatory.

Recovery completion may require trust re-establishment for all active devices.

---

## 32. Lost Device

Holder action should support:

1. identify device;
2. suspend immediately;
3. revoke if loss confirmed;
4. revoke affected runtimes;
5. invalidate device-bound mandates where required;
6. rotate affected session credentials;
7. preserve evidence;
8. notify holder on surviving trusted channels.

---

## 33. Compromised Device

Confirmed compromise requires:

- state → REVOKED;
- signer access blocked;
- runtime revoked;
- device-bound mandates invalidated or suspended;
- active sessions terminated;
- SAEL security event;
- potential holder-wide security escalation.

---

## 34. Emergency Device Controls

The wallet shall support deterministic controls to:

- suspend device;
- revoke device;
- disable approvals;
- disable signing;
- disable wearable actions;
- revoke device-bound mandates;
- force reauthentication;
- hide sensitive details globally.

Emergency controls should depend on as few external services as practical.

---

## 35. State Transition Object

```json
{
  "schema": "ssw.device-transition.v1",
  "transition_id": "uuid",
  "device_id": "device:uuid",
  "from_state": "ATTESTED",
  "to_state": "TRUSTED",
  "reason": "HOLDER_AUTH_AND_VALID_ATTESTATION",
  "initiated_by": "holder|policy|security|recovery|system",
  "auth_ref": "auth-uuid|null",
  "attestation_ref": "attestation-uuid|null",
  "policy_ref": "policy-uuid",
  "created_at": "RFC3339",
  "sael_event_ref": "sael-event-uuid"
}
```

Transitions must be append-only in evidence.

---

## 36. Allowed Transition Matrix

| From | To | Allowed |
|---|---|---|
| UNREGISTERED | REGISTERED | Yes |
| REGISTERED | ATTESTED | Yes |
| REGISTERED | LIMITED | Yes |
| REGISTERED | SUSPENDED | Yes |
| REGISTERED | REVOKED | Yes |
| ATTESTED | TRUSTED | Yes |
| ATTESTED | LIMITED | Yes |
| ATTESTED | REGISTERED | Yes, on expiry/policy |
| ATTESTED | SUSPENDED | Yes |
| ATTESTED | REVOKED | Yes |
| TRUSTED | ATTESTED | Yes |
| TRUSTED | LIMITED | Yes |
| TRUSTED | SUSPENDED | Yes |
| TRUSTED | REVOKED | Yes |
| LIMITED | TRUSTED | Yes |
| LIMITED | ATTESTED | Yes |
| LIMITED | SUSPENDED | Yes |
| LIMITED | REVOKED | Yes |
| SUSPENDED | LIMITED | Yes |
| SUSPENDED | TRUSTED | Yes, strong revalidation |
| SUSPENDED | REVOKED | Yes |
| REVOKED | Any active state | No |

---

## 37. Transition Guards

Examples:

### REGISTERED → ATTESTED

Requires:

- attestation PASS;
- freshness valid;
- no terminal risk flags.

### ATTESTED → TRUSTED

Requires:

- holder authentication;
- valid attestation;
- policy PASS;
- risk acceptable;
- secure key available.

### TRUSTED → LIMITED

May be triggered by:

- elevated risk;
- policy change;
- role change;
- stale trust.

### Any active state → SUSPENDED

May be triggered by:

- anomaly;
- holder action;
- security policy;
- failed attestation;
- recovery process.

### Any non-revoked state → REVOKED

May be triggered by:

- holder revocation;
- confirmed compromise;
- decommission;
- security recovery.

---

## 38. Device Trust Evaluation Result

```json
{
  "schema": "ssw.device-trust-evaluation.v1",
  "evaluation_id": "uuid",
  "device_id": "device:uuid",
  "state": "TRUSTED",
  "eligible": true,
  "action_id": "uuid",
  "risk_class": "R3",
  "authority_class": "A2",
  "reasons": [],
  "evaluated_at": "RFC3339",
  "expires_at": "RFC3339"
}
```

This result is action-specific.

A device may be TRUSTED overall but ineligible for a particular R5 action.

---

## 39. Runtime Eligibility

A trusted device may host an ineligible runtime.

Runtime eligibility shall be separately validated.

Example conditions:

- runtime version outdated;
- runtime integrity failed;
- cloud runtime not permitted;
- runtime revoked;
- runtime tool scope insufficient.

Device TRUSTED + runtime INELIGIBLE = action blocked.

---

## 40. Cloud Runtime

Cloud reasoning runtimes do not become trusted devices.

They are represented as runtimes/environments with their own policy.

They may:

- interpret;
- plan;
- summarize;
- compare;
- prepare.

They may not independently satisfy device-trust requirements for signing or high-risk holder authorization.

---

## 41. Concealed Detail Interaction

Device trust influences reveal policy.

Examples:

- TRUSTED phone: authenticated reveal may be allowed;
- LIMITED wearable: show summary only;
- SUSPENDED device: no sensitive reveal;
- REGISTERED device: conceal sensitive balances by default.

Reveal remains separate from approval.

---

## 42. Offline Mode

Offline device trust is permitted only when a pre-existing policy defines:

- cached trust state;
- freshness window;
- local attestation basis;
- allowed action classes;
- replay protection;
- reconciliation requirement.

If offline trust freshness expires, the device must downgrade or block affected actions.

---

## 43. Trust Expiry

Trust expiry is not revocation.

On expiry:

- device may downgrade;
- selected low-risk actions may remain;
- high-risk execution blocks;
- re-attestation/re-authentication may restore TRUSTED.

---

## 44. SAEL Evidence

SAEL shall record:

- registration;
- attestation;
- trust promotion;
- trust downgrade;
- limitation;
- suspension;
- revocation;
- recovery;
- failed trust checks;
- device-bound mandate invalidation;
- cross-device handoff;
- emergency controls.

Device state history is audit evidence.

---

## 45. Reporting

Holder-facing reports may include:

- currently trusted devices;
- limited devices;
- suspended/revoked devices;
- last attestation time;
- recent device state changes;
- actions approved by each device;
- mandates bound to each device;
- security events.

---

## 46. Security Invariants

1. Registration is not trust.
2. Attestation is not holder authority.
3. TRUSTED is not unlimited authority.
4. Device trust never overrides risk.
5. Device trust never overrides REV.
6. Device trust never overrides mandate limits.
7. Cross-device handoff never transfers source-device authority.
8. SUSPENDED and REVOKED devices cannot sign.
9. REVOKED device identity cannot silently reactivate.
10. Wearables default to constrained authority.
11. Cloud runtimes do not substitute for trusted devices.
12. State transitions must be evidencable.
13. Trust freshness is enforceable.
14. Recovery may reduce authority before restoring it.

---

## 47. Open Implementation Items

Downstream work must define:

- platform attestation adapters;
- exact freshness periods;
- secure key enrollment;
- device key rotation;
- device registration challenge protocol;
- device transfer process;
- primary-device designation rules;
- wearable-specific policy;
- offline trust package format;
- runtime integrity verification;
- compromise detection inputs;
- SAEL device event schemas.

---

## 48. Exit Criteria

SSW-AI-SCH-03 is ready to advance when:

1. platform-specific attestation profiles are defined;
2. action eligibility matrix is tested;
3. cross-device handoff flows are validated;
4. mandate interaction is tested;
5. revoked-device replay attempts are blocked;
6. offline trust behavior is specified;
7. SAEL device events are mapped;
8. recovery and lost-device flows pass threat-model review.

---

## 49. Controlled Statement

This specification defines the device trust state machine for SERA and Soul Super Wallet.

A device may be known without being trusted.

A device may be trusted without being authorized for every action.

And no device state, by itself, is sufficient to create holder authority.
