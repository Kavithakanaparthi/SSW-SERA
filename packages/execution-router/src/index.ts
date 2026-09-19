import type {ActionContract} from "@soulverse/contracts";
import {assertContract} from "@soulverse/schema-validation";

export interface ExecutionRequest{
 schema:"ssw.execution-request.v1";execution_request_id:string;action_id:string;action_version:number;payload_type:"evm.transaction";
 payload_hash:string;signed_payload_ref:string|null;signed_payload_hash:string|null;chain_id:string;idempotency_key:string;issued_at:string;expires_at:string;
}
export interface ExecutionResult{
 schema:"ssw.execution-result.v1";execution_request_id:string;action_id:string;status:"SIMULATED"|"READY_TO_SUBMIT"|"SUBMITTED"|"CONFIRMED"|"FAILED"|"EXECUTION_STATUS_UNKNOWN"|"BLOCKED";
 reason_codes:string[];submission_ref:string|null;network_tx_id:string|null;observed_at:string;
}
export interface ChainSubmissionTransport{
 submit(input:{signedPayloadRef:string;signedPayloadHash:string;chainId:string;idempotencyKey:string}):Promise<{submissionRef:string;networkTxId?:string|null;status:"SUBMITTED"|"CONFIRMED"|"FAILED"|"UNKNOWN"}>;
}
export class ExecutionReplayStore{
 private seen=new Map<string,string>();
 check(idempotencyKey:string,payloadHash:string):"FRESH"|"IDENTICAL"|"CONFLICT"{const p=this.seen.get(idempotencyKey);if(!p)return"FRESH";return p===payloadHash?"IDENTICAL":"CONFLICT";}
 mark(idempotencyKey:string,payloadHash:string){this.seen.set(idempotencyKey,payloadHash);}
}

export function buildExecutionRequest(input:{
 action:ActionContract;executionRequestId:string;payloadHash:string;signedPayloadRef:string|null;signedPayloadHash:string|null;chainId:string;issuedAt:string;expiresAt:string;
}):ExecutionRequest{
 const a=assertContract("action-contract",input.action);
 const r:ExecutionRequest={schema:"ssw.execution-request.v1",execution_request_id:input.executionRequestId,action_id:a.action_id,action_version:a.version,
 payload_type:"evm.transaction",payload_hash:input.payloadHash,signed_payload_ref:input.signedPayloadRef,signed_payload_hash:input.signedPayloadHash,
 chain_id:input.chainId,idempotency_key:a.execution.idempotency_key,issued_at:input.issuedAt,expires_at:input.expiresAt};
 return assertContract("execution-request",r) as unknown as ExecutionRequest;
}

export function simulateEvmExecution(input:{request:ExecutionRequest;action:ActionContract;payloadBody:Record<string,unknown>;observedAt:string}):ExecutionResult{
 const req=assertContract("execution-request",input.request) as unknown as ExecutionRequest;const a=assertContract("action-contract",input.action);
 const terms=a.material_terms as any;const b=input.payloadBody as any;const reasons:string[]=[];
 if(req.action_id!==a.action_id||req.action_version!==a.version)reasons.push("ACTION_VERSION_MISMATCH");
 if(req.chain_id!==terms?.network?.chain_id||b.chain_id!==terms?.network?.chain_id)reasons.push("CHAIN_SEMANTICS_INVALID");
 if(String(b.value_atomic)!==String(terms?.amount?.atomic))reasons.push("MATERIAL_TERMS_HASH_MISMATCH");
 if(b.to!==terms?.counterparty?.canonical_id)reasons.push("COUNTERPARTY_IDENTITY_MISMATCH");
 const status=reasons.length?"BLOCKED":"SIMULATED";
 return assertContract("execution-result",{schema:"ssw.execution-result.v1",execution_request_id:req.execution_request_id,action_id:req.action_id,status,
 reason_codes:reasons,submission_ref:null,network_tx_id:null,observed_at:input.observedAt}) as unknown as ExecutionResult;
}

export async function submitExecution(input:{request:ExecutionRequest;transport:ChainSubmissionTransport;store:ExecutionReplayStore;now:string;submissionEnabled:boolean}):Promise<ExecutionResult>{
 const req=assertContract("execution-request",input.request) as unknown as ExecutionRequest;
 const block=(code:string):ExecutionResult=>assertContract("execution-result",{schema:"ssw.execution-result.v1",execution_request_id:req.execution_request_id,action_id:req.action_id,status:"BLOCKED",reason_codes:[code],submission_ref:null,network_tx_id:null,observed_at:input.now}) as unknown as ExecutionResult;
 if(Date.parse(req.expires_at)<=Date.parse(input.now))return block("EXECUTION_REQUEST_EXPIRED");
 if(!input.submissionEnabled)return block("PRODUCTION_SUBMISSION_DISABLED");
 if(!req.signed_payload_ref||!req.signed_payload_hash)return block("SIGNED_PAYLOAD_REQUIRED");
 const replay=input.store.check(req.idempotency_key,req.signed_payload_hash);if(replay==="CONFLICT")return block("IDEMPOTENCY_CONFLICT");
 if(replay==="IDENTICAL")return block("REPLAY_DETECTED");
 input.store.mark(req.idempotency_key,req.signed_payload_hash);
 try{
  const out=await input.transport.submit({signedPayloadRef:req.signed_payload_ref,signedPayloadHash:req.signed_payload_hash,chainId:req.chain_id,idempotencyKey:req.idempotency_key});
  const status=out.status==="UNKNOWN"?"EXECUTION_STATUS_UNKNOWN":out.status;
  return assertContract("execution-result",{schema:"ssw.execution-result.v1",execution_request_id:req.execution_request_id,action_id:req.action_id,status,
   reason_codes:[],submission_ref:out.submissionRef,network_tx_id:out.networkTxId??null,observed_at:input.now}) as unknown as ExecutionResult;
 }catch{
  return assertContract("execution-result",{schema:"ssw.execution-result.v1",execution_request_id:req.execution_request_id,action_id:req.action_id,status:"EXECUTION_STATUS_UNKNOWN",
   reason_codes:["TRANSPORT_OUTCOME_UNKNOWN"],submission_ref:null,network_tx_id:null,observed_at:input.now}) as unknown as ExecutionResult;
 }
}
