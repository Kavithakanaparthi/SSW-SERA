import {createHash} from "node:crypto";
import type {ExecutionRequest,ExecutionResult} from "@soulverse/execution-router";
import {PostgresPersistence,PersistenceConflict} from "@soulverse/persistence-postgres";

export class EvmExecutionError extends Error{
 constructor(public readonly code:string,public readonly outcomeUnknown=false){super(code);}
}

export interface ResolvedSignedEvmPayload{
 rawTransaction:string;
 signedPayloadHash:string;
 chainId:string;
 expectedNetworkTxId:string;
}
export interface SignedPayloadResolver{
 resolve(ref:string):Promise<ResolvedSignedEvmPayload|null>;
}

export interface EvmRpc{
 call<T=unknown>(method:string,params:unknown[]):Promise<T>;
}

export class HttpsEvmJsonRpcClient implements EvmRpc{
 private id=0;
 constructor(private readonly endpoint:string,private readonly timeoutMs=5000,private readonly fetchFn:typeof fetch=fetch){
  if(!endpoint.startsWith("https://"))throw new EvmExecutionError("EVM_RPC_HTTPS_REQUIRED");
 }
 async call<T>(method:string,params:unknown[]):Promise<T>{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),this.timeoutMs);
  try{
   const response=await this.fetchFn(this.endpoint,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:++this.id,method,params}),signal:controller.signal});
   if(!response.ok)throw new EvmExecutionError("EVM_RPC_HTTP_ERROR",response.status>=500||response.status===429);
   const body=await response.json() as any;
   if(body?.error)throw new EvmExecutionError("EVM_RPC_ERROR",false);
   if(!("result" in body))throw new EvmExecutionError("EVM_RPC_INVALID_RESPONSE",false);
   return body.result as T;
  }catch(error){
   if(error instanceof EvmExecutionError)throw error;
   throw new EvmExecutionError("EVM_RPC_NETWORK_OUTCOME_UNKNOWN",true);
  }finally{clearTimeout(timer);}
 }
}

export interface ProductionExecutionInput{
 request:ExecutionRequest;
 signedPayloadResolver:SignedPayloadResolver;
 rpc:EvmRpc;
 persistence:PostgresPersistence;
 now:string;
 submissionEnabled:boolean;
}

function result(request:ExecutionRequest,status:ExecutionResult["status"],now:string,reasonCodes:string[]=[],submissionRef:string|null=null,networkTxId:string|null=null):ExecutionResult{
 return{schema:"ssw.execution-result.v1",execution_request_id:request.execution_request_id,action_id:request.action_id,status,reason_codes:reasonCodes,submission_ref:submissionRef,network_tx_id:networkTxId,observed_at:now};
}

