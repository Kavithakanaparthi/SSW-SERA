import {createHash} from "node:crypto";
import {readFile,readdir} from "node:fs/promises";
import {join} from "node:path";
import {Pool,type PoolClient,type QueryResultRow} from "pg";

export type Queryable={query<R extends QueryResultRow=any>(text:string,values?:readonly unknown[]):Promise<{rows:R[];rowCount:number|null}>};
export interface PostgresOptions{connectionString:string;max?:number;applicationName?:string;}

export class PersistenceConflict extends Error{constructor(public readonly code:string){super(code);}}

export class PostgresPersistence{
 readonly pool:Pool;
 constructor(options:PostgresOptions){
  this.pool=new Pool({connectionString:options.connectionString,max:options.max??10,application_name:options.applicationName??"ssw-sera"});
 }
 async close(){await this.pool.end();}
 async transaction<T>(fn:(session:PostgresSession)=>Promise<T>):Promise<T>{
  const client=await this.pool.connect();
  try{await client.query("BEGIN");const result=await fn(new PostgresSession(client));await client.query("COMMIT");return result;}
  catch(error){await client.query("ROLLBACK");throw error;}
  finally{client.release();}
 }
 session(){return new PostgresSession(this.pool);}
}

export class PostgresSession{
 constructor(private readonly db:Queryable){}

 async getRecord(input:{ownerService:string;recordType:string;recordId:string}){
  const r=await this.db.query(`SELECT owner_service,record_type,record_id,version,status,state,state_hash,expires_at,created_at,updated_at
    FROM ssw.domain_record WHERE owner_service=$1 AND record_type=$2 AND record_id=$3`,
    [input.ownerService,input.recordType,input.recordId]);
  return r.rows[0]??null;
 }

 async saveRecord(input:{ownerService:string;recordType:string;recordId:string;status:string;state:unknown;stateHash:string;expiresAt?:string|null;expectedVersion?:number|null}){
  if(input.expectedVersion===undefined||input.expectedVersion===null){
    const r=await this.db.query(`INSERT INTO ssw.domain_record(owner_service,record_type,record_id,version,status,state,state_hash,expires_at)
      VALUES($1,$2,$3,1,$4,$5::jsonb,$6,$7)
      ON CONFLICT DO NOTHING RETURNING version`,
      [input.ownerService,input.recordType,input.recordId,input.status,JSON.stringify(input.state),input.stateHash,input.expiresAt??null]);
    if(r.rowCount!==1)throw new PersistenceConflict("RECORD_ALREADY_EXISTS");
    return 1;
  }
  const r=await this.db.query(`UPDATE ssw.domain_record SET version=version+1,status=$4,state=$5::jsonb,state_hash=$6,expires_at=$7,updated_at=now()
    WHERE owner_service=$1 AND record_type=$2 AND record_id=$3 AND version=$8 RETURNING version`,
    [input.ownerService,input.recordType,input.recordId,input.status,JSON.stringify(input.state),input.stateHash,input.expiresAt??null,input.expectedVersion]);
  if(r.rowCount!==1)throw new PersistenceConflict("OPTIMISTIC_CONCURRENCY_CONFLICT");
  return Number(r.rows[0]!.version);
 }

 async claimIdempotency(input:{ownerService:string;key:string;requestHash:string;expiresAt?:string|null}):Promise<"FRESH"|"IDENTICAL_RETRY"|"CONFLICT">{
  const inserted=await this.db.query(`INSERT INTO ssw.idempotency_claim(owner_service,idempotency_key,request_hash,expires_at)
    VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING RETURNING request_hash`,[input.ownerService,input.key,input.requestHash,input.expiresAt??null]);
  if(inserted.rowCount===1)return"FRESH";
  const current=await this.db.query(`SELECT request_hash FROM ssw.idempotency_claim WHERE owner_service=$1 AND idempotency_key=$2`,[input.ownerService,input.key]);
  return current.rows[0]?.request_hash===input.requestHash?"IDENTICAL_RETRY":"CONFLICT";
 }

