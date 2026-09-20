import {randomUUID} from "node:crypto";
import {assertContract} from "@soulverse/schema-validation";

export type SoulIdStatus="ACTIVE"|"SUSPENDED"|"REVOKED";
export type SeraGovernanceStatus="ACTIVE"|"SUSPENDED"|"REVOKED";

export interface SoulIdResolution{
 holderDid:string;
 status:SoulIdStatus;
 didDocumentRef:string;
 documentVersion:number;
 recoveryPolicyRef:string|null;
 verificationMethodRefs:string[];
 integrityRef:string;
 observedAt:string;
 validUntil:string;
}

export interface WalletIdentityResolution{
 walletContextRef:string;
 holderDid:string;
 authorizedSeraAgentDid:string;
 relationshipStatus:SeraGovernanceStatus;
 bindingRef:string;
 bindingVersion:number;
 observedAt:string;
 validUntil:string;
}

export interface SoulIdProvider{
 resolveHolderDid(input:{holderDid:string;now:string}):Promise<SoulIdResolution|null>;
 resolveWalletIdentity(input:{holderDid:string;seraAgentDid:string;now:string}):Promise<WalletIdentityResolution|null>;
}

export class SoulIdRuntimeError extends Error{
 constructor(public readonly code:string){super(code);this.name="SoulIdRuntimeError";}
}

function validDate(value:string){return Number.isFinite(Date.parse(value));}
function uniqueSorted(values:string[],max=32){return [...new Set(values.map(v=>v.trim()).filter(Boolean))].sort().slice(0,max);}

export class SoulIdRuntime{
 constructor(private readonly provider:SoulIdProvider){}

 async resolveHolderContext(input:{holderDid:string;seraAgentDid:string;now:string;contextId?:string}){
  if(!input.holderDid.startsWith("did:soul:")||input.holderDid.startsWith("did:soul:agent:"))throw new SoulIdRuntimeError("INVALID_HOLDER_DID");
  if(!input.seraAgentDid.startsWith("did:soul:agent:"))throw new SoulIdRuntimeError("INVALID_SERA_AGENT_DID");
  if(input.holderDid===input.seraAgentDid)throw new SoulIdRuntimeError("IDENTITY_COLLISION");

  const soul=await this.provider.resolveHolderDid({holderDid:input.holderDid,now:input.now});
  if(!soul)throw new SoulIdRuntimeError("SOUL_ID_NOT_RESOLVED");
  if(soul.holderDid!==input.holderDid)throw new SoulIdRuntimeError("SOUL_ID_BINDING_MISMATCH");
  if(soul.status!=="ACTIVE")throw new SoulIdRuntimeError(soul.status==="REVOKED"?"SOUL_ID_REVOKED":"SOUL_ID_SUSPENDED");
  if(!Number.isInteger(soul.documentVersion)||soul.documentVersion<1)throw new SoulIdRuntimeError("SOUL_ID_VERSION_INVALID");
  if(!validDate(soul.observedAt)||!validDate(soul.validUntil)||Date.parse(soul.validUntil)<=Date.parse(input.now))throw new SoulIdRuntimeError("SOUL_ID_CONTEXT_STALE");
  if(!soul.didDocumentRef||!soul.integrityRef)throw new SoulIdRuntimeError("SOUL_ID_PROVENANCE_REQUIRED");

  const wallet=await this.provider.resolveWalletIdentity({holderDid:input.holderDid,seraAgentDid:input.seraAgentDid,now:input.now});
  if(!wallet)throw new SoulIdRuntimeError("WALLET_CONTEXT_NOT_RESOLVED");
  if(wallet.holderDid!==input.holderDid)throw new SoulIdRuntimeError("WALLET_HOLDER_BINDING_MISMATCH");
  if(wallet.authorizedSeraAgentDid!==input.seraAgentDid)throw new SoulIdRuntimeError("SERA_GOVERNANCE_BINDING_MISMATCH");
  if(wallet.relationshipStatus!=="ACTIVE")throw new SoulIdRuntimeError(wallet.relationshipStatus==="REVOKED"?"SERA_GOVERNANCE_REVOKED":"SERA_GOVERNANCE_SUSPENDED");
  if(!Number.isInteger(wallet.bindingVersion)||wallet.bindingVersion<1)throw new SoulIdRuntimeError("SERA_GOVERNANCE_VERSION_INVALID");
  if(!validDate(wallet.observedAt)||!validDate(wallet.validUntil)||Date.parse(wallet.validUntil)<=Date.parse(input.now))throw new SoulIdRuntimeError("WALLET_IDENTITY_CONTEXT_STALE");
  if(!wallet.walletContextRef||!wallet.bindingRef)throw new SoulIdRuntimeError("WALLET_IDENTITY_PROVENANCE_REQUIRED");

  const validUntil=new Date(Math.min(Date.parse(soul.validUntil),Date.parse(wallet.validUntil))).toISOString();
  const observedAt=new Date(Math.max(Date.parse(soul.observedAt),Date.parse(wallet.observedAt))).toISOString();

  return assertContract("holder-identity-context",{
   schema:"ssw.holder-identity-context.v1",
   context_id:input.contextId??randomUUID(),
   holder_did:input.holderDid,
   sera_agent_did:input.seraAgentDid,
   wallet_context_ref:wallet.walletContextRef,
   soul_id:{
    status:"ACTIVE",
    did_document_ref:soul.didDocumentRef,
    document_version:soul.documentVersion,
    recovery_policy_ref:soul.recoveryPolicyRef,
    verification_method_refs:uniqueSorted(soul.verificationMethodRefs),
    integrity_ref:soul.integrityRef
   },
   sera_governance:{
    status:"VERIFIED",
    binding_ref:wallet.bindingRef,
    binding_version:wallet.bindingVersion
   },
   continuity:{
    wallet_ownership_root:"SOUL_ID",
    device_ownership_root:false,
    recovery_root:"SOUL_ID_SOULSCAN",
    identity_continuity:"ESTABLISHED"
   },
   authority_effect:"NONE",
   observed_at:observedAt,
   valid_until:validUntil,
   created_at:input.now
  });
 }
}

export class SoulIdHolderContextSource{
 constructor(private readonly runtime:SoulIdRuntime){}
 async fetch(input:{holderDid:string;seraAgentDid:string;contextKey:string;purpose:string;now:string}){
  const context:any=await this.runtime.resolveHolderContext({holderDid:input.holderDid,seraAgentDid:input.seraAgentDid,now:input.now});
  return{
   contextKey:input.contextKey,
   contextTier:"C2" as const,
   value:{
    holder_did:context.holder_did,
    sera_agent_did:context.sera_agent_did,
    wallet_context_ref:context.wallet_context_ref,
    soul_id_status:context.soul_id.status,
    did_document_ref:context.soul_id.did_document_ref,
    document_version:context.soul_id.document_version,
    sera_governance_status:context.sera_governance.status,
    continuity:context.continuity,
    authority_effect:"NONE"
   },
   sourceType:"WALLET_STATE" as const,
   sourceRef:context.wallet_context_ref,
   provenance:"AUTHORITATIVE_STORE" as const,
   observedAt:context.observed_at,
   validUntil:context.valid_until,
   confidence:1,
   retentionClass:"RT1" as const,
   externalTransmissionAllowed:false
  };
 }
}
