# SSW-AI-PROD-01: Executable Build & CI Baseline

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-PROD-01  
**Status:** COMPLETE  
**Date:** 2026-09-19  
**Parent Phase:** IMP-01 through IMP-16 complete

## 1. Purpose

Establish an executable, reproducible repository gate before connecting credentials, providers, HSM/KMS, production Trust/REV services or chain submission.

## 2. Runtime Baseline

- TypeScript / Node.js
- Node major: 22
- npm workspaces
- package-lock.json lockfile v3
- no production credentials
- no production signing
- no production execution

## 3. Verified CI Gate

GitHub Actions Run #8 completed successfully on 2026-09-19.

The successful run verified:

1. clean dependency resolution;
2. package-lock.json generation;
3. clean npm ci;
4. scaffold verification;
5. 34 controlled JSON Schemas plus enum/OpenAPI verification;
6. 104 contract, integration and security tests;
7. strict TypeScript typecheck;
8. verified lockfile commit.

Successful workflow run ID:

`35474348335`

Verified lockfile commit:

`37fd223b8cb1643c57c2140a62d5678a7bb246af`

Lockfile blob SHA:

`091afc15bfb02cae0ac97f20324ce591eaa367b0`

## 4. Defects Closed During Bootstrap

The executable CI gate surfaced and closed:

- invalid short idempotency/replay test fixtures;
- stale scaffold expectations after execution baseline advancement;
- stale schema-registry test expectations;
- SAEL idempotent retry ordering defect;
- missing Node type declarations;
- incomplete generated ContractTypeMap coverage;
- strict TypeScript validation-boundary casts;
- Ajv / ajv-formats declaration interop issues.

These were corrected before the lockfile was committed.

## 5. Steady-State CI

The temporary lockfile bootstrap workflow has been converted to normal CI.

Steady-state properties:

- contents: read;
- committed package-lock.json required;
- npm ci only;
- npm cache keyed from package-lock.json;
- contract/integration/security tests required;
- strict TypeScript typecheck required;
- no workflow ability to push repository contents.

## 6. Security Posture

CI uses no application secrets.

Dependency lifecycle scripts remain disabled during installation.

No production provider credentials, HSM/KMS credentials, signing keys, Trust/REV production credentials or chain-broadcast credentials were introduced.

## 7. Exit Criteria

All PROD-01 exit criteria are satisfied:

- package-lock.json committed from a successful clean CI run;
- npm ci succeeds;
- repository tests succeed;
- typecheck succeeds;
- workflow converted to steady-state read-only operation;
- project tracker and append-only ledger updated.

## 8. Next Controlled Artifact

**SSW-AI-PROD-02: Production Service Framework & Runtime Conventions**
