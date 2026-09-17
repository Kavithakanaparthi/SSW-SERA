# SSW-SERA-DB07
## SERA Intent, Capability, Tool & Execution Contract Design

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Document ID:** SSW-SERA-DB07  
**Status:** Drawing Board / Controlled Design Baseline  
**Repository:** Kavithakanaparthi/SSW-SERA  
**Purpose:** Define the machine-readable contract that connects natural-language or multimodal holder intent to wallet capabilities, tools, permissions, policy, risk, runtime authorization, execution, and evidence.

---

## 1. Why this contract exists

The AI-first wallet must not allow a language model to move directly from interpreted speech or text into privileged wallet execution. SERA may understand, plan, compare, recommend and prepare, but every consequential action must cross a deterministic contract boundary.

The canonical execution chain is:

```text
INPUT
  ↓
INTENT
  ↓
CAPABILITY
  ↓
TOOL
  ↓
PERMISSION / DELEGATION
  ↓
CONTEXT + RISK
  ↓
TRUST PROTOCOL
  ↓
REV
  ↓
AUTHENTICATION / SIGNING
  ↓
EXECUTION
  ↓
EVIDENCE / RECEIPT
```

No model output may bypass this sequence for a privileged action.

---

## 2. Contract principles

1. **Models propose; deterministic systems authorize.**
2. **Intent is not authority.**
3. **Capability selection is explicit and typed.**
4. **Every executable capability maps to one or more registered tools.**
5. **Tools operate under explicit permission scopes.**
6. **Risk is computed before execution, not after.**
7. **REV remains the runtime pass/fail gate for protected operations.**
8. **Signing occurs outside the model context.**
9. **Every consequential action produces inspectable evidence.**
10. **Cross-device execution inherits only device-scoped authority.**
11. **Ambiguity blocks irreversible execution.**
12. **The holder can inspect what SERA understood before committing where risk warrants it.**

---

## 3. Intent taxonomy

SERA intents are normalized into a controlled vocabulary.

### 3.1 Read intents

- `ASK`
- `SHOW`
- `FIND`
- `SUMMARIZE`
- `EXPLAIN`
- `COMPARE`
- `CHECK_STATUS`

### 3.2 Preparation intents

- `PREPARE_TRANSFER`
- `PREPARE_SWAP`
- `PREPARE_PROOF`
- `PREPARE_CONNECTION`
- `PREPARE_DELEGATION`
- `PREPARE_AUTOMATION`

### 3.3 Execution intents

- `SEND`
- `RECEIVE`
- `SWAP`
- `SIGN`
- `PRESENT_CREDENTIAL`
- `CONNECT`
- `APPROVE`
- `REJECT`
- `LOCK`
- `UNLOCK`
- `REVOKE`

### 3.4 Ongoing-agent intents

- `MONITOR`
- `REMIND`
- `WATCH_CONDITION`
- `DELEGATE`
- `AUTOMATE`
- `REBAlANCE` *(canonical implementation spelling should be normalized to `REBALANCE`)*
- `CANCEL_AUTOMATION`

### 3.5 Recovery and safety intents

- `REPORT_DEVICE_LOST`
- `FREEZE_WALLET`
- `ROTATE_KEYS`
- `RECOVER_ACCESS`
- `REVOKE_DEVICE`
- `REVOKE_AGENT_AUTHORITY`

---

## 4. Intent object

Every parsed holder request should become a deterministic `IntentEnvelope`.

```json
{
  "intent_id": "uuid",
  "intent_type": "SEND",
  "source_modality": "voice",
  "holder_id": "did:soul:...",
  "device_id": "device:...",
  "session_id": "session:...",
  "utterance_ref": "local-or-redacted-ref",
  "entities": {
    "asset": "USDC",
    "amount": "500",
    "recipient": "contact:Jane",
    "chain": null
  },
  "confidence": {
    "intent": 0.98,
    "numeric": 0.99,
    "recipient": 0.91,
    "chain": 0.00
  },
  "ambiguities": ["chain"],
  "requested_at": "iso8601"
}
```

