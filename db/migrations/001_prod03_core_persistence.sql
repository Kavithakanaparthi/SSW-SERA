BEGIN;

CREATE SCHEMA IF NOT EXISTS ssw;

CREATE TABLE IF NOT EXISTS ssw.schema_migration (
  migration_id text PRIMARY KEY,
  checksum_sha256 text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ssw.domain_record (
  owner_service text NOT NULL,
  record_type text NOT NULL,
  record_id text NOT NULL,
  version bigint NOT NULL CHECK (version >= 1),
  status text NOT NULL,
  state jsonb NOT NULL,
  state_hash text NOT NULL,
  expires_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_service, record_type, record_id)
);

CREATE INDEX IF NOT EXISTS domain_record_expiry_idx
  ON ssw.domain_record (expires_at)
  WHERE expires_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS ssw.idempotency_claim (
  owner_service text NOT NULL,
  idempotency_key text NOT NULL,
  request_hash text NOT NULL,
  response_ref text NULL,
  status text NOT NULL DEFAULT 'CLAIMED',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NULL,
  PRIMARY KEY (owner_service, idempotency_key)
);

CREATE TABLE IF NOT EXISTS ssw.replay_claim (
  owner_service text NOT NULL,
  replay_token text NOT NULL,
  request_hash text NOT NULL,
  rev_decision_id text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NULL,
  consumed_at timestamptz NULL,
  PRIMARY KEY (owner_service, replay_token)
);

CREATE UNIQUE INDEX IF NOT EXISTS replay_claim_rev_single_use_idx
  ON ssw.replay_claim (owner_service, rev_decision_id)
  WHERE rev_decision_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS ssw.mandate_usage (
  mandate_id text NOT NULL,
  asset_id text NOT NULL,
  action_count bigint NOT NULL DEFAULT 0 CHECK (action_count >= 0),
  cumulative_atomic numeric(78,0) NOT NULL DEFAULT 0 CHECK (cumulative_atomic >= 0),
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (mandate_id, asset_id)
);

CREATE TABLE IF NOT EXISTS ssw.execution_state (
  execution_request_id text PRIMARY KEY,
  action_id text NOT NULL,
  status text NOT NULL,
  signed_payload_hash text NULL,
  idempotency_key text NOT NULL,
  submission_ref text NULL,
  network_tx_id text NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS execution_state_idempotency_idx
  ON ssw.execution_state (idempotency_key);

CREATE TABLE IF NOT EXISTS ssw.event_outbox (
  event_id uuid PRIMARY KEY,
  owner_service text NOT NULL,
  topic text NOT NULL,
  partition_key text NOT NULL,
  payload jsonb NOT NULL,
  headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','INFLIGHT','DELIVERED','FAILED')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  available_at timestamptz NOT NULL DEFAULT now(),
  lease_until timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS event_outbox_dispatch_idx
  ON ssw.event_outbox (status, available_at, created_at);

CREATE TABLE IF NOT EXISTS ssw.event_inbox (
  consumer_service text NOT NULL,
  event_id uuid NOT NULL,
  payload_hash text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz NULL,
  PRIMARY KEY (consumer_service, event_id)
);

COMMIT;
