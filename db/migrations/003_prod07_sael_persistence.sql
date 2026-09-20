BEGIN;

CREATE TABLE IF NOT EXISTS ssw.sael_stream_head (
  stream_id text PRIMARY KEY,
  sequence bigint NOT NULL DEFAULT 0 CHECK (sequence >= 0),
  event_hash text NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ssw.sael_event (
  stream_id text NOT NULL,
  sequence bigint NOT NULL CHECK (sequence >= 1),
  event_id uuid NOT NULL UNIQUE,
  producer_id text NOT NULL,
  idempotency_key text NOT NULL,
  event_type text NOT NULL,
  event_hash text NOT NULL,
  previous_event_hash text NULL,
  event_json jsonb NOT NULL,
  occurred_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL,
  PRIMARY KEY (stream_id, sequence),
  UNIQUE (producer_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS sael_event_type_idx
  ON ssw.sael_event(stream_id,event_type,sequence);

CREATE INDEX IF NOT EXISTS sael_event_occurred_idx
  ON ssw.sael_event(stream_id,occurred_at);

CREATE TABLE IF NOT EXISTS ssw.sael_reservation (
  reservation_id uuid PRIMARY KEY,
  action_id uuid NOT NULL,
  expected_event_types jsonb NOT NULL,
  required_durability text NOT NULL,
  expires_at timestamptz NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sael_reservation_action_idx
  ON ssw.sael_reservation(action_id,completed,expires_at);

CREATE TABLE IF NOT EXISTS ssw.sael_checkpoint (
  checkpoint_id uuid PRIMARY KEY,
  stream_id text NOT NULL,
  from_sequence bigint NOT NULL,
  to_sequence bigint NOT NULL,
  root_hash text NOT NULL,
  checkpoint_hash text NOT NULL,
  previous_checkpoint_hash text NULL,
  signature_ref text NOT NULL,
  created_at timestamptz NOT NULL,
  UNIQUE(stream_id,to_sequence),
  CHECK (from_sequence >= 1),
  CHECK (to_sequence >= from_sequence)
);

CREATE INDEX IF NOT EXISTS sael_checkpoint_stream_idx
  ON ssw.sael_checkpoint(stream_id,to_sequence);

CREATE TABLE IF NOT EXISTS ssw.sael_archive (
  archive_id uuid PRIMARY KEY,
  checkpoint_id uuid NOT NULL UNIQUE REFERENCES ssw.sael_checkpoint(checkpoint_id),
  stream_id text NOT NULL,
  archive_ref text NOT NULL,
  archive_hash text NOT NULL,
  encryption_profile text NOT NULL,
  created_at timestamptz NOT NULL
);

CREATE OR REPLACE FUNCTION ssw.reject_sael_event_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'SAEL_EVENT_IMMUTABLE';
END;
$$;

CREATE TRIGGER sael_event_immutable_update
BEFORE UPDATE ON ssw.sael_event
FOR EACH ROW EXECUTE FUNCTION ssw.reject_sael_event_mutation();

CREATE TRIGGER sael_event_immutable_delete
BEFORE DELETE ON ssw.sael_event
FOR EACH ROW EXECUTE FUNCTION ssw.reject_sael_event_mutation();

COMMIT;
