import {createHash,randomUUID} from "node:crypto";

export type CredentialProtocol="OPENID4VP"|"SOULOGRAM_DIRECT";
export type CredentialFormat="W3C_VC_JWT"|"SD_JWT_VC"|"JWT_VP"|"SOULOGRAM_VP";
export type ClaimSensitivity="LOW"|"MODERATE"|"HIGH"|"RESTRICTED";

export interface CredentialPresentationRequest{
 requestId:string;
 holderDid:string;
 seraAgentDid:string;
 verifierCanonicalId:string;
 protocol:CredentialProtocol;
 nonce:string;
 domain:string|null;
 purpose:string;
 requestedClaims:string[];
 requestedCredentialTypes:string[];
 issuedAt:string;
 expiresAt:string;
}

export interface CredentialDescriptor{
 credentialRef:string;
 credentialType:string;
 issuerRef:string;
 format:CredentialFormat;
 status:"ACTIVE"|"SUSPENDED"|"REVOKED"|"EXPIRED";
 claimNames:string[];
 claimSensitivity:Record<string,ClaimSensitivity>;
 validUntil:string|null;
}

export interface CredentialDisclosurePlan{
 schema:"ssw.credential-disclosure-plan.v1";
 planId:string;
 requestId:string;
 requestHash:string;
 holderDid:string;
 seraAgentDid:string;
 verifierCanonicalId:string;
 credentialRef:string;
 credentialType:string;
 protocol:CredentialProtocol;
 format:CredentialFormat;
 disclosedClaims:string[];
 sensitivity:"LOW"|"MODERATE"|"HIGH"|"RESTRICTED";
 holderReviewRequired:true;
 explicitApprovalRequired:true;
 trustRequired:boolean;
 revRequired:boolean;
 authorityEffect:"NONE";
 createdAt:string;
 expiresAt:string;
}

export interface CredentialControlEvidence{
 requestHash:string;
 reviewRef:string;
 authorizationRef:string;
 trustDecisionRef:string|null;
 revDecisionRef:string|null;
 trustSatisfied:boolean;
 revSatisfied:boolean;
 validUntil:string;
}

export interface SoulogramPresentationProvider{
 generate(input:{
  holderDid:string;credentialRef:string;verifierCanonicalId:string;protocol:CredentialProtocol;format:CredentialFormat;
  disclosedClaims:string[];nonce:string;domain:string|null;requestHash:string;authorizationRef:string;
 }):Promise<{proofRef:string;presentationTokenRef:string;format:CredentialFormat}>;
 present(input:{presentationTokenRef:string;verifierCanonicalId:string;protocol:CredentialProtocol;requestHash:string}):Promise<{receiptRef:string;presentedAt:string}>;
}

export class CredentialRuntimeError extends Error{constructor(public readonly code:string){super(code);}}

