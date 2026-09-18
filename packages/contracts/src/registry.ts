export const contractSchemaIds = {
  actionContract: "https://schemas.soulverse.world/ssw/json-schema/ssw-action-contract.v1.schema.json",
  mandate: "https://schemas.soulverse.world/ssw/json-schema/ssw-mandate.v1.schema.json",
  offlineAuthorizationPackage: "https://schemas.soulverse.world/ssw/json-schema/ssw-offline-authorization-package.v1.schema.json",
  dmclExpression: "https://schemas.soulverse.world/ssw/json-schema/ssw-dmcl-expression.v1.schema.json",
  attestationEvidence: "https://schemas.soulverse.world/ssw/json-schema/ssw-attestation-evidence.v1.schema.json",
  recoveryProof: "https://schemas.soulverse.world/ssw/json-schema/ssw-recovery-proof.v1.schema.json",
  wrappedStateKey: "https://schemas.soulverse.world/ssw/json-schema/ssw-wrapped-state-key.v1.schema.json",
  counterpartyResolution: "https://schemas.soulverse.world/ssw/json-schema/ssw-counterparty-resolution.v1.schema.json"
} as const;

export type ContractKind =
  | "action-contract"
  | "mandate"
  | "offline-authorization-package"
  | "dmcl-expression"
  | "attestation-evidence"
  | "recovery-proof"
  | "wrapped-state-key"
  | "counterparty-resolution";

export const contractKindToSchemaId: Readonly<Record<ContractKind, string>> = {
  "action-contract": contractSchemaIds.actionContract,
  mandate: contractSchemaIds.mandate,
  "offline-authorization-package": contractSchemaIds.offlineAuthorizationPackage,
  "dmcl-expression": contractSchemaIds.dmclExpression,
  "attestation-evidence": contractSchemaIds.attestationEvidence,
  "recovery-proof": contractSchemaIds.recoveryProof,
  "wrapped-state-key": contractSchemaIds.wrappedStateKey,
  "counterparty-resolution": contractSchemaIds.counterpartyResolution
};
