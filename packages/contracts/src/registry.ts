export const contractSchemaIds = {
  intentEnvelope: "https://schemas.soulverse.world/ssw/json-schema/ssw-intent-envelope.v1.schema.json",
  resolvedIntent: "https://schemas.soulverse.world/ssw/json-schema/ssw-resolved-intent.v1.schema.json",
  actionContract: "https://schemas.soulverse.world/ssw/json-schema/ssw-action-contract.v1.schema.json",
  deviceRecord: "https://schemas.soulverse.world/ssw/json-schema/ssw-device-record.v1.schema.json",
  runtimeRecord: "https://schemas.soulverse.world/ssw/json-schema/ssw-runtime-record.v1.schema.json",
  sessionEligibilityDecision: "https://schemas.soulverse.world/ssw/json-schema/ssw-session-eligibility-decision.v1.schema.json",
  authorityDecision: "https://schemas.soulverse.world/ssw/json-schema/ssw-authority-decision.v1.schema.json",
  riskDecision: "https://schemas.soulverse.world/ssw/json-schema/ssw-risk-decision.v1.schema.json",
  policyDecision: "https://schemas.soulverse.world/ssw/json-schema/ssw-policy-decision.v1.schema.json",
  mandate: "https://schemas.soulverse.world/ssw/json-schema/ssw-mandate.v1.schema.json",
  offlineAuthorizationPackage: "https://schemas.soulverse.world/ssw/json-schema/ssw-offline-authorization-package.v1.schema.json",
  dmclExpression: "https://schemas.soulverse.world/ssw/json-schema/ssw-dmcl-expression.v1.schema.json",
  attestationEvidence: "https://schemas.soulverse.world/ssw/json-schema/ssw-attestation-evidence.v1.schema.json",
  recoveryProof: "https://schemas.soulverse.world/ssw/json-schema/ssw-recovery-proof.v1.schema.json",
  wrappedStateKey: "https://schemas.soulverse.world/ssw/json-schema/ssw-wrapped-state-key.v1.schema.json",
  counterpartyResolution: "https://schemas.soulverse.world/ssw/json-schema/ssw-counterparty-resolution.v1.schema.json"
} as const;

export type ContractKind =
  | "intent-envelope"
  | "resolved-intent"
  | "action-contract"
  | "device-record"
  | "runtime-record"
  | "session-eligibility-decision"
  | "authority-decision"
  | "risk-decision"
  | "policy-decision"
  | "mandate"
  | "offline-authorization-package"
  | "dmcl-expression"
  | "attestation-evidence"
  | "recovery-proof"
  | "wrapped-state-key"
  | "counterparty-resolution";

export const contractKindToSchemaId: Readonly<Record<ContractKind, string>> = {
  "intent-envelope": contractSchemaIds.intentEnvelope,
  "resolved-intent": contractSchemaIds.resolvedIntent,
  "action-contract": contractSchemaIds.actionContract,
  "device-record": contractSchemaIds.deviceRecord,
  "runtime-record": contractSchemaIds.runtimeRecord,
  "session-eligibility-decision": contractSchemaIds.sessionEligibilityDecision,
  "authority-decision": contractSchemaIds.authorityDecision,
  "risk-decision": contractSchemaIds.riskDecision,
  "policy-decision": contractSchemaIds.policyDecision,
  mandate: contractSchemaIds.mandate,
  "offline-authorization-package": contractSchemaIds.offlineAuthorizationPackage,
  "dmcl-expression": contractSchemaIds.dmclExpression,
  "attestation-evidence": contractSchemaIds.attestationEvidence,
  "recovery-proof": contractSchemaIds.recoveryProof,
  "wrapped-state-key": contractSchemaIds.wrappedStateKey,
  "counterparty-resolution": contractSchemaIds.counterpartyResolution
};