The intent envelope must preserve uncertainties rather than silently filling them.

---

## 5. Capability registry

An intent does not call arbitrary code. It resolves to a registered capability.

Example capability families:

### Identity and credentials

- `identity.get_profile`
- `credential.list`
- `credential.inspect`
- `credential.prepare_proof`
- `credential.present`
- `credential.verify`

### Assets and balances

- `asset.list`
- `asset.get_balance`
- `asset.get_value`
- `asset.get_chain_distribution`

### Transactions

- `tx.prepare_send`
- `tx.prepare_receive`
- `tx.prepare_swap`
- `tx.estimate_fee`
- `tx.simulate`
- `tx.submit`
- `tx.get_status`

### Multi-chain routing

- `route.discover`
- `route.compare`
- `route.select`
- `route.prepare`

### Wallet security

- `wallet.lock`
- `wallet.unlock`
- `wallet.freeze`
- `wallet.revoke_device`

### Intelligence

- `intel.get_news`
- `intel.get_asset_context`
- `intel.get_entity_context`
- `intel.get_risk_context`

### Agent delegation

- `agent.create_mandate`
- `agent.inspect_mandate`
- `agent.revoke_mandate`
- `agent.execute_under_mandate`

### Wearables / cross-device

- `device.get_scope`
- `device.request_handoff`
- `device.present_low_risk_credential`
- `device.approve_scoped_action`

---

## 6. Capability descriptor

Each capability must be defined by a typed descriptor.

```json
{
  "capability_id": "tx.prepare_send",
  "version": "1.0",
  "risk_class": "R2",
  "execution_class": "PREPARE_ONLY",
  "required_inputs": ["asset", "amount", "recipient"],
  "optional_inputs": ["chain"],
  "allowed_devices": ["phone"],
  "requires_rev": false,
  "requires_authentication": false,
  "produces": ["transaction_draft", "fee_estimate", "route_options"],
  "tool_binding": ["wallet.tx.prepare_send.v1"]
}
```

Execution-capable descriptors carry stricter controls.

```json
{
  "capability_id": "tx.submit",
  "version": "1.0",
  "risk_class": "R4",
  "execution_class": "IRREVERSIBLE",
  "required_inputs": ["signed_transaction"],
  "allowed_devices": ["phone"],
  "requires_rev": true,
  "requires_authentication": true,
  "requires_signing": true,
  "tool_binding": ["wallet.tx.submit.v1"]
}
```

---

## 7. Tool registry

Tools are deterministic execution adapters registered with metadata.

Each tool must declare:

- tool ID
- version
- capability IDs it serves
- input schema
- output schema
- side effects
- data sensitivity
- supported chains / credential formats / providers
- timeout and retry policy
- idempotency semantics
- authorization requirements
- evidence generated
- failure codes
- rollback semantics where possible

Example:

```json
{
  "tool_id": "wallet.tx.prepare_send.v1",
  "capabilities": ["tx.prepare_send"],
  "side_effect": "none",
  "idempotent": true,
  "sensitivity": "financial",
  "network_access": true,
  "requires_signing": false,
  "evidence_type": "transaction_draft"
}
```

The model never receives arbitrary direct access to private-key or signing tools.

---

## 8. Permission and authority contract

Every protected capability evaluates holder and agent authority separately.

### 8.1 Authority dimensions

- holder identity
- authenticated session
- SVID4AI identity
- delegated scope
- capability scope
- asset scope
- chain scope
- recipient scope
- value limit
- time window
- device scope
- context restrictions
- revocation state

### 8.2 Mandate example

```json
{
  "mandate_id": "mandate:uuid",
  "principal": "did:soul:holder",
  "agent": "did:soul:agent:sera",
  "capability": "tx.submit",
  "constraints": {
    "recipient": "merchant:AWS",
    "asset": ["USDC"],
    "max_amount": "500",
    "frequency": "monthly",
    "expires_at": "2027-09-17T00:00:00Z",
    "device_scope": ["cloud-agent-runtime"],
    "require_rev": true
  }
}
```

