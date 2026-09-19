import {generateKeyPairSync,sign as cryptoSign,type KeyObject} from "node:crypto";
import type {SigningRequest,SigningResult,TrustDecisionLike,RevDecisionLike} from "@soulverse/signing-gateway";
import {dryRunVerifySigning,type ReplayStore} from "@soulverse/signing-gateway";
import {sha256DomainSeparated,type CanonicalJson} from "@soulverse/canonicalization";
import {PostgresPersistence,PersistenceConflict} from "@soulverse/persistence-postgres";

export type SignerProviderClass="SOULSCAN_IPFS_PORTABLE"|"TEST_PORTABLE";
export type SignerKeyStatus="ACTIVE"|"SUSPENDED"|"REVOKED"|"RETIRED";

export interface SignerKeyDescriptor{
 keyRef:string;holderDid:string;keyClass:string;providerClass:SignerProviderClass;algorithm:string;publicKeyRef:string;
 allowedChains:string[];allowedActionTypes:string[];status:SignerKeyStatus;
}
export interface PreparedSigningDigest{digest:Buffer;digestProfile:string;sourcePayloadHash:string;}
export interface SigningDigestVerifier{prepare(request:SigningRequest):Promise<PreparedSigningDigest>;}
export class DenySigningDigestVerifier implements SigningDigestVerifier{
 async prepare():Promise<PreparedSigningDigest>{throw new SignerRuntimeError("SIGNING_DIGEST_VERIFIER_REQUIRED",false);}
}

export interface SignerProviderRequest{
 operationId:string;keyRef:string;digest:Buffer;digestProfile:string;idempotencyKey:string;
}
export interface SignerProviderResult{
 status:"SIGNED";keyRef:string;signature:Buffer;signatureFormat:string;providerOperationRef:string;
}
export interface SignerProvider{
 readonly providerClass:SignerProviderClass;
 describeKey(keyRef:string):Promise<SignerKeyDescriptor|null>;
 signDigest(request:SignerProviderRequest):Promise<SignerProviderResult>;
}
export class SignerRuntimeError extends Error{constructor(public readonly code:string,public readonly outcomeUnknown:boolean){super(code);}}

export class IsolatedTestSignerProvider implements SignerProvider{
 readonly providerClass="TEST_PORTABLE" as const;
 private readonly keys=new Map<string,{privateKey:KeyObject;descriptor:SignerKeyDescriptor}>();
 createTestKey(input:{keyRef:string;holderDid:string;keyClass:string;allowedChains:string[];allowedActionTypes:string[]}){
  const pair=generateKeyPairSync("ed25519");
  const descriptor:SignerKeyDescriptor={keyRef:input.keyRef,holderDid:input.holderDid,keyClass:input.keyClass,providerClass:this.providerClass,algorithm:"ED25519_TEST_ONLY",publicKeyRef:`test-public:${input.keyRef}`,allowedChains:input.allowedChains,allowedActionTypes:input.allowedActionTypes,status:"ACTIVE"};
  this.keys.set(input.keyRef,{privateKey:pair.privateKey,descriptor});return descriptor;
 }
 async describeKey(keyRef:string){return this.keys.get(keyRef)?.descriptor??null;}
 async signDigest(request:SignerProviderRequest){
  const entry=this.keys.get(request.keyRef);if(!entry)throw new SignerRuntimeError("SIGNER_KEY_NOT_FOUND",false);
  return{status:"SIGNED" as const,keyRef:request.keyRef,signature:cryptoSign(null,request.digest,entry.privateKey),signatureFormat:"ED25519_TEST_ONLY",providerOperationRef:`test-op:${request.operationId}`};
 }
}

class VerificationOnlyReplayStore implements ReplayStore{
 inspect(){return"FRESH" as const;}consume(){}
}

export interface ProductionSigningEvidence{
 request:SigningRequest;action:any;materialTermsHash:string;callerIdentity:string;allowedCallerIdentities:readonly string[];
 approval?:any;mandateDecision?:any;trustDecision:TrustDecisionLike;revDecision:RevDecisionLike;policyVersion:string;riskClass:any;
 expectedTrustServiceIdentity:string;expectedRevServiceIdentity:string;now:string;
}
export interface SignerCoordinatorResult{
 status:"SIGNED"|"IDENTICAL_RETRY"|"SIGNER_STATUS_UNKNOWN";operationId:string;keyRef:string|null;signatureRef:string|null;providerOperationRef:string|null;
}

