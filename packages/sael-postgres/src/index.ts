import {createHash} from "node:crypto";
import {assertContract} from "@soulverse/schema-validation";
import {sha256DomainSeparated,type CanonicalJson} from "@soulverse/canonicalization";
import {PostgresPersistence} from "@soulverse/persistence-postgres";
import {SAEL_EVENT_HASH_DOMAIN,type SaelEvent,type SaelIngestResult} from "@soulverse/sael-runtime";

const CHECKPOINT_DOMAIN="SSW:SAEL:CHECKPOINT:V1";
const MERKLE_DOMAIN=Buffer.from("SSW:SAEL:MERKLE:V1\0","utf8");

export class SaelPersistenceError extends Error{constructor(public readonly code:string){super(code);}}

export interface SaelCheckpointSigner{
 sign(input:{checkpointHash:string;streamId:string;fromSequence:number;toSequence:number;rootHash:string}):Promise<{signatureRef:string}>;
}
export interface SaelArchiveWriter{
 write(input:{checkpoint:SaelCheckpointRecord;events:readonly SaelStoredEvent[];manifestHash:string}):Promise<{archiveRef:string;archiveHash:string;encryptionProfile:string}>;
}
export interface SaelStoredEvent{
 stream_id:string;sequence:number;event_id:string;producer_id:string;idempotency_key:string;event_type:string;event_hash:string;
 previous_event_hash:string|null;event_json:SaelEvent;occurred_at:string;recorded_at:string;
}
export interface SaelCheckpointRecord{
 checkpoint_id:string;stream_id:string;from_sequence:number;to_sequence:number;root_hash:string;checkpoint_hash:string;
 previous_checkpoint_hash:string|null;signature_ref:string;created_at:string;
}

function hashPair(left:Buffer,right:Buffer){
 return createHash("sha256").update(MERKLE_DOMAIN).update(left).update(right).digest();
}
export function merkleRoot(eventHashes:readonly string[]):string{
 if(eventHashes.length===0)throw new SaelPersistenceError("SAEL_CHECKPOINT_EMPTY_RANGE");
 let layer=eventHashes.map(h=>Buffer.from(h.replace(/^sha256:/,""),"hex"));
 while(layer.length>1){
  const next:Buffer[]=[];
  for(let i=0;i<layer.length;i+=2){const left=layer[i]!;const right=layer[i+1]??left;next.push(hashPair(left,right));}
  layer=next;
 }
 return"sha256:"+layer[0]!.toString("hex");
}

export class PostgresSaelStore{
 constructor(private readonly db:PostgresPersistence,private readonly producerPrefixes:Readonly<Record<string,readonly string[]>>){}