export async function submitEvmProduction(input:ProductionExecutionInput):Promise<ExecutionResult>{
 const r=input.request;
 if(Date.parse(r.expires_at)<=Date.parse(input.now))return result(r,"BLOCKED",input.now,["EXECUTION_REQUEST_EXPIRED"]);
 if(!input.submissionEnabled)return result(r,"BLOCKED",input.now,["PRODUCTION_SUBMISSION_DISABLED"]);
 if(!r.signed_payload_ref||!r.signed_payload_hash)return result(r,"BLOCKED",input.now,["SIGNED_PAYLOAD_REQUIRED"]);
 const signed=await input.signedPayloadResolver.resolve(r.signed_payload_ref);
 if(!signed)return result(r,"BLOCKED",input.now,["SIGNED_PAYLOAD_NOT_FOUND"]);
 if(signed.signedPayloadHash!==r.signed_payload_hash)return result(r,"BLOCKED",input.now,["SIGNED_PAYLOAD_HASH_MISMATCH"]);
 if(signed.chainId!==r.chain_id)return result(r,"BLOCKED",input.now,["SIGNED_PAYLOAD_CHAIN_MISMATCH"]);
 if(!/^0x[0-9a-fA-F]+$/.test(signed.rawTransaction))return result(r,"BLOCKED",input.now,["SIGNED_PAYLOAD_ENCODING_INVALID"]);
 if(!/^0x[0-9a-fA-F]{64}$/.test(signed.expectedNetworkTxId))return result(r,"BLOCKED",input.now,["EXPECTED_NETWORK_TX_ID_REQUIRED"]);

 const existing=await input.persistence.session().getExecutionStateByIdempotency(r.idempotency_key);
 if(existing){
  if(existing.execution_request_id!==r.execution_request_id||existing.signed_payload_hash!==r.signed_payload_hash)throw new EvmExecutionError("EXECUTION_IDEMPOTENCY_CONFLICT");
  return await reconcileEvmExecution({executionRequest:r,rpc:input.rpc,persistence:input.persistence,expectedNetworkTxId:signed.expectedNetworkTxId,now:input.now});
 }

 await input.persistence.session().putExecutionState({executionRequestId:r.execution_request_id,actionId:r.action_id,status:"SUBMITTING",signedPayloadHash:r.signed_payload_hash,idempotencyKey:r.idempotency_key,submissionRef:"evm:pending",networkTxId:signed.expectedNetworkTxId});
 try{
  const txid=await input.rpc.call<string>("eth_sendRawTransaction",[signed.rawTransaction]);
  if(typeof txid!=="string"||txid.toLowerCase()!==signed.expectedNetworkTxId.toLowerCase()){
   await input.persistence.session().putExecutionState({executionRequestId:r.execution_request_id,actionId:r.action_id,status:"FAILED",signedPayloadHash:r.signed_payload_hash,idempotencyKey:r.idempotency_key,submissionRef:"evm:hash-mismatch",networkTxId:typeof txid==="string"?txid:null});
   return result(r,"FAILED",input.now,["NETWORK_TX_ID_MISMATCH"],"evm:hash-mismatch",typeof txid==="string"?txid:null);
  }
  await input.persistence.session().putExecutionState({executionRequestId:r.execution_request_id,actionId:r.action_id,status:"SUBMITTED",signedPayloadHash:r.signed_payload_hash,idempotencyKey:r.idempotency_key,submissionRef:"evm:rpc",networkTxId:txid});
  return result(r,"SUBMITTED",input.now,[],"evm:rpc",txid);
 }catch(error){
  const unknown=error instanceof EvmExecutionError&&error.outcomeUnknown;
  const status=unknown?"EXECUTION_STATUS_UNKNOWN":"FAILED";
  await input.persistence.session().putExecutionState({executionRequestId:r.execution_request_id,actionId:r.action_id,status,signedPayloadHash:r.signed_payload_hash,idempotencyKey:r.idempotency_key,submissionRef:"evm:rpc",networkTxId:signed.expectedNetworkTxId});
  return result(r,status,input.now,[unknown?"TRANSPORT_OUTCOME_UNKNOWN":"EVM_SUBMISSION_FAILED"],"evm:rpc",signed.expectedNetworkTxId);
 }
}

export async function reconcileEvmExecution(input:{executionRequest:ExecutionRequest;rpc:EvmRpc;persistence:PostgresPersistence;expectedNetworkTxId:string;now:string}):Promise<ExecutionResult>{
 const r=input.executionRequest;
 const receipt=await input.rpc.call<any>("eth_getTransactionReceipt",[input.expectedNetworkTxId]);
 if(receipt){
  const confirmed=receipt.status==="0x1";const status=confirmed?"CONFIRMED":"FAILED";
  await input.persistence.session().putExecutionState({executionRequestId:r.execution_request_id,actionId:r.action_id,status,signedPayloadHash:r.signed_payload_hash,idempotencyKey:r.idempotency_key,submissionRef:"evm:reconciled",networkTxId:input.expectedNetworkTxId});
  return result(r,status,input.now,confirmed?[]:["EVM_RECEIPT_FAILED"],"evm:reconciled",input.expectedNetworkTxId);
 }
 const tx=await input.rpc.call<any>("eth_getTransactionByHash",[input.expectedNetworkTxId]);
 if(tx){
  await input.persistence.session().putExecutionState({executionRequestId:r.execution_request_id,actionId:r.action_id,status:"SUBMITTED",signedPayloadHash:r.signed_payload_hash,idempotencyKey:r.idempotency_key,submissionRef:"evm:reconciled",networkTxId:input.expectedNetworkTxId});
  return result(r,"SUBMITTED",input.now,[],"evm:reconciled",input.expectedNetworkTxId);
 }
 await input.persistence.session().putExecutionState({executionRequestId:r.execution_request_id,actionId:r.action_id,status:"EXECUTION_STATUS_UNKNOWN",signedPayloadHash:r.signed_payload_hash,idempotencyKey:r.idempotency_key,submissionRef:"evm:reconciled",networkTxId:input.expectedNetworkTxId});
 return result(r,"EXECUTION_STATUS_UNKNOWN",input.now,["NETWORK_STATUS_UNRESOLVED"],"evm:reconciled",input.expectedNetworkTxId);
}
