import { readFile } from "node:fs/promises";
import { buildPaymentSendAction } from "../packages/action-contract-builder/src/index.js";

const intent=JSON.parse(await readFile("tests/fixtures/resolved-intent.payment-send.valid.json","utf8"));
const result=buildPaymentSendAction(intent,{
 actionId:"88888888-8888-4888-8888-888888888888",
 saelCorrelationId:"99999999-9999-4999-8999-999999999999",
 idempotencyKey:"payment-send-idempotency-001",
 replayToken:"payment-send-replay-001",
 createdAt:"2026-09-19T16:01:00Z",
 expiresAt:"2026-09-19T16:06:00Z"
});
console.log(JSON.stringify(result,null,2));