 async ingest(input:{producerId:string;event:SaelEvent;idempotencyKey:string;recordedAt:string}):Promise<SaelIngestResult>{
  const event=assertContract("sael-event",input.event) as unknown as SaelEvent;
  const allowed=this.producerPrefixes[input.producerId]??[];
  if(!allowed.some(prefix=>event.event_type.startsWith(prefix)))throw new SaelPersistenceError("SAEL_PRODUCER_NOT_AUTHORIZED");
  const eventHash=sha256DomainSeparated(SAEL_EVENT_HASH_DOMAIN,event as unknown as CanonicalJson).hash;

  return await this.db.transaction(async session=>{
   const tx=(session as any).db as {query:(text:string,values?:readonly unknown[])=>Promise<{rows:any[];rowCount:number|null}>};
   const existing=await tx.query(`SELECT event_hash,sequence,event_id,recorded_at FROM ssw.sael_event WHERE producer_id=$1 AND idempotency_key=$2`,[input.producerId,input.idempotencyKey]);
   if(existing.rowCount){
    const row=existing.rows[0]!;
    if(row.event_hash!==eventHash)throw new SaelPersistenceError("IDEMPOTENCY_CONFLICT");
    return assertContract("sael-ingest-result",{schema:"ssw.sael-ingest-result.v1",event_id:row.event_id,accepted:true,sequence:Number(row.sequence),event_hash:row.event_hash,durability:"COMMITTED",recorded_at:new Date(row.recorded_at).toISOString()}) as unknown as SaelIngestResult;
   }
   const byEvent=await tx.query(`SELECT event_hash,sequence,recorded_at FROM ssw.sael_event WHERE event_id=$1::uuid`,[event.event_id]);
   if(byEvent.rowCount){
    const row=byEvent.rows[0]!;
    if(row.event_hash!==eventHash)throw new SaelPersistenceError("SAEL_EVENT_ID_CONFLICT");
    return assertContract("sael-ingest-result",{schema:"ssw.sael-ingest-result.v1",event_id:event.event_id,accepted:true,sequence:Number(row.sequence),event_hash:row.event_hash,durability:"COMMITTED",recorded_at:new Date(row.recorded_at).toISOString()}) as unknown as SaelIngestResult;
   }

   await tx.query(`INSERT INTO ssw.sael_stream_head(stream_id) VALUES($1) ON CONFLICT DO NOTHING`,[event.stream_id]);
   const headResult=await tx.query(`SELECT sequence,event_hash FROM ssw.sael_stream_head WHERE stream_id=$1 FOR UPDATE`,[event.stream_id]);
   const head=headResult.rows[0]!;
   const previous=head.event_hash??null;
   if(event.previous_event_hash!==previous)throw new SaelPersistenceError("SAEL_PREVIOUS_HASH_MISMATCH");
   const sequence=Number(head.sequence)+1;

   await tx.query(`INSERT INTO ssw.sael_event(stream_id,sequence,event_id,producer_id,idempotency_key,event_type,event_hash,previous_event_hash,event_json,occurred_at,recorded_at)
     VALUES($1,$2,$3::uuid,$4,$5,$6,$7,$8,$9::jsonb,$10::timestamptz,$11::timestamptz)`,
     [event.stream_id,sequence,event.event_id,input.producerId,input.idempotencyKey,event.event_type,eventHash,event.previous_event_hash,JSON.stringify(event),event.occurred_at,input.recordedAt]);
   await tx.query(`UPDATE ssw.sael_stream_head SET sequence=$2,event_hash=$3,updated_at=now() WHERE stream_id=$1`,[event.stream_id,sequence,eventHash]);

   const actionId=(event.correlation as any).action_id;
   if(typeof actionId==="string"){
    const reservations=await tx.query(`SELECT reservation_id,expected_event_types FROM ssw.sael_reservation WHERE action_id=$1::uuid AND completed=false AND expires_at>$2::timestamptz FOR UPDATE`,[actionId,input.recordedAt]);
    if(reservations.rowCount){
     const eventTypes=await tx.query(`SELECT DISTINCT event_type FROM ssw.sael_event WHERE (event_json->'correlation'->>'action_id')=$1`,[actionId]);
     const types=new Set(eventTypes.rows.map((r:any)=>r.event_type));
     for(const reservation of reservations.rows){
      const expected=reservation.expected_event_types as string[];
      if(expected.every(t=>types.has(t)))await tx.query(`UPDATE ssw.sael_reservation SET completed=true,completed_at=$2::timestamptz WHERE reservation_id=$1::uuid`,[reservation.reservation_id,input.recordedAt]);
     }
    }
   }

   const result={schema:"ssw.sael-ingest-result.v1",event_id:event.event_id,accepted:true,sequence,event_hash:eventHash,durability:"COMMITTED",recorded_at:input.recordedAt};
   return assertContract("sael-ingest-result",result) as unknown as SaelIngestResult;
  });
 }

