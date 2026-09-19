export interface IntentEntity {
  value: unknown;
  resolution: "EXPLICIT" | "RESOLVED" | "DEFAULTED_BY_POLICY" | "INFERRED_NON_MATERIAL" | "UNRESOLVED";
  source_ref: string | null;
}

export interface IntentEnvelope {
  schema: "ssw.intent-envelope.v1";
  intent_id: string;
  correlation_id: string;
  created_at: string;
  expires_at: string | null;
  holder_did: string;
  sera_agent_did: string;
  sera_runtime_id: string;
  device_id: string;
  source: {
    modality: "text" | "voice" | "notification" | "external_request" | "scheduled_trigger" | "system_event";
    channel: "wallet" | "widget" | "wearable" | "voice" | "walletconnect" | "api" | "other";
    raw_input_ref: string | null;
  };
  interpretation: {
    intent_type: string;
    confidence: number;
    ambiguity: boolean;
    ambiguity_reasons: string[];
  };
}

export interface ResolvedIntent {
  schema: "ssw.resolved-intent.v1";
  intent_id: string;
  correlation_id: string;
  intent_type: string;
  holder_did: string;
  sera_agent_did: string;
  sera_runtime_id: string;
  device_id: string;
  entities: Record<string, IntentEntity>;
  context_refs: string[];
  authority_requested: "A0" | "A1" | "A2" | "A3" | "A4" | "A5";
  risk_preliminary: "R0" | "R1" | "R2" | "R3" | "R4" | "R5";
  confidence: {
    overall: number;
    material_terms: Record<string, number>;
  };
  ambiguity: {
    material: boolean;
    items: string[];
  };
  created_at: string;
  expires_at: string;
}
