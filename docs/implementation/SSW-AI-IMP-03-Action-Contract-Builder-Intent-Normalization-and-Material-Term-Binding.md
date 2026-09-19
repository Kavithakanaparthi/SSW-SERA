# SSW-AI-IMP-03: Action Contract Builder, Intent Normalization & Material-Term Binding

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-IMP-03  
**Status:** Controlled Implementation Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-IMP-02  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

IMP-03 creates the first deterministic construction path from holder intent into a validated Action Contract.

The governing rule is:

> Intent may be uncertain. Material terms may not be.

The builder therefore preserves ambiguity instead of guessing. A materially ambiguous intent does not produce an executable Action Contract.

## 2. First Supported Action Family

The first implemented action family is:

`payment.send`

This is deliberate. The implementation pattern will be proven against one consequential action before being generalized to swaps, credential presentations, WalletConnect, security controls and other action families.

## 3. Object Progression

```
Intent Envelope
   ↓
Resolved Intent
   ↓
Material ambiguity gate
   ↓
Payment material terms
   ↓
Material-terms binding hash
   ↓
Action Contract v1
   ↓
IMP-02 schema + semantic validation
```

## 4. Intent Envelope

The Intent Envelope captures a holder request before material entities are resolved.

It is explicitly non-executable.

It records:

- holder, SERA, runtime and device identity;
- modality and channel;
- interpreted intent type;
- confidence;
- material ambiguity indicators;
- source reference without embedding unrestricted raw sensitive content.

## 5. Resolved Intent

The Resolved Intent contains typed entity resolution results and provenance.

For `payment.send`, material fields are:

- asset;
- amount;
- counterparty;
- chain.

Every material entity carries a resolution basis:

- EXPLICIT
- RESOLVED
- DEFAULTED_BY_POLICY

`INFERRED_NON_MATERIAL` is allowed only for non-material context and cannot satisfy a required payment term.

## 6. Ambiguity Gate

The builder returns:

```ts
{ status: "BLOCKED_AMBIGUITY", reasonCodes: [...] }
```

and no Action Contract when any required material field is unresolved or when the resolved intent declares material ambiguity.

Initial reason codes:

- AMBIGUOUS_RECIPIENT
- AMBIGUOUS_AMOUNT
- AMBIGUOUS_ASSET
- AMBIGUOUS_CHAIN

A model confidence score never overrides this gate.

## 7. Payment Material Terms

The builder normalizes payment terms into:

```json
{
  "asset": {
    "asset_id": "USDC",
    "decimals": 6
  },
  "amount": {
    "atomic": "5000000",
    "decimals": 6
  },
  "counterparty": {
    "canonical_id": "did:soul:merchant-example",
    "resolution_source": "COUNTERPARTY_RESOLUTION"
  },
  "network": {
    "chain_id": "eip155:137"
  }
}
```

No floating financial values are used.

## 8. Material-Term Binding

IMP-03 adds a deterministic JSON canonicalization profile for implementation-stage hashing.

The hash input is domain separated:

```
SSW:MATERIAL_TERMS:V1
+
canonical_json({
  action_type,
  material_terms
})
```

The resulting SHA-256 is used as the first material-term binding value.

This implementation is sufficient for internal contract binding and conformance tests. The final production canonicalization profile remains governed by ISC-02 and must undergo the production cryptographic profile review before signing is enabled.

## 9. Builder Defaults

A newly built `payment.send` Action Contract starts conservatively:

- authority: A2;
- approval required: true;
- risk: R3;
- device eligibility: false until evaluated;
- runtime eligibility: false until evaluated;
- Trust Protocol required: true;
- REV required: true;
- Trust/REV references: null;
- approval status: REQUIRED;
- execution status: NOT_READY.

The builder cannot mark an action approved, trusted, REV-passed or ready to sign.

## 10. Immutability

Builder inputs are copied into a new object.

The builder does not mutate the Resolved Intent.

Material terms are deep-frozen before being returned.

Later material change requires a new Action Contract version and new binding hash.

## 11. Validation

The produced Action Contract is passed through the IMP-02 validator before being returned.

The builder therefore cannot emit a structurally invalid or Holder/SERA identity-confused contract.

## 12. Binding Metadata

The builder returns the Action Contract alongside:

- material terms hash;
- canonical material representation;
- source Resolved Intent ID;
- source correlation ID.

The current Action Contract JSON Schema does not yet add a dedicated terms-hash field. The hash remains builder/control-plane metadata until the schema version is formally extended or the approval/signing object stores it.

## 13. Tests

IMP-03 proves:

1. valid payment intent builds an Action Contract;
2. unresolved recipient blocks construction;
3. material ambiguity flag blocks construction;
4. amount mutation changes terms hash;
5. property insertion order does not change terms hash;
6. builder defaults remain NOT_READY and approval REQUIRED;
7. Holder DID / SERA DID validation still applies;
8. Intent Envelope and Resolved Intent validate independently.

## 14. Security Boundary

IMP-03 does not:

- authenticate the holder;
- approve the action;
- validate a mandate;
- call Trust Protocol;
- call REV;
- sign;
- broadcast;
- write production SAEL events.

It only constructs the deterministic object that later controls may evaluate.

## 15. Next Controlled Artifact

**SSW-AI-IMP-04: Authority, Risk & Policy Evaluation Baseline**

IMP-04 should consume the validated Action Contract and establish deterministic authority-class verification, preliminary risk evaluation and policy-decision objects without yet enabling signing.
