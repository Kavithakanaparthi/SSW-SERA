import {randomUUID} from "node:crypto";
import {assertContract} from "@soulverse/schema-validation";
import {PostgresPersistence} from "@soulverse/persistence-postgres";
import type {ContextSource,ContextSourceResult} from "@soulverse/context-broker";

export type MemoryDomain="HOLDER_PREFERENCE"|"LANGUAGE_VOICE"|"ENTITY_ALIAS"|"BEHAVIORAL_CONVENIENCE";
export type MemoryProvenance="HOLDER_EXPLICIT"|"HOLDER_CORRECTION"|"SYSTEM_OBSERVED";
export type MemoryRetention="RT1"|"RT2"|"RT3";
export type MemoryContextTier="C1"|"C2"|"C3"|"C4";

export interface MemoryItem{
 schema:"ssw.memory-item.v1";memory_id:string;holder_did:string;sera_agent_did:string;domain:MemoryDomain;memory_key:string;
 value:Record<string,unknown>;provenance:MemoryProvenance;confidence:number;retention_class:MemoryRetention;context_tier:MemoryContextTier;
 external_transmission_allowed:boolean;scope:"HOLDER";device_scope:"ALL_AUTHORIZED_DEVICES"|"CURRENT_DEVICE_ONLY";authority_effect:"NONE";
 status:"ACTIVE"|"DELETED"|"EXPIRED";version:number;created_at:string;updated_at:string;last_confirmed_at:string|null;expires_at:string|null;
}
export class MemoryError extends Error{constructor(public readonly code:string){super(code);}}

const prohibitedKey=/(private[_-]?key|seed[_-]?phrase|signing[_-]?secret|recovery[_-]?secret|raw[_-]?biometric|unrestricted[_-]?signing|password|auth(?:entication)?[_-]?token)/i;
function assertSafeValue(value:unknown,path="value"){
 if(Array.isArray(value)){value.forEach((v,i)=>assertSafeValue(v,`${path}[${i}]`));return;}
 if(value&&typeof value==="object"){
  for(const [key,val] of Object.entries(value as Record<string,unknown>)){
   if(prohibitedKey.test(key))throw new MemoryError("MEMORY_PROHIBITED_MATERIAL");
   assertSafeValue(val,`${path}.${key}`);
  }
 }
}

function rowToMemory(row:any):MemoryItem{
 return assertContract("memory-item",{
  schema:"ssw.memory-item.v1",memory_id:String(row.memory_id),holder_did:row.holder_did,sera_agent_did:row.sera_agent_did,domain:row.domain,memory_key:row.memory_key,
  value:row.value_json??{},provenance:row.provenance,confidence:Number(row.confidence),retention_class:row.retention_class,context_tier:row.context_tier,
  external_transmission_allowed:row.external_transmission_allowed,scope:row.scope,device_scope:row.device_scope,authority_effect:row.authority_effect,
  status:row.status,version:Number(row.version),created_at:new Date(row.created_at).toISOString(),updated_at:new Date(row.updated_at).toISOString(),
  last_confirmed_at:row.last_confirmed_at?new Date(row.last_confirmed_at).toISOString():null,expires_at:row.expires_at?new Date(row.expires_at).toISOString():null
 }) as unknown as MemoryItem;
}

export class SeraMemoryStore{
 constructor(private readonly db:PostgresPersistence){}

