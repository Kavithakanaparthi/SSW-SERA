# SSW-AI-ATT-01: Device & Runtime Attestation Profiles

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-ATT-01  
**Status:** Controlled Security Specification  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-SCH-03, SSW-AI-TM-01, SSW-AI-ISC-04, API-01, API-02  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

This specification defines platform-neutral attestation semantics for device-bound and cloud-hosted SERA runtimes, together with implementation profiles for iOS, Android, wearables and protected cloud runtimes.

The governing invariants are:

> Attestation proves properties of a runtime or device. It does not prove holder identity ownership, wallet continuity, holder intent, or authority.

> Soul Super Wallet ownership and recovery are anchored to the Holder Soul ID, recoverable through the SoulScan facial-biometric path. Device attestation is applied after that identity context is established to determine execution assurance.

## 2. Architectural Separation

The system distinguishes:

- Holder Soul ID
- Soul Super Wallet identity context
- SERA Agent DID governance binding
- Device identity
- Runtime identity
- Runtime key
- Attestation evidence
- Device trust state
- Runtime eligibility
- Session scope
- Holder authority

The Holder Soul ID is the continuity anchor. Devices are replaceable execution environments.

Attestation feeds Device Trust and Runtime Registry. It never establishes wallet ownership, never performs Soul ID recovery, and never writes authority directly.

## 3. Canonical Attestation Profile

The canonical machine object is defined in:

`contracts/json-schema/ssw-attestation-evidence.v1.schema.json`

Every attestation record must include:

- attestation ID;
- provider;
- profile;
- subject type;
- Device ID and/or Runtime ID;
- challenge/nonce binding;
- issued_at;
- expires_at;
- app/runtime identity;
- environment claims;
- security claims;
- verification status;
- evidence hash;
- verifier reference.

## 4. Required Properties

An attestation implementation should establish, where technically available:

- expected application/runtime identity;
- expected build/signing identity;
- runtime key possession;
- challenge freshness;
- replay resistance;
- platform integrity;
- production vs debug/development state;
- secure hardware presence where applicable;
- device or workload provenance;
- attestation freshness.

Not all platforms expose identical signals. Policy must evaluate profile-specific evidence rather than pretending all attestation is equivalent.

## 5. Canonical Verification Status

- PASS
- FAIL
- UNAVAILABLE
- EXPIRED
- UNSUPPORTED

UNAVAILABLE and UNSUPPORTED are not equivalent to PASS.

## 6. Profile Families

Initial profiles:

- APPLE_APP_ATTEST
- ANDROID_PLAY_INTEGRITY
- WEARABLE_PAIRED_PROFILE
- CLOUD_WORKLOAD_ATTESTATION
- RECOVERY_LIMITED_PROFILE

## 7. Apple Profile

For supported Apple app environments, the preferred profile uses Apple App Attest / DeviceCheck-style server validation.

The profile should bind:

- registered app identity;
- app instance attestation key;
- server challenge;
- assertion;
- runtime key reference;
- app version/build;
- Device ID mapping internal to Soulverse.

The server must validate attestation/assertion evidence. Client-side self-assertion is insufficient.

App Attest availability must be checked. Unsupported environments must not be silently promoted to TRUSTED solely because the API is unavailable.

Apple documentation explicitly positions App Attest as a way for an app to prove that requests come from a legitimate app instance, and notes that availability varies by device/environment.

## 8. Android Profile

For Android production deployments distributed through Google Play, the preferred profile uses the Play Integrity API.

The profile may consume:

- app integrity verdicts;
- device integrity verdicts;
- licensing/account signals where relevant;
- device attributes;
- recent device activity where policy requires.

The SSW control plane shall map platform verdicts into its own Device Trust policy rather than exposing Google verdict labels as authority.

Play Integrity is treated as one security signal among several, not as holder authorization.

## 9. Android Stronger-Assurance Policy

Higher-risk SSW actions may require stronger Android integrity evidence than low-risk actions.

Example policy mapping:

