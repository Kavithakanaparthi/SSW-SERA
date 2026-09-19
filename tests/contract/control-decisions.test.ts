import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildPaymentSendAction } from "../../packages/action-contract-builder/src/index.js";
import { evaluateAuthority, evaluateRisk, evaluatePolicy } from "../../packages/control-decisions/src/index.js";

const intentPath=new URL("../fixtures/resolved-intent.payment-send.valid.json",import.meta.url);
async function built(){
 const intent=JSON.parse(await readFile(intentPath,"utf8"));
 const result=buildPaymentSendAction(intent,{
  actionId:"88888888-8888-4888-8888-888888888888",
  saelCorrelationId:"99999999-9999-4999-8999-999999999999",
  idempotencyKey:"payment-send-idempotency-001",
  replayToken:"payment-send-replay-001",
  createdAt:"2026-09-19T16:01:00Z",
  expiresAt:"2026-09-19T16:06:00Z"
 });
 if(result.status!=="BUILT")throw new Error("fixture failed to build");
 return result;
}
const ids={
 authorityDecisionId:"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
 riskDecisionId:"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
 policyDecisionId:"cccccccc-cccc-4ccc-8ccc-cccccccccccc"
};

test("A2 without approval requires approval",async()=>{
 const b=await built();
 const d=evaluateAuthority({action:b.actionContract,materialTermsHash:b.materialTermsHash,decisionId:ids.authorityDecisionId,evaluatedAt:"2026-09-19T16:02:00Z"});
 assert.equal(d.status,"REQUIRE_APPROVAL");
});

test("A2 with mismatched terms hash fails",async()=>{
 const b=await built();
 const action=structuredClone(b.actionContract);
 action.approval.status="APPROVED";
 action.approval.approval_id="dddddddd-dddd-4ddd-8ddd-dddddddddddd";
 action.approval.approved_terms_hash="sha256:"+"f".repeat(64);
 const d=evaluateAuthority({action,materialTermsHash:b.materialTermsHash,decisionId:ids.authorityDecisionId,evaluatedAt:"2026-09-19T16:02:00Z"});
 assert.equal(d.status,"FAIL");
 assert.ok(d.reason_codes.includes("MATERIAL_TERMS_HASH_MISMATCH"));
});

test("A2 matching approval passes authority but not later controls",async()=>{
 const b=await built();
 const action=structuredClone(b.actionContract);
 action.approval.status="APPROVED";
 action.approval.approval_id="dddddddd-dddd-4ddd-8ddd-dddddddddddd";
 action.approval.approved_terms_hash=b.materialTermsHash;
 const authority=evaluateAuthority({action,materialTermsHash:b.materialTermsHash,decisionId:ids.authorityDecisionId,evaluatedAt:"2026-09-19T16:02:00Z"});
 assert.equal(authority.status,"PASS");
 const risk=evaluateRisk({action,materialTermsHash:b.materialTermsHash,decisionId:ids.riskDecisionId,evaluatedAt:"2026-09-19T16:02:01Z"});
 const policy=evaluatePolicy({action,materialTermsHash:b.materialTermsHash,authorityDecision:authority,riskDecision:risk,decisionId:ids.policyDecisionId,evaluatedAt:"2026-09-19T16:02:02Z"});
 assert.equal(policy.status,"REQUIRE_DEVICE_RUNTIME");
});

test("payment.send risk cannot fall below R3",async()=>{
 const b=await built();
 const action=structuredClone(b.actionContract);
 action.risk.class="R0";
 const d=evaluateRisk({action,materialTermsHash:b.materialTermsHash,decisionId:ids.riskDecisionId,evaluatedAt:"2026-09-19T16:02:00Z"});
 assert.equal(d.final_class,"R3");
});

test("risk signals elevate risk deterministically",async()=>{
 const b=await built();
 const d=evaluateRisk({action:b.actionContract,materialTermsHash:b.materialTermsHash,decisionId:ids.riskDecisionId,evaluatedAt:"2026-09-19T16:02:00Z",signals:["BRIDGE_REQUIRED"]});
 assert.equal(d.final_class,"R4");
});

test("restricted risk is denied by baseline policy",async()=>{
 const b=await built();
 const action=structuredClone(b.actionContract);
 action.approval.status="APPROVED";
 action.approval.approval_id="dddddddd-dddd-4ddd-8ddd-dddddddddddd";
 action.approval.approved_terms_hash=b.materialTermsHash;
 const authority=evaluateAuthority({action,materialTermsHash:b.materialTermsHash,decisionId:ids.authorityDecisionId,evaluatedAt:"2026-09-19T16:02:00Z"});
 const risk=evaluateRisk({action,materialTermsHash:b.materialTermsHash,decisionId:ids.riskDecisionId,evaluatedAt:"2026-09-19T16:02:01Z",signals:["UNTRUSTED_ORIGIN"]});
 const policy=evaluatePolicy({action,materialTermsHash:b.materialTermsHash,authorityDecision:authority,riskDecision:risk,decisionId:ids.policyDecisionId,evaluatedAt:"2026-09-19T16:02:02Z"});
 assert.equal(risk.final_class,"R5");
 assert.equal(policy.status,"DENY");
});

test("A3 and A4 require mandate validation",async()=>{
 const b=await built();
 for(const cls of ["A3","A4"] as const){
  const action=structuredClone(b.actionContract);
  action.authority.class=cls;
  action.authority.approval_required=false;
  action.authority.mandate_id="eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
  const d=evaluateAuthority({action,materialTermsHash:b.materialTermsHash,decisionId:ids.authorityDecisionId,evaluatedAt:"2026-09-19T16:02:00Z"});
  assert.equal(d.status,"REQUIRE_MANDATE_VALIDATION");
 }
});

test("A5 is prohibited",async()=>{
 const b=await built();
 const action=structuredClone(b.actionContract);
 action.authority.class="A5";
 const d=evaluateAuthority({action,materialTermsHash:b.materialTermsHash,decisionId:ids.authorityDecisionId,evaluatedAt:"2026-09-19T16:02:00Z"});
 assert.equal(d.status,"PROHIBITED");
});