 async reserve(input:{reservationId:string;actionId:string;expectedEventTypes:string[];requiredDurability:"COMMITTED"|"CHECKPOINTED"|"ARCHIVED";expiresAt:string}){
  await this.db.pool.query(`INSERT INTO ssw.sael_reservation(reservation_id,action_id,expected_event_types,required_durability,expires_at)
    VALUES($1::uuid,$2::uuid,$3::jsonb,$4,$5::timestamptz)`,[input.reservationId,input.actionId,JSON.stringify(input.expectedEventTypes),input.requiredDurability,input.expiresAt]);
 }

 async getReservation(id:string){
  const r=await this.db.pool.query(`SELECT * FROM ssw.sael_reservation WHERE reservation_id=$1::uuid`,[id]);return r.rows[0]??null;
 }

 async listEvents(streamId:string,fromSequence=1,toSequence?:number):Promise<SaelStoredEvent[]>{
  const r=await this.db.pool.query(`SELECT stream_id,sequence,event_id,producer_id,idempotency_key,event_type,event_hash,previous_event_hash,event_json,occurred_at,recorded_at
    FROM ssw.sael_event WHERE stream_id=$1 AND sequence >= $2 AND ($3::bigint IS NULL OR sequence <= $3)
    ORDER BY sequence`,[streamId,fromSequence,toSequence??null]);
  return r.rows.map((row:any)=>({...row,sequence:Number(row.sequence),event_id:String(row.event_id),event_json:row.event_json as SaelEvent,occurred_at:new Date(row.occurred_at).toISOString(),recorded_at:new Date(row.recorded_at).toISOString()}));
 }

 async verifyStream(streamId:string):Promise<boolean>{
  const events=await this.listEvents(streamId);let previous:string|null=null;let seq=0;
  for(const row of events){
   seq++;if(row.sequence!==seq)return false;if(row.previous_event_hash!==previous)return false;
   const hash=sha256DomainSeparated(SAEL_EVENT_HASH_DOMAIN,row.event_json as unknown as CanonicalJson).hash;
   if(hash!==row.event_hash)return false;previous=row.event_hash;
  }
  const head=await this.db.pool.query(`SELECT sequence,event_hash FROM ssw.sael_stream_head WHERE stream_id=$1`,[streamId]);
  if(!head.rowCount)return events.length===0;
  return Number(head.rows[0]!.sequence)===seq&&(head.rows[0]!.event_hash??null)===previous;
 }

 async createCheckpoint(input:{checkpointId:string;streamId:string;fromSequence:number;toSequence:number;createdAt:string;signer:SaelCheckpointSigner}):Promise<SaelCheckpointRecord>{
  const events=await this.listEvents(input.streamId,input.fromSequence,input.toSequence);
  if(events.length!==input.toSequence-input.fromSequence+1)throw new SaelPersistenceError("SAEL_CHECKPOINT_RANGE_INCOMPLETE");
  for(let i=1;i<events.length;i++)if(events[i]!.previous_event_hash!==events[i-1]!.event_hash)throw new SaelPersistenceError("SAEL_CHECKPOINT_RANGE_INTEGRITY_FAILURE");
  const rootHash=merkleRoot(events.map(e=>e.event_hash));
  const previous=await this.db.pool.query(`SELECT checkpoint_hash FROM ssw.sael_checkpoint WHERE stream_id=$1 AND to_sequence<$2 ORDER BY to_sequence DESC LIMIT 1`,[input.streamId,input.fromSequence]);
  const previousCheckpointHash=previous.rows[0]?.checkpoint_hash??null;
  const core={checkpoint_id:input.checkpointId,stream_id:input.streamId,from_sequence:input.fromSequence,to_sequence:input.toSequence,root_hash:rootHash,previous_checkpoint_hash:previousCheckpointHash,created_at:input.createdAt};
  const checkpointHash=sha256DomainSeparated(CHECKPOINT_DOMAIN,core as unknown as CanonicalJson).hash;
  const signed=await input.signer.sign({checkpointHash,streamId:input.streamId,fromSequence:input.fromSequence,toSequence:input.toSequence,rootHash});
  await this.db.pool.query(`INSERT INTO ssw.sael_checkpoint(checkpoint_id,stream_id,from_sequence,to_sequence,root_hash,checkpoint_hash,previous_checkpoint_hash,signature_ref,created_at)
    VALUES($1::uuid,$2,$3,$4,$5,$6,$7,$8,$9::timestamptz)`,[input.checkpointId,input.streamId,input.fromSequence,input.toSequence,rootHash,checkpointHash,previousCheckpointHash,signed.signatureRef,input.createdAt]);
  return{...core,checkpoint_hash:checkpointHash,signature_ref:signed.signatureRef};
 }

