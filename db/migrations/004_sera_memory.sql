BEGIN;

CREATE TABLE IF NOT EXISTS ssw.sera_memory (
  memory_id uuid PRIMARY KEY,
  holder_did text NOT NULL,
  sera_agent_did text NOT NULL,
  domain text NOT NULL CHECK (domain IN ('HOLDER_PREFERENCE','LANGUAGE_VOICE','ENTITY_ALIAS','BEHAVIORAL_CONVENIENCE')),
  memory_key text NOT NULL,
  value_json jsonb NOT NULL,
  provenance text NOT NULL CHECK (provenance IN ('HOLDER_EXPLICIT','HOLDER_CORRECTION','SYSTEM_OBSERVED')),
  confidence numeric(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  retention_class text NOT NULL CHECK (retention_class IN ('RT1','RT2','RT3')),
  context_tier text NOT NULL CHECK (context_tier IN ('C1','C2','C3','C4')),
  external_transmission_allowed boolean NOT NULL,
  scope text NOT NULL DEFAULT 'HOLDER' CHECK (scope='HOLDER'),
  device_scope text NOT NULL CHECK (device_scope IN ('ALL_AUTHORIZED_DEVICES','CURRENT_DEVICE_ONLY')),
  authority_effect text NOT NULL DEFAULT 'NONE' CHECK (authority_effect='NONE'),
  status text NOT NULL CHECK (status IN ('ACTIVE','DELETED','EXPIRED')),
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  last_confirmed_at timestamptz NULL,
  expires_at timestamptz NULL,
  UNIQUE(holder_did,sera_agent_did,domain,memory_key)
);

CREATE INDEX IF NOT EXISTS sera_memory_active_lookup_idx
  ON ssw.sera_memory(holder_did,sera_agent_did,domain,memory_key)
  WHERE status='ACTIVE';

CREATE INDEX IF NOT EXISTS sera_memory_expiry_idx
  ON ssw.sera_memory(expires_at)
  WHERE status='ACTIVE' AND expires_at IS NOT NULL;

COMMIT;
