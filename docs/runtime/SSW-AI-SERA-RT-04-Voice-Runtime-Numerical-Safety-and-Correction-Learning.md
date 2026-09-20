# SSW-AI-SERA-RT-04: Voice Runtime, Numerical Safety & Correction Learning

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-SERA-RT-04  
**Status:** Controlled Runtime Baseline  
**Date:** 2026-09-19  
**Parent:** SSW-AI-SERA-RT-03

## 1. Purpose

RT-04 implements the deterministic safety layer between speech interpretation and the SERA intent/action pipeline.

The governing rule is:

> Voice may propose an interpretation. Voice uncertainty must never become execution authority.

## 2. Provider Neutrality

This artifact does not select Apple, Android, Whisper, or another speech-recognition provider.

Speech providers produce candidate transcripts and confidence signals.

The shared SSW-SERA runtime evaluates those signals deterministically.

## 3. Voice Risk Classes

- V0 conversational / public
- V1 wallet read
- V2 sensitive read / credential lookup
- V3 prepare-only action
- V4 transactional / disclosure action
- V5 mandate / standing-authority creation

## 4. Protected Signals

The Voice Confidence Envelope includes:

- acoustic confidence;
- transcript confidence;
- intent confidence;
- entity confidence;
- numeric confidence;
- negation confidence;
- context confidence;
- optional holder-adaptation confidence;
- environmental confidence.

## 5. Fail-Safe Rules

The runtime returns one of:

- CONTINUE;
- CLARIFY;
- STOP;
- REQUIRE_INDEPENDENT_AUTHORIZATION.

Hard stop/clarification conditions include:

- uncertain negation;
- materially ambiguous protected numeric values;
- materially ambiguous recipient/entity;
- insufficient confidence for the risk class;
- missing protected-field confidence for a consequential command.

## 6. Numeric Safety

Protected numeric fields include:

- amount;
- quantity;
- decimal placement;
- percentage;
- threshold;
- limit;
- date/time;
- recurrence;
- expiry;
- slippage;
- exchange rate.

If more than one materially different numeric candidate remains plausible, the runtime returns CLARIFY.

It does not choose the most likely amount on behalf of the holder.

## 7. Negation Safety

If negation confidence falls below the risk-class threshold, the command fails safe.

For V3 and above, ambiguity between “send” and “do not send” results in STOP, not CONTINUE.

## 8. Recipient Safety

Voice aliases and memory may propose recipient candidates.

A consequential voice command must still resolve the final counterparty through the canonical Counterparty Resolver.

Voice confidence never replaces counterparty resolution.

## 9. Independent Authorization

V4 and V5 commands may proceed past voice interpretation only as:

REQUIRE_INDEPENDENT_AUTHORIZATION

This means voice interpretation is sufficient to prepare the next deterministic authorization step.

It does not mean the command is authorized.

## 10. Correction Learning

RT-04 exposes typed correction classes:

- PRONUNCIATION;
- VOCABULARY;
- ENTITY_ALIAS;
- LANGUAGE_PREFERENCE;
- NUMERIC_CONFUSION.

Confirmed corrections may update SERA memory.

Correction routing:

- PRONUNCIATION / VOCABULARY / LANGUAGE_PREFERENCE / NUMERIC_CONFUSION -> M2 LANGUAGE_VOICE
- ENTITY_ALIAS -> M3 ENTITY_ALIAS

Corrections always use HOLDER_CORRECTION provenance.

A correction does not create a mandate, policy rule or transaction authority.

## 11. Raw Audio

RT-04 does not persist raw audio.

Any future raw-audio retention must be separately justified and controlled.

## 12. Acceptance

RT-04 is complete when:

- Voice Confidence Envelope schema exists;
- deterministic safety evaluator exists;
- numeric ambiguity fails safe;
- negation ambiguity fails safe;
- recipient ambiguity fails safe;
- V4/V5 require independent authorization;
- correction routing writes only permitted M2/M3 memory;
- tests and strict TypeScript pass.

## 13. Next Runtime Artifact

**SSW-AI-SERA-RT-05: Proactive Intelligence, Monitoring & Notification Runtime**
