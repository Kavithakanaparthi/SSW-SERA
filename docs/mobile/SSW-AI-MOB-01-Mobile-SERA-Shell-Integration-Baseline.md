# SSW-AI-MOB-01: Mobile SERA Shell Integration Baseline, Feature Flags & Deterministic Fallback

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-MOB-01  
**Status:** Controlled Mobile Integration Baseline — IN PROGRESS  
**Date:** 2026-09-19  
**Parent:** SSW-AI-SERA-RT-10  
**Normative Input:** SSW-SERA-DB16

## 1. Purpose

MOB-01 begins Phase F mobile product integration.

It establishes one shared shell-decision contract for iOS and Android before native presentation layers diverge.

The governing migration rule remains:

> Preserve capability, change orchestration.

The SERA-first experience may become the preferred coordinator, but it may not make the underlying deterministic wallet, recovery or security controls inaccessible.

## 2. Migration Stages

The mobile shell baseline implements DB16 stages:

- M0: baseline / conventional wallet;
- M1: SERA as additive assistant;
- M2: SERA as primary coordinator for selected preparation flows;
- M3: SERA-first default only behind the explicit primary-home flag and fallback gates;
- M4: controlled delegation behind separate feature flags.

M5 wearables remains Phase 2.

## 3. Shared iOS / Android Contract

Both platforms use the same deterministic decision inputs:

- platform;
- app version;
- migration stage;
- feature flags;
- SERA availability;
- wallet-core availability;
- control-plane availability;
- signer availability;
- recovery availability;
- security-control availability.

The result determines:

- shell mode;
- default home;
- allowed SERA capabilities;
- blocked capabilities;
- fallback state;
- deterministic reason codes.

Platform-specific UI may render the decision differently but may not widen it.

## 4. Deterministic Fallback

MOB-01 machine-enforces:

- conventional wallet remains accessible;
- deterministic fallback remains available;
- SERA outage returns to conventional wallet;
- wallet-core unavailability cannot be hidden behind SERA;
- control-plane outage degrades consequential SERA operations;
- signer outage blocks delegated/autonomous execution;
- SERA-first home requires recovery and security controls to remain accessible.

The shell must never become a single point of failure for wallet access.

## 5. Feature Flags

MOB-01 recognizes the DB16 flags including:

- sera_primary_home;
- sera_voice;
- sera_send_prepare;
- sera_swap_prepare;
- sera_chain_recommendation;
- sera_credential_prepare;
- sera_proactive_alerts;
- external context flags;
- delegated_payments;
- conditional_automation;
- autonomous_execution;
- wearable flags.

Flags enable capability availability only. They do not grant authority.

## 6. Capability Progression

M1 permits additive read/explain experiences.

M2 permits only explicitly flagged preparation and recommendation capabilities.

M3 may make SERA the default shell, but only when deterministic fallback, security controls and recovery remain reachable.

M4 may expose delegated functions only behind independent flags and existing mandate/control-plane gates.

## 7. Safety Invariants

1. Conventional wallet access survives every SERA migration stage.
2. Recovery remains a deterministic wallet capability.
3. Security controls remain independently reachable.
4. A feature flag cannot bypass the control plane.
5. A feature flag cannot create signing authority.
6. SERA outage does not trap the holder.
7. Control-plane outage removes consequential SERA operations rather than simulating success.
8. Signing outage prevents execution while retaining safe read-only use.
9. iOS and Android share authority semantics.
10. Platform UI differences cannot widen capability.

## 8. Scope Boundary

MOB-01 is not yet a React Native, SwiftUI or Jetpack Compose implementation.

It is the shared mobile integration policy/runtime baseline that those platform surfaces must consume.

This prevents native UI work from independently redefining migration, fallback or authority behavior.

## 9. Next

After MOB-01 closure, Phase F may proceed into the concrete iOS/Android SERA shell surface and adaptive workspace integration using this shared contract.
