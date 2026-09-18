# SSW-AI-ISC-04: Runtime Registration, Device Attestation & Session Contract

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-ISC-04  
**Status:** Controlled Draft  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-01, SSW-AI-02, SSW-AI-CF-A01, SSW-AI-SCH-01 through SSW-AI-SCH-05, SSW-AI-TM-01, SSW-AI-ISC-01 through SSW-AI-ISC-03  
**Repository:** Kavithakanaparthi/SSW-SERA

---

## 1. Purpose

This specification defines the contract for registering SERA runtime instances under a persistent SERA Agent DID that is governed by the wallet holder's Soul ID, evaluating the security posture of the current device/runtime, issuing scoped runtime sessions, enforcing trust freshness, and revoking or rebinding runtimes when trust changes.

Soul Super Wallet is **identity-bound, not device-bound**. A holder may recover the wallet on another device by recovering the holder's Soul ID through the SoulScan facial-biometric recovery path. Device and runtime identity therefore describe the current execution environment; they do not define wallet ownership or continuity.

The governing invariants are:

> The Holder Soul ID is the root identity for Soul Super Wallet continuity.

> The SERA Agent DID is governed by and bound to that Holder DID.

> A Runtime ID is a scoped execution instance. A Device ID is a security and assurance context. Neither is the root of wallet ownership.

---

## 2. Scope

This specification defines:

- runtime registration;
- device binding;
- runtime identity;
- attestation;
- attestation freshness;
- runtime eligibility;
- session issuance;
- session scope;
- session expiry;
- device-state dependency;
- runtime suspension and revocation;
- device compromise propagation;
- cross-device rebinding;
- cloud runtime handling;
- wearable runtime handling;
- recovery-mode registration;
- SAEL evidence requirements.

It does not define vendor-specific Apple, Android or wearable attestation APIs.

---

## 3. Identity Model

The architecture distinguishes:

```
Holder DID
  did:soul:<holder>

SERA Agent DID
  did:soul:agent:<sera>

Device ID
  device:<device-id>

SERA Runtime ID
  sera-runtime:<runtime-id>

Runtime Session ID
  sera-session:<session-id>
```

Relationships:

```
Holder Soul ID
   ↓ controls / recovers
Soul Super Wallet
   ↓ governs
SERA Agent DID
   ↓ represented by
Runtime ID
   ↓ executes on
Device / Environment
   ↓ receives scoped
Runtime Session
```

The Device ID is replaceable. A new device does not become the owner of the wallet. The wallet context is established from the recovered Holder Soul ID; device/runtime controls are then applied to the current execution environment.

---

## 4. Runtime Classes

Initial runtime classes:

- PRIMARY_PHONE
- SECONDARY_PHONE
- TABLET
- DESKTOP
- WEARABLE
- PROTECTED_CLOUD_REASONING
- RECOVERY_RUNTIME
- TEST_OR_DEVELOPMENT

Runtime class affects eligibility and policy.

TEST_OR_DEVELOPMENT runtimes shall never be eligible for production signing.

---

## 5. Canonical Runtime Object

```json
{
  "schema": "ssw.runtime.v1",
  "sera_runtime_id": "sera-runtime:uuid",
  "holder_did": "did:soul:...",
  "sera_agent_did": "did:soul:agent:...",
  "runtime_class": "PRIMARY_PHONE",
  "device_id": "device:uuid|null",
  "environment": {
    "platform": "ios",
    "app_version": "string",
    "runtime_version": "string",
    "build_id": "string"
  },
  "state": "REGISTERED",
  "registered_at": "RFC3339",
  "last_attested_at": null,
  "eligibility": {
    "status": "PENDING",
    "expires_at": null
  },
  "capabilities": [],
  "revocation": {
    "revoked_at": null,
    "reason": null
  },
  "sael_correlation_id": "uuid"
}
```

---

## 6. Runtime States

Canonical runtime states:

