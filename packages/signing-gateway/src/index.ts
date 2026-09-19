import type {ActionContract,RiskClass} from "@soulverse/contracts";
import {assertContract} from "@soulverse/schema-validation";
import {ACTION_HASH_DOMAIN,EVM_PAYLOAD_HASH_DOMAIN,SIGNING_REQUEST_HASH_DOMAIN,sha256DomainSeparated,type CanonicalJson} from "@soulverse/canonicalization";
import type {ApprovalRecord} from "@soulverse/approval-runtime";

export interface SigningRequest{
 schema:"ssw.signing-request.v1";signing_request_id:string;action_id:string;action_version:number;action_contract_hash:string;material_terms_hash:string;
 holder_did:string;sera_agent_did:string;sera_runtime_id:string;device_id:string;
 authority:{class:string;approval_ref:string|null;mandate_ref:string|null;mandate_evaluation_ref:string|null};
 control_refs:{policy_ref:string;device_trust_ref:string;runtime_ref:string;trust_protocol_ref:string;rev_ref:string};
 payload:{payload_type:"evm.transaction";payload_ref:string;payload_hash:string;body:Record<string,unknown>};
 replay:{idempotency_key:string;replay_token:string;nonce:string|null};requested_key_class:"HOLDER_EVM_ACCOUNT"|"HOLDER_GENERIC_SIGNING";
 issued_at:string;expires_at:string;
}
export interface SigningResult{
 schema:"ssw.signing-result.v1";signing_request_id:string;action_id:string;status:"DRY_RUN_ACCEPTED"|"REJECTED";request_hash:string;payload_hash:string;
 key_class:string|null;reason_codes:string[];signed_payload_ref:null;signed_payload_hash:null;signed_at:null;
}
export interface TrustDecisionLike{schema:"ssw.trust-protocol-decision.v1";decision_id:string;action_id:string;action_version:number;material_terms_hash:string;status:string;
 principal:{holder_did:string;sera_agent_did:string};runtime:{device_id:string;sera_runtime_id:string};authority_class:string;risk_class:RiskClass;policy_version:string;
 service_identity:string;issued_at:string;expires_at:string;}
export interface RevDecisionLike{schema:"ssw.rev-decision.v1";decision_id:string;action_id:string;action_version:number;material_terms_hash:string;status:string;
 authority_class:string;risk_class:RiskClass;policy_version:string;trust_protocol_decision_ref:string;service_identity:string;single_use:boolean;issued_at:string;expires_at:string;}

export interface ReplayStore{
 inspect(input:{requestId:string;idempotencyKey:string;replayToken:string;revDecisionId:string;requestHash:string}):"FRESH"|"IDENTICAL_RETRY"|"REPLAY"|"IDEMPOTENCY_CONFLICT"|"REV_CONSUMED";
 consume(input:{requestId:string;idempotencyKey:string;replayToken:string;revDecisionId:string;requestHash:string}):void;
}
export class InMemoryReplayStore implements ReplayStore{
 private requestHashes=new Map<string,string>();private idem=new Map<string,string>();private tokens=new Set<string>();private rev=new Set<string>();
 inspect(i:{requestId:string;idempotencyKey:string;replayToken:string;revDecisionId:string;requestHash:string}){
  const existing=this.requestHashes.get(i.requestId);if(existing===i.requestHash)return"IDENTICAL_RETRY" as const;if(existing)return"REPLAY" as const;
  const idem=this.idem.get(i.idempotencyKey);if(idem&&idem!==i.requestHash)return"IDEMPOTENCY_CONFLICT" as const;
  if(this.tokens.has(i.replayToken))return"REPLAY" as const;if(this.rev.has(i.revDecisionId))return"REV_CONSUMED" as const;return"FRESH" as const;
 }
 consume(i:{requestId:string;idempotencyKey:string;replayToken:string;revDecisionId:string;requestHash:string}){this.requestHashes.set(i.requestId,i.requestHash);this.idem.set(i.idempotencyKey,i.requestHash);this.tokens.add(i.replayToken);this.rev.add(i.revDecisionId);}
}