The mandate does not expose keys. It expresses bounded authority.

---

## 9. Device-scoped authority

Authority must not automatically propagate between phone, watch, browser, cloud agent runtime, or future wearables.

Example device classes:

- `PRIMARY_PHONE`
- `SECONDARY_PHONE`
- `APPLE_WATCH`
- `WEAR_OS_WATCH`
- `WEB_SESSION`
- `DESKTOP_SESSION`
- `CLOUD_AGENT_RUNTIME`

Each device receives a capability scope.

Example watch scope:

```json
{
  "device_class": "APPLE_WATCH",
  "allowed": [
    "asset.get_balance",
    "credential.present.low_risk",
    "tx.approve.low_value",
    "wallet.freeze"
  ],
  "denied": [
    "key.export",
    "tx.submit.high_value",
    "agent.create_unbounded_mandate"
  ]
}
```

A paired watch is not equivalent to the primary wallet.

---

## 10. Context contract

SERA may enrich intent using approved context but must distinguish facts, inferred context and external intelligence.

### Context classes

- holder preferences
- recent transaction state
- contact aliases
- chain balances
- gas / fee data
- spam-token signals
- credential metadata
- news context
- LinkedIn-derived professional context where permitted
- device posture
- network state
- location only when explicitly authorized and relevant

Each context item should include provenance.

```json
{
  "context_id": "ctx:uuid",
  "type": "chain_fee",
  "source": "provider:gas-oracle",
  "freshness": "2026-09-17T18:20:00Z",
  "confidence": 0.97,
  "sensitivity": "public",
  "eligible_for_model": true
}
```

---

## 11. Risk contract

Risk is computed per action, not merely per feature.

### R0: informational

Examples: balance lookup, public news summary.

### R1: low sensitivity

Examples: show a credential, list recent transactions.

### R2: preparatory financial or identity action

Examples: prepare transfer, prepare credential proof.

### R3: consequential but reversible / bounded

Examples: create low-value automation, approve low-risk proof.

### R4: high-consequence / irreversible

Examples: submit transfer, reveal sensitive credential claims, high-value swap.

### R5: critical authority / recovery

Examples: key rotation, wallet recovery, high-value mandate creation, disabling protections.

Risk may be elevated by:

- low speech confidence
- new recipient
- anomalous value
- suspicious token
- high network risk
- external service mismatch
- degraded device security
- wearable-originated command
- cross-device handoff
- stale data
- model/tool disagreement
- unusual timing

---

## 12. Ambiguity contract

Ambiguity must be represented explicitly.

Examples:

- recipient ambiguity
- amount ambiguity
- chain ambiguity
- asset ambiguity
- credential ambiguity
- delegation-scope ambiguity

Policy:

```text
R0–R1 + low ambiguity
→ may continue

R2 + resolvable ambiguity
→ may ask one clarification or present options

R3–R5 + material ambiguity
→ MUST stop execution until resolved
```

For financial values and recipients, SERA must never guess.

---

## 13. Multi-chain contract

A multi-chain action separates intent from route selection.

Example holder request:

> Send Jane $500 USDC.

Intent:

```text
asset = USDC
amount = 500
recipient = Jane
chain = unspecified
```

Routing subsystem evaluates:

- holder balances by chain
- recipient compatibility
- fee
- settlement time
- chain availability
- bridge requirement
- policy restrictions
- route risk
- prior holder preference

SERA may recommend a route, but route selection and transaction preparation remain inspectable.

Example execution draft:

```json
{
  "recommended_chain": "Polygon",
  "alternatives": ["Ethereum"],
  "basis": {
    "lower_fee": true,
    "recipient_previous_use": true,
    "bridge_required": false
  }
}
```

---

## 14. REV execution gate

Protected execution requests are transformed into a `RuntimeAuthorizationRequest`.

```json
{
  "request_id": "revreq:uuid",
  "holder": "did:soul:holder",
  "agent": "did:soul:agent:sera",
  "device": "device:primary-phone",
  "capability": "tx.submit",
  "risk": "R4",
  "authority_ref": "mandate-or-session-ref",
  "transaction_digest": "hash",
  "context_digest": "hash",
  "policy_version": "...",
  "requested_at": "iso8601"
}
```