 async claimReplay(input:{ownerService:string;replayToken:string;requestHash:string;revDecisionId?:string|null;expiresAt?:string|null}):Promise<"FRESH"|"REPLAY">{
  try{
   const r=await this.db.query(`INSERT INTO ssw.replay_claim(owner_service,replay_token,request_hash,rev_decision_id,expires_at)
     VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING RETURNING replay_token`,
     [input.ownerService,input.replayToken,input.requestHash,input.revDecisionId??null,input.expiresAt??null]);
   return r.rowCount===1?"FRESH":"REPLAY";
  }catch(error:any){if(error?.code==="23505")return"REPLAY";throw error;}
 }

 async consumeReplay(input:{ownerService:string;replayToken:string}){
  const r=await this.db.query(`UPDATE ssw.replay_claim SET consumed_at=COALESCE(consumed_at,now())
    WHERE owner_service=$1 AND replay_token=$2 RETURNING consumed_at`,[input.ownerService,input.replayToken]);
  if(r.rowCount!==1)throw new PersistenceConflict("REPLAY_CLAIM_NOT_FOUND");
 }

 async reserveMandateUsage(input:{mandateId:string;assetId:string;amountAtomic:string;maxActionCount?:number|null;maxCumulativeAtomic?:string|null}){
  await this.db.query(`INSERT INTO ssw.mandate_usage(mandate_id,asset_id) VALUES($1,$2) ON CONFLICT DO NOTHING`,[input.mandateId,input.assetId]);
  const current=await this.db.query(`SELECT action_count,cumulative_atomic,version FROM ssw.mandate_usage WHERE mandate_id=$1 AND asset_id=$2 FOR UPDATE`,[input.mandateId,input.assetId]);
  const row=current.rows[0]!;const nextCount=BigInt(row.action_count)+1n;const nextAtomic=BigInt(row.cumulative_atomic)+BigInt(input.amountAtomic);
  if(input.maxActionCount!==undefined&&input.maxActionCount!==null&&nextCount>BigInt(input.maxActionCount))throw new PersistenceConflict("MANDATE_ACTION_COUNT_EXCEEDED");
  if(input.maxCumulativeAtomic!==undefined&&input.maxCumulativeAtomic!==null&&nextAtomic>BigInt(input.maxCumulativeAtomic))throw new PersistenceConflict("MANDATE_CUMULATIVE_LIMIT_EXCEEDED");
  const updated=await this.db.query(`UPDATE ssw.mandate_usage SET action_count=$3,cumulative_atomic=$4,version=version+1,updated_at=now()
    WHERE mandate_id=$1 AND asset_id=$2 RETURNING action_count,cumulative_atomic,version`,
    [input.mandateId,input.assetId,nextCount.toString(),nextAtomic.toString()]);
  return updated.rows[0]!;
 }

 async putExecutionState(input:{executionRequestId:string;actionId:string;status:string;signedPayloadHash?:string|null;idempotencyKey:string;submissionRef?:string|null;networkTxId?:string|null}){
  const r=await this.db.query(`INSERT INTO ssw.execution_state(execution_request_id,action_id,status,signed_payload_hash,idempotency_key,submission_ref,network_tx_id)
    VALUES($1,$2,$3,$4,$5,$6,$7)
    ON CONFLICT(execution_request_id) DO UPDATE SET status=EXCLUDED.status,signed_payload_hash=COALESCE(EXCLUDED.signed_payload_hash,ssw.execution_state.signed_payload_hash),
    submission_ref=COALESCE(EXCLUDED.submission_ref,ssw.execution_state.submission_ref),network_tx_id=COALESCE(EXCLUDED.network_tx_id,ssw.execution_state.network_tx_id),
    version=ssw.execution_state.version+1,updated_at=now()
    RETURNING *`,[input.executionRequestId,input.actionId,input.status,input.signedPayloadHash??null,input.idempotencyKey,input.submissionRef??null,input.networkTxId??null]);
  return r.rows[0]!;
 }

