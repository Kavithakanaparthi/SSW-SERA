# SSW-AI-MOB-02: Adaptive Workspace & Deterministic Fallback View Contract

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-MOB-02  
**Status:** Controlled Mobile Integration Baseline — IN PROGRESS  
**Date:** 2026-09-19  
**Parent:** SSW-AI-MOB-01  
**Normative Inputs:** SSW-SERA-DB03, SSW-SERA-DB16

## 1. Purpose

MOB-02 defines the shared mobile contract for generated adaptive workspaces and the deterministic wallet fallback tray.

It implements the product direction:

`Ambient SERA -> Conversational Shell -> Adaptive Workspace -> Inspectable Wallet State`

Generated workspaces improve coordination and comprehension. They do not become a second hidden wallet state.

## 2. Workspace Classes

The shared contract supports workspace classes including:

- asset;
- transaction review;
- credential disclosure;
- identity;
- intelligence;
- chain comparison;
- counterparty;
- boarding pass;
- QR presentation;
- WalletConnect;
- policy / REV;
- activity evidence;
- settings;
- security.

Native iOS and Android presentation may differ while consuming the same semantic contract.

## 3. Canonical Source Binding

Every workspace must reference the sources from which it was constructed.

Source classes include:

- authoritative wallet state;
- credential;
- Action Contract;
- Route Decision;
- SAEL;
- external context;
- policy decision;
- Trust decision;
- REV decision.

Consequential workspaces require at least one authoritative source.

External information is always distinguishable from authoritative wallet state.

## 4. No Hidden Authority

Workspace actions are restricted to:

- READ;
- PREPARE;
- NAVIGATE.

A workspace cannot directly perform an AUTHORIZE effect.

Authorization remains in the controlled approval/authentication path.

A transaction card may display an approval affordance, but the workspace contract itself may only route into the deterministic authorization flow.

## 5. Inspectability

Every workspace supports:

- Show underlying state;
- navigate to its canonical wallet surface;
- inspect source references;
- inspect authoritative versus external provenance.

This implements DB03's universal "Show me" requirement.

## 6. Dynamic Surface Expiry

Time-sensitive workspaces may carry an expiry.

An expired route comparison, transaction review or other transient workspace fails closed rather than presenting stale material as current.

A fresh workspace must be generated from current authoritative state.

## 7. Deterministic Fallback Tray

MOB-02 defines canonical fallback surfaces:

- Assets;
- Send;
- Receive;
- Swap;
- Credentials;
- Activity;
- Security;
- Identity;
- WalletConnect;
- Settings.

These are control and inspectability surfaces, not the primary AI-first navigation model.

## 8. Fallback Safety

Manual deterministic access is capability-aware.

Examples:

- signer outage disables manual Send/Swap execution paths while preserving Assets, Activity, Security and Identity;
- credential subsystem outage disables Credentials without disabling wallet recovery/safety;
- SERA failure does not remove fallback surfaces;
- Security and Identity are critical fallback surfaces.

## 9. Security Invariants

1. A generated workspace is presentation state, not canonical wallet state.
2. A workspace cannot grant authority.
3. Consequential workspaces require authoritative source references.
4. External context cannot masquerade as wallet truth.
5. Expired dynamic surfaces cannot remain actionable.
6. PREPARE actions remain review-required.
7. Every workspace maps back to a deterministic canonical wallet surface.
8. Security and Identity fallback remain independently reachable.
9. Native UI implementations may not widen workspace effects.
10. "Show me" remains universally supportable through inspectability references.

## 10. Next

After MOB-02 closure, the next mobile artifact should bind text/voice interaction and concealed-detail presentation to these shell/workspace contracts before platform-native surface expansion.
