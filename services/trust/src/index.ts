export {buildTrustProtocolRequest,verifyTrustProtocolDecision,evaluateTrustProtocol,applyVerifiedTrustToAction} from "@soulverse/trust-adapter";
export type {TrustProtocolRequest,TrustProtocolDecision,TrustProtocolTransport,TrustVerification} from "@soulverse/trust-adapter";
export const serviceName="trust" as const;
export const implementationStatus="BASELINE_IMPLEMENTED" as const;

export {ProductionTrustProtocolTransport,NodeMtlsJsonClient,StaticDecisionKeyResolver,PostgresDecisionPersistence,CircuitBreaker} from "@soulverse/control-service-client";
