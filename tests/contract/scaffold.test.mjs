import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

test("controlled contract anchors remain present", async () => {
  await access("contracts/json-schema/ssw-action-contract.v1.schema.json");
  await access("contracts/openapi/ssw-internal-api.v1.yaml");
});

test("signing and execution are safe in IMP-01", async () => {
  const signing = await readFile("services/signing/src/index.ts", "utf8");
  const execution = await readFile("services/execution/src/index.ts", "utf8");
  assert.match(signing, /DRY_RUN_ONLY/);
  assert.match(execution, /STUB_ONLY/);
});
