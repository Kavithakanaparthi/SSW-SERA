import test from "node:test";
import assert from "node:assert/strict";
import {SoulIdRuntime,SoulIdRuntimeError,SoulIdHolderContextSource,type SoulIdProvider} from "../../packages/recovery-runtime/src/soul-id-runtime.js";

const now="2026-09-20T02:00:00Z";
const holder="did:soul:holder-alice";
const sera="did:soul:agent:sera-alice";

function provider(overrides?:Partial<{
 soul:any;
 wallet:any;
}>):SoulIdProvider{
 const soul=overrides?.soul??{
  holderDid:holder,status:"ACTIVE",didDocumentRef:"did-doc:holder-alice",documentVersion:7,
  recoveryPolicyRef:"recovery-policy:soulscan:v3",verificationMethodRefs:["did:soul:holder-alice#key-2","did:soul:holder-alice#key-1","did:soul:holder-alice#key-1"],
  integrityRef:"sig:soul-id:7",observedAt:"2026-09-20T01:59:00Z",validUntil:"2026-09-20T02:05:00Z"
 };
 const wallet=overrides?.wallet??{
  walletContextRef:"ssw:wallet-context:alice",holderDid:holder,authorizedSeraAgentDid:sera,relationshipStatus:"ACTIVE",
  bindingRef:"soul-id-sera-binding:alice:3",bindingVersion:3,observedAt:"2026-09-20T01:59:30Z",validUntil:"2026-09-20T02:04:00Z"
 };
 return{
  resolveHolderDid:async()=>soul,
  resolveWalletIdentity:async()=>wallet
 };
}

test("Soul ID establishes wallet ownership root and verified SERA governance context",async()=>{
 const runtime=new SoulIdRuntime(provider());
 const c:any=await runtime.resolveHolderContext({holderDid:holder,seraAgentDid:sera,now,contextId:"11111111-1111-4111-8111-111111111111"});
 assert.equal(c.continuity.wallet_ownership_root,"SOUL_ID");
 assert.equal(c.continuity.device_ownership_root,false);
 assert.equal(c.sera_governance.status,"VERIFIED");
 assert.equal(c.authority_effect,"NONE");
 assert.deepEqual(c.soul_id.verification_method_refs,["did:soul:holder-alice#key-1","did:soul:holder-alice#key-2"]);
});

test("wrong Holder DID returned by provider fails closed",async()=>{
 const runtime=new SoulIdRuntime(provider({soul:{holderDid:"did:soul:other",status:"ACTIVE",didDocumentRef:"d",documentVersion:1,recoveryPolicyRef:null,verificationMethodRefs:[],integrityRef:"i",observedAt:"2026-09-20T01:59:00Z",validUntil:"2026-09-20T02:05:00Z"}}));
 await assert.rejects(runtime.resolveHolderContext({holderDid:holder,seraAgentDid:sera,now}),(e:any)=>e instanceof SoulIdRuntimeError&&e.code==="SOUL_ID_BINDING_MISMATCH");
});

test("revoked Soul ID fails closed",async()=>{
 const base=(provider() as any);
 const soul={holderDid:holder,status:"REVOKED",didDocumentRef:"d",documentVersion:1,recoveryPolicyRef:null,verificationMethodRefs:[],integrityRef:"i",observedAt:"2026-09-20T01:59:00Z",validUntil:"2026-09-20T02:05:00Z"};
 const runtime=new SoulIdRuntime(provider({soul}));
 await assert.rejects(runtime.resolveHolderContext({holderDid:holder,seraAgentDid:sera,now}),(e:any)=>e.code==="SOUL_ID_REVOKED");
});

test("wrong authorized SERA Agent DID fails governance binding",async()=>{
 const wallet={walletContextRef:"w",holderDid:holder,authorizedSeraAgentDid:"did:soul:agent:other",relationshipStatus:"ACTIVE",bindingRef:"b",bindingVersion:1,observedAt:"2026-09-20T01:59:00Z",validUntil:"2026-09-20T02:05:00Z"};
 const runtime=new SoulIdRuntime(provider({wallet}));
 await assert.rejects(runtime.resolveHolderContext({holderDid:holder,seraAgentDid:sera,now}),(e:any)=>e.code==="SERA_GOVERNANCE_BINDING_MISMATCH");
});

test("stale Soul ID context fails closed",async()=>{
 const soul={holderDid:holder,status:"ACTIVE",didDocumentRef:"d",documentVersion:1,recoveryPolicyRef:null,verificationMethodRefs:[],integrityRef:"i",observedAt:"2026-09-20T01:50:00Z",validUntil:"2026-09-20T01:59:59Z"};
 const runtime=new SoulIdRuntime(provider({soul}));
 await assert.rejects(runtime.resolveHolderContext({holderDid:holder,seraAgentDid:sera,now}),(e:any)=>e.code==="SOUL_ID_CONTEXT_STALE");
});

test("Context Broker source exposes minimized non-authority identity context",async()=>{
 const source=new SoulIdHolderContextSource(new SoulIdRuntime(provider()));
 const c=await source.fetch({holderDid:holder,seraAgentDid:sera,contextKey:"holder_identity",purpose:"wallet-context",now});
 assert.equal(c.contextTier,"C2");
 assert.equal(c.externalTransmissionAllowed,false);
 assert.equal(c.value.authority_effect,"NONE");
 assert.equal("verification_method_refs" in c.value,false);
});
