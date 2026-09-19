import {assertContract} from "@soulverse/schema-validation";
import {sha256DomainSeparated,type CanonicalJson} from "@soulverse/canonicalization";

export const COUNTERPARTY_RESOLUTION_HASH_DOMAIN="SSW:COUNTERPARTY_RESOLUTION:V1";

export interface ResolverCandidate{
 candidate_id:string;display_label:string;class:"PERSON"|"ORGANIZATION"|"MERCHANT"|"WALLET_ADDRESS"|"SMART_CONTRACT"|"CREDENTIAL_VERIFIER"|"SERVICE_PROVIDER"|"AGENT"|"UNKNOWN";
 identifiers:{type:"DID"|"AGENT_DID"|"CHAIN_ADDRESS"|"CONTRACT_ADDRESS"|"MERCHANT_ID"|"VERIFIER_ID"|"PROVIDER_ID";value:string;chain_id?:string|null;normalized_value?:string|null}[];
 provenance:string[];confidence:number;verification_status:"VERIFIED"|"UNVERIFIED"|"STALE"|"CONFLICTED"|"REVOKED"|"UNKNOWN";
 last_verified_at?:string|null;risk_flags?:string[];
}
function authorityIdentifiers(c:ResolverCandidate){
 return c.identifiers.filter(id=>{
  if((id.type==="CHAIN_ADDRESS"||id.type==="CONTRACT_ADDRESS")&&(!id.chain_id||!id.normalized_value))return false;
  return true;
 });
}
function soleExternalProfile(c:ResolverCandidate){return c.provenance.length>0&&c.provenance.every(p=>p==="EXTERNAL_PROFILE");}

export function resolveCounterparty(input:{resolutionId:string;holderDid:string;originalReference:string;candidates:ResolverCandidate[];createdAt:string;expiresAt:string;minimumConfidence?:number;holderConfirmationRef?:string|null}){
 const minimum=input.minimumConfidence??0.8;
 const eligible=input.candidates.filter(c=>c.verification_status==="VERIFIED"&&c.confidence>=minimum&&!soleExternalProfile(c)&&authorityIdentifiers(c).length>0);
 let status:"UNIQUE"|"MULTIPLE_CANDIDATES"|"LOW_CONFIDENCE"|"UNRESOLVED"|"CONFLICTING_IDENTIFIERS";
 if(input.candidates.some(c=>c.verification_status==="CONFLICTED"))status="CONFLICTING_IDENTIFIERS";
 else if(eligible.length===1)status="UNIQUE";
 else if(eligible.length>1)status="MULTIPLE_CANDIDATES";
 else if(input.candidates.length===0)status="UNRESOLVED";
 else if(input.candidates.some(c=>c.confidence<minimum||c.verification_status==="UNVERIFIED"||c.verification_status==="UNKNOWN"))status="LOW_CONFIDENCE";
 else status="UNRESOLVED";

 let selected:any=null;
 if(status==="UNIQUE"){
  const c=eligible[0]!;
  const ids=authorityIdentifiers(c);
  const holderDidCandidate=ids.find(i=>i.type==="DID"&&!i.value.startsWith("did:soul:agent:"));
  const preferred=holderDidCandidate??ids.find(i=>i.type!=="AGENT_DID")??ids[0]!;
  selected={candidate_id:c.candidate_id,canonical_identifier_type:preferred.type,canonical_identifier_value:preferred.normalized_value??preferred.value,chain_id:preferred.chain_id??null,holder_confirmation_required:c.provenance.includes("HOLDER_ENTERED")&&!c.provenance.includes("HOLDER_CONFIRMED"),holder_confirmation_ref:input.holderConfirmationRef??null};
 }
 const core={schema:"ssw.counterparty-resolution.v1",resolution_id:input.resolutionId,holder_did:input.holderDid,original_reference:input.originalReference,status,candidates:input.candidates,selected,created_at:input.createdAt,expires_at:input.expiresAt};
 const hash=sha256DomainSeparated(COUNTERPARTY_RESOLUTION_HASH_DOMAIN,core as unknown as CanonicalJson).hash;
 return assertContract("counterparty-resolution",{...core,integrity:{resolution_hash:hash,signature_ref:null}});
}

export function requireExecutableCounterparty(resolutionInput:unknown,now:string):string{
 const r=assertContract("counterparty-resolution",resolutionInput) as any;
 if(Date.parse(r.expires_at)<=Date.parse(now))throw new Error("COUNTERPARTY_STALE");
 if(r.status!=="UNIQUE"||!r.selected)throw new Error(r.status==="MULTIPLE_CANDIDATES"?"COUNTERPARTY_AMBIGUOUS":"COUNTERPARTY_UNRESOLVED");
 if(r.selected.holder_confirmation_required&&!r.selected.holder_confirmation_ref)throw new Error("COUNTERPARTY_CONFIRMATION_REQUIRED");
 if(r.selected.canonical_identifier_type==="AGENT_DID")throw new Error("COUNTERPARTY_AGENT_OPERATOR_REQUIRED");
 return r.selected.canonical_identifier_value;
}
