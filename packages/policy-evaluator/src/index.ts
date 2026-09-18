export type PolicyDecision = 'ALLOW' | 'DENY' | 'REQUIRE_STEP_UP';
export interface PolicyEvaluator { evaluate(input: unknown): Promise<PolicyDecision>; }
