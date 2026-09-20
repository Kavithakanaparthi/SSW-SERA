import {randomUUID} from "node:crypto";
import {assertContract} from "@soulverse/schema-validation";
import {sha256DomainSeparated,type CanonicalJson} from "@soulverse/canonicalization";
import {PostgresPersistence} from "@soulverse/persistence-postgres";

export type ContextTier="C0"|"C1"|"C2"|"C3"|"C4"|"C5";
export type RetentionClass="RT0"|"RT1"|"RT2"|"RT3"|"RT4"|"RT5";
const tierRank:Record<ContextTier,number>={C0:0,C1:1,C2:2,C3:3,C4:4,C5:5};
const PROHIBITED_KEYS=new Set(["private_key","seed_phrase","signing_secret","recovery_secret","raw_biometric_template","unrestricted_signing_handle"]);

export interface ContextSourceResult{
 contextKey:string;contextTier:ContextTier;value:Record<string,unknown>;
 sourceType:"WALLET_STATE"|"MEMORY"|"EXTERNAL"|"SECURITY"|"DEVICE"|"CREDENTIAL"|"OTHER";
 sourceRef:string;provenance:"HOLDER_EXPLICIT"|"HOLDER_CORRECTION"|"SYSTEM_OBSERVED"|"AUTHORITATIVE_STORE"|"EXTERNAL_IMPORTED";
 observedAt:string;validUntil:string|null;confidence:number;retentionClass:RetentionClass;externalTransmissionAllowed:boolean;
}
export interface ContextSource{
 fetch(input:{holderDid:string;seraAgentDid:string;contextKey:string;purpose:string;now:string}):Promise<ContextSourceResult|null>;
}
export class ContextSourceRegistry{
 private readonly sources=new Map<string,ContextSource>();
 register(contextKey:string,source:ContextSource){if(this.sources.has(contextKey))throw new Error("CONTEXT_SOURCE_ALREADY_REGISTERED");this.sources.set(contextKey,source);}
 get(contextKey:string){return this.sources.get(contextKey)??null;}
}
export interface ContextKeyPolicy{context_key:string;required:boolean;max_tier:Exclude<ContextTier,"C5">;allowed_fields:string[];}
export interface ContextPolicy{capability:string;max_tier:Exclude<ContextTier,"C5">;max_cloud_tier:Exclude<ContextTier,"C5">;retention_class:RetentionClass;keys:ContextKeyPolicy[];}
export class ContextPolicyRegistry{
 private readonly policies=new Map<string,ContextPolicy>();
 constructor(policies:readonly ContextPolicy[]){for(const p of policies)this.policies.set(p.capability,p);}
 get(capability:string){return this.policies.get(capability)??null;}
}
export class ContextBrokerError extends Error{constructor(public readonly code:string){super(code);}}

function minimize(value:Record<string,unknown>,allowedFields:readonly string[]){
 const out:Record<string,unknown>={};for(const field of allowedFields)if(Object.prototype.hasOwnProperty.call(value,field))out[field]=structuredClone(value[field]);return out;
}

export class PostgresContextAuditStore{
 constructor(private readonly db:PostgresPersistence){}
 async persist(manifest:any){
  const metadata={
   schema:"ssw.context-manifest-audit.v1",manifest_id:manifest.manifest_id,request_id:manifest.request_id,holder_did:manifest.holder_did,sera_agent_did:manifest.sera_agent_did,
   capability:manifest.capability,purpose:manifest.purpose,model_location:manifest.model_location,status:manifest.status,manifest_hash:manifest.integrity.manifest_hash,
   items:manifest.items.map((i:any)=>({context_key:i.context_key,context_tier:i.context_tier,source_type:i.source_type,source_ref:i.source_ref,provenance:i.provenance,observed_at:i.observed_at,valid_until:i.valid_until,confidence:i.confidence,retention_class:i.retention_class,external_transmission_allowed:i.external_transmission_allowed})),
   excluded:manifest.excluded,created_at:manifest.created_at,expires_at:manifest.expires_at
  };
  const stateHash=sha256DomainSeparated("SSW:CONTEXT_AUDIT:V1",metadata as unknown as CanonicalJson).hash;
  await this.db.transaction(async s=>{
   await s.saveRecord({ownerService:"context",recordType:"context-manifest-audit",recordId:manifest.manifest_id,status:manifest.status,state:metadata,stateHash,expiresAt:manifest.expires_at});
   await s.enqueueOutbox({eventId:randomUUID(),ownerService:"context",topic:"CONTEXT.MANIFEST_CREATED",partitionKey:manifest.holder_did,payload:{manifest_id:manifest.manifest_id,request_id:manifest.request_id,capability:manifest.capability,status:manifest.status,manifest_hash:manifest.integrity.manifest_hash,item_keys:metadata.items.map((i:any)=>i.context_key),excluded:manifest.excluded}});
  });
 }
}

