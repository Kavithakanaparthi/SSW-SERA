# SSW-AI-IMP-09: Approval, Authentication & Exact-Term Authorization Binding

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-IMP-09  
**Status:** Controlled Implementation Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-IMP-08

## 1. Purpose

IMP-09 makes A2 holder approval a first-class, machine-verifiable authorization object.

The governing rules are:

> Reveal is not approval.

> Review is not approval.

> Authentication is not approval unless it is explicitly bound to the approval purpose and exact material terms.

> Identity recovery is not transaction authorization.

## 2. Controlled Objects

IMP-09 introduces:

- Review Record;
- Authentication Evidence;
- Approval Record.

These are separate objects because presentation, review, authentication and authorization are separate controls.

## 3. Review Record

A Review Record proves that the holder was presented the exact material terms associated with a specific Action Contract version.

It binds:

- action ID;
- action version;
- material-terms hash;
- presentation reference;
- Device ID;
- Runtime ID;
- review timestamp.

A material change invalidates reuse.

## 4. Authentication Evidence

Authentication Evidence records a successful or failed authentication ceremony and its purpose.

Purposes:

- REVEAL;
- ACTION_APPROVAL;
- MANDATE_CREATION;
- RECOVERY;
- SECURITY_ACTION.

Methods may include:

- DEVICE_BIOMETRIC;
- DEVICE_PASSCODE;
- HARDWARE_KEY;
- PLATFORM_CREDENTIAL;
- WALLET_KEY_CONFIRMATION;
- SOULSCAN_FACE.

An authentication event with purpose RECOVERY cannot satisfy ACTION_APPROVAL.

## 5. Authentication Binding

For ACTION_APPROVAL, evidence binds:

- Holder DID;
- action ID/version;
- material-terms hash;
- Device ID;
- Runtime ID;
- challenge reference;
- assurance level;
- issue/expiry time;
- verifier/service identity.

## 6. Approval Record

An Approval Record is created only when:

1. Action Contract is valid and authority class is A2;
2. action is not expired;
3. Review Record matches action ID/version and material-terms hash;
4. Review Device/Runtime match the current Action Contract;
5. Authentication Evidence status is PASS;
6. authentication purpose is ACTION_APPROVAL;
7. authentication Holder DID matches;
8. authentication action/version/material hash match;
9. authentication Device/Runtime match;
10. authentication evidence is unexpired.

## 7. Approval Status

Approval Record supports:

- APPROVED;
- REJECTED;
- EXPIRED;
- INVALIDATED.

IMP-09 constructs APPROVED records from verified review + authentication.

Rejected/expired/invalidated lifecycle persistence will be implemented with the stateful approval service.

## 8. Exact-Term Authorization

An approval binds the exact `material_terms_hash`.

Changing:

- amount;
- asset;
- recipient;
- chain;
- material route;
- action version;

makes the approval unusable for the changed action.

## 9. Action Contract Application

A verified Approval Record may produce a copied Action Contract with:

- approval.status = APPROVED;
- approval.approval_id = Approval Record ID;
- approval.approved_terms_hash = exact material-terms hash;
- presentation.review_hash = exact reviewed material-terms hash.

The source Action Contract is not mutated.

Execution remains NOT_READY.

## 10. Recovery Separation

SOULSCAN_FACE may appear as an authentication method.

However:

```
purpose = RECOVERY
```

cannot satisfy:

```
purpose = ACTION_APPROVAL
```

This implements CF-A02 and REC-01 separation between wallet recovery and transaction authority.

## 11. Authentication Assurance

IMP-09 records assurance levels:

- AL1
- AL2
- AL3
- AL4

The baseline requires AL2 or stronger for R3 A2 payment approval.

R4/R5 requirements remain policy-configurable and will be tightened before production signing.

## 12. No Signing

IMP-09 does not:

- hold private keys;
- sign blockchain transactions;
- consume REV decisions;
- broadcast;
- infer approval from voice acknowledgment;
- infer approval from reveal/review;
- infer approval from recovery authentication.

## 13. Tests

IMP-09 proves:

1. exact review + ACTION_APPROVAL authentication creates approval;
2. material hash mismatch blocks;
3. action version mismatch blocks;
4. wrong Holder DID blocks;
5. wrong Device ID blocks;
6. wrong Runtime ID blocks;
7. expired authentication blocks;
8. RECOVERY-purpose authentication blocks;
9. reveal-purpose authentication blocks;
10. insufficient assurance blocks R3 payment;
11. approved record enriches only a copy;
12. changed material terms make prior approval unusable.

## 14. Next Controlled Artifact

**SSW-AI-IMP-10: Canonical Signing Gateway Baseline**
