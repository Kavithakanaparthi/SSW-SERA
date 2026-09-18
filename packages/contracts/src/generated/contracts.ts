// GENERATED SNAPSHOT FROM CONTROLLED JSON SCHEMAS.
// Do not treat these TypeScript types as runtime validation.
// Regenerate with: npm run generate:types

export type AuthorityClass = "A0" | "A1" | "A2" | "A3" | "A4" | "A5";
export type RiskClass = "R0" | "R1" | "R2" | "R3" | "R4" | "R5";
export type ApprovalStatus =
  | "NOT_REQUIRED" | "REQUIRED" | "PENDING" | "APPROVED"
  | "REJECTED" | "EXPIRED" | "INVALIDATED";
export type ExecutionStatus =
  | "NOT_READY" | "READY" | "SUBMITTING" | "SUBMITTED" | "CONFIRMED"
  | "FAILED" | "EXECUTION_STATUS_UNKNOWN" | "CANCELLED" | "BLOCKED";

export interface ActionContract {
  schema: "ssw.action-contract.v1";
  action_id: string;
  intent_id: string;
  correlation_id: string;
  action_type: string;
  version: number;
  created_at: string;
  expires_at: string;
  principal: {
    holder_did: string;
    sera_agent_did: string;
    sera_runtime_id: string;
    device_id: string;
  };
  authority: {
    class: AuthorityClass;
    approval_required: boolean;
    mandate_id: string | null;
  };
  risk: { class: RiskClass; reasons: string[] };
  material_terms: Record<string, unknown>;
  policy: { policy_refs: string[]; device_eligible: boolean; runtime_eligible: boolean };
  trust: {
    trust_protocol_required: boolean;
    trust_protocol_ref: string | null;
    rev_required: boolean;
    rev_ref: string | null;
  };
  presentation: {
    concealed: boolean;
    reveal_required: boolean;
    authenticated_reveal_required: boolean;
    review_hash: string | null;
  };
  approval: {
    status: ApprovalStatus;
    approval_id: string | null;
    approved_terms_hash: string | null;
  };
  execution: { idempotency_key: string; replay_token: string; status: ExecutionStatus };
  evidence: { sael_correlation_id: string };
}

export interface Mandate {
  schema: "ssw.mandate.v1";
  mandate_id: string;
  version: number;
  created_at: string;
  valid_from: string;
  valid_until: string;
  principal: { holder_did: string; sera_agent_did: string };
  authority: { class: "A3" | "A4"; delegation_type: "bounded" | "conditional"; self_renewal_allowed: false };
  scope: {
    capabilities: string[];
    action_types: string[];
    assets: Record<string, unknown>[];
    chains: Record<string, unknown>[];
    counterparties: Record<string, unknown>[];
    contracts: Record<string, unknown>[];
  };
  limits: Record<string, unknown>;
  conditions: Record<string, unknown>[];
  risk: { max_class: RiskClass; prohibited_reasons: string[] };
  device_policy: {
    allowed_device_ids: string[];
    allowed_device_states: string[];
    allowed_runtime_ids: string[];
    cloud_execution_allowed: boolean;
    wearable_execution_allowed: boolean;
  };
  trust: { trust_protocol_required: boolean; rev_required: boolean; aurion_required: boolean };
  authentication: Record<string, unknown>;
  presentation: Record<string, unknown>;
  revocation: {
    status: "ACTIVE" | "SUSPENDED" | "REVOKED" | "EXPIRED" | "EXHAUSTED" | "TERMINATED";
    revoked_at: string | null;
    revocation_reason: string | null;
  };
  usage: Record<string, unknown>;
  evidence: Record<string, unknown>;
  integrity: { mandate_terms_hash: string; holder_signature_ref: string };
}

export interface OfflineAuthorizationPackage {
  schema: "ssw.offline-authorization-package.v1";
  oap_id: string;
  version: number;
  holder_did: string;
  sera_agent_did: string;
  issued_at: string;
  expires_at: string;
  authority: Record<string, unknown>;
  risk: Record<string, unknown>;
  device_policy: Record<string, unknown>;
  runtime_policy: Record<string, unknown>;
  scope: Record<string, unknown>;
  limits: Record<string, unknown>;
  freshness: Record<string, unknown>;
  offline_basis: "TRUST_PREAUTHORIZED_OFFLINE" | "REV_PREAUTHORIZED_OFFLINE" | "LOCAL_POLICY_ONLY";
  replay: Record<string, unknown>;
  usage: Record<string, unknown>;
  reconciliation: Record<string, unknown>;
  integrity: Record<string, unknown>;
}

export type DmclExpression = Record<string, unknown>;

export interface AttestationEvidence {
  schema: "ssw.attestation-evidence.v1";
  attestation_id: string;
  profile: string;
  provider: string;
  subject: Record<string, unknown>;
  challenge: Record<string, unknown>;
  status: "PASS" | "FAIL" | "UNAVAILABLE" | "EXPIRED" | "UNSUPPORTED";
  issued_at: string;
  expires_at: string;
  claims: Record<string, unknown>;
  integrity: Record<string, unknown>;
  reason_codes?: string[];
}

export interface RecoveryProof {
  schema: "ssw.recovery-proof.v1";
  proof_id: string;
  recovery_id: string;
  holder_did: string;
  sera_agent_did: string;
  proof_class: "RP1" | "RP2" | "RP3" | "RP4" | "RP5";
  assurance_level: "RAL1" | "RAL2" | "RAL3" | "RAL4" | "RAL5";
  target_device_id?: string | null;
  target_runtime_id?: string | null;
  challenge: Record<string, unknown>;
  status: "PASS" | "FAIL" | "EXPIRED";
  issued_at: string;
  expires_at: string;
  verifier_ref: string;
  reason_codes?: string[];
  integrity: Record<string, unknown>;
}

export interface WrappedStateKey {
  schema: "ssw.wrapped-state-key.v1";
  wrapped_key_id: string;
  holder_did: string;
  sera_agent_did: string;
  key_version: number;
  wrapping_profile: string;
  target: Record<string, unknown>;
  cipher_suite: string;
  wrapped_key: string;
  created_at: string;
  expires_at?: string | null;
  status: "ACTIVE" | "REVOKED" | "SUPERSEDED";
  integrity: Record<string, unknown>;
}

export interface CounterpartyResolution {
  schema: "ssw.counterparty-resolution.v1";
  resolution_id: string;
  holder_did: string;
  original_reference: string;
  status: "UNIQUE" | "MULTIPLE_CANDIDATES" | "LOW_CONFIDENCE" | "UNRESOLVED" | "CONFLICTING_IDENTIFIERS";
  candidates: Record<string, unknown>[];
  selected: Record<string, unknown> | null;
  created_at: string;
  expires_at: string;
  integrity: Record<string, unknown>;
}

export interface ContractTypeMap {
  "action-contract": ActionContract;
  mandate: Mandate;
  "offline-authorization-package": OfflineAuthorizationPackage;
  "dmcl-expression": DmclExpression;
  "attestation-evidence": AttestationEvidence;
  "recovery-proof": RecoveryProof;
  "wrapped-state-key": WrappedStateKey;
  "counterparty-resolution": CounterpartyResolution;
}
