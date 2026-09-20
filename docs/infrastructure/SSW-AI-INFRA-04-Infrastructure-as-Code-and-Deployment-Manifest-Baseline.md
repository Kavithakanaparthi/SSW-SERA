# SSW-AI-INFRA-04: Infrastructure-as-Code & Deployment Manifest Baseline

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-INFRA-04  
**Status:** Controlled Infrastructure Baseline — IN PROGRESS  
**Date:** 2026-09-20  
**Parent:** SSW-AI-INFRA-03  
**Normative Inputs:** SSW-SERA-DB15, SSW-AI-PROD-02, INFRA-01, INFRA-02, INFRA-03

## 1. Purpose

INFRA-04 converts the controlled infrastructure rules into machine-validated deployment manifests.

The baseline is provider-neutral.

It does not prematurely bind Soulverse to AWS, GCP, Azure, a Kubernetes distribution, Terraform provider, service mesh or secrets vendor.

## 2. Governing Rule

`INFRASTRUCTURE CODE MAY REPRODUCE THE ENVIRONMENT; IT MAY NOT EMBED PRODUCTION AUTHORITY.`

No manifest may contain production signing enablement, production asset-movement enablement or secret values.

## 3. Manifest Scope

The controlled deployment manifest defines:

- environment profile;
- logical service inventory;
- DB15 trust zone;
- ingress exposure;
- workload identity requirement;
- allowed caller roles;
- secret references;
- database references;
- telemetry enablement;
- replica bounds;
- controlled data stores;
- external-provider adapters.

## 4. Reference Services

The provider-neutral reference deployment includes:

- wallet API gateway;
- wallet control plane;
- SERA agent runtime;
- execution adapter;
- evidence service;
- operations service.

These are logical deployment roles. A provider-specific implementation may split or consolidate them while preserving trust boundaries.

## 5. Trust-Zone Controls

Machine validation enforces examples including:

- Z3 intelligence runtime cannot be public-edge exposed;
- Z6 evidence service cannot be public-edge exposed;
- staging/production internal services require workload identity;
- provider traffic enters through controlled adapter services;
- operations remains separate from holder execution authority.

## 6. Data Stores

The baseline declares separate stores for:

- authority;
- policy;
- controlled holder/context metadata;
- evidence.

Every declared store requires encryption at rest.

Authority and evidence stores require backups.

Database namespaces must match the active environment profile.

## 7. Secret Handling

Manifests contain secret references only.

Secret references must live under the environment-specific secret namespace.

No secret value, private key, mnemonic, bearer token or provider credential belongs in the deployment manifest.

## 8. External Providers

External providers are bound to a declared adapter service.

Non-production environments reject providers marked production-capable.

Live provider credentials remain secret references.

## 9. Replicas and Availability

Every service declares minimum and maximum replica bounds.

This baseline does not select autoscaling algorithms.

Provider-specific IaC must preserve the declared floor and may tighten availability requirements.

## 10. Production Safety

The reference production manifest still has:

- `productionSigningEnabled: false`;
- `productionAssetMovementEnabled: false`.

Infrastructure deployment is not signing approval.

Infrastructure deployment is not asset-movement approval.

## 11. Provider-Specific Compilation

A future controlled adapter may compile the provider-neutral manifest into:

- Terraform/OpenTofu;
- Kubernetes/Helm;
- AWS CDK/CloudFormation;
- Pulumi;
- sovereign/private-cloud manifests.

The compiler must preserve, not reinterpret, environment and trust-zone controls.

## 12. Next

After INFRA-04 closure, Phase H should define the provider-specific deployment/IaC binding and infrastructure evidence required for the Production Deployment Gate.
