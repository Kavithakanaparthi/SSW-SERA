import { readFile } from "node:fs/promises";
import { assertContract } from "../packages/schema-validation/src/index.js";

const fixture = JSON.parse(
  await readFile("tests/fixtures/action-contract.valid.json", "utf8")
);

const action = assertContract("action-contract", fixture);
console.log(JSON.stringify({
  validated: true,
  actionId: action.action_id,
  holderDid: action.principal.holder_did,
  seraDid: action.principal.sera_agent_did,
  authorityClass: action.authority.class,
  riskClass: action.risk.class
}, null, 2));
