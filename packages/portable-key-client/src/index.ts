import {createHash} from "node:crypto";
import type {SecureJsonClient} from "@soulverse/control-service-client";
import {assertContract} from "@soulverse/schema-validation";
import type {
 PortableKeyManifest,
 SoulScanRecoveryAuthorization,
 PortableEncryptedKeyObject,
 PortableSigningSession
} from "@soulverse/signer-runtime";

export class PortableKeyClientError extends Error{
 constructor(public readonly code:string,public readonly retryable=false){super(code);}
}

export interface PortableKeyManifestResolver{
 resolve(keyRef:string):Promise<PortableKeyManifest|null>;
}

export class StaticPortableKeyManifestResolver implements PortableKeyManifestResolver{
 constructor(private readonly manifests:ReadonlyMap<string,PortableKeyManifest>){}
 async resolve(keyRef:string){return this.manifests.get(keyRef)??null;}
}

export interface SoulScanAuthorizationRequest{
 holderDid:string;
 seraAgentDid:string|null;
 keyRef:string;
 purpose:"SIGN";
 recoveryId:string;
}

export class SoulScanAuthorizationClient{
 constructor(private readonly endpoint:string,private readonly client:SecureJsonClient){}
 async authorize(input:SoulScanAuthorizationRequest):Promise<SoulScanRecoveryAuthorization>{
  if(!this.endpoint.startsWith("https://"))throw new PortableKeyClientError("SOULSCAN_HTTPS_REQUIRED");
  const raw=await this.client.post(this.endpoint,{
   schema:"ssw.soulscan-key-recovery-request.v1",
   recovery_id:input.recoveryId,
   holder_did:input.holderDid,
   sera_agent_did:input.seraAgentDid,
   key_ref:input.keyRef,
   purpose:input.purpose
  });
  const auth=assertContract("soulscan-recovery-authorization",raw) as any;
  if(auth.holder_did!==input.holderDid)throw new PortableKeyClientError("SOULSCAN_HOLDER_MISMATCH");
  if(auth.sera_agent_did!==input.seraAgentDid)throw new PortableKeyClientError("SOULSCAN_SERA_BINDING_MISMATCH");
  if(auth.key_ref!==input.keyRef)throw new PortableKeyClientError("SOULSCAN_KEY_REFERENCE_MISMATCH");
  return auth as SoulScanRecoveryAuthorization;
 }
}

export interface EncryptedKeyObjectReference{
 schema:"ssw.encrypted-key-object-ref.v1";
 key_ref:string;cid:string;ciphertext_hash:string;encryption_profile:string;key_version:number;
 subject_did:string;governing_holder_did:string;created_at:string;
}
export type FetchLike=(url:string)=>Promise<{ok:boolean;status:number;arrayBuffer():Promise<ArrayBuffer>}>;
export class IpfsGatewayEncryptedKeyStore{
 constructor(private readonly gatewayBase:string,private readonly fetchFn:FetchLike,private readonly maxBytes=1_048_576){
  if(!gatewayBase.startsWith("https://"))throw new PortableKeyClientError("IPFS_GATEWAY_HTTPS_REQUIRED");
 }
 async fetch(refInput:unknown):Promise<PortableEncryptedKeyObject>{
  const ref=assertContract("encrypted-key-object-ref",refInput) as any as EncryptedKeyObjectReference;
  const base=this.gatewayBase.replace(/\/$/,"");const response=await this.fetchFn(`${base}/ipfs/${encodeURIComponent(ref.cid)}`);
  if(!response.ok)throw new PortableKeyClientError(response.status>=500?"IPFS_GATEWAY_UNAVAILABLE":"IPFS_KEY_OBJECT_NOT_FOUND",response.status>=500);
  const bytes=new Uint8Array(await response.arrayBuffer());if(bytes.byteLength===0)throw new PortableKeyClientError("IPFS_KEY_OBJECT_EMPTY");
  if(bytes.byteLength>this.maxBytes)throw new PortableKeyClientError("IPFS_KEY_OBJECT_TOO_LARGE");
  const hash="sha256:"+createHash("sha256").update(bytes).digest("hex");
  if(hash!==ref.ciphertext_hash)throw new PortableKeyClientError("IPFS_KEY_OBJECT_HASH_MISMATCH");
  return{cid:ref.cid,ciphertext:bytes,encryptionProfile:ref.encryption_profile,integrityHash:hash};
 }
}

export interface KeyEnvelopeOpener{
 open(input:{
  manifest:PortableKeyManifest;
  authorization:SoulScanRecoveryAuthorization;
  encryptedKey:PortableEncryptedKeyObject;
 }):Promise<PortableSigningSession>;
}

export class PortableKeyRecoveryCoordinator{
 constructor(
  private readonly manifests:PortableKeyManifestResolver,
  private readonly soulScan:SoulScanAuthorizationClient,
  private readonly ipfs:IpfsGatewayEncryptedKeyStore,
  private readonly envelopeOpener:KeyEnvelopeOpener
 ){}
 async openSigningSession(input:{
  holderDid:string;seraAgentDid:string|null;subjectDid:string;keyRef:string;recoveryId:string;
  encryptedObjectRef:unknown;now:string;minimumKeyVersion:number;
 }):Promise<PortableSigningSession>{
  const manifestRaw=await this.manifests.resolve(input.keyRef);if(!manifestRaw)throw new PortableKeyClientError("PORTABLE_KEY_MANIFEST_NOT_FOUND");
  const manifest=assertContract("portable-key-manifest",manifestRaw) as any as PortableKeyManifest;
  if((manifest as any).status!=="ACTIVE")throw new PortableKeyClientError("KEY_MANIFEST_NOT_ACTIVE");
  if((manifest as any).governing_holder_did!==input.holderDid)throw new PortableKeyClientError("KEY_MANIFEST_HOLDER_MISMATCH");
  if((manifest as any).subject_did!==input.subjectDid)throw new PortableKeyClientError("KEY_MANIFEST_SUBJECT_MISMATCH");
  if((manifest as any).key_version<input.minimumKeyVersion)throw new PortableKeyClientError("KEY_MANIFEST_ROLLBACK_DETECTED");
  if((manifest as any).expires_at&&Date.parse((manifest as any).expires_at)<=Date.parse(input.now))throw new PortableKeyClientError("KEY_MANIFEST_EXPIRED");
  const auth=await this.soulScan.authorize({holderDid:input.holderDid,seraAgentDid:input.seraAgentDid,keyRef:input.keyRef,purpose:"SIGN",recoveryId:input.recoveryId});
  if((auth as any).status!=="PASS")throw new PortableKeyClientError("SOULSCAN_RECOVERY_NOT_AUTHORIZED");
  if(Date.parse((auth as any).expires_at)<=Date.parse(input.now))throw new PortableKeyClientError("SOULSCAN_RECOVERY_AUTHORIZATION_EXPIRED");
  const ref=assertContract("encrypted-key-object-ref",input.encryptedObjectRef) as any;
  if(ref.key_ref!==(manifest as any).key_ref||ref.cid!==(manifest as any).encrypted_key_cid||ref.key_version!==(manifest as any).key_version)throw new PortableKeyClientError("KEY_OBJECT_BINDING_MISMATCH");
  const encryptedKey=await this.ipfs.fetch(ref);
  return await this.envelopeOpener.open({manifest,authorization:auth,encryptedKey});
 }
}
