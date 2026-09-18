# SSW-AI-ID-01: Counterparty Canonical Identity Resolution Profile

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Specification ID:** SSW-AI-ID-01  
**Status:** Controlled Security Specification  
**Date:** 2026-09-17  
**Applies to:** SSW-AI-SCH-01, SSW-AI-SCH-02, SSW-AI-TM-01, SSW-AI-ISC-01 through ISC-03, SSW-AI-CF-A02  
**Repository:** Kavithakanaparthi/SSW-SERA

## 1. Purpose

This specification defines how SERA resolves human-friendly counterparties into stable canonical identities for wallet actions, mandates, credential presentation and external requests.

The governing invariant is:

> Labels help the holder recognize a counterparty. Canonical identifiers determine who or what the system is actually acting with.

Aliases, contact names, social-profile names and merchant display names are never authoritative by themselves.

## 2. Scope

This profile covers:

- individuals;
- Holder DIDs;
- organization DIDs;
- SERA/agent DIDs where relevant;
- wallet addresses;
- merchant identities;
- service providers;
- contracts;
- credential verifiers;
- contacts and aliases;
- linked external profiles;
- provenance;
- confidence;
- ambiguity;
- canonical identity changes.

## 3. Counterparty Classes

Initial classes:

- PERSON
- ORGANIZATION
- MERCHANT
- WALLET_ADDRESS
- SMART_CONTRACT
- CREDENTIAL_VERIFIER
- SERVICE_PROVIDER
- AGENT
- UNKNOWN

## 4. Canonical Identity Types

Supported canonical identifiers may include:

- `did:soul:<holder>`
- organizational DID
- `did:soul:agent:<agent>`
- chain-qualified wallet address
- chain-qualified contract address
- merchant identifier
- verifier DID
- provider identifier

Every identifier must be typed and namespaced.

## 5. Human Labels

Examples:

- "Alex"
- "My accountant"
- "Coffee shop"
- "Payroll"
- "Treasury wallet"
- "Acme Inc."

These are display or search labels only.

A label must resolve to one or more canonical candidates before any consequential action proceeds.

## 6. Resolution Pipeline

```
Holder expression
  ↓
Alias / Contact Search
  ↓
Candidate Set
  ↓
Canonical Identifier Resolution
  ↓
Provenance + Confidence
  ↓
Ambiguity Check
  ↓
Holder Review if required
  ↓
Canonical Counterparty Binding
```

## 7. Candidate Object

Each candidate should include:

- candidate ID;
- display label;
- counterparty class;
- canonical identifiers;
- source/provenance;
- confidence;
- last-verified timestamp;
- relationship to holder;
- risk flags;
- verification status.

## 8. Canonical Resolution Record

The machine object is defined at:

`contracts/json-schema/ssw-counterparty-resolution.v1.schema.json`

It binds:

- original holder reference;
- candidate set;
- selected canonical identity;
- provenance;
- confidence;
- ambiguity result;
- verification status;
- holder confirmation where required;
- timestamps;
- integrity hash.

## 9. Chain-Qualified Wallet Identity

A wallet address must never be stored as an unqualified string for authority purposes.

Canonical wallet identity includes:

- chain namespace;
- chain ID;
- address;
- address normalization;
- optional asset context;
- provenance.

Example:

```
eip155:137:0x...
```

Display formatting may differ, but the normalized canonical value governs.

## 10. Contract Identity

Smart contracts require:

- chain;
- address;
- code/contract identifier where available;
- contract type;
- verified metadata source if used;
- current risk flags.

A contract display name cannot substitute for address identity.

## 11. DID Resolution

DID-based counterparties should resolve through the appropriate DID method.

The resolution result should preserve:

- DID;
- controller information;
- verification methods;
- service endpoints where relevant;
- resolution timestamp;
- resolution metadata.

A DID document change may invalidate cached assumptions.

## 12. Merchant Identity

Merchant resolution may combine:

- merchant ID;
- organization DID;
- payment endpoint;
- verified wallet address;
- provider account ID;
- contract address.

The merchant's legal/display name remains presentation metadata.

## 13. Credential Verifier Identity

Credential presentation requires canonical verifier binding.

The verifier record should include:

- verifier DID or equivalent identifier;
- organization identity;
- requested purpose;
- requested claims;
- endpoint;
- proof/audience binding.

A presentation approved for one verifier cannot be reused for another.

## 14. Contact and Alias Sources

Potential sources:

- holder-created alias;
- wallet contact book;
- Soul ID contact;
- verified organization directory;
- prior transaction history;
- imported contacts;
- external profile connector;
- merchant directory.

Each source must be tagged with provenance.

## 15. LinkedIn / External Profile Data

External profile data, including LinkedIn-derived information, may help disambiguate or enrich professional/business context.

It must not by itself become a payment-authority identifier.

External profile fields are contextual evidence, not canonical payment identity.

## 16. Alias Security

Alias changes are sensitive.

If "Alex" previously mapped to one canonical counterparty and now maps to another:

- raise change event;
- invalidate cached assumptions;
- require fresh resolution;
- require holder review for consequential actions.

Alias updates must never silently rewrite mandate scope.

## 17. Mandate Binding

Mandates bind to canonical counterparty identifiers, not aliases.