- UNREGISTERED
- REGISTERED
- ATTESTED
- ELIGIBLE
- LIMITED
- SUSPENDED
- REVOKED

These states are distinct from device trust states, though related.

---

## 7. Runtime Registration Preconditions

A runtime registration request shall include:

- Holder DID;
- SERA Agent DID;
- Device ID if device-bound;
- runtime class;
- platform;
- app/runtime version;
- build identifier;
- runtime-generated key or attestation identifier;
- holder/device authentication reference where required.

Cloud runtimes use environment identity instead of physical Device ID.

---

## 8. Runtime Registration Request

```json
{
  "schema": "ssw.runtime-registration-request.v1",
  "request_id": "uuid",
  "holder_did": "did:soul:...",
  "sera_agent_did": "did:soul:agent:...",
  "device_id": "device:uuid",
  "runtime_class": "PRIMARY_PHONE",
  "environment": {
    "platform": "ios",
    "app_version": "1.0.0",
    "runtime_version": "1.0.0",
    "build_id": "prod-100"
  },
  "runtime_key_ref": "runtime-key:opaque",
  "auth_ref": "auth:uuid",
  "attestation_ref": "attestation:uuid|null",
  "requested_capabilities": []
}
```

---

## 9. Registration Validation

Runtime Registry shall validate:

1. Holder DID exists and is active.
2. SERA Agent DID is governed by holder.
3. The runtime is operating inside a Soul Super Wallet context established for the same Holder DID that governs the SERA Agent DID.
4. Device ID, where present, is registered for the current execution environment and is not REVOKED. Device registration is not proof of wallet ownership.
5. Runtime class is permitted.
6. Build/runtime version is allowed.
7. Runtime key is valid.
8. Registration request is fresh.
9. Authentication requirements pass.
10. Attestation requirements are satisfied or registration remains limited.

---

## 10. Device Attestation Contract

Device attestation is an integrity signal, not holder authorization.

Attestation may prove, where platform supports:

- genuine app/runtime;
- expected signing identity;
- secure hardware availability;
- device integrity;
- OS security posture;
- non-debug production environment;
- device-bound key possession.

---

## 11. Canonical Attestation Result

```json
{
  "schema": "ssw.device-attestation.v1",
  "attestation_id": "uuid",
  "device_id": "device:uuid",
  "sera_runtime_id": "sera-runtime:uuid",
  "provider": "platform-or-soulverse",
  "status": "PASS|FAIL|UNAVAILABLE|EXPIRED",
  "claims": {
    "runtime_integrity": true,
    "secure_hardware": true,
    "production_build": true,
    "debug_state": false
  },
  "issued_at": "RFC3339",
  "expires_at": "RFC3339",
  "evidence_ref": "opaque-ref",
  "integrity": {
    "attestation_hash": "sha256:...",
    "signature_ref": "signature:..."
  }
}
```

---

## 12. Attestation Freshness

Attestation shall be time-bounded.

Freshness periods may vary by:

- runtime class;
- device class;
- risk class;
- action authority;
- platform capability.

R4/R5 actions require fresher assurance than R1/R2 actions.

---

## 13. Runtime Eligibility

Eligibility is action-independent baseline permission to participate in production control paths.

An ELIGIBLE runtime may still be ineligible for a specific action.

Eligibility evaluation shall consider:

- runtime state;
- device state;
- attestation;
- version policy;
- security flags;
- runtime key status;
- compromise indicators;
- runtime class.

---

## 14. Runtime Eligibility Result

```json
{
  "schema": "ssw.runtime-eligibility.v1",
  "evaluation_id": "uuid",
  "sera_runtime_id": "sera-runtime:uuid",
  "device_id": "device:uuid|null",
  "status": "ELIGIBLE|LIMITED|INELIGIBLE",
  "reason_codes": [],
  "issued_at": "RFC3339",
  "expires_at": "RFC3339"
}
```

