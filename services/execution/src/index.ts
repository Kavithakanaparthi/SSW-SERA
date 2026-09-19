export {buildExecutionRequest,simulateEvmExecution,submitExecution,ExecutionReplayStore} from "@soulverse/execution-router";
export type {ExecutionRequest,ExecutionResult,ChainSubmissionTransport} from "@soulverse/execution-router";
export const serviceName="execution" as const;
export const implementationStatus="BASELINE_IMPLEMENTED" as const;
export const EXECUTION_MODE="SUBMISSION_DISABLED_BY_DEFAULT" as const;