 async archiveCheckpoint(input:{archiveId:string;checkpointId:string;createdAt:string;writer:SaelArchiveWriter}){
  const cpResult=await this.db.pool.query(`SELECT * FROM ssw.sael_checkpoint WHERE checkpoint_id=$1::uuid`,[input.checkpointId]);
  if(!cpResult.rowCount)throw new SaelPersistenceError("SAEL_CHECKPOINT_NOT_FOUND");
  const cp=cpResult.rows[0] as any;const checkpoint:SaelCheckpointRecord={checkpoint_id:String(cp.checkpoint_id),stream_id:cp.stream_id,from_sequence:Number(cp.from_sequence),to_sequence:Number(cp.to_sequence),root_hash:cp.root_hash,checkpoint_hash:cp.checkpoint_hash,previous_checkpoint_hash:cp.previous_checkpoint_hash,signature_ref:cp.signature_ref,created_at:new Date(cp.created_at).toISOString()};
  const events=await this.listEvents(checkpoint.stream_id,checkpoint.from_sequence,checkpoint.to_sequence);
  const manifest={schema:"ssw.sael-archive-manifest.v1",archive_id:input.archiveId,checkpoint_id:checkpoint.checkpoint_id,stream_id:checkpoint.stream_id,from_sequence:checkpoint.from_sequence,to_sequence:checkpoint.to_sequence,checkpoint_hash:checkpoint.checkpoint_hash,event_hashes:events.map(e=>e.event_hash),created_at:input.createdAt};
  const manifestHash=sha256DomainSeparated("SSW:SAEL:ARCHIVE_MANIFEST:V1",manifest as unknown as CanonicalJson).hash;
  const stored=await input.writer.write({checkpoint,events,manifestHash});
  await this.db.pool.query(`INSERT INTO ssw.sael_archive(archive_id,checkpoint_id,stream_id,archive_ref,archive_hash,encryption_profile,created_at)
    VALUES($1::uuid,$2::uuid,$3,$4,$5,$6,$7::timestamptz)`,[input.archiveId,input.checkpointId,checkpoint.stream_id,stored.archiveRef,stored.archiveHash,stored.encryptionProfile,input.createdAt]);
  return{archiveId:input.archiveId,checkpointId:input.checkpointId,manifestHash,...stored};
 }

 async query(input:{streamId:string;maxDisclosure:"L0"|"L1"|"L2"|"L3"|"L4";requestedDisclosure:"L0"|"L1"|"L2"|"L3"|"L4";eventTypePrefix?:string}){
  const rank={L0:0,L1:1,L2:2,L3:3,L4:4};if(rank[input.requestedDisclosure]>rank[input.maxDisclosure])throw new SaelPersistenceError("SAEL_DISCLOSURE_NOT_AUTHORIZED");
  const values:any[]=[input.streamId];let sql=`SELECT * FROM ssw.sael_event WHERE stream_id=$1`;
  if(input.eventTypePrefix){values.push(input.eventTypePrefix+"%");sql+=` AND event_type LIKE $2`;}
  sql+=` ORDER BY sequence`;const r=await this.db.pool.query(sql,values);return r.rows;
 }
}
