export type DmclDecision = 'TRUE' | 'FALSE' | 'INDETERMINATE';
export interface DmclEvaluator { evaluate(expression: unknown, signals: Readonly<Record<string, unknown>>): DmclDecision; }
