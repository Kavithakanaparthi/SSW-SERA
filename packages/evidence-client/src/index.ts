export interface EvidenceClient { append(event: unknown): Promise<{ eventId: string }>; }