REV returns deterministic output:

```json
{
  "decision": "PASS",
  "reason_codes": ["AUTHORITY_VALID", "POLICY_SATISFIED"],
  "expires_at": "iso8601",
  "evidence_ref": "rev:evidence:uuid"
}
```

Possible outcomes:

- `PASS`
- `FAIL`
- `REQUIRE_STEP_UP`
- `REQUIRE_HOLDER_CONFIRMATION`
- `REQUIRE_DEVICE_HANDOFF`

---

## 15. Authentication and signing boundary

After REV approval, a signing request is constructed outside the model context.

The model must not receive:

- seed phrase
- raw private key
- raw signing secret
- biometric template
- secure enclave secret

The signing service receives only the minimum deterministic payload required.

```text
REV PASS
   ↓
Authentication
   ↓
Transaction digest
   ↓
Secure signing boundary
   ↓
Signed payload
```

SERA may narrate the result but cannot fabricate a signature.

---

## 16. Evidence contract

Every consequential operation produces an evidence envelope.

```json
{
  "evidence_id": "evidence:uuid",
  "intent_id": "uuid",
  "capability": "tx.submit",
  "tool": "wallet.tx.submit.v1",
  "holder": "did:soul:holder",
  "agent": "did:soul:agent:sera",
  "device": "device:primary-phone",
  "rev_decision_ref": "rev:evidence:uuid",
  "authorization_method": "biometric",
  "execution_result": "submitted",
  "network": "Polygon",
  "transaction_hash": "0x...",
  "timestamp": "iso8601"
}
```

The holder should be able to inspect this through natural language or conventional UI.

---

## 17. Failure contract

Failures should use controlled categories.

- `INTENT_UNRESOLVED`
- `AMBIGUOUS_ENTITY`
- `MISSING_REQUIRED_INPUT`
- `CAPABILITY_NOT_AVAILABLE`
- `TOOL_UNAVAILABLE`
- `DEVICE_NOT_AUTHORIZED`
- `AUTHORITY_EXPIRED`
- `AUTHORITY_REVOKED`
- `REV_FAILED`
- `STEP_UP_REQUIRED`
- `SIGNING_FAILED`
- `CHAIN_UNAVAILABLE`
- `INSUFFICIENT_BALANCE`
- `INSUFFICIENT_GAS`
- `SPAM_OR_RISK_BLOCK`
- `EXTERNAL_PROVIDER_ERROR`
- `NETWORK_OFFLINE`
- `EVIDENCE_WRITE_FAILED`

SERA translates these into human language without hiding the machine reason code.

---

## 18. Cross-device handoff contract

A task can begin on one device and continue on another.

Example:

```text
Watch voice request
   ↓
Intent created
   ↓
Watch scope allows prepare but not high-value signing
   ↓
Handoff request created
   ↓
Primary phone receives execution draft
   ↓
Holder authenticates
   ↓
REV
   ↓
Sign / execute
   ↓
Receipt synchronized to watch
```

The handoff object must preserve:

- original intent
- originating device
- context snapshot
- risk class
- unresolved fields
- expiry
- holder-visible summary

---

## 19. Voice-specific execution contract

Voice commands pass through the Holder Voice Adaptation Layer before the IntentEnvelope is accepted.

Required voice metadata for consequential actions:

- transcript confidence
- numeric confidence
- recipient confidence
- speaker confidence when enabled
- language / locale
- noise score
- correction state

Example policy:

```text
"Send fifteen thousand dollars to Acme"

numeric confidence = 0.93
risk = R4

→ no silent execution
→ display / speak back normalized amount
→ require explicit confirmation
→ continue only after confirmation
```

Voice recognition is a source of intent, not proof of transaction authorization.

---

## 20. Spam-token and malicious-asset contract

Existing spam-token filters become a formal context and policy input.

Possible outputs:

- `KNOWN_SAFE`
- `UNKNOWN`
- `SUSPICIOUS`
- `KNOWN_SPAM`
- `BLOCKED`

