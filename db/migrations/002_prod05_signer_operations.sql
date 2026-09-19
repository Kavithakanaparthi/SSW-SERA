BEGIN;

CREATE TABLE IF NOT EXISTS ssw.signer_key_registry (
  key_ref text PRIMARY KEY,
  holder_did text NOT NULL,
  key_class text NOT NULL,
  provider_class text NOT NULL,
  algorithm text NOT NULL,
  public_key_ref text NOT NULL,
  allowed_chains text[] NOT NULL DEFAULT '{}',
  allowed_action_types text[] NOT NULL DEFAULT '{}',
  status text NOT NULL CHECK (status IN ('ACTIVE','SUSPENDED','REVOKED','RETIRED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  rotated_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS signer_key_eligibility_idx
  ON ssw.signer_key_registry(holder_did,key_class,status);

CREATE TABLE IF NOT EXISTS ssw.signing_operation (
  operation_id uuid PRIMARY KEY,
  signing_request_id text NOT NULL UNIQUE,
  action_id text NOT NULL,
  request_hash text NOT NULL,
  payload_hash text NOT NULL,
  signing_digest text NOT NULL,
  digest_profile text NOT NULL,
  key_ref text NOT NULL REFERENCES ssw.signer_key_registry(key_ref),
  rev_decision_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('RESERVED','SIGNING','SIGNED','REJECTED','SIGNER_STATUS_UNKNOWN')),
  provider_operation_ref text NULL,
  signature_ref text NULL,
  reason_code text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS signing_operation_action_idx
  ON ssw.signing_operation(action_id,created_at);

COMMIT;
