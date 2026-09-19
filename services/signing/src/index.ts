export {buildSigningRequest,dryRunVerifySigning,InMemoryReplayStore,hashActionContract,hashEvmPayload} from "@soulverse/signing-gateway";
export type {SigningRequest,SigningResult,ReplayStore} from "@soulverse/signing-gateway";
export const serviceName="signing" as const;
export const implementationStatus="DRY_RUN_BASELINE_IMPLEMENTED" as const;
export const SIGNING_MODE="DRY_RUN_ONLY" as const;