- R1/R2: basic acceptable integrity + valid app identity
- R3: device integrity + fresh runtime/session
- R4: stronger integrity threshold + fresh authentication + Trust/REV
- R5: no autonomous execution regardless of attestation

Exact vendor verdict mapping remains deployment-configurable.

## 10. Wearable Profile

Wearables are not assumed to inherit the phone's trust.

The default wearable model is:

- Device state: LIMITED
- Runtime state: LIMITED
- narrow session scopes
- no unrestricted signing
- explicit handoff for elevated actions

A wearable profile may consume:

- paired-device relationship;
- wearable app identity;
- local runtime key;
- platform-specific attestation if available;
- pairing freshness;
- wrist/device unlock state where platform exposes suitable assurance.

A paired phone being TRUSTED does not make the wearable TRUSTED.

## 11. WatchOS Consideration

Where Apple App Attest support is available for a watchOS extension, the wearable profile may incorporate it.

Where direct equivalent evidence is unavailable or insufficient, the wearable remains LIMITED and relies on handoff for consequential signing.

## 12. Protected Cloud Runtime Profile

A protected cloud reasoning runtime has no physical Device ID requirement.

It must instead present workload identity and workload/node attestation evidence.

The profile may use:

- SPIFFE ID;
- X.509-SVID;
- SPIRE-style workload attestation;
- Kubernetes workload identity;
- node attestation;
- image/build identity;
- deployment environment;
- workload key possession.

The cloud runtime remains prohibited from unrestricted signing even if its workload attestation is strong.

## 13. Cloud Workload Identity

The recommended architecture supports standards-based workload identity.

SPIFFE/SPIRE is a suitable profile because it separates workload identity from user identity and supports attested issuance of verifiable workload identities.

Cloud workload identity maps to:

`sera-runtime:<runtime-id>`

It does not replace:

`did:soul:agent:<sera>`

## 14. Challenge Binding

Every online attestation flow must bind to a server-issued challenge or equivalent replay-resistant freshness mechanism.

The challenge should bind:

- attestation request ID;
- Runtime ID;
- Device ID where applicable;
- service audience;
- issued_at;
- expiry.

Replayed evidence must fail.

## 15. Runtime Key Binding

Attestation should bind or establish possession of a runtime-specific key wherever the platform permits.

Runtime key uses:

- service authentication;
- attestation continuity;
- session establishment;
- request integrity.

Runtime key is not the wallet signing key.

## 16. Build Identity

Attestation policy shall distinguish:

- PRODUCTION
- DEVELOPMENT
- TEST
- DEBUG
- UNKNOWN

Production authority shall not be granted to DEBUG or TEST builds.

## 17. Freshness Classes

Suggested profile classes:

- F0: <= 5 minutes
- F1: <= 1 hour
- F2: <= 24 hours
- F3: <= 7 days

Policy maps action risk to freshness.

Example:

- R1 may accept F2
- R3 may require F1
- R4 may require F0 or fresh step-up
- R5 remains direct-holder only

These are default policy examples, not immutable values.

## 18. Attestation Failure

On FAIL:

- runtime/device cannot be promoted;
- existing privileged sessions may be revoked;
- R3+ execution blocks by default;
- SAEL records failure.

On UNAVAILABLE:

- policy determines LIMITED vs fail closed;
- no implicit TRUSTED state.

On EXPIRED:

- fresh attestation required.

## 19. Attestation and Device State

Attestation contributes to, but does not alone define, device trust state.

Device trust is an execution-security property. It is not a wallet-ownership state. A holder may recover Soul Super Wallet on a new device through Soul ID facial biometrics even while that new device is still UNREGISTERED or LIMITED for higher-risk execution.

Example:

```
REGISTERED
  + attestation PASS
  + policy PASS
  + no security flags
  -> ATTESTED

ATTESTED
  + holder/device binding
  + freshness
  + runtime eligibility
  -> TRUSTED
```

## 20. Attestation and Runtime State