export function hashActionContract(action:ActionContract):string{
 return sha256DomainSeparated(ACTION_HASH_DOMAIN,action as unknown as CanonicalJson).hash;
}
export function hashEvmPayload(body:Record<string,unknown>):string{
 return sha256DomainSeparated(EVM_PAYLOAD_HASH_DOMAIN,body as unknown as CanonicalJson).hash;
}
export function buildSigningRequest(input:{action:ActionContract;materialTermsHash:string;signingRequestId:string;deviceTrustRef:string;policyRef:string;
 payloadRef:string;payloadBody:Record<string,unknown>;requestedKeyClass:"HOLDER_EVM_ACCOUNT"|"HOLDER_GENERIC_SIGNING";issuedAt:string;expiresAt:string;
 mandateEvaluationRef?:string|null;}):SigningRequest{
 const a=assertContract("action-contract",input.action);
 if(!a.policy.device_eligible||!a.policy.runtime_eligible)throw new Error("Signing request requires eligible device/runtime.");
 if(!a.trust.trust_protocol_ref||!a.trust.rev_ref)throw new Error("Signing request requires Trust and REV references.");
 const request:SigningRequest={schema:"ssw.signing-request.v1",signing_request_id:input.signingRequestId,action_id:a.action_id,action_version:a.version,
  action_contract_hash:hashActionContract(a),material_terms_hash:input.materialTermsHash,holder_did:a.principal.holder_did,sera_agent_did:a.principal.sera_agent_did,
  sera_runtime_id:a.principal.sera_runtime_id,device_id:a.principal.device_id,authority:{class:a.authority.class,approval_ref:a.approval.approval_id,
  mandate_ref:a.authority.mandate_id,mandate_evaluation_ref:input.mandateEvaluationRef??null},control_refs:{policy_ref:input.policyRef,device_trust_ref:input.deviceTrustRef,
  runtime_ref:a.principal.sera_runtime_id,trust_protocol_ref:a.trust.trust_protocol_ref,rev_ref:a.trust.rev_ref},payload:{payload_type:"evm.transaction",payload_ref:input.payloadRef,
  payload_hash:hashEvmPayload(input.payloadBody),body:structuredClone(input.payloadBody)},replay:{idempotency_key:a.execution.idempotency_key,replay_token:a.execution.replay_token,
  nonce:String((input.payloadBody as any).nonce??"")||null},requested_key_class:input.requestedKeyClass,issued_at:input.issuedAt,expires_at:input.expiresAt};
 return assertContract("signing-request",request) as unknown as SigningRequest;
}

function rejected(req:SigningRequest,code:string):SigningResult{
 const requestHash=sha256DomainSeparated(SIGNING_REQUEST_HASH_DOMAIN,req as unknown as CanonicalJson).hash;
 const result:SigningResult={schema:"ssw.signing-result.v1",signing_request_id:req.signing_request_id,action_id:req.action_id,status:"REJECTED",request_hash:requestHash,
 payload_hash:req.payload.payload_hash,key_class:null,reason_codes:[code],signed_payload_ref:null,signed_payload_hash:null,signed_at:null};
 return assertContract("signing-result",result) as unknown as SigningResult;
}

