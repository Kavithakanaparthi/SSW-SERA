BEGIN;

CREATE TABLE IF NOT EXISTS ssw.monitoring_grant (
  grant_id uuid PRIMARY KEY,
  holder_did text NOT NULL,
  sera_agent_did text NOT NULL,
  signal_class text NOT NULL,
  scope_json jsonb NOT NULL,
  delivery_classes text[] NOT NULL,
  processing text NOT NULL,
  retention text NOT NULL,
  enabled boolean NOT NULL,
  authority_effect text NOT NULL DEFAULT 'NONE' CHECK (authority_effect='NONE'),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  expires_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS monitoring_grant_lookup_idx
  ON ssw.monitoring_grant(holder_did,sera_agent_did,signal_class,enabled);

CREATE TABLE IF NOT EXISTS ssw.proactive_signal (
  signal_id uuid PRIMARY KEY,
  holder_did text NOT NULL,
  sera_agent_did text NOT NULL,
  signal_class text NOT NULL,
  event_type text NOT NULL,
  source_json jsonb NOT NULL,
  subject_json jsonb NOT NULL,
  severity text NOT NULL,
  freshness_seconds bigint NOT NULL CHECK (freshness_seconds >= 0),
  evidence_refs text[] NOT NULL,
  dedupe_key text NOT NULL,
  observed_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL,
  UNIQUE(holder_did,dedupe_key)
);

CREATE TABLE IF NOT EXISTS ssw.proactive_assessment (
  assessment_id uuid PRIMARY KEY,
  signal_id uuid NOT NULL REFERENCES ssw.proactive_signal(signal_id),
  grant_id uuid NULL REFERENCES ssw.monitoring_grant(grant_id),
  holder_did text NOT NULL,
  sera_agent_did text NOT NULL,
  factors_json jsonb NOT NULL,
  relevance_score numeric(7,6) NOT NULL CHECK (relevance_score >= 0 AND relevance_score <= 1),
  urgency text NOT NULL,
  notification_class text NOT NULL,
  decision text NOT NULL,
  reason_codes text[] NOT NULL,
  evidence_refs text[] NOT NULL,
  authority_effect text NOT NULL DEFAULT 'NONE' CHECK (authority_effect='NONE'),
  created_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS proactive_assessment_holder_idx
  ON ssw.proactive_assessment(holder_did,created_at DESC);

COMMIT;