---

## 15. Session Issuance

A runtime session is a short-lived operational credential for accessing specific wallet services after the Holder DID wallet context has already been established.

A session is not wallet ownership, is not Soul ID recovery proof, is not a mandate, and cannot create A3/A4 delegation.

Session issuance requires:

- eligible runtime;
- eligible device where applicable;
- valid authentication context;
- valid runtime key;
- requested scope allowed by policy.

---

## 16. Canonical Session Object

```json
{
  "schema": "ssw.runtime-session.v1",
  "session_id": "sera-session:uuid",
  "holder_did": "did:soul:...",
  "sera_agent_did": "did:soul:agent:...",
  "sera_runtime_id": "sera-runtime:uuid",
  "device_id": "device:uuid|null",
  "scope": [
    "wallet.read",
    "intent.prepare",
    "presentation.review"
  ],
  "assurance": {
    "device_state": "TRUSTED",
    "runtime_state": "ELIGIBLE",
    "authentication_ref": "auth:uuid"
  },
  "issued_at": "RFC3339",
  "expires_at": "RFC3339",
  "revocation_id": "uuid",
  "integrity": {
    "session_hash": "sha256:...",
    "signature_ref": "signature:..."
  }
}
```

---

## 17. Session Scope

Session scopes may include:

- wallet.read
- credential.read
- intent.prepare
- presentation.reveal
- presentation.review
- approval.request
- approval.grant
- mandate.manage
- signing.request
- execution.request
- security.emergency_lock
- device.manage
- recovery.manage

A runtime receives only necessary scopes.

---

## 18. Scope Separation

The following high-privilege scopes should not coexist by default in low-trust runtimes:

- mandate.manage;
- signing.request;
- recovery.manage;
- device.manage.

Cloud reasoning runtimes shall not receive signing.request.

---

## 19. Session Freshness

Sessions must be short-lived.

Higher-risk scopes require:

- shorter expiry;
- stronger authentication;
- fresher attestation;
- stronger device state.

Session expiration does not change the underlying Device ID or Runtime ID state.

---

## 20. Session Revocation

Sessions may be revoked due to:

- device suspension;
- device revocation;
- runtime suspension;
- runtime revocation;
- holder logout;
- recovery event;
- compromise signal;
- policy change;
- key rotation;
- app/runtime version block.

Revocation shall propagate quickly to privileged services.

---

## 21. Runtime Suspension

A runtime may be SUSPENDED without revoking the device.

Examples:

- compromised app process;
- invalid runtime build;
- runtime key anomaly;
- malicious extension/module;
- unsupported version.

Suspension blocks new privileged sessions.

---

## 22. Runtime Revocation

REVOKED is terminal for the Runtime ID.

A revoked runtime cannot be reactivated.

A new runtime registration is required.

---

## 23. Device Compromise Propagation

If Device ID becomes SUSPENDED or REVOKED:

- all device-bound runtimes become LIMITED/SUSPENDED/REVOKED by policy;
- privileged sessions are revoked;
- signing requests fail;
- device-bound mandates may become ineligible;
- SAEL security events are emitted.

---

## 24. Runtime Compromise Without Device Compromise

If runtime is compromised but device remains trustworthy:

- revoke runtime;
- revoke runtime sessions;
- preserve Device ID;
- require clean runtime reinstall/registration;
- re-attest;
- issue new Runtime ID where policy requires.

---

## 25. Runtime Key

Each runtime should possess a runtime-specific cryptographic key or equivalent identity credential.

The runtime key may be used for:

- service authentication;
- session establishment;
- request integrity;
- runtime registration proof.

Runtime keys must not be wallet private keys.

---

## 26. Runtime Key Rotation

Rotation triggers may include:

- scheduled rotation;
- runtime upgrade;
- compromise suspicion;
- device migration;
- recovery.

Rotation shall:

