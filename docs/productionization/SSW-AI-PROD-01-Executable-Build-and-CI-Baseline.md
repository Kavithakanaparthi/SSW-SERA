# SSW-AI-PROD-01: Executable Build & CI Baseline

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Artifact ID:** SSW-AI-PROD-01  
**Status:** Productionization Bootstrap  
**Date:** 2026-09-19  
**Parent Phase:** IMP-01 through IMP-16 complete

## 1. Purpose

Establish an executable, reproducible repository gate before connecting credentials, providers, HSM/KMS, production Trust/REV services or chain submission.

## 2. Runtime Baseline

- TypeScript / Node.js
- Node major: 22
- npm workspaces
- no production credentials
- no production signing
- no production execution

## 3. CI Gate

Every accepted baseline must pass:

1. clean dependency installation;
2. scaffold verification;
3. contract readability/validation checks;
4. contract + integration + security tests;
5. TypeScript strict typecheck.

## 4. Lockfile Bootstrap

The repository currently has no package-lock.json.

The first CI run therefore:

1. generates package-lock.json with lifecycle scripts disabled;
2. performs a clean npm ci from that lockfile;
3. runs the entire CI gate;
4. commits package-lock.json only if all checks pass.

After the lockfile is committed, the temporary bootstrap write permission must be removed and CI becomes read-only.

## 5. Security Posture

CI uses no application secrets.

Dependency lifecycle scripts are disabled during installation for this baseline.

GitHub Actions permissions are minimized. The temporary contents:write permission exists solely to commit the verified initial lockfile and is removed after bootstrap.

## 6. Exit Criteria

PROD-01 advances when:

- package-lock.json is committed from a successful clean CI run;
- npm ci succeeds;
- repository tests succeed;
- typecheck succeeds;
- CI workflow is converted to steady-state read-only operation;
- build status is recorded in the Project Build Tracker and Build Progress Ledger.

No production integration work should begin before these conditions are satisfied.