 async enqueueOutbox(input:{eventId:string;ownerService:string;topic:string;partitionKey:string;payload:unknown;headers?:Record<string,string>;availableAt?:string|null}){
  await this.db.query(`INSERT INTO ssw.event_outbox(event_id,owner_service,topic,partition_key,payload,headers,available_at)
    VALUES($1::uuid,$2,$3,$4,$5::jsonb,$6::jsonb,COALESCE($7::timestamptz,now()))`,
    [input.eventId,input.ownerService,input.topic,input.partitionKey,JSON.stringify(input.payload),JSON.stringify(input.headers??{}),input.availableAt??null]);
 }

 async claimOutbox(input:{limit:number;leaseSeconds:number}){
  const r=await this.db.query(`WITH picked AS (
      SELECT event_id FROM ssw.event_outbox
      WHERE (status='PENDING' OR (status='INFLIGHT' AND lease_until<now())) AND available_at<=now()
      ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT $1
    )
    UPDATE ssw.event_outbox o SET status='INFLIGHT',attempts=attempts+1,lease_until=now()+($2::text||' seconds')::interval
    FROM picked WHERE o.event_id=picked.event_id
    RETURNING o.*`,[input.limit,input.leaseSeconds]);
  return r.rows;
 }

 async markOutboxDelivered(eventId:string){
  await this.db.query(`UPDATE ssw.event_outbox SET status='DELIVERED',delivered_at=now(),lease_until=NULL WHERE event_id=$1::uuid`,[eventId]);
 }

 async releaseOutbox(eventId:string,delaySeconds:number){
  await this.db.query(`UPDATE ssw.event_outbox SET status='PENDING',lease_until=NULL,available_at=now()+($2::text||' seconds')::interval WHERE event_id=$1::uuid`,[eventId,delaySeconds]);
 }

 async acceptInbox(input:{consumerService:string;eventId:string;payloadHash:string}):Promise<"FRESH"|"IDENTICAL_RETRY"|"CONFLICT">{
  const inserted=await this.db.query(`INSERT INTO ssw.event_inbox(consumer_service,event_id,payload_hash) VALUES($1,$2::uuid,$3)
    ON CONFLICT DO NOTHING RETURNING payload_hash`,[input.consumerService,input.eventId,input.payloadHash]);
  if(inserted.rowCount===1)return"FRESH";
  const current=await this.db.query(`SELECT payload_hash FROM ssw.event_inbox WHERE consumer_service=$1 AND event_id=$2::uuid`,[input.consumerService,input.eventId]);
  return current.rows[0]?.payload_hash===input.payloadHash?"IDENTICAL_RETRY":"CONFLICT";
 }
}

export async function applyMigrations(pool:Pool,migrationsDir:string){
 const bootstrap=`CREATE SCHEMA IF NOT EXISTS ssw;
 CREATE TABLE IF NOT EXISTS ssw.schema_migration(migration_id text PRIMARY KEY,checksum_sha256 text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now());`;
 await pool.query(bootstrap);
 const files=(await readdir(migrationsDir)).filter(x=>x.endsWith(".sql")).sort();
 for(const name of files){
  const sql=await readFile(join(migrationsDir,name),"utf8");const checksum="sha256:"+createHash("sha256").update(sql).digest("hex");
  const existing=await pool.query("SELECT checksum_sha256 FROM ssw.schema_migration WHERE migration_id=$1",[name]);
  if(existing.rowCount){if(existing.rows[0]!.checksum_sha256!==checksum)throw new Error("MIGRATION_CHECKSUM_MISMATCH");continue;}
  const client=await pool.connect();
  try{await client.query("BEGIN");await client.query(sql);await client.query("INSERT INTO ssw.schema_migration(migration_id,checksum_sha256) VALUES($1,$2)",[name,checksum]);await client.query("COMMIT");}
  catch(error){await client.query("ROLLBACK");throw error;}finally{client.release();}
 }
}
