# SSW-AI-SERA-RT-08: Credential Runtime & Soulogram Presentation Integration

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-SERA-RT-08  
**Status:** Controlled Runtime Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-SERA-RT-07

## 1. Purpose

RT-08 establishes the controlled credential-presentation runtime between SERA, the existing Soul Super Wallet credential subsystem and Soulogram.

Credential presentation is consequential disclosure. It therefore follows the same governing control pattern as other protected wallet actions.

SERA may interpret a verifier request and explain the proposed disclosure. It may not independently disclose credential claims, generate an authorized proof or submit a presentation.

## 2. Governing Invariants

1. A verifier request is input, not authority.
2. Credential metadata may be exposed to SERA only at the minimum level needed to select a candidate.
3. Raw credentials and proof material remain outside model context.
4. Requested claims are normalized and disclosure is limited to the exact requested set.
5. A prepared presentation is not authorization to disclose.
6. Holder review and disclosure authorization are distinct evidence.
7. Trust Protocol and REV are enforced where the disclosure policy requires them.
8. Proof generation is bound to the exact normalized verifier request hash.
9. Presentation is bound to the same verifier, request hash, nonce/domain context and authorization evidence.
10. Soulogram remains the credential/proof implementation boundary; SSW-SERA does not rebuild credential cryptography.

## 3. Supported Runtime Boundary

RT-08 introduces:

- normalized credential presentation requests;
- credential metadata descriptors;
- deterministic eligible-credential selection;
- exact disclosure-plan construction;
- claim-sensitivity classification;
- request hashing;
- review/authorization binding;
- Trust Protocol / REV binding;
- injected Soulogram proof-generation boundary;
- injected presentation-delivery boundary;
- verifier-specific presentation receipts.

Supported protocol classes are:

- OpenID4VP;
- controlled direct Soulogram presentation.

Supported proof/credential-format identifiers at this boundary include:

- W3C VC JWT;
- SD-JWT VC;
- JWT VP;
- Soulogram VP.

The adapter remains provider-neutral.

## 4. Runtime Sequence

```text
Verifier Request
  -> Normalize request
  -> Canonical verifier binding
  -> Candidate credential metadata lookup
  -> Exact claim-coverage test
  -> Disclosure minimization
  -> Sensitivity / risk classification
  -> Holder review
  -> Authorization
  -> Trust Protocol where required
  -> REV where required
  -> Soulogram proof generation
  -> Presentation delivery
  -> Receipt / SAEL evidence
```

No stage may collapse review into approval or preparation into disclosure.

## 5. Request Binding

The runtime computes a domain-separated SHA-256 hash over the normalized presentation request.

The binding includes:

- request ID;
- Holder DID;
- SERA Agent DID;
- canonical verifier identity;
- protocol;
- nonce;
- domain;
- purpose;
- requested claims;
- requested credential types;
- issue time;
- expiry.

Any mutation requires a new control evaluation.

## 6. Credential Selection

Only ACTIVE, unexpired credentials may be selected.

A candidate must satisfy the entire requested claim set.

If no credential satisfies the request, the runtime fails closed.

If more than one credential is equally eligible, the runtime returns ambiguity rather than silently choosing one.

A later product layer may present the alternatives to the holder for explicit selection.

## 7. Disclosure Plan

The disclosure plan records only:

- credential reference;
- credential type;
- verifier identity;
- exact disclosed claim names;
- sensitivity class;
- protocol/format;
- request hash;
- expiry;
- control requirements.

It does not contain raw credential values.

Every plan has `authorityEffect: NONE`.

## 8. Soulogram Boundary

Soulogram is injected through a controlled provider interface.

The provider receives the minimum proof-generation inputs required after authorization.

SERA does not receive:

- credential private keys;
- raw credential documents unless a separately authorized holder inspection path requires them;
- signing keys;
- wallet seed material;
- unrestricted proof-generation handles.

The runtime receives proof and presentation references, not secret key material.

## 9. OpenID4VP

OpenID4VP requests are normalized into the same request object before control evaluation.

Remote request objects, URLs, presentation definitions and verifier metadata remain untrusted transport inputs until normalized and validated by the live Soulogram/OpenID adapter.

RT-08 does not permit raw remote verifier content to become an execution instruction.

## 10. Security Failure States

The runtime fails closed on:

- expired request;
- future-dated request outside tolerance;
- invalid Holder DID / SERA Agent DID namespace;
- missing verifier identity;
- missing nonce or purpose;
- no requested claims;
- no eligible credential;
- ambiguous credential selection;
- requested claim not present;
- request-hash mismatch;
- Holder/SERA identity mismatch;
- verifier mismatch;
- expired review/authorization evidence;
- absent review or authorization;
- absent required Trust decision;
- absent required REV decision.

## 11. Evidence

Credential disclosure should emit SAEL evidence for:

- normalized request received;
- credential candidate selected;
- disclosure plan produced;
- holder review;
- authorization;
- Trust/REV decisions where required;
- proof generated;
- presentation submitted;
- presentation receipt or failure.

The evidence record should reference credential and proof identifiers, not duplicate sensitive claim values.

## 12. Live Integration Handoff

The existing Soul Super Wallet credential store and Soulogram/OpenID4VC implementation remain authoritative live systems.

A developer-owned live binding item will connect those systems behind the RT-08 interfaces. The controlled runtime should not be redesigned merely to fit provider-specific transport objects.

## 13. Next Runtime Artifact

**SSW-AI-SERA-RT-09: Soul ID Runtime & did:soul Holder Context Integration**