 async write(input:{
  memoryId?:string;holderDid:string;seraAgentDid:string;domain:MemoryDomain;memoryKey:string;value:Record<string,unknown>;
  provenance:MemoryProvenance;confidence:number;retentionClass:MemoryRetention;contextTier:MemoryContextTier;externalTransmissionAllowed:boolean;
  deviceScope:"ALL_AUTHORIZED_DEVICES"|"CURRENT_DEVICE_ONLY";now:string;expiresAt?:string|null;
 }):Promise<MemoryItem>{
  assertSafeValue(input.value);
  if(input.provenance==="SYSTEM_OBSERVED"&&input.domain==="ENTITY_ALIAS")throw new MemoryError("ENTITY_ALIAS_REQUIRES_HOLDER_PROVENANCE");
  if(input.provenance==="SYSTEM_OBSERVED"&&input.confidence>0.95)throw new MemoryError("SYSTEM_OBSERVED_CONFIDENCE_TOO_HIGH");
  const existing=await this.db.pool.query(`SELECT * FROM ssw.sera_memory WHERE holder_did=$1 AND sera_agent_did=$2 AND domain=$3 AND memory_key=$4 FOR UPDATE`,
   [input.holderDid,input.seraAgentDid,input.domain,input.memoryKey]);
  if(existing.rowCount){
   const row=existing.rows[0]!;
   const nextVersion=Number(row.version)+1;
   await this.db.transaction(async s=>{
    await (s as any).db.query(`UPDATE ssw.sera_memory SET value_json=$3::jsonb,provenance=$4,confidence=$5,retention_class=$6,context_tier=$7,
      external_transmission_allowed=$8,device_scope=$9,status='ACTIVE',version=$10,updated_at=$11::timestamptz,last_confirmed_at=$11::timestamptz,expires_at=$12::timestamptz
      WHERE memory_id=$1::uuid AND version=$2`,
      [row.memory_id,row.version,JSON.stringify(input.value),input.provenance,input.confidence,input.retentionClass,input.contextTier,input.externalTransmissionAllowed,input.deviceScope,nextVersion,input.now,input.expiresAt??null]);
    await s.enqueueOutbox({eventId:randomUUID(),ownerService:"memory",topic:"MEMORY.ITEM_UPDATED",partitionKey:input.holderDid,payload:{memory_id:String(row.memory_id),domain:input.domain,memory_key:input.memoryKey,version:nextVersion,provenance:input.provenance}});
   });
   return (await this.getById(String(row.memory_id),input.now,true))!;
  }
  const id=input.memoryId??randomUUID();
  await this.db.transaction(async s=>{
   await (s as any).db.query(`INSERT INTO ssw.sera_memory(memory_id,holder_did,sera_agent_did,domain,memory_key,value_json,provenance,confidence,retention_class,context_tier,external_transmission_allowed,device_scope,status,version,created_at,updated_at,last_confirmed_at,expires_at)
    VALUES($1::uuid,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,$12,'ACTIVE',1,$13::timestamptz,$13::timestamptz,$13::timestamptz,$14::timestamptz)`,
    [id,input.holderDid,input.seraAgentDid,input.domain,input.memoryKey,JSON.stringify(input.value),input.provenance,input.confidence,input.retentionClass,input.contextTier,input.externalTransmissionAllowed,input.deviceScope,input.now,input.expiresAt??null]);
   await s.enqueueOutbox({eventId:randomUUID(),ownerService:"memory",topic:"MEMORY.ITEM_CREATED",partitionKey:input.holderDid,payload:{memory_id:id,domain:input.domain,memory_key:input.memoryKey,version:1,provenance:input.provenance}});
  });
  return (await this.getById(id,input.now,true))!;
 }

 async correct(input:{memoryId:string;holderDid:string;value:Record<string,unknown>;confidence:number;now:string;expiresAt?:string|null}){
  const current=await this.getById(input.memoryId,input.now,true);if(!current||current.holder_did!==input.holderDid)throw new MemoryError("MEMORY_NOT_FOUND");
  return await this.write({memoryId:current.memory_id,holderDid:current.holder_did,seraAgentDid:current.sera_agent_did,domain:current.domain,memoryKey:current.memory_key,value:input.value,provenance:"HOLDER_CORRECTION",confidence:input.confidence,retentionClass:current.retention_class,contextTier:current.context_tier,externalTransmissionAllowed:current.external_transmission_allowed,deviceScope:current.device_scope,now:input.now,expiresAt:input.expiresAt??current.expires_at});
 }

 async forget(input:{memoryId:string;holderDid:string;now:string}){
  await this.db.transaction(async s=>{
   const tx=(s as any).db;const r=await tx.query(`UPDATE ssw.sera_memory SET value_json='{}'::jsonb,status='DELETED',version=version+1,updated_at=$3::timestamptz,last_confirmed_at=NULL,expires_at=NULL
    WHERE memory_id=$1::uuid AND holder_did=$2 AND status<>'DELETED' RETURNING memory_id,domain,memory_key,version`,[input.memoryId,input.holderDid,input.now]);
   if(r.rowCount!==1)throw new MemoryError("MEMORY_NOT_FOUND");
   const row=r.rows[0]!;
   await s.enqueueOutbox({eventId:randomUUID(),ownerService:"memory",topic:"MEMORY.ITEM_DELETED",partitionKey:input.holderDid,payload:{memory_id:String(row.memory_id),domain:row.domain,memory_key:row.memory_key,version:Number(row.version)}});
  });
 }

