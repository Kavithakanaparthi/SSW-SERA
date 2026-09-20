# SSW-AI-SERA-RT-07: External Intelligence & Risk Context Adapters

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-SERA-RT-07  
**Status:** Controlled Runtime Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-SERA-RT-06

## 1. Purpose

RT-07 creates controlled adapter boundaries for the existing Soul Super Wallet news integrations, LinkedIn/professional-context integrations and spam/asset-risk signals.

The governing rules are:

> External intelligence is advisory context, not authority.

> A professional profile is not cryptographic identity proof.

> An asset-risk signal may increase caution or block interaction under policy, but it does not authorize disposal, transfer or execution.

## 2. Common External Context Record

All adapter outputs normalize to a common machine record with:

- source identity and class;
- source confidence;
- veracity state;
- subject;
- category;
- freshness;
- normalized data;
- content role;
- explicit non-authority fields.

Every record carries:

- `identity_authority: false`;
- `authority_effect: "NONE"`.

## 3. Untrusted External Text

News and professional-context text is represented as:

`content_role: "UNTRUSTED_EXTERNAL_TEXT"`

Transport hygiene removes HTML markup, control characters, excessive whitespace and oversized payloads.

This sanitation does not make external text trusted.

Prompt-injection resistance remains a model/context policy obligation. External text is data, never an instruction channel.

## 4. News Adapter

The news adapter may expose normalized:

- headline;
- short excerpt;
- entity references;
- source/provenance reference;
- publication timestamp;
- confidence/veracity.

It does not expose arbitrary provider payloads to the model.

## 5. Professional Context Adapter

Professional-context records may expose normalized:

- display name;
- organization;
- role;
- entity references;
- source/profile reference.

Even when a platform reports a profile as verified, the SSW-SERA record remains:

`identity_authority: false`

Canonical counterparty and identity resolution continue through Soul ID / DID / credential mechanisms.

## 6. Asset Risk Adapter

Spam/token-risk adapters normalize to structured risk states:

- KNOWN_SAFE;
- LOW_RISK;
- UNKNOWN;
- SUSPICIOUS;
- HIGH_RISK;
- KNOWN_MALICIOUS.

Risk context may feed:

- Context Broker;
- SERA explanation;
- Risk Engine;
- Trust Protocol / REV inputs where explicitly mapped.

It cannot directly transfer, burn, hide permanently or execute against an asset.

## 7. Context Broker Integration

RT-07 implements ContextSource adapters for:

- news context;
- professional context;
- asset-risk context.

The Context Broker remains responsible for:

- capability allowlists;
- purpose;
- minimization;
- field selection;
- cloud transmission policy;
- retention.

## 8. Live Provider Binding

Current SSW provider integrations remain outside this repository boundary.

Developers shall bind the existing news APIs, LinkedIn/professional APIs and spam/risk services behind the RT-07 interfaces.

This work is tracked as DEV-OPEN-007.

## 9. Next Runtime Artifact

**SSW-AI-SERA-RT-08: Credential Runtime & Soulogram Presentation Integration**