export class SignerCoordinator{
 constructor(private readonly db:PostgresPersistence,private readonly provider:SignerProvider,private readonly digestVerifier:SigningDigestVerifier){}
 async execute(input:{operationId:string;evidence:ProductionSigningEvidence}):Promise<SignerCoordinatorResult>{
  const e=input.evidence;
  const verification:SigningResult=dryRunVerifySigning({...e,replayStore:new VerificationOnlyReplayStore()});
  if(verification.status!=="DRY_RUN_ACCEPTED")throw new SignerRuntimeError(verification.reason_codes[0]??"SIGNING_VERIFICATION_FAILED",false);
  const prepared=await this.digestVerifier.prepare(e.request);
  if(prepared.sourcePayloadHash!==e.request.payload.payload_hash)throw new SignerRuntimeError("SIGNING_DIGEST_PAYLOAD_MISMATCH",false);
  if(prepared.digest.length===0)throw new SignerRuntimeError("SIGNING_DIGEST_EMPTY",false);
  const chainId=String((e.request.payload.body as any).chain_id??"");
  const actionType=String((e.action as any).action_type??"");
  const requestHash=sha256DomainSeparated("SSW:PRODUCTION_SIGNING_REQUEST:V1",e.request as unknown as CanonicalJson).hash;
  const digestRef="hex:"+prepared.digest.toString("hex");

  let selected:SignerKeyDescriptor|undefined;
  const reservation=await this.db.transaction(async s=>{
   const idem=await s.claimIdempotency({ownerService:"signing",key:e.request.replay.idempotency_key,requestHash,expiresAt:e.request.expires_at});
   if(idem==="CONFLICT")throw new SignerRuntimeError("IDEMPOTENCY_CONFLICT",false);
   if(idem==="IDENTICAL_RETRY"){
    const existing=await s.getSigningOperationByRequest(e.request.signing_request_id);
    if(existing)return{retry:true,existing};
   }
   const replay=await s.claimReplay({ownerService:"signing",replayToken:e.request.replay.replay_token,requestHash,revDecisionId:e.revDecision.decision_id,expiresAt:e.request.expires_at});
   if(replay!=="FRESH")throw new SignerRuntimeError("REPLAY_DETECTED",false);
   const keys=await s.findEligibleSignerKeys({holderDid:e.request.holder_did,keyClass:e.request.requested_key_class,chainId,actionType});
   if(keys.length!==1)throw new SignerRuntimeError(keys.length===0?"KEY_NOT_ELIGIBLE":"SIGNER_KEY_AMBIGUOUS",false);
   selected={keyRef:keys[0]!.key_ref,holderDid:keys[0]!.holder_did,keyClass:keys[0]!.key_class,providerClass:keys[0]!.provider_class,algorithm:keys[0]!.algorithm,publicKeyRef:keys[0]!.public_key_ref,allowedChains:keys[0]!.allowed_chains,allowedActionTypes:keys[0]!.allowed_action_types,status:keys[0]!.status};
   if(selected.providerClass!==this.provider.providerClass)throw new SignerRuntimeError("SIGNER_PROVIDER_CLASS_MISMATCH",false);
   const providerKey=await this.provider.describeKey(selected.keyRef);if(!providerKey||providerKey.status!=="ACTIVE")throw new SignerRuntimeError("KEY_NOT_ELIGIBLE",false);
   await s.beginSigningOperation({operationId:input.operationId,signingRequestId:e.request.signing_request_id,actionId:e.request.action_id,requestHash,payloadHash:e.request.payload.payload_hash,signingDigest:digestRef,digestProfile:prepared.digestProfile,keyRef:selected.keyRef,revDecisionId:e.revDecision.decision_id});
   return{retry:false,existing:null};
  });

  if(reservation.retry){
   const existing=reservation.existing;
   if(existing.status==="SIGNED")return{status:"IDENTICAL_RETRY",operationId:existing.operation_id,keyRef:existing.key_ref,signatureRef:existing.signature_ref,providerOperationRef:existing.provider_operation_ref};
   if(existing.status==="SIGNER_STATUS_UNKNOWN")return{status:"SIGNER_STATUS_UNKNOWN",operationId:existing.operation_id,keyRef:existing.key_ref,signatureRef:null,providerOperationRef:existing.provider_operation_ref};
   throw new SignerRuntimeError("SIGNING_OPERATION_ALREADY_IN_PROGRESS",true);
  }

  try{
   await this.db.session().markSigningOperationSigning(input.operationId);
   const result=await this.provider.signDigest({operationId:input.operationId,keyRef:selected!.keyRef,digest:prepared.digest,digestProfile:prepared.digestProfile,idempotencyKey:e.request.replay.idempotency_key});
   if(result.keyRef!==selected!.keyRef)throw new SignerRuntimeError("SIGNER_KEY_RESULT_MISMATCH",false);
   const signatureRef=`${result.signatureFormat.toLowerCase()}:${result.signature.toString("base64url")}`;
   await this.db.session().completeSigningOperation({operationId:input.operationId,status:"SIGNED",providerOperationRef:result.providerOperationRef,signatureRef});
   return{status:"SIGNED",operationId:input.operationId,keyRef:selected!.keyRef,signatureRef,providerOperationRef:result.providerOperationRef};
  }catch(error){
   const unknown=error instanceof SignerRuntimeError&&error.outcomeUnknown;
   await this.db.session().completeSigningOperation({operationId:input.operationId,status:unknown?"SIGNER_STATUS_UNKNOWN":"REJECTED",providerOperationRef:null,signatureRef:null,reasonCode:error instanceof SignerRuntimeError?error.code:"SIGNER_PROVIDER_ERROR"});
   if(unknown)return{status:"SIGNER_STATUS_UNKNOWN",operationId:input.operationId,keyRef:selected!.keyRef,signatureRef:null,providerOperationRef:null};
   throw error;
  }
 }
}

export {evaluatePortableKeyRuntime} from "./portable-key-runtime.js";
export type {PortableKeyRuntimeInput,PortableKeyRuntimeDecision} from "./portable-key-runtime.js";
export type {PortableKeyManifest,SoulScanRecoveryAuthorization,PortableEncryptedKeyObject,PortableKeyRecoveryProvider,PortableSigningSession} from "./portable-key.js";