export class ContextBroker{
 constructor(private readonly policies:ContextPolicyRegistry,private readonly sources:ContextSourceRegistry,private readonly audit?:PostgresContextAuditStore){}
 async resolve(requestInput:unknown,now:string,manifestId=randomUUID()){
  const request=assertContract("context-request",requestInput) as any;
  if(Date.parse(request.expires_at)<=Date.parse(now))throw new ContextBrokerError("CONTEXT_REQUEST_EXPIRED");
  const policy=this.policies.get(request.capability);if(!policy)throw new ContextBrokerError("CONTEXT_CAPABILITY_POLICY_NOT_FOUND");
  const requested=new Set<string>(request.requested_context);
  const policyMap=new Map(policy.keys.map(k=>[k.context_key,k]));
  const excluded:{context_key:string;reason:string}[]=[];const items:any[]=[];

  for(const key of requested){
   if(PROHIBITED_KEYS.has(key)||request.prohibited_context.includes(key)){excluded.push({context_key:key,reason:"PROHIBITED"});continue;}
   const keyPolicy=policyMap.get(key);if(!keyPolicy){excluded.push({context_key:key,reason:"NOT_ALLOWED"});continue;}
   if(request.model_location==="NONE"){excluded.push({context_key:key,reason:"TIER_EXCEEDED"});continue;}
   const source=this.sources.get(key);if(!source){excluded.push({context_key:key,reason:"SOURCE_MISSING"});continue;}
   const sourceResult=await source.fetch({holderDid:request.holder_did,seraAgentDid:request.sera_agent_did,contextKey:key,purpose:request.purpose,now});
   if(!sourceResult){excluded.push({context_key:key,reason:"SOURCE_MISSING"});continue;}
   if(sourceResult.contextTier==="C5"||tierRank[sourceResult.contextTier]>tierRank[keyPolicy.max_tier]||tierRank[sourceResult.contextTier]>tierRank[policy.max_tier]){excluded.push({context_key:key,reason:sourceResult.contextTier==="C5"?"PROHIBITED":"TIER_EXCEEDED"});continue;}
   if(sourceResult.validUntil&&Date.parse(sourceResult.validUntil)<=Date.parse(now)){excluded.push({context_key:key,reason:"STALE"});continue;}
   if(request.model_location==="PROTECTED_CLOUD"&&(tierRank[sourceResult.contextTier]>tierRank[policy.max_cloud_tier]||!sourceResult.externalTransmissionAllowed||!request.external_transmission)){excluded.push({context_key:key,reason:"CLOUD_TRANSMISSION_DENIED"});continue;}
   const value=minimize(sourceResult.value,keyPolicy.allowed_fields);if(Object.keys(value).length===0){excluded.push({context_key:key,reason:"FIELD_POLICY_EMPTY"});continue;}
   items.push({context_key:key,context_tier:sourceResult.contextTier,value,source_type:sourceResult.sourceType,source_ref:sourceResult.sourceRef,provenance:sourceResult.provenance,observed_at:sourceResult.observedAt,valid_until:sourceResult.validUntil,confidence:sourceResult.confidence,retention_class:sourceResult.retentionClass,external_transmission_allowed:sourceResult.externalTransmissionAllowed});
  }

  const unauthorized=excluded.some(x=>x.reason==="PROHIBITED"||x.reason==="NOT_ALLOWED");
  const missingRequired=policy.keys.filter(k=>k.required&&requested.has(k.context_key)).some(k=>excluded.some(x=>x.context_key===k.context_key));
  const omittedRequired=policy.keys.filter(k=>k.required).some(k=>!requested.has(k.context_key));
  const status=unauthorized?"BLOCKED":(missingRequired||omittedRequired)?"INCOMPLETE":"COMPLETE";
  const expiresAt=new Date(Math.min(Date.parse(request.expires_at),...items.map(i=>i.valid_until?Date.parse(i.valid_until):Date.parse(request.expires_at)))).toISOString();
  const core={schema:"ssw.context-manifest.v1",manifest_id:manifestId,request_id:request.request_id,holder_did:request.holder_did,sera_agent_did:request.sera_agent_did,capability:request.capability,purpose:request.purpose,model_location:request.model_location,status,items,excluded,created_at:now,expires_at:expiresAt};
  const manifestHash=sha256DomainSeparated("SSW:CONTEXT_MANIFEST:V1",core as unknown as CanonicalJson).hash;
  const manifest=assertContract("context-manifest",{...core,integrity:{manifest_hash:manifestHash}});
  if(this.audit)await this.audit.persist(manifest);
  return manifest;
 }
}