- invalidate old sessions as policy requires;
- preserve SAEL lineage;
- not alter SERA Agent DID.

---

## 27. Current Phone Runtime

Any phone on which the holder has validly recovered or opened Soul Super Wallet under the Holder Soul ID may host an eligible runtime.

Typical baseline after identity recovery and environment checks:

- device assurance evaluated;
- runtime state ELIGIBLE where policy permits;
- may receive approval.grant;
- may receive signing.request;
- may manage mandates under strong holder authentication;
- may participate in recovery administration under the Soul ID recovery policy.

No phone is the permanent ownership anchor.

---

## 28. Additional Device Runtime

An additional device may become ELIGIBLE or LIMITED according to policy after the wallet context is established for the same Holder DID.

Its scope must be explicit. It does not inherit another device's session or assurance, but it also does not require transfer of wallet ownership from another device.

---

## 29. Wearable Runtime

Wearables default to LIMITED.

Typical scopes:

- wallet.read limited;
- notification.receive;
- presentation.summary;
- handoff.request;
- emergency_lock.

High-risk signing is prohibited by default.

---

## 30. Protected Cloud Reasoning Runtime

Cloud runtime:

- has Runtime ID;
- no physical Device ID;
- has environment identity;
- may use intent.prepare;
- may use context-limited reasoning;
- may query approved SAEL summaries;
- may coordinate long-running tasks.

Prohibited by default:

- approval.grant;
- mandate.manage;
- signing.request;
- recovery.manage.

---

## 31. Recovery Runtime

A recovery runtime is temporary and constrained.

It may:

- authenticate holder;
- resolve SERA Agent DID;
- retrieve state manifest;
- register new device/runtime.

It shall not receive unrestricted transaction authority during recovery.

---

## 32. Runtime Handoff

Cross-device/runtime handoff shall bind:

- source Runtime ID;
- target Runtime ID;
- source Device ID;
- target Device ID;
- action ID;
- material terms hash;
- expiry.

Target runtime must obtain its own valid session.

---

## 33. Session Handoff

Sessions are not transferred across runtimes.

A target runtime must establish a new session.

This prevents source-device privileges from leaking across handoff.

---

## 34. Session Token Requirements

Session credentials must be:

- short-lived;
- audience-bound;
- scope-bound;
- runtime-bound;
- revocable;
- integrity-protected;
- non-exportable where possible.

Bearer-only long-lived tokens are prohibited for privileged scopes.

---

## 35. Audience Binding

A session token must specify permitted service audience.

Example:

```
aud = approval-service
```

A token issued for read-only wallet service cannot call signer.

---

## 36. Action Binding

For high-risk scopes, sessions may be action-bound.

Example:

```
scope = approval.grant
action_id = uuid
material_terms_hash = sha256:...
```

This narrows stolen-session utility.

---

## 37. Session Step-Up

A session may require step-up before sensitive scope use.

Example:

```
wallet.read session
   ↓
holder requests R4 approval
   ↓
fresh authentication
   ↓
short-lived approval.grant session
```

---

## 38. Runtime Version Policy

Runtime Registry shall maintain minimum supported versions.

Old versions may become:

- LIMITED;
- INELIGIBLE;
- SUSPENDED.

Policy changes must be evidenced.

---

## 39. Debug / Development Environments

Production holder authority shall not be granted to runtimes that attest as debug/development unless explicitly isolated under a non-production environment.

Environment separation is mandatory.

---

## 40. Session Error Codes

Canonical codes:

- RUNTIME_NOT_REGISTERED
- RUNTIME_REVOKED
- RUNTIME_SUSPENDED
- RUNTIME_VERSION_UNSUPPORTED
- DEVICE_NOT_ELIGIBLE
- ATTESTATION_REQUIRED
- ATTESTATION_FAILED
- ATTESTATION_EXPIRED
- AUTHENTICATION_REQUIRED
- SESSION_SCOPE_DENIED
- SESSION_EXPIRED
- SESSION_REVOKED
- AUDIENCE_MISMATCH
- ACTION_BINDING_MISMATCH
- RUNTIME_KEY_INVALID

