import {randomUUID} from "node:crypto";
import {assertContract} from "@soulverse/schema-validation";
import type {ContextSource,ContextSourceResult} from "@soulverse/context-broker";

export type Veracity="CONFIRMED"|"HIGH_CONFIDENCE"|"CORROBORATED"|"UNCONFIRMED"|"CONFLICTING"|"STALE";
export type AssetRiskStatus="KNOWN_SAFE"|"LOW_RISK"|"UNKNOWN"|"SUSPICIOUS"|"HIGH_RISK"|"KNOWN_MALICIOUS";
export class ExternalContextError extends Error{constructor(public readonly code:string){super(code);}}

export function sanitizeExternalText(value:string,maxLength=2000){
 const noScript=value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ");
 const noTags=noScript.replace(/<[^>]+>/g," ");
 const noControl=noTags.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g," ");
 return noControl.replace(/\s+/g," ").trim().slice(0,maxLength);
}

export interface NewsProviderRecord{
 sourceId:string;sourceRef:string;subject:{type:string;id:string};headline:string;excerpt:string;entityRefs:string[];
 confidence:number;veracity:Veracity;publishedAt:string;validUntil:string|null;
}
export interface NewsProviderAdapter{search(input:{query:string;now:string}):Promise<NewsProviderRecord[]>;}

export interface ProfessionalProviderRecord{
 sourceId:string;sourceRef:string;subject:{type:string;id:string};displayName:string;organization:string|null;role:string|null;entityRefs:string[];
 confidence:number;veracity:Veracity;observedAt:string;validUntil:string|null;platformVerified:boolean;
}
export interface ProfessionalContextProviderAdapter{lookup(input:{entityRef:string;now:string}):Promise<ProfessionalProviderRecord|null>;}

export interface AssetRiskProviderRecord{
 sourceId:string;sourceRef:string;assetId:string;chainId:string;status:AssetRiskStatus;reasonCodes:string[];evidenceRefs:string[];
 confidence:number;veracity:Veracity;observedAt:string;validUntil:string|null;
}
export interface AssetRiskProviderAdapter{get(input:{assetId:string;chainId:string;now:string}):Promise<AssetRiskProviderRecord|null>;}

export function normalizeNewsRecord(input:NewsProviderRecord,createdAt:string,recordId=randomUUID()){
 return assertContract("external-context-record",{
  schema:"ssw.external-context-record.v1",record_id:recordId,category:"NEWS",
  source:{source_id:input.sourceId,source_class:"EXTERNAL_NEWS",confidence:input.confidence,veracity:input.veracity,source_ref:input.sourceRef},
  subject:input.subject,
  data:{headline:sanitizeExternalText(input.headline,512),excerpt:sanitizeExternalText(input.excerpt,2000),entity_refs:[...new Set(input.entityRefs)].slice(0,64),published_at:input.publishedAt},
  content_role:"UNTRUSTED_EXTERNAL_TEXT",identity_authority:false,authority_effect:"NONE",observed_at:input.publishedAt,valid_until:input.validUntil,created_at:createdAt
 });
}

export function normalizeProfessionalRecord(input:ProfessionalProviderRecord,createdAt:string,recordId=randomUUID()){
 return assertContract("external-context-record",{
  schema:"ssw.external-context-record.v1",record_id:recordId,category:"PROFESSIONAL_CONTEXT",
  source:{source_id:input.sourceId,source_class:"EXTERNAL_PROFESSIONAL",confidence:input.confidence,veracity:input.veracity,source_ref:input.sourceRef},
  subject:input.subject,
  data:{display_name:sanitizeExternalText(input.displayName,256),organization:input.organization?sanitizeExternalText(input.organization,256):null,role:input.role?sanitizeExternalText(input.role,256):null,entity_refs:[...new Set(input.entityRefs)].slice(0,64),platform_verified:input.platformVerified,identity_authority:false},
  content_role:"UNTRUSTED_EXTERNAL_TEXT",identity_authority:false,authority_effect:"NONE",observed_at:input.observedAt,valid_until:input.validUntil,created_at:createdAt
 });
}

