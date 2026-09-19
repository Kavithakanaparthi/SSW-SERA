import {request as httpsRequest} from "node:https";
import {createPublicKey,verify as verifySignature,type KeyObject} from "node:crypto";
import type {TrustProtocolRequest,TrustProtocolDecision,TrustProtocolTransport} from "@soulverse/trust-adapter";
import type {RevRequest,RevDecision,RevTransport} from "@soulverse/rev-adapter";
import {assertContract} from "@soulverse/schema-validation";
import {sha256DomainSeparated,type CanonicalJson} from "@soulverse/canonicalization";
import {PostgresPersistence,PersistenceConflict} from "@soulverse/persistence-postgres";

export type DecisionKind="TRUST"|"REV";
const decisionDomains:Record<DecisionKind,string>={TRUST:"SSW:TRUST_DECISION:V1",REV:"SSW:REV_DECISION:V1"};
const requestDomains:Record<DecisionKind,string>={TRUST:"SSW:TRUST_REQUEST:V1",REV:"SSW:REV_REQUEST:V1"};

export interface DecisionKeyResolver{resolve(serviceIdentity:string,keyId:string):Promise<string|Buffer|KeyObject|null>;}
export class StaticDecisionKeyResolver implements DecisionKeyResolver{
 constructor(private readonly keys:ReadonlyMap<string,string|Buffer|KeyObject>){}
 async resolve(serviceIdentity:string,keyId:string){return this.keys.get(`${serviceIdentity}:${keyId}`)??null;}
}

export class ControlServiceError extends Error{
 constructor(public readonly code:string,public readonly retryable:boolean,public readonly statusCode?:number){super(code);}
}
export interface SecureJsonClient{post(url:string,body:unknown,headers?:Record<string,string>):Promise<unknown>;}
export interface MtlsMaterial{cert:string|Buffer;key:string|Buffer;ca:string|Buffer;servername?:string;}
export interface MtlsClientOptions{tls:MtlsMaterial;timeoutMs:number;maxResponseBytes?:number;}

export class NodeMtlsJsonClient implements SecureJsonClient{
 constructor(private readonly options:MtlsClientOptions){}
 async post(urlText:string,body:unknown,headers:Record<string,string>={}):Promise<unknown>{
  const url=new URL(urlText);if(url.protocol!=="https:")throw new ControlServiceError("CONTROL_SERVICE_HTTPS_REQUIRED",false);
  const payload=Buffer.from(JSON.stringify(body),"utf8");const max=this.options.maxResponseBytes??1_048_576;
  return await new Promise((resolve,reject)=>{
   const req=httpsRequest({
    protocol:"https:",hostname:url.hostname,port:url.port?Number(url.port):443,path:url.pathname+url.search,method:"POST",
    cert:this.options.tls.cert,key:this.options.tls.key,ca:this.options.tls.ca,rejectUnauthorized:true,
    servername:this.options.tls.servername??url.hostname,
    headers:{"content-type":"application/json","content-length":String(payload.length),...headers}
   },res=>{
    const status=res.statusCode??0;let bytes=0;const chunks:Buffer[]=[];
    res.on("data",(chunk:Buffer)=>{bytes+=chunk.length;if(bytes>max){req.destroy(new ControlServiceError("CONTROL_SERVICE_RESPONSE_TOO_LARGE",false));return;}chunks.push(Buffer.from(chunk));});
    res.on("end",()=>{
     const text=Buffer.concat(chunks).toString("utf8");
     if(status<200||status>=300){const retryable=status===408||status===429||status>=500;return reject(new ControlServiceError("CONTROL_SERVICE_HTTP_ERROR",retryable,status));}
     try{resolve(JSON.parse(text));}catch{reject(new ControlServiceError("CONTROL_SERVICE_INVALID_JSON",false,status));}
    });
   });
   req.setTimeout(this.options.timeoutMs,()=>req.destroy(new ControlServiceError("CONTROL_SERVICE_TIMEOUT",true)));
   req.on("error",error=>reject(error instanceof ControlServiceError?error:new ControlServiceError("CONTROL_SERVICE_NETWORK_ERROR",true)));
   req.end(payload);
  });
 }
}

function unsignedDecision(decision:Record<string,unknown>):CanonicalJson{
 const copy=structuredClone(decision) as Record<string,unknown>;delete copy.integrity;return copy as CanonicalJson;
}
export function computeDecisionHash(kind:DecisionKind,decision:Record<string,unknown>){
 return sha256DomainSeparated(decisionDomains[kind],unsignedDecision(decision)).hash;
}
export function parseEd25519SignatureRef(signatureRef:string){
 const m=/^ed25519:([^:]+):([A-Za-z0-9_-]+)$/.exec(signatureRef);if(!m)throw new ControlServiceError("DECISION_SIGNATURE_PROFILE_INVALID",false);
 return{keyId:m[1]!,signature:Buffer.from(m[2]!,"base64url")};
}
export async function verifyDecisionIntegrity(input:{kind:DecisionKind;decision:Record<string,unknown>;expectedServiceIdentity:string;keyResolver:DecisionKeyResolver}){
 const integrity=(input.decision.integrity??{}) as any;const serviceIdentity=String(input.decision.service_identity??"");
 if(serviceIdentity!==input.expectedServiceIdentity)throw new ControlServiceError("DECISION_SERVICE_IDENTITY_MISMATCH",false);
 const expectedHash=computeDecisionHash(input.kind,input.decision);
 if(integrity.decision_hash!==expectedHash)throw new ControlServiceError("DECISION_HASH_MISMATCH",false);
 const parsed=parseEd25519SignatureRef(String(integrity.signature_ref??""));
 const key=await input.keyResolver.resolve(serviceIdentity,parsed.keyId);if(!key)throw new ControlServiceError("DECISION_SIGNING_KEY_UNKNOWN",false);
 const publicKey=key instanceof KeyObject?key:createPublicKey(key);
 const digest=Buffer.from(expectedHash.slice("sha256:".length),"hex");
 if(!verifySignature(null,digest,publicKey,parsed.signature))throw new ControlServiceError("DECISION_SIGNATURE_INVALID",false);
 return{decisionHash:expectedHash,keyId:parsed.keyId};
}

