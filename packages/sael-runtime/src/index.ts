import {assertContract} from "@soulverse/schema-validation";
import {sha256DomainSeparated,type CanonicalJson} from "@soulverse/canonicalization";
export const SAEL_EVENT_HASH_DOMAIN="SSW:SAEL:EVENT:V1";

export interface SaelEvent{schema:"ssw.sael-event.v1";event_id:string;stream_id:string;event_type:string;event_version:number;occurred_at:string;
 correlation:Record<string,unknown>;principal:Record<string,unknown>;origin:Record<string,unknown>;classification:Record<string,unknown>;
 payload:Record<string,unknown>;privacy:Record<string,unknown>;previous_event_hash:string|null;}
export interface SaelIngestResult{schema:"ssw.sael-ingest-result.v1";event_id:string;accepted:boolean;sequence:number;event_hash:string;durability:"COMMITTED";recorded_at:string;}
export interface SaelReservation{reservationId:string;actionId:string;expectedEventTypes:string[];expiresAt:string;completed:boolean;}

export class InMemorySaelStore{
 private streams=new Map<string,{event:SaelEvent;sequence:number;hash:string}[]>();
 private idem=new Map<string,{hash:string;result:SaelIngestResult}>();
 private reservations=new Map<string,SaelReservation>();
 constructor(private producerPrefixes:Record<string,readonly string[]>){}

 ingest(input:{producerId:string;event:SaelEvent;idempotencyKey:string;recordedAt:string}):SaelIngestResult{
  const event=assertContract("sael-event",input.event) as SaelEvent;
  const allowed=this.producerPrefixes[input.producerId]??[];
  if(!allowed.some(p=>event.event_type.startsWith(p)))throw new Error("SAEL_PRODUCER_NOT_AUTHORIZED");
  const hash=sha256DomainSeparated(SAEL_EVENT_HASH_DOMAIN,event as unknown as CanonicalJson).hash;
  const existing=this.idem.get(input.idempotencyKey);
  if(existing){if(existing.hash!==hash)throw new Error("IDEMPOTENCY_CONFLICT");return existing.result;}
  const list=this.streams.get(event.stream_id)??[];const previous=list.length?list[list.length-1]!.hash:null;
  if(event.previous_event_hash!==previous)throw new Error("SAEL_PREVIOUS_HASH_MISMATCH");
  const result:SaelIngestResult={schema:"ssw.sael-ingest-result.v1",event_id:event.event_id,accepted:true,sequence:list.length+1,event_hash:hash,durability:"COMMITTED",recorded_at:input.recordedAt};
  assertContract("sael-ingest-result",result);
  list.push({event:structuredClone(event),sequence:result.sequence,hash});this.streams.set(event.stream_id,list);this.idem.set(input.idempotencyKey,{hash,result});
  for(const r of this.reservations.values()){if(!r.completed&&r.actionId===(event.correlation as any).action_id){const types=new Set(list.filter(x=>(x.event.correlation as any).action_id===r.actionId).map(x=>x.event.event_type));r.completed=r.expectedEventTypes.every(t=>types.has(t));}}
  return result;
 }
 reserve(input:{reservationId:string;actionId:string;expectedEventTypes:string[];expiresAt:string}){const r:SaelReservation={...input,completed:false};this.reservations.set(r.reservationId,r);return structuredClone(r);}
 getReservation(id:string){const r=this.reservations.get(id);return r?structuredClone(r):null;}
 verifyStream(streamId:string):boolean{const list=this.streams.get(streamId)??[];let previous:string|null=null;for(const row of list){if(row.event.previous_event_hash!==previous)return false;const hash=sha256DomainSeparated(SAEL_EVENT_HASH_DOMAIN,row.event as unknown as CanonicalJson).hash;if(hash!==row.hash)return false;previous=row.hash;}return true;}
 query(input:{streamId:string;maxDisclosure:"L0"|"L1"|"L2"|"L3"|"L4";requestedDisclosure:"L0"|"L1"|"L2"|"L3"|"L4";eventTypePrefix?:string}){
  const rank={L0:0,L1:1,L2:2,L3:3,L4:4};if(rank[input.requestedDisclosure]>rank[input.maxDisclosure])throw new Error("SAEL_DISCLOSURE_NOT_AUTHORIZED");
  return (this.streams.get(input.streamId)??[]).filter(x=>!input.eventTypePrefix||x.event.event_type.startsWith(input.eventTypePrefix)).map(x=>structuredClone(x));
 }
}
