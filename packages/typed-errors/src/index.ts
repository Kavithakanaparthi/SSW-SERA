export class SswError extends Error { constructor(public readonly code: string, message: string){ super(message); this.name='SswError'; } }
export const BLOCKED = 'BLOCKED' as const;