export function dryRunVerifySigning(input:{request:SigningRequest;action:ActionContract;materialTermsHash:string;callerIdentity:string;allowedCallerIdentities:readonly string[];
 approval?:ApprovalRecord;mandateDecision?:any;trustDecision:TrustDecisionLike;revDecision:RevDecisionLike;policyVersion:string;riskClass:RiskClass;
 expectedTrustServiceIdentity:string;expectedRevServiceIdentity:string;now:string;replayStore:ReplayStore;}):SigningResult{
 const req=assertContract("signing-request",input.request) as unknown as SigningRequest;
 const action=assertContract("action-contract",input.action);
 const trust=assertContract("trust-protocol-decision",input.trustDecision) as unknown as TrustDecisionLike;
 const rev=assertContract("rev-decision",input.revDecision) as unknown as RevDecisionLike;
 const fail=(c:string)=>rejected(req,c);
 if(Date.parse(req.expires_at)<=Date.parse(input.now))return fail("SIGNING_REQUEST_EXPIRED");
 if(!input.allowedCallerIdentities.includes(input.callerIdentity))return fail("CALLER_NOT_AUTHORIZED");
 if(req.action_id!==action.action_id||req.action_version!==action.version)return fail("ACTION_VERSION_MISMATCH");
 if(req.action_contract_hash!==hashActionContract(action))return fail("ACTION_HASH_MISMATCH");
 if(req.material_terms_hash!==input.materialTermsHash)return fail("MATERIAL_TERMS_HASH_MISMATCH");
 if(req.holder_did!==action.principal.holder_did||req.sera_agent_did!==action.principal.sera_agent_did)return fail("IDENTITY_BINDING_MISMATCH");
 if(req.device_id!==action.principal.device_id||req.sera_runtime_id!==action.principal.sera_runtime_id)return fail("RUNTIME_BINDING_MISMATCH");
 if(!action.policy.device_eligible)return fail("DEVICE_NOT_ELIGIBLE");if(!action.policy.runtime_eligible)return fail("RUNTIME_NOT_ELIGIBLE");
 if(action.authority.class==="A2"){
  if(!input.approval)return fail("APPROVAL_INVALID");
  const ap=assertContract("approval-record",input.approval) as unknown as ApprovalRecord;
  if(ap.status!=="APPROVED"||ap.action_id!==action.action_id||ap.action_version!==action.version||ap.material_terms_hash!==input.materialTermsHash||ap.holder_did!==action.principal.holder_did||ap.device_id!==action.principal.device_id||ap.runtime_id!==action.principal.sera_runtime_id)return fail("APPROVAL_INVALID");
  if(Date.parse(ap.expires_at)<=Date.parse(input.now))return fail("APPROVAL_EXPIRED");
  if(req.authority.approval_ref!==ap.approval_id)return fail("APPROVAL_INVALID");
 }else if(action.authority.class==="A3"||action.authority.class==="A4"){
  const md=input.mandateDecision;if(!md||md.status!=="PASS"||md.action_id!==action.action_id||md.action_version!==action.version||md.material_terms_hash!==input.materialTermsHash)return fail("MANDATE_INVALID");
  if(req.authority.mandate_ref!==action.authority.mandate_id||req.authority.mandate_evaluation_ref!==md.decision_id)return fail("MANDATE_SCOPE_MISMATCH");
 }else return fail("APPROVAL_INVALID");
 if(trust.status!=="PASS"||trust.decision_id!==req.control_refs.trust_protocol_ref)return fail("TRUST_PROTOCOL_FAILED");
 if(trust.action_id!==action.action_id||trust.action_version!==action.version||trust.material_terms_hash!==input.materialTermsHash||trust.principal.holder_did!==action.principal.holder_did||
 trust.principal.sera_agent_did!==action.principal.sera_agent_did||trust.runtime.device_id!==action.principal.device_id||trust.runtime.sera_runtime_id!==action.principal.sera_runtime_id||
 trust.authority_class!==action.authority.class||trust.risk_class!==input.riskClass||trust.policy_version!==input.policyVersion)return fail("TRUST_PROTOCOL_FAILED");
 if(trust.service_identity!==input.expectedTrustServiceIdentity)return fail("TRUST_PROTOCOL_FAILED");if(Date.parse(trust.expires_at)<=Date.parse(input.now))return fail("TRUST_PROTOCOL_EXPIRED");
 if(rev.status!=="PASS"||rev.decision_id!==req.control_refs.rev_ref)return fail("REV_FAILED");
 if(rev.action_id!==action.action_id||rev.action_version!==action.version||rev.material_terms_hash!==input.materialTermsHash||rev.authority_class!==action.authority.class||
 rev.risk_class!==input.riskClass||rev.policy_version!==input.policyVersion||rev.trust_protocol_decision_ref!==trust.decision_id)return fail("REV_FAILED");
 if(rev.service_identity!==input.expectedRevServiceIdentity)return fail("REV_FAILED");if(Date.parse(rev.expires_at)<=Date.parse(input.now))return fail("REV_EXPIRED");
 if(req.payload.payload_type!=="evm.transaction")return fail("UNSUPPORTED_PAYLOAD_TYPE");
 if(req.payload.payload_hash!==hashEvmPayload(req.payload.body))return fail("PAYLOAD_HASH_MISMATCH");
 const terms=action.material_terms as any;const body=req.payload.body as any;
 if(body.chain_id!==terms?.network?.chain_id||String(body.value_atomic)!==String(terms?.amount?.atomic)||body.to!==terms?.counterparty?.canonical_id)return fail("CHAIN_SEMANTICS_INVALID");
 const requestHash=sha256DomainSeparated(SIGNING_REQUEST_HASH_DOMAIN,req as unknown as CanonicalJson).hash;
 const replay=input.replayStore.inspect({requestId:req.signing_request_id,idempotencyKey:req.replay.idempotency_key,replayToken:req.replay.replay_token,revDecisionId:rev.decision_id,requestHash});
 if(replay==="REPLAY")return fail("REPLAY_DETECTED");if(replay==="IDEMPOTENCY_CONFLICT")return fail("IDEMPOTENCY_CONFLICT");if(replay==="REV_CONSUMED")return fail("REV_CONSUMED");
 if(replay==="FRESH")input.replayStore.consume({requestId:req.signing_request_id,idempotencyKey:req.replay.idempotency_key,replayToken:req.replay.replay_token,revDecisionId:rev.decision_id,requestHash});
 const result:SigningResult={schema:"ssw.signing-result.v1",signing_request_id:req.signing_request_id,action_id:req.action_id,status:"DRY_RUN_ACCEPTED",request_hash:requestHash,
 payload_hash:req.payload.payload_hash,key_class:req.requested_key_class,reason_codes:replay==="IDENTICAL_RETRY"?["IDEMPOTENT_RETRY"]:[],signed_payload_ref:null,signed_payload_hash:null,signed_at:null};
 return assertContract("signing-result",result) as unknown as SigningResult;
}
