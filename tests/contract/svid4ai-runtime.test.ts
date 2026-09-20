import test from "node:test";
import assert from "node:assert/strict";
import {Svid4AiRuntime,Svid4AiRuntimeError,type Svid4AiProvider} from "../../packages/mandate-runtime/src/svid4ai-runtime.js";

const now="2026-09-20T02:30:00Z";
const holder="did:soul:holder-alice";
const sera="did:soul:agent:sera-alice";

const provider=(overrides:Record<string,unknown>={}):Svid4AiProvider=>({
 resolveAgent:async()=>({
  seraAgentDid:sera,governingHolderDid:holder,operatorDid:holder,status:"ACTIVE",
  didDocumentRef:"did-doc:sera-alice",documentVersion:4,
  verificationMethodRefs:[sera+"#key-2",sera+"#key-1",sera+"#key-1"],
  bindingRef:"svid4ai:binding:alice:2",bindingVersion:2,integrityRef:"sig:svid4ai:2",
  observedAt:"2026-09-20T02:29:00Z",validUntil:"2026-09-20T02:35:00Z",
  ...overrides
 } as any)
});

function mandate(overrides:Record<string,unknown>={}):any{
 return{
  schema:"ssw.mandate.v1",mandate_id:"11111111-1111-4111-8111-111111111111",version:1,
  created_at:"2026-09-20T02:00:00Z",valid_from:"2026-09-20T02:00:00Z",valid_until:"2026-10-20T02:00:00Z",
  principal:{holder_did:holder,sera_agent_did:sera},
  authority:{class:"A3",delegation_type:"bounded",self_renewal_allowed:false},
  scope:{capabilities:["payment"],action_types:["payment.send"],assets:[],chains:[],counterparties:[],contracts:[]},
  limits:{},conditions:[],risk:{max_class:"R3",prohibited_reasons:[]},
  device_policy:{allowed_device_ids:[],allowed_device_states:[],allowed_runtime_ids:[],cloud_execution_allowed:false,wearable_execution_allowed:false},
  trust:{trust_protocol_required:true,rev_required:true,aurion_required:false},
  authentication:{},presentation:{},revocation:{status:"ACTIVE",revoked_at:null,revocation_reason:null},usage:{},evidence:{},
  integrity:{mandate_terms_hash:"sha256:"+"a".repeat(64),holder_signature_ref:"sig:holder:mandate"},
  ...overrides
 };
}

test("SVID4AI context binds active SERA agent to governing holder without granting authority",async()=>{
 const runtime=new Svid4AiRuntime(provider());
 const ctx:any=await runtime.resolveAgentContext({holderDid:holder,seraAgentDid:sera,now,contextId:"22222222-2222-4222-8222-222222222222"});
 assert.equal(ctx.governance.governing_holder_did,holder);
 assert.equal(ctx.operator_did,holder);
 assert.equal(ctx.delegation.authority_source,"HOLDER_ISSUED_MANDATE");
 assert.equal(ctx.delegation.self_expansion_allowed,false);
 assert.equal(ctx.authority_effect,"NONE");
 assert.deepEqual(ctx.agent.verification_method_refs,[sera+"#key-1",sera+"#key-2"]);
});

test("wrong governing holder fails closed",async()=>{
 const runtime=new Svid4AiRuntime(provider({governingHolderDid:"did:soul:other"}));
 await assert.rejects(runtime.resolveAgentContext({holderDid:holder,seraAgentDid:sera,now}),(e:any)=>e instanceof Svid4AiRuntimeError&&e.code==="SVID4AI_HOLDER_BINDING_MISMATCH");
});

test("wrong operator fails closed for holder-bound SERA",async()=>{
 const runtime=new Svid4AiRuntime(provider({operatorDid:"did:soul:other"}));
 await assert.rejects(runtime.resolveAgentContext({holderDid:holder,seraAgentDid:sera,now}),(e:any)=>e.code==="SVID4AI_OPERATOR_BINDING_MISMATCH");
});

test("revoked SVID4AI agent fails closed",async()=>{
 const runtime=new Svid4AiRuntime(provider({status:"REVOKED"}));
 await assert.rejects(runtime.resolveAgentContext({holderDid:holder,seraAgentDid:sera,now}),(e:any)=>e.code==="SVID4AI_AGENT_REVOKED");
});

test("mandate binds only to exact holder and SERA agent and never directly authorizes execution",async()=>{
 const runtime=new Svid4AiRuntime(provider());
 const ctx=await runtime.resolveAgentContext({holderDid:holder,seraAgentDid:sera,now});
 const binding=runtime.bindMandate({agentContext:ctx,mandate:mandate(),now});
 assert.equal(binding.authoritySource,"HOLDER_ISSUED_MANDATE");
 assert.equal(binding.executionAuthorized,false);
 assert.equal(binding.requiresExecutionTimeControlPlane,true);
 assert.equal(binding.trustProtocolRequired,true);
 assert.equal(binding.revRequired,true);
});

test("wrong mandate agent fails closed",async()=>{
 const runtime=new Svid4AiRuntime(provider());
 const ctx=await runtime.resolveAgentContext({holderDid:holder,seraAgentDid:sera,now});
 const m=mandate({principal:{holder_did:holder,sera_agent_did:"did:soul:agent:other"}});
 assert.throws(()=>runtime.bindMandate({agentContext:ctx,mandate:m,now}),(e:any)=>e.code==="MANDATE_AGENT_BINDING_MISMATCH");
});

test("expired or revoked mandate cannot bind to SVID4AI authority context",async()=>{
 const runtime=new Svid4AiRuntime(provider());
 const ctx=await runtime.resolveAgentContext({holderDid:holder,seraAgentDid:sera,now});
 assert.throws(()=>runtime.bindMandate({agentContext:ctx,mandate:mandate({revocation:{status:"REVOKED",revoked_at:now,revocation_reason:"holder"}}),now}),(e:any)=>e.code==="MANDATE_NOT_ACTIVE");
 assert.throws(()=>runtime.bindMandate({agentContext:ctx,mandate:mandate({valid_until:"2026-09-20T02:29:59Z"}),now}),(e:any)=>e.code==="MANDATE_EXPIRED");
});