Example:

Invalid:

```
counterparty = "Payroll"
```

Valid:

```
counterparty = did:soul:organization:example
```

or a chain-qualified address where no DID exists.

## 18. Ambiguity

Resolution statuses:

- UNIQUE
- MULTIPLE_CANDIDATES
- LOW_CONFIDENCE
- UNRESOLVED
- CONFLICTING_IDENTIFIERS

Only UNIQUE with sufficient policy confidence may proceed without holder clarification.

## 19. Confidence

Confidence is advisory, not authority.

Suggested components:

- exact identifier match;
- holder alias match;
- contact match;
- prior verified transaction;
- DID verification;
- organization verification;
- recent holder confirmation;
- source freshness.

No model-generated confidence score can override deterministic ambiguity rules.

## 20. Holder Confirmation

Holder confirmation should display enough canonical detail to distinguish candidates.

Examples:

- name;
- organization;
- DID;
- shortened address;
- chain;
- relationship/source;
- prior transaction indicator.

For concealed-detail contexts, reveal rules from SCH-04 still apply.

## 21. Resolution Freshness

Resolution records should expire or be revalidated when:

- DID document changes;
- merchant endpoint changes;
- wallet address changes;
- alias changes;
- organization verification expires;
- counterparty risk changes;
- long time has elapsed.

## 22. Counterparty Change

Changing the canonical counterparty after approval or mandate evaluation is a material-term change.

It requires:

- new material terms hash;
- new approval where A2;
- new mandate evaluation where A3/A4;
- new Trust Protocol/REV decision where required.

## 23. Provenance

Every canonical identifier should state provenance.

Examples:

- HOLDER_ENTERED
- HOLDER_CONFIRMED
- SOUL_ID_DIRECTORY
- DID_RESOLUTION
- PRIOR_VERIFIED_TRANSACTION
- MERCHANT_DIRECTORY
- WALLETCONNECT_REQUEST
- CREDENTIAL_REQUEST
- EXTERNAL_PROFILE
- CONTRACT_REGISTRY

## 24. Verification Status

Canonical verification statuses:

- VERIFIED
- UNVERIFIED
- STALE
- CONFLICTED
- REVOKED
- UNKNOWN

Verification does not imply trust or authority.

## 25. Risk Signals

Counterparty resolution may emit risk signals such as:

- NEW_COUNTERPARTY
- ADDRESS_CHANGED
- VERIFIER_CHANGED
- CONTRACT_CHANGED
- IDENTITY_CONFLICT
- UNVERIFIED_MERCHANT
- SUSPICIOUS_ALIAS_CHANGE
- RECENTLY_CREATED_IDENTITY

These feed Risk Engine, not authority directly.

## 26. SERA Agent Counterparties

If an external SERA-like or AI agent is a counterparty, resolution should identify:

- agent DID;
- governing/operator DID;
- delegation/authority metadata where available.

Agent DID alone does not prove operator authority.

## 27. Holder DID / SERA DID Separation

For the local wallet:

- Holder DID identifies the owner;
- SERA Agent DID identifies the holder-bound agent;
- counterparty resolution must never confuse the two.

A SERA Agent DID may not replace the Holder DID for ownership-sensitive checks.

## 28. SAEL Evidence

SAEL should record:

- resolution request;
- original label/reference;
- candidate count;
- selected canonical identity;
- ambiguity status;
- provenance;
- holder confirmation where required;
- material changes.

Sensitive contact-book content should be minimized.

## 29. Error Codes

- COUNTERPARTY_UNRESOLVED
- COUNTERPARTY_AMBIGUOUS
- COUNTERPARTY_LOW_CONFIDENCE
- COUNTERPARTY_IDENTITY_CONFLICT
- COUNTERPARTY_STALE
- COUNTERPARTY_REVOKED
- COUNTERPARTY_CHAIN_MISMATCH
- COUNTERPARTY_ADDRESS_CHANGED
- COUNTERPARTY_VERIFIER_CHANGED
- COUNTERPARTY_CONFIRMATION_REQUIRED

## 30. Machine Schema

The canonical resolution schema is:

`contracts/json-schema/ssw-counterparty-resolution.v1.schema.json`

## 31. Threat Model Gap Closure

This specification closes the remaining schema-level work for:

**SG-09 Counterparty identity binding**

## 32. Conformance Tests

Minimum tests:

1. duplicate "Alex" candidates trigger ambiguity;
2. alias alone cannot satisfy mandate counterparty scope;
3. address change invalidates prior approval;
4. chain mismatch fails;
5. DID resolution change triggers revalidation;
6. stale merchant record cannot silently execute;
7. external profile name cannot become payment identity;
8. verifier identity change invalidates credential approval;
9. SERA Agent DID is not confused with governing Holder DID;
10. prior transaction history improves context but does not override explicit conflict.

## 33. Exit Criteria

ID-01 advances when:

- canonical resolver service exists;
- chain-qualified addresses are enforced;
- DID resolution is integrated;
- alias changes are evidenced;
- ambiguity blocking works;
- mandates bind canonical identifiers;
- SAEL records resolution evidence.

## 34. Controlled Statement

SERA may understand "Alex."

The control plane must know exactly which Alex.
