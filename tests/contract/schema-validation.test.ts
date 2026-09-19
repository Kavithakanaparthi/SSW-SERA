import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  assertContract,
  ContractValidationException,
  registeredContractKinds,
  validateContract
} from "../../packages/schema-validation/src/index.js";
import { contractKindToSchemaId } from "../../packages/contracts/src/registry.js";

const fixturePath = new URL("../fixtures/action-contract.valid.json", import.meta.url);

async function validAction(): Promise<any> {
  return JSON.parse(await readFile(fixturePath, "utf8"));
}

test("all controlled top-level contract schemas are registered", () => {
  assert.deepEqual(
    [...registeredContractKinds()].sort(),
    Object.keys(contractKindToSchemaId).sort()
  );
});

test("valid Action Contract passes structural and semantic validation", async () => {
  const input = await validAction();
  const result = validateContract("action-contract", input);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.schema, "ssw.action-contract.v1");
});

test("missing required field fails closed", async () => {
  const input = await validAction();
  delete input.action_id;
  const result = validateContract("action-contract", input);
  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.errors.some((e) => e.code === "SCHEMA_REQUIRED"));
});

test("unexpected additional property is rejected", async () => {
  const input = await validAction();
  input.uncontrolled = true;
  const result = validateContract("action-contract", input);
  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.errors.some((e) => e.code === "SCHEMA_ADDITIONALPROPERTIES"));
});

test("SERA Agent DID cannot occupy Holder DID field", async () => {
  const input = await validAction();
  input.principal.holder_did = "did:soul:agent:stolen-context";
  const result = validateContract("action-contract", input);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.errors.some((e) => e.code === "HOLDER_DID_AGENT_NAMESPACE_FORBIDDEN"));
  }
});

test("SERA DID requires agent namespace", async () => {
  const input = await validAction();
  input.principal.sera_agent_did = "did:soul:not-an-agent";
  const result = validateContract("action-contract", input);
  assert.equal(result.ok, false);
});

test("assertContract throws structured exception", async () => {
  const input = await validAction();
  delete input.intent_id;
  assert.throws(
    () => assertContract("action-contract", input),
    (error: unknown) => error instanceof ContractValidationException
  );
});
