# SSW-AI-INFRA-02: Observability, Telemetry Privacy & Operational Signal Baseline

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-INFRA-02  
**Status:** Controlled Infrastructure Baseline — IN PROGRESS  
**Date:** 2026-09-20  
**Parent:** SSW-AI-INFRA-01  
**Normative Inputs:** SSW-SERA-DB15, SSW-AI-PROD-02

## 1. Purpose

INFRA-02 establishes a production-safe observability contract for logs, metrics, traces and operational/security signals.

The governing rule is:

`OBSERVABILITY MAY EXPLAIN SYSTEM BEHAVIOR; IT MUST NOT BECOME A SHADOW WALLET DATABASE.`

## 2. Telemetry Classes

The shared runtime supports:

- LOG;
- METRIC;
- TRACE;
- SECURITY_SIGNAL.

Operational telemetry is reference-oriented.

Preferred correlation fields include:

- request ID;
- correlation ID;
- action ID;
- trace ID;
- span ID;
- service;
- environment;
- reason code;
- dependency;
- duration;
- result.

## 3. Privacy Classification

Telemetry attributes are classified as:

- PUBLIC;
- OPERATIONAL;
- HOLDER_SENSITIVE;
- SECRET.

SECRET attributes are dropped.

Holder-sensitive identifiers may be hashed only where explicitly allowed.

Sensitive financial or credential content is redacted rather than copied.

## 4. Explicitly Prohibited Telemetry

The observability layer must not carry:

- seed phrases;
- private keys;
- wallet recovery secrets;
- biometric material;
- raw credentials;
- unrestricted credential claims;
- bearer tokens;
- authorization headers;
- signed payloads;
- full model prompts containing unrestricted wallet context;
- unrestricted SERA conversation transcripts;
- material transaction details where IDs/references are sufficient.

## 5. Metrics

Metric labels are restricted to low-cardinality operational dimensions.

Approved label classes include:

- service;
- environment;
- status;
- result;
- reason code;
- dependency;
- zone;
- operation;
- route;
- chain family.

Holder DIDs, wallet addresses, action IDs, recipient addresses and free-form strings are prohibited as metric labels.

## 6. Tracing

Trace context may propagate:

- trace ID;
- span ID;
- parent span ID;
- correlation ID;
- action ID.

Tracing must not propagate raw wallet action bodies merely for convenience.

Action ID provides the linkage to authoritative action/evidence stores.

## 7. Operational and Security Signals

Z7 operations may receive structured signals such as:

- dependency unavailable;
- stale identity/certificate;
- Trust/REV timeout;
- signer unavailable;
- replay detected;
- policy denial surge;
- execution reconciliation failure;
- SAEL integrity failure.

Signals carry references and reason codes, not sensitive holder payloads.

Administrative observability does not grant holder transaction authority.

## 8. Trust-Zone Boundary

DB15 places observability in Z7.

Z7 may inspect operational health and selected structured evidence references.

Z7 must not become an alternate authority, signing, identity, credential or wallet-state store.

## 9. Exporter Boundary

INFRA-02 is exporter-neutral.

The sanitized telemetry record can later be delivered to OpenTelemetry, logs/metrics providers or a sovereign observability stack.

Exporter selection may not weaken the sanitization contract.

Sanitization occurs before exporter submission.

## 10. Retention and Residency

Production deployment shall define retention and residency separately by telemetry class.

Security signals may require longer retention than routine traces.

No retention policy authorizes capture of otherwise prohibited data.

## 11. Incident Reconstruction

Operational telemetry supports incident reconstruction by linking to:

- action IDs;
- request/correlation IDs;
- SAEL/evidence references;
- service identity;
- controlled reason codes.

Authoritative holder/execution evidence remains in the appropriate controlled store, especially SAEL.

## 12. Next

After INFRA-02 closure, the next independent Phase H baseline should define environment separation before infrastructure-as-code packaging.
