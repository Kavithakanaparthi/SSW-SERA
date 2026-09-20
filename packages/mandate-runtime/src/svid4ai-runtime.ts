import {randomUUID} from "node:crypto";
import {assertContract} from "@soulverse/schema-validation";
import type {Mandate} from "@soulverse/contracts";

export type Svid4AiStatus="ACTIVE"|"SUSPENDED"|"REVOKED";

export interface Svid4AiResolution{
 seraAgentDid:string;
 governingHolderDid:string;
 operatorDid:string;
 status:Svid4AiStatus;
 didDocumentRef:string;
 documentVersion:number;
 verificationMethodRefs:string[];
 bindingRef:string;
 bindingVersion:number;
 integrityRef:string;
 observedAt:string;
 validUntil:string;
}

export interface Svid4AiProvider{
 resolveAgent(input:{seraAgentDid:string;holderDid:string;now:string}):Promise<Svid4AiResolution|null>;
}

export class Svid4AiRuntimeError extends Error{
 constructor(public readonly code:string){super(code);this.name="Svid4AiRuntimeError";}
}

function validDate(value:string){return Number.isFinite(Date.parse(value));}
function uniqueSorted(values:string[],max=32){return [...new Set(values.map(v=>v.trim()).filter(Boolean))].sort().slice(0,max);}

export class Svid4AiRuntime{
 constructor(private readonly provider:Svid4AiProvider){}

 async resolveAgentContext(input:{holderDid:string;seraAgentDid:string;now:string;contextId?:string}){
  if(!input.holderDid.startsWith("did:soul:")||input.holderDid.startsWith("did:soul:agent:"))throw new Svid4AiRuntimeError("INVALID_HOLDER_DID");
  if(!input.seraAgentDid.startsWith("did:soul:agent:"))throw new Svid4AiRuntimeError("INVALID_SERA_AGENT_DID");
  if(input.holderDid===input.seraAgentDid)throw new Svid4AiRuntimeError("IDENTITY_COLLISION");

  const r=await this.provider.resolveAgent({seraAgentDid:input.seraAgentDid,holderDid:input.holderDid,now:input.now});
  if(!r)throw new Svid4AiRuntimeError("SVID4AI_AGENT_NOT_RESOLVED");
  if(r.seraAgentDid!==input.seraAgentDid)throw new Svid4AiRuntimeError("SVID4AI_AGENT_BINDING_MISMATCH");
  if(r.governingHolderDid!==input.holderDid)throw new Svid4AiRuntimeError("SVID4AI_HOLDER_BINDING_MISMATCH");
  if(r.operatorDid!==input.holderDid)throw new Svid4AiRuntimeError("SVID4AI_OPERATOR_BINDING_MISMATCH");
  if(r.status!=="ACTIVE")throw new Svid4AiRuntimeError(r.status==="REVOKED"?"SVID4AI_AGENT_REVOKED":"SVID4AI_AGENT_SUSPENDED");
  if(!Number.isInteger(r.documentVersion)||r.documentVersion<1)throw new Svid4AiRuntimeError("SVID4AI_DOCUMENT_VERSION_INVALID");
  if(!Number.isInteger(r.bindingVersion)||r.bindingVersion<1)throw new Svid4AiRuntimeError("SVID4AI_BINDING_VERSION_INVALID");
  if(!validDate(r.observedAt)||!validDate(r.validUntil)||Date.parse(r.validUntil)<=Date.parse(input.now))throw new Svid4AiRuntimeError("SVID4AI_CONTEXT_STALE");
  if(!r.didDocumentRef||!r.bindingRef||!r.integrityRef)throw new Svid4AiRuntimeError("SVID4AI_PROVENANCE_REQUIRED");

  return assertContract("svid4ai-agent-context",{
   schema:"ssw.svid4ai-agent-context.v1",
   context_id:input.contextId??randomUUID(),
   holder_did:input.holderDid,
   sera_agent_did:input.seraAgentDid,
   operator_did:r.operatorDid,
   agent:{
    status:"ACTIVE",
    did_document_ref:r.didDocumentRef,
    document_version:r.documentVersion,
    verification_method_refs:uniqueSorted(r.verificationMethodRefs),
    integrity_ref:r.integrityRef
   },
   governance:{
    status:"VERIFIED",
    binding_ref:r.bindingRef,
    binding_version:r.bindingVersion,
    governing_holder_did:r.governingHolderDid,
    operator_did:r.operatorDid
   },
   delegation:{
    authority_source:"HOLDER_ISSUED_MANDATE",
    self_expansion_allowed:false,
    self_renewal_allowed:false,
    requires_mandate:true
   },
   trust:{
    trust_protocol_required_for_consequential_action:true,
    rev_required_for_consequential_action:true
   },
   authority_effect:"NONE",
   observed_at:r.observedAt,
   valid_until:r.validUntil,
   created_at:input.now
  });
 }

 bindMandate(input:{agentContext:unknown;mandate:Mandate;now:string}){
  const ctx:any=assertContract("svid4ai-agent-context",input.agentContext);
  const mandate=assertContract("mandate",input.mandate) as unknown as Mandate;
  if(Date.parse(ctx.valid_until)<=Date.parse(input.now))throw new Svid4AiRuntimeError("SVID4AI_CONTEXT_STALE");
  if(mandate.principal.holder_did!==ctx.holder_did)throw new Svid4AiRuntimeError("MANDATE_HOLDER_BINDING_MISMATCH");
  if(mandate.principal.sera_agent_did!==ctx.sera_agent_did)throw new Svid4AiRuntimeError("MANDATE_AGENT_BINDING_MISMATCH");
  if(mandate.revocation.status!=="ACTIVE")throw new Svid4AiRuntimeError("MANDATE_NOT_ACTIVE");
  if(Date.parse(input.now)<Date.parse(mandate.valid_from))throw new Svid4AiRuntimeError("MANDATE_NOT_YET_VALID");
  if(Date.parse(input.now)>=Date.parse(mandate.valid_until))throw new Svid4AiRuntimeError("MANDATE_EXPIRED");
  if(mandate.authority.self_renewal_allowed!==false)throw new Svid4AiRuntimeError("MANDATE_SELF_RENEWAL_PROHIBITED");
  if(!mandate.integrity.holder_signature_ref||!mandate.integrity.mandate_terms_hash)throw new Svid4AiRuntimeError("MANDATE_HOLDER_AUTHORIZATION_REQUIRED");

  return{
   holderDid:ctx.holder_did as string,
   seraAgentDid:ctx.sera_agent_did as string,
   operatorDid:ctx.operator_did as string,
   mandateId:mandate.mandate_id,
   mandateVersion:mandate.version,
   mandateTermsHash:mandate.integrity.mandate_terms_hash,
   authorityClass:mandate.authority.class,
   delegationType:mandate.authority.delegation_type,
   validUntil:mandate.valid_until,
   trustProtocolRequired:mandate.trust.trust_protocol_required,
   revRequired:mandate.trust.rev_required,
   aurionRequired:mandate.trust.aurion_required,
   authoritySource:"HOLDER_ISSUED_MANDATE" as const,
   executionAuthorized:false as const,
   requiresExecutionTimeControlPlane:true as const
  };
 }
}