function normalizeStrings(values:string[],max=64){
 return [...new Set(values.map(v=>v.trim()).filter(Boolean))].sort().slice(0,max);
}
function canonical(value:unknown):string{
 if(value===null||typeof value!=="object")return JSON.stringify(value);
 if(Array.isArray(value))return "["+value.map(canonical).join(",")+"]";
 const o=value as Record<string,unknown>;
 return "{"+Object.keys(o).sort().map(k=>JSON.stringify(k)+":"+canonical(o[k])).join(",")+"}";
}
export function hashCredentialPresentationRequest(request:CredentialPresentationRequest){
 const normalized={...request,requestedClaims:normalizeStrings(request.requestedClaims),requestedCredentialTypes:normalizeStrings(request.requestedCredentialTypes)};
 return "sha256:"+createHash("sha256").update("SSW:CREDENTIAL_PRESENTATION_REQUEST:V1\n"+canonical(normalized)).digest("hex");
}
function sensitivityRank(s:ClaimSensitivity){return({LOW:0,MODERATE:1,HIGH:2,RESTRICTED:3})[s];}
function maxSensitivity(claims:string[],map:Record<string,ClaimSensitivity>):ClaimSensitivity{
 let result:ClaimSensitivity="LOW";
 for(const claim of claims){const next=map[claim]??"HIGH";if(sensitivityRank(next)>sensitivityRank(result))result=next;}
 return result;
}
function assertRequest(request:CredentialPresentationRequest,now:string){
 if(!request.holderDid.startsWith("did:soul:")||request.holderDid.startsWith("did:soul:agent:"))throw new CredentialRuntimeError("INVALID_HOLDER_DID");
 if(!request.seraAgentDid.startsWith("did:soul:agent:"))throw new CredentialRuntimeError("INVALID_SERA_AGENT_DID");
 if(request.holderDid===request.seraAgentDid)throw new CredentialRuntimeError("IDENTITY_COLLISION");
 if(!request.verifierCanonicalId.trim())throw new CredentialRuntimeError("VERIFIER_REQUIRED");
 if(!request.nonce.trim())throw new CredentialRuntimeError("NONCE_REQUIRED");
 if(!request.purpose.trim())throw new CredentialRuntimeError("PURPOSE_REQUIRED");
 if(!request.requestedClaims.length)throw new CredentialRuntimeError("CLAIMS_REQUIRED");
 if(Date.parse(request.expiresAt)<=Date.parse(now))throw new CredentialRuntimeError("REQUEST_EXPIRED");
 if(Date.parse(request.issuedAt)>Date.parse(now)+300000)throw new CredentialRuntimeError("REQUEST_ISSUED_IN_FUTURE");
}
export function selectCredentialForRequest(request:CredentialPresentationRequest,candidates:CredentialDescriptor[],now:string){
 assertRequest(request,now);
 const requestedClaims=normalizeStrings(request.requestedClaims);
 const requestedTypes=new Set(normalizeStrings(request.requestedCredentialTypes));
 const eligible=candidates.filter(c=>{
  if(c.status!=="ACTIVE")return false;
  if(c.validUntil&&Date.parse(c.validUntil)<=Date.parse(now))return false;
  if(requestedTypes.size&& !requestedTypes.has(c.credentialType))return false;
  const names=new Set(c.claimNames); return requestedClaims.every(x=>names.has(x));
 });
 if(eligible.length===0)throw new CredentialRuntimeError("NO_ELIGIBLE_CREDENTIAL");
 if(eligible.length>1)throw new CredentialRuntimeError("AMBIGUOUS_CREDENTIAL");
 return eligible[0]!;
}
export function buildCredentialDisclosurePlan(input:{request:CredentialPresentationRequest;credential:CredentialDescriptor;now:string;planId?:string;trustRequired?:boolean;revRequired?:boolean}):CredentialDisclosurePlan{
 assertRequest(input.request,input.now);
 if(input.credential.status!=="ACTIVE")throw new CredentialRuntimeError("CREDENTIAL_NOT_ACTIVE");
 const requestedClaims=normalizeStrings(input.request.requestedClaims);
 const available=new Set(input.credential.claimNames);
 if(requestedClaims.some(c=>!available.has(c)))throw new CredentialRuntimeError("REQUESTED_CLAIM_UNAVAILABLE");
 return{
  schema:"ssw.credential-disclosure-plan.v1",planId:input.planId??randomUUID(),requestId:input.request.requestId,
  requestHash:hashCredentialPresentationRequest(input.request),holderDid:input.request.holderDid,seraAgentDid:input.request.seraAgentDid,
  verifierCanonicalId:input.request.verifierCanonicalId,credentialRef:input.credential.credentialRef,credentialType:input.credential.credentialType,
  protocol:input.request.protocol,format:input.credential.format,disclosedClaims:requestedClaims,
  sensitivity:maxSensitivity(requestedClaims,input.credential.claimSensitivity),holderReviewRequired:true,explicitApprovalRequired:true,
  trustRequired:input.trustRequired??true,revRequired:input.revRequired??true,authorityEffect:"NONE",createdAt:input.now,
  expiresAt:Date.parse(input.request.expiresAt)<Date.parse(input.now)+300000?input.request.expiresAt:new Date(Date.parse(input.now)+300000).toISOString()
 };
}
export class CredentialPresentationRuntime{
 constructor(private readonly provider:SoulogramPresentationProvider){}
 async generateProof(input:{request:CredentialPresentationRequest;plan:CredentialDisclosurePlan;control:CredentialControlEvidence;now:string}){
  const expected=hashCredentialPresentationRequest(input.request);
  if(input.plan.requestHash!==expected||input.control.requestHash!==expected)throw new CredentialRuntimeError("REQUEST_BINDING_MISMATCH");
  if(input.plan.holderDid!==input.request.holderDid||input.plan.seraAgentDid!==input.request.seraAgentDid)throw new CredentialRuntimeError("IDENTITY_BINDING_MISMATCH");
  if(input.plan.verifierCanonicalId!==input.request.verifierCanonicalId)throw new CredentialRuntimeError("VERIFIER_BINDING_MISMATCH");
  if(Date.parse(input.plan.expiresAt)<=Date.parse(input.now)||Date.parse(input.control.validUntil)<=Date.parse(input.now))throw new CredentialRuntimeError("CONTROL_EXPIRED");
  if(!input.control.reviewRef||!input.control.authorizationRef)throw new CredentialRuntimeError("REVIEW_AND_AUTHORIZATION_REQUIRED");
  if(input.plan.trustRequired&&(!input.control.trustSatisfied||!input.control.trustDecisionRef))throw new CredentialRuntimeError("TRUST_REQUIRED");
  if(input.plan.revRequired&&(!input.control.revSatisfied||!input.control.revDecisionRef))throw new CredentialRuntimeError("REV_REQUIRED");
  return this.provider.generate({holderDid:input.request.holderDid,credentialRef:input.plan.credentialRef,verifierCanonicalId:input.plan.verifierCanonicalId,
   protocol:input.plan.protocol,format:input.plan.format,disclosedClaims:input.plan.disclosedClaims,nonce:input.request.nonce,domain:input.request.domain,
   requestHash:expected,authorizationRef:input.control.authorizationRef});
 }
 async present(input:{request:CredentialPresentationRequest;plan:CredentialDisclosurePlan;control:CredentialControlEvidence;proof:{presentationTokenRef:string};now:string}){
  const expected=hashCredentialPresentationRequest(input.request);
  if(input.plan.requestHash!==expected||input.control.requestHash!==expected)throw new CredentialRuntimeError("REQUEST_BINDING_MISMATCH");
  if(Date.parse(input.plan.expiresAt)<=Date.parse(input.now)||Date.parse(input.control.validUntil)<=Date.parse(input.now))throw new CredentialRuntimeError("CONTROL_EXPIRED");
  if(!input.control.authorizationRef)throw new CredentialRuntimeError("AUTHORIZATION_REQUIRED");
  if(input.plan.trustRequired&&!input.control.trustSatisfied)throw new CredentialRuntimeError("TRUST_REQUIRED");
  if(input.plan.revRequired&&!input.control.revSatisfied)throw new CredentialRuntimeError("REV_REQUIRED");
  return this.provider.present({presentationTokenRef:input.proof.presentationTokenRef,verifierCanonicalId:input.plan.verifierCanonicalId,protocol:input.plan.protocol,requestHash:expected});
 }
}