---

## 41. SAEL Evidence

SAEL shall record:

- runtime registered;
- runtime attested;
- runtime eligible;
- runtime limited;
- runtime suspended;
- runtime revoked;
- session issued;
- session step-up;
- session revoked;
- runtime key rotated;
- runtime handoff;
- recovery runtime created/terminated.

Sensitive session secrets are not logged.

---

## 42. Service Enforcement

Privileged services shall validate:

- Runtime ID;
- runtime state;
- session scope;
- audience;
- expiry;
- Device ID;
- device state where applicable;
- action binding where applicable.

No service should rely on runtime-supplied claims without verification.

---

## 43. Trust Protocol / REV Integration

Trust Protocol and REV may consume:

- Runtime ID;
- runtime class;
- runtime eligibility;
- Device ID;
- device trust state;
- session assurance.

Runtime/session changes may invalidate prior decisions under ISC-03.

---

## 44. Signing Integration

Signing Gateway shall require:

- eligible runtime;
- eligible device;
- signing.request session scope;
- action binding;
- fresh Trust/REV;
- valid approval/mandate.

Cloud reasoning runtimes fail by policy.

---

## 45. Recovery Integration

Soul Super Wallet recovery is rooted in recovery of the Holder Soul ID through the SoulScan facial-biometric recovery mechanism. That identity recovery may occur on a different device without possession of the former device.

Recovery does not automatically restore prior runtime sessions.

After Soul ID and wallet context recovery:

- verify the SERA Agent DID is governed by the recovered Holder DID;
- old sessions remain invalid;
- old runtimes are re-evaluated or retired;
- the current runtime is registered;
- device/runtime assurance is evaluated for the current environment;
- new sessions are issued according to policy.

Device trust affects assurance and permitted operations after wallet recovery; it does not determine whether the holder owns or can recover Soul Super Wallet.

---

## 46. Threat Model Gaps Closed

This specification materially closes:

- **SG-03 Runtime integrity profile**

It also advances:

- SG-08 recovery authorization;
- SG-10 platform attestation;
- cross-device isolation;
- session replay resistance.

---

## 47. Open Implementation Items

Still required:

- platform-specific attestation adapters;
- service credential format;
- session token format;
- runtime-key hardware binding;
- session revocation distribution;
- runtime version registry;
- cloud runtime attestation mechanism;
- wearable policy profile;
- recovery-session profile.

---

## 48. Conformance Tests

Minimum tests:

1. revoked runtime cannot obtain session;
2. suspended device revokes privileged runtime sessions;
3. cloud runtime cannot obtain signing.request;
4. secondary runtime cannot inherit primary session;
5. expired attestation blocks high-risk session;
6. debug runtime blocked in production;
7. action-bound session fails on different action;
8. audience mismatch fails;
9. revoked session fails immediately;
10. runtime key mismatch fails;
11. handoff target obtains new independent session;
12. recovery runtime cannot sign.

---

## 49. Exit Criteria

SSW-AI-ISC-04 advances when:

1. runtime registration service exists;
2. runtime and device states are independently enforced;
3. session scopes are technically enforced;
4. session revocation propagates;
5. cloud runtime restrictions are enforced;
6. attestation freshness is enforced;
7. signer validates runtime/session;
8. SAEL runtime/session events are implemented.

---

## 50. Controlled Statement

SERA is persistent through identity, not through one process or one device.

Soul Super Wallet follows the holder's Soul ID and may be recovered on a new device through the SoulScan facial-biometric recovery path.

Each runtime must earn its place in the trust fabric. Each session must be scoped. Each device is evaluated as a replaceable execution environment.

No device owns the wallet, and no runtime inherits authority merely because it belongs to SERA.
