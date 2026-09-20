# SSW-AI-INFRA-01: Production Workload Identity Baseline

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-INFRA-01  
**Status:** Controlled Infrastructure Baseline — IN PROGRESS  
**Date:** 2026-09-19  
**Parent:** SSW-AI-MOB-GATE-01  
**Normative Inputs:** SSW-AI-PROD-02, DB15

## 1. Purpose

INFRA-01 supplies the production workload-identity baseline deliberately left open by PROD-02.

Internal service identity must be cryptographically verified from the transport identity.

An asserted HTTP header, bearer string, holder session token or model-provided value is not service identity.

## 2. Selected Baseline

The controlled baseline uses mTLS peer authentication with SPIFFE-compatible X.509 workload identities.

The repository remains deployment-provider neutral.

A production environment may use SPIRE, a service mesh, Kubernetes-integrated workload issuance or another approved system, provided the resulting identity maps to the same controlled verifier semantics.

## 3. SPIFFE Identity Form

Expected workload identity form:

`spiffe://<trust-domain>/<workload-path>`

Example:

`spiffe://soulverse.internal/ns/ssw/sa/policy-runtime`

The trust domain is explicitly allowlisted.

Multiple SPIFFE IDs on one peer certificate fail closed as ambiguous.

## 4. Certificate Requirements

A peer is accepted only when:

- TLS reports the peer certificate as authorized;
- a certificate fingerprint exists;
- certificate validity fields are present and parseable;
- the certificate is currently valid;
- optional maximum remaining lifetime policy is satisfied;
- exactly one SPIFFE URI SAN exists;
- the SPIFFE trust domain is allowed;
- optional exact SPIFFE ID allowlist rules pass.

Plain HTTP produces no verified workload identity.

## 5. Identity Is Not Authority

A verified workload identity answers which service workload is calling.

It does not itself grant:

- signing authority;
- wallet authority;
- holder authority;
- mandate authority;
- administrative override;
- arbitrary access to another service.

Service-to-service authorization remains explicit.

INFRA-01 therefore includes an authorization mapping from caller SPIFFE ID to allowed target services and optionally allowed actions.

## 6. Service Host Integration

The existing `@soulverse/service-host` already:

- injects an `IdentityVerifier`;
- defaults to `DenyAllIdentityVerifier`;
- only populates caller identity after verifier success;
- rejects identity-required routes when no verified identity exists.

INFRA-01 adds `TlsSpiffeIdentityVerifier` as a production-capable verifier boundary.

Deployment TLS termination must preserve an actual authenticated peer identity or use an equally strong controlled adapter. Raw forwarded identity headers are not accepted by this baseline.

## 7. Failure Rules

Fail closed on:

- non-TLS transport;
- unauthorized TLS peer;
- missing peer certificate;
- missing certificate fingerprint;
- invalid or expired certificate;
- certificate not yet valid;
- missing SPIFFE URI SAN;
- multiple SPIFFE URI SANs;
- unapproved trust domain;
- unapproved exact workload identity;
- disallowed service target;
- disallowed action.

## 8. Secret and Key Boundary

INFRA-01 introduces no workload private keys or production certificates into the repository.

Certificate/key issuance, rotation and storage remain infrastructure/provider responsibilities.

The repository only defines verification and authorization semantics.

## 9. Production Binding Still Required

Production deployment must provide:

- workload CA / trust bundle;
- certificate/SVID issuance mechanism;
- rotation policy;
- revocation/expiry behavior;
- service-to-SPIFFE mapping;
- service authorization grants;
- TLS listener or service-mesh integration;
- staging evidence for rejected invalid/expired/wrong-domain identities.

## 10. Next

After INFRA-01 closure, Phase H should proceed into observability and environment separation while secret-management live bindings remain separately controlled.
