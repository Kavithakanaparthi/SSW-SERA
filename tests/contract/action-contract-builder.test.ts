import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildPaymentSendAction } from "../../packages/action-contract-builder/src/index.js";
import { validateContract } from "../../packages/schema-validation/src/index.js";

const resolvedPath=new URL("../fixtures/resolved-intent.payment-send.valid.json",import.meta.url);
const envelopePath=new URL("../fixtures/intent-envelope.payment-send.valid.json",import.meta.url);
async function resolved(){return JSON.parse(await readFile(resolvedPath,"utf8"));}

const context={
 actionId:"88888888-8888-4888-8888-888888888888",
 saelCorrelationId:"99999999-9999-4999-8999-999999999999",
 idempotencyKey:"payment-send-idempotency-001",
 replayToken:"payment-send-replay-001",
 createdAt:"2026-09-19T16:01:00Z",
 expiresAt:"2026-09-19T16:06:00Z"
};

test("Intent Envelope validates independently",async()=>{
 const value=JSON.parse(await readFile(envelopePath,"utf8"));
 assert.equal(validateContract("intent-envelope",value).ok,true);
});

test("Resolved Intent validates independently",async()=>{
 assert.equal(validateContract("resolved-intent",await resolved()).ok,true);
});

test("valid payment intent builds conservative Action Contract",async()=>{
 const result=buildPaymentSendAction(await resolved(),context);
 assert.equal(result.status,"BUILT");
 if(result.status==="BUILT"){
  assert.equal(result.actionContract.action_type,"payment.send");
  assert.equal(result.actionContract.authority.class,"A2");
  assert.equal(result.actionContract.approval.status,"REQUIRED");
  assert.equal(result.actionContract.execution.status,"NOT_READY");
  assert.equal(result.actionContract.policy.device_eligible,false);
  assert.equal(result.actionContract.policy.runtime_eligible,false);
  assert.equal(result.actionContract.trust.trust_protocol_ref,null);
  assert.equal(result.actionContract.trust.rev_ref,null);
 }
});

test("unresolved recipient blocks contract construction",async()=>{
 const input=await resolved();
 input.entities.counterparty={value:null,resolution:"UNRESOLVED",source_ref:null};
 input.ambiguity={material:true,items:["AMBIGUOUS_RECIPIENT"]};
 const result=buildPaymentSendAction(input,context);
 assert.deepEqual(result,{status:"BLOCKED_AMBIGUITY",reasonCodes:["AMBIGUOUS_RECIPIENT"]});
});

test("amount mutation changes material terms hash",async()=>{
 const a=await resolved();
 const b=await resolved();
 b.entities.amount.value.atomic="5000001";
 const one=buildPaymentSendAction(a,context);
 const two=buildPaymentSendAction(b,context);
 assert.equal(one.status,"BUILT"); assert.equal(two.status,"BUILT");
 if(one.status==="BUILT"&&two.status==="BUILT")assert.notEqual(one.materialTermsHash,two.materialTermsHash);
});

test("entity insertion order does not change material terms hash",async()=>{
 const a=await resolved();
 const b=await resolved();
 b.entities={
   chain:b.entities.chain,
   counterparty:b.entities.counterparty,
   amount:b.entities.amount,
   asset:b.entities.asset
 };
 const one=buildPaymentSendAction(a,context);
 const two=buildPaymentSendAction(b,context);
 assert.equal(one.status,"BUILT"); assert.equal(two.status,"BUILT");
 if(one.status==="BUILT"&&two.status==="BUILT")assert.equal(one.materialTermsHash,two.materialTermsHash);
});

test("Holder DID cannot be replaced by SERA DID",async()=>{
 const input=await resolved();
 input.holder_did=input.sera_agent_did;
 const result=validateContract("resolved-intent",input);
 assert.equal(result.ok,false);
});
