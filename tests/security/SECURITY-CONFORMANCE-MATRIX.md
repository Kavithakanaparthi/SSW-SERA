# SSW-SERA Security Conformance Matrix

This matrix is controlled by SSW-AI-IMP-16.

| ID | Boundary | Attack | Expected |
|---|---|---|---|
| SEC-001 | Signing | Replay token reuse | REPLAY_DETECTED |
| SEC-002 | Signing | Idempotency conflict | IDEMPOTENCY_CONFLICT |
| SEC-003 | Signing | Action hash mutation | ACTION_HASH_MISMATCH |
| SEC-004 | Approval | Material term mutation | MATERIAL_TERMS_HASH_MISMATCH |
| SEC-005 | Approval | Approval substitution | APPROVAL_INVALID |
| SEC-006 | Mandate | Scope bypass | OUT_OF_SCOPE |
| SEC-007 | DMCL | Missing execution signal | INDETERMINATE |
| SEC-008 | Trust | Stale Trust PASS | TRUST_PROTOCOL_EXPIRED |
| SEC-009 | REV | Stale REV PASS | REV_EXPIRED |
| SEC-010 | Runtime | Wrong Holder/SERA context | INELIGIBLE |
| SEC-011 | Counterparty | Alias poisoning / ambiguity | COUNTERPARTY_AMBIGUOUS |
| SEC-012 | Recovery | State rollback | STATE_ROLLBACK_DETECTED |
| SEC-013 | Signing | Model calls signer | CALLER_NOT_AUTHORIZED |
| SEC-014 | Execution | Payload mutation | PAYLOAD_HASH_MISMATCH |
| SEC-015 | SAEL | Producer namespace spoof | SAEL_PRODUCER_NOT_AUTHORIZED |
| SEC-016 | SAEL | Hash-chain tamper | SAEL_PREVIOUS_HASH_MISMATCH |
| SEC-017 | SAEL | Disclosure escalation | SAEL_DISCLOSURE_NOT_AUTHORIZED |
| SEC-018 | Offline | OAP replay | OFFLINE_REPLAY_BLOCK |

A test existing in source is not equivalent to a production security pass. CI/staging execution evidence is required.