Runtime eligibility additionally checks:

- allowed version;
- runtime key;
- build identity;
- environment;
- compromise indicators;
- runtime class.

A trusted device may host an ineligible runtime.

## 21. Session Issuance

Privileged sessions shall bind to the attestation result reference where policy requires.

If the attestation expires or is invalidated:

- session may be downgraded or revoked;
- high-risk actions require fresh attestation.

## 22. Cross-Device Handoff

A handoff target must provide its own device/runtime assurance.

Attestation evidence is never transferable across devices or runtimes.

## 23. Recovery

Soul Super Wallet recovery begins with recovery of the Holder Soul ID through SoulScan facial biometrics. It does not depend on the previous device being present or trusted.

Recovery runtimes use RECOVERY_LIMITED_PROFILE.

They may:

- support the Soul ID recovery flow;
- establish the recovered Holder DID wallet context;
- verify the bound SERA Agent DID;
- restore SERA state;
- register the current runtime.

They may not gain normal signing authority until the current execution environment satisfies the required attestation, runtime, policy, Trust Protocol and REV controls.

Attestation therefore controls post-recovery execution assurance, not whether the holder is entitled to recover the wallet.

## 24. Privacy

Attestation storage should minimize platform identifiers.

Prefer:

- internal Device ID;
- internal Runtime ID;
- attestation hash;
- verifier reference;
- summarized claims.

Avoid retaining raw provider payloads longer than operationally necessary unless audit/security policy requires them.

## 25. SAEL Evidence

SAEL should record:

- attestation requested;
- provider/profile;
- subject;
- result;
- issued_at;
- expires_at;
- claims summary;
- evidence hash;
- runtime/device state transition caused by the result.

## 26. Error Codes

- ATTESTATION_UNSUPPORTED
- ATTESTATION_UNAVAILABLE
- ATTESTATION_EXPIRED
- ATTESTATION_CHALLENGE_MISMATCH
- ATTESTATION_REPLAY_DETECTED
- ATTESTATION_SIGNATURE_INVALID
- ATTESTATION_APP_ID_MISMATCH
- ATTESTATION_BUILD_NOT_ALLOWED
- ATTESTATION_DEVICE_INTEGRITY_INSUFFICIENT
- ATTESTATION_RUNTIME_KEY_MISMATCH
- ATTESTATION_WORKLOAD_ID_MISMATCH
- ATTESTATION_PROFILE_NOT_ALLOWED

## 27. Threat Model Gap Closure

This specification materially closes:

**SG-10 Platform attestation**

It also completes the platform-specific portion of:

**SG-03 Runtime integrity profile**

## 28. Conformance Tests

Minimum tests:

1. stale attestation fails high-risk eligibility;
2. replayed challenge fails;
3. wrong app/build identity fails;
4. debug build blocked in production;
5. runtime key mismatch fails;
6. revoked device remains blocked despite new stale evidence;
7. cloud runtime cannot acquire signing authority;
8. wearable cannot inherit phone trust;
9. unsupported attestation does not become PASS;
10. cross-device evidence reuse fails;
11. recovery profile cannot sign;
12. expired evidence revokes or downgrades privileged session per policy.

## 29. Exit Criteria

ATT-01 advances when:

- platform adapters are implemented;
- verifier services exist;
- attestation-to-device-state mapping is policy-driven;
- runtime key binding works;
- freshness enforcement works;
- SAEL evidence is emitted;
- conformance tests pass.

## 30. Reference Sources

- Apple DeviceCheck / App Attest documentation
- Google Play Integrity documentation
- SPIFFE and SPIRE workload identity / attestation specifications

## 31. Controlled Statement

Attestation answers: "What runtime or device is this, and what security properties can I verify about it?"

It does not answer:

- "Who owns this Soul Super Wallet?"
- "Has the holder recovered their Soul ID?"
- "What is this runtime allowed to do?"

Wallet continuity comes from the Holder Soul ID. Authority remains a separate control-plane decision.