export function normalizeAssetRiskRecord(input:AssetRiskProviderRecord,createdAt:string,recordId=randomUUID()){
 return assertContract("external-context-record",{
  schema:"ssw.external-context-record.v1",record_id:recordId,category:"ASSET_RISK",
  source:{source_id:input.sourceId,source_class:"SECURITY_ENGINE",confidence:input.confidence,veracity:input.veracity,source_ref:input.sourceRef},
  subject:{type:"asset",id:`${input.chainId}:${input.assetId}`},
  data:{asset_id:input.assetId,chain_id:input.chainId,status:input.status,reason_codes:[...new Set(input.reasonCodes)].slice(0,64),evidence_refs:[...new Set(input.evidenceRefs)].slice(0,64)},
  content_role:"STRUCTURED_RISK_SIGNAL",identity_authority:false,authority_effect:"NONE",observed_at:input.observedAt,valid_until:input.validUntil,created_at:createdAt
 });
}

export class NewsContextSource implements ContextSource{
 constructor(private readonly provider:NewsProviderAdapter,private readonly query:string,private readonly maxRecords=5){}
 async fetch(input:{holderDid:string;seraAgentDid:string;contextKey:string;purpose:string;now:string}):Promise<ContextSourceResult|null>{
  const records=(await this.provider.search({query:this.query,now:input.now})).slice(0,this.maxRecords).map((x,i)=>normalizeNewsRecord(x,input.now,`00000000-0000-4000-8000-${String(i+1).padStart(12,"0")}`));
  if(!records.length)return null;
  const valid=records.filter((r:any)=>!r.valid_until||Date.parse(r.valid_until)>Date.parse(input.now));if(!valid.length)return null;
  const confidence=Math.min(...valid.map((r:any)=>r.source.confidence));
  return{contextKey:input.contextKey,contextTier:"C1",value:{records:valid},sourceType:"EXTERNAL",sourceRef:`news:${this.query}`,provenance:"EXTERNAL_IMPORTED",observedAt:input.now,validUntil:null,confidence,retentionClass:"RT1",externalTransmissionAllowed:true};
 }
}

export class ProfessionalContextSource implements ContextSource{
 constructor(private readonly provider:ProfessionalContextProviderAdapter,private readonly entityRef:string){}
 async fetch(input:{holderDid:string;seraAgentDid:string;contextKey:string;purpose:string;now:string}):Promise<ContextSourceResult|null>{
  const raw=await this.provider.lookup({entityRef:this.entityRef,now:input.now});if(!raw)return null;const r:any=normalizeProfessionalRecord(raw,input.now);
  if(r.valid_until&&Date.parse(r.valid_until)<=Date.parse(input.now))return null;
  return{contextKey:input.contextKey,contextTier:"C2",value:{record:r},sourceType:"EXTERNAL",sourceRef:r.source.source_ref,provenance:"EXTERNAL_IMPORTED",observedAt:r.observed_at,validUntil:r.valid_until,confidence:r.source.confidence,retentionClass:"RT1",externalTransmissionAllowed:true};
 }
}

export class AssetRiskContextSource implements ContextSource{
 constructor(private readonly provider:AssetRiskProviderAdapter,private readonly assetId:string,private readonly chainId:string){}
 async fetch(input:{holderDid:string;seraAgentDid:string;contextKey:string;purpose:string;now:string}):Promise<ContextSourceResult|null>{
  const raw=await this.provider.get({assetId:this.assetId,chainId:this.chainId,now:input.now});if(!raw)return null;const r:any=normalizeAssetRiskRecord(raw,input.now);
  if(r.valid_until&&Date.parse(r.valid_until)<=Date.parse(input.now))return null;
  return{contextKey:input.contextKey,contextTier:"C2",value:{record:r},sourceType:"SECURITY",sourceRef:r.source.source_ref,provenance:"AUTHORITATIVE_STORE",observedAt:r.observed_at,validUntil:r.valid_until,confidence:r.source.confidence,retentionClass:"RT1",externalTransmissionAllowed:false};
 }
}