For `KNOWN_SPAM` or `BLOCKED`:

- SERA must not recommend interaction;
- transaction tools must not execute by default;
- any override requires elevated holder confirmation and policy allowance;
- the event becomes evidence.

---

## 21. External intelligence contract

News and LinkedIn-derived context may inform SERA but cannot directly authorize financial or identity execution.

Rules:

- external intelligence remains provenance-tagged;
- unverified content cannot become an authority input;
- news may influence recommendations, not signatures;
- LinkedIn context may assist entity disambiguation where permitted, but cannot establish cryptographic identity;
- prompt-injection or malicious external content must be treated as untrusted input.

---

## 22. Model/tool separation

The architecture should use a strict separation:

```text
MODEL PLANE
understand
reason
plan
explain
recommend

        ↓ typed request only

CONTROL PLANE
validate schema
resolve capability
check permission
compute risk
invoke Trust Protocol
invoke REV

        ↓ deterministic approval

EXECUTION PLANE
authenticate
sign
submit
write evidence
```

This separation remains mandatory whether inference occurs on-device, in Private Cloud Compute, through Gemini Nano/AICore, or in Soulverse-hosted runtime infrastructure.

---

## 23. Versioning

All contracts are versioned.

Required version domains:

- intent schema
- capability schema
- tool schema
- risk taxonomy
- authority schema
- REV request schema
- evidence schema

Execution evidence must record the exact versions used.

---

## 24. Observability

Operational telemetry should capture non-secret execution metadata:

- intent resolution success
- ambiguity rate
- capability selection accuracy
- tool failure rate
- REV pass/fail/step-up rate
- voice correction rate
- cross-device handoff success
- chain-route recommendation acceptance
- false-positive spam blocking
- average authorization latency

Telemetry must not expose private keys, raw credential payloads or raw voice recordings by default.

---

## 25. Acceptance criteria

DB07 should be considered ready to graduate into controlled architecture when:

1. Every supported SERA intent maps to at least one capability.
2. Every capability has a typed descriptor.
3. Every executable capability has registered tool bindings.
4. No model has direct access to signing keys.
5. All R3-R5 actions have explicit authority and REV requirements.
6. All material ambiguity blocks irreversible execution.
7. Cross-device execution respects device scope.
8. Voice confidence participates in risk escalation.
9. Multi-chain routing is inspectable and policy-bounded.
10. External intelligence cannot directly create authority.
11. All consequential actions generate evidence.
12. Schema versioning is defined.

---

## 26. Working architectural decisions

**DB07-D01** — SERA outputs typed IntentEnvelopes, not free-form execution commands.  
**DB07-D02** — Capabilities are registered and versioned.  
**DB07-D03** — Tools are deterministic adapters with declared side effects.  
**DB07-D04** — Intent and authority remain separate objects.  
**DB07-D05** — REV gates protected runtime execution.  
**DB07-D06** — Signing is isolated from the model plane.  
**DB07-D07** — Ambiguity blocks irreversible actions.  
**DB07-D08** — Device authority is explicit and scoped.  
**DB07-D09** — Wearable-originated actions may require phone handoff based on risk.  
**DB07-D10** — Voice is an intent channel, not an authorization substitute.  
**DB07-D11** — Multi-chain route selection is a separate deterministic capability.  
**DB07-D12** — Spam-token filtering contributes to policy and risk.  
**DB07-D13** — News and LinkedIn context remain advisory/provenance-bound inputs.  
**DB07-D14** — Every consequential action creates machine-readable evidence.  
**DB07-D15** — Model, control and execution planes remain separated across all deployment environments.

---

## 27. Next dependency

The next logical drawing-board artifact is:

**SSW-SERA-DB08: SERA Memory, Context Broker & Personalization Architecture**

DB08 should define how SERA remembers holder preferences, voice corrections, contact aliases, wallet behavior, recurring intents, chain preferences, prior decisions, device context and long-term personal state without allowing the AI context layer to become an uncontrolled copy of wallet data.