 async getById(memoryId:string,now:string,includeInactive=false):Promise<MemoryItem|null>{
  const r=await this.db.pool.query(`SELECT * FROM ssw.sera_memory WHERE memory_id=$1::uuid`,[memoryId]);if(!r.rowCount)return null;
  const item=rowToMemory(r.rows[0]);
  if(!includeInactive&&item.status!=="ACTIVE")return null;
  if(!includeInactive&&item.expires_at&&Date.parse(item.expires_at)<=Date.parse(now))return null;
  return item;
 }

 async getByKey(input:{holderDid:string;seraAgentDid:string;domain:MemoryDomain;memoryKey:string;now:string}):Promise<MemoryItem|null>{
  const r=await this.db.pool.query(`SELECT * FROM ssw.sera_memory WHERE holder_did=$1 AND sera_agent_did=$2 AND domain=$3 AND memory_key=$4 AND status='ACTIVE'
    AND (expires_at IS NULL OR expires_at>$5::timestamptz)`,[input.holderDid,input.seraAgentDid,input.domain,input.memoryKey,input.now]);
  return r.rowCount?rowToMemory(r.rows[0]):null;
 }

 async inspect(input:{holderDid:string;seraAgentDid:string;domain?:MemoryDomain;now:string}):Promise<MemoryItem[]>{
  const values:any[]=[input.holderDid,input.seraAgentDid,input.now];let sql=`SELECT * FROM ssw.sera_memory WHERE holder_did=$1 AND sera_agent_did=$2 AND status='ACTIVE' AND (expires_at IS NULL OR expires_at>$3::timestamptz)`;
  if(input.domain){values.push(input.domain);sql+=` AND domain=$4`;}sql+=` ORDER BY domain,memory_key`;
  const r=await this.db.pool.query(sql,values);return r.rows.map(rowToMemory);
 }

 async expire(now:string){
  return await this.db.transaction(async s=>{
   const tx=(s as any).db;const r=await tx.query(`UPDATE ssw.sera_memory SET status='EXPIRED',value_json='{}'::jsonb,version=version+1,updated_at=$1::timestamptz
    WHERE status='ACTIVE' AND expires_at IS NOT NULL AND expires_at<=$1::timestamptz RETURNING memory_id,holder_did,domain,memory_key,version`,[now]);
   for(const row of r.rows)await s.enqueueOutbox({eventId:randomUUID(),ownerService:"memory",topic:"MEMORY.ITEM_EXPIRED",partitionKey:row.holder_did,payload:{memory_id:String(row.memory_id),domain:row.domain,memory_key:row.memory_key,version:Number(row.version)}});
   return r.rowCount??0;
  });
 }
}

export class MemoryContextSource implements ContextSource{
 constructor(private readonly memory:SeraMemoryStore,private readonly domain:MemoryDomain,private readonly memoryKey:string){}
 async fetch(input:{holderDid:string;seraAgentDid:string;contextKey:string;purpose:string;now:string}):Promise<ContextSourceResult|null>{
  const item=await this.memory.getByKey({holderDid:input.holderDid,seraAgentDid:input.seraAgentDid,domain:this.domain,memoryKey:this.memoryKey,now:input.now});
  if(!item)return null;
  const provenance=item.provenance==="SYSTEM_OBSERVED"?"SYSTEM_OBSERVED":item.provenance;
  return{contextKey:input.contextKey,contextTier:item.context_tier,value:item.value,sourceType:"MEMORY",sourceRef:`memory:${item.memory_id}:v${item.version}`,provenance,observedAt:item.updated_at,validUntil:item.expires_at,confidence:item.confidence,retentionClass:item.retention_class,externalTransmissionAllowed:item.external_transmission_allowed};
 }
}