export class CircuitBreaker{
 private failures=0;private openUntil=0;
 constructor(private readonly threshold:number,private readonly openMs:number,private readonly now:()=>number=()=>Date.now()){}
 before(){if(this.openUntil>this.now())throw new ControlServiceError("CONTROL_SERVICE_CIRCUIT_OPEN",true);if(this.openUntil&&this.openUntil<=this.now()){this.openUntil=0;this.failures=0;}}
 success(){this.failures=0;this.openUntil=0;}
 failure(){this.failures++;if(this.failures>=this.threshold)this.openUntil=this.now()+this.openMs;}
 get state(){return this.openUntil>this.now()?"OPEN":"CLOSED";}
}

export interface DecisionPersistence{
 claimRequest(kind:DecisionKind,requestId:string,requestHash:string,expiresAt:string):Promise<"FRESH"|"IDENTICAL_RETRY"|"CONFLICT">;
 storeDecision(kind:DecisionKind,decisionId:string,decisionHash:string,decision:unknown,expiresAt:string):Promise<void>;
}
export class PostgresDecisionPersistence implements DecisionPersistence{
 constructor(private readonly db:PostgresPersistence){}
 async claimRequest(kind:DecisionKind,requestId:string,requestHash:string,expiresAt:string){
  return this.db.session().claimIdempotency({ownerService:`${kind.toLowerCase()}-client`,key:requestId,requestHash,expiresAt});
 }
 async storeDecision(kind:DecisionKind,decisionId:string,decisionHash:string,decision:unknown,expiresAt:string){
  const s=this.db.session();const owner=kind.toLowerCase();const type=`${owner}-decision`;
  try{await s.saveRecord({ownerService:owner,recordType:type,recordId:decisionId,status:String((decision as any).status??"UNKNOWN"),state:decision,stateHash:decisionHash,expiresAt});}
  catch(error){if(!(error instanceof PersistenceConflict)||error.code!=="RECORD_ALREADY_EXISTS")throw error;const existing=await s.getRecord({ownerService:owner,recordType:type,recordId:decisionId});if(existing?.state_hash!==decisionHash)throw new ControlServiceError("DECISION_ID_CONFLICT",false);}
 }
}

interface ProductionTransportOptions{
 endpoint:string;expectedServiceIdentity:string;keyResolver:DecisionKeyResolver;client:SecureJsonClient;persistence:DecisionPersistence;
 maxAttempts?:number;circuitBreaker?:CircuitBreaker;
}
abstract class BaseProductionTransport{
 protected readonly maxAttempts:number;protected readonly breaker:CircuitBreaker;
 constructor(protected readonly kind:DecisionKind,protected readonly options:ProductionTransportOptions){
  this.maxAttempts=options.maxAttempts??2;this.breaker=options.circuitBreaker??new CircuitBreaker(3,30_000);
 }
 protected async send(request:any,contractKind:"trust-protocol-decision"|"rev-decision"){
  const requestHash=sha256DomainSeparated(requestDomains[this.kind],request as CanonicalJson).hash;
  const claim=await this.options.persistence.claimRequest(this.kind,request.request_id,requestHash,request.expires_at);
  if(claim==="CONFLICT")throw new ControlServiceError("CONTROL_REQUEST_IDEMPOTENCY_CONFLICT",false);
  let last:unknown;
  for(let attempt=1;attempt<=this.maxAttempts;attempt++){
   this.breaker.before();
   try{
    const raw=await this.options.client.post(this.options.endpoint,request,{"x-request-id":request.request_id,"x-idempotency-key":request.request_id});
    const decision=assertContract(contractKind,raw) as unknown as Record<string,unknown>;
    const verified=await verifyDecisionIntegrity({kind:this.kind,decision,expectedServiceIdentity:this.options.expectedServiceIdentity,keyResolver:this.options.keyResolver});
    await this.options.persistence.storeDecision(this.kind,String((decision as any).decision_id),verified.decisionHash,decision,String((decision as any).expires_at));
    this.breaker.success();return decision;
   }catch(error){last=error;const retryable=error instanceof ControlServiceError&&error.retryable;this.breaker.failure();if(!retryable||attempt===this.maxAttempts)throw error;}
  }
  throw last;
 }
}
export class ProductionTrustProtocolTransport extends BaseProductionTransport implements TrustProtocolTransport{
 constructor(options:ProductionTransportOptions){super("TRUST",options);}
 async evaluate(request:TrustProtocolRequest):Promise<TrustProtocolDecision>{return await this.send(request,"trust-protocol-decision") as unknown as TrustProtocolDecision;}
}
export class ProductionRevTransport extends BaseProductionTransport implements RevTransport{
 constructor(options:ProductionTransportOptions){super("REV",options);}
 async evaluate(request:RevRequest):Promise<RevDecision>{return await this.send(request,"rev-decision") as unknown as RevDecision;}
}
