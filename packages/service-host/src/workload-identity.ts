import type {IncomingMessage} from "node:http";
import {TLSSocket} from "node:tls";
import type {IdentityVerifier,VerifiedIdentity} from "./index.js";

export interface WorkloadIdentityPolicy{
 trustDomains:readonly string[];
 allowedSpiffeIds?:ReadonlySet<string>;
 requireAuthorizedTls?:boolean;
 maxRemainingLifetimeMs?:number|null;
}

export interface PeerCertificateEvidence{
 authorized:boolean;
 subjectAltName:string|null;
 validFrom:string|null;
 validTo:string|null;
 fingerprint256:string|null;
 issuerCN:string|null;
}

export type WorkloadIdentityDecision=
 | {allowed:true;identity:VerifiedIdentity;spiffeId:string;trustDomain:string;certificateFingerprint256:string;validTo:string}
 | {allowed:false;reason:string};

function parseSpiffeUris(subjectAltName:string|null){
 if(!subjectAltName)return[];
 return subjectAltName.split(",").map(x=>x.trim()).filter(x=>x.startsWith("URI:spiffe://")).map(x=>x.slice(4));
}

export function evaluateWorkloadIdentity(evidence:PeerCertificateEvidence,policy:WorkloadIdentityPolicy,now:string):WorkloadIdentityDecision{
 if(policy.requireAuthorizedTls!==false&&!evidence.authorized)return{allowed:false,reason:"TLS_PEER_NOT_AUTHORIZED"};
 if(!evidence.fingerprint256)return{allowed:false,reason:"CERTIFICATE_FINGERPRINT_REQUIRED"};
 if(!evidence.validFrom||!evidence.validTo)return{allowed:false,reason:"CERTIFICATE_VALIDITY_REQUIRED"};
 const nowMs=Date.parse(now),fromMs=Date.parse(evidence.validFrom),toMs=Date.parse(evidence.validTo);
 if(!Number.isFinite(nowMs)||!Number.isFinite(fromMs)||!Number.isFinite(toMs))return{allowed:false,reason:"CERTIFICATE_VALIDITY_INVALID"};
 if(nowMs<fromMs)return{allowed:false,reason:"CERTIFICATE_NOT_YET_VALID"};
 if(nowMs>=toMs)return{allowed:false,reason:"CERTIFICATE_EXPIRED"};
 if(policy.maxRemainingLifetimeMs!==null&&policy.maxRemainingLifetimeMs!==undefined&&toMs-nowMs>policy.maxRemainingLifetimeMs)return{allowed:false,reason:"CERTIFICATE_LIFETIME_EXCEEDS_POLICY"};

 const uris=parseSpiffeUris(evidence.subjectAltName);
 if(uris.length===0)return{allowed:false,reason:"SPIFFE_ID_REQUIRED"};
 if(uris.length>1)return{allowed:false,reason:"AMBIGUOUS_SPIFFE_ID"};

 let parsed:URL;
 try{parsed=new URL(uris[0]!);}catch{return{allowed:false,reason:"SPIFFE_ID_INVALID"};}
 if(parsed.protocol!=="spiffe:")return{allowed:false,reason:"SPIFFE_ID_INVALID"};
 const trustDomain=parsed.hostname;
 if(!trustDomain||!policy.trustDomains.includes(trustDomain))return{allowed:false,reason:"SPIFFE_TRUST_DOMAIN_NOT_ALLOWED"};
 const spiffeId=uris[0]!;
 if(policy.allowedSpiffeIds&& !policy.allowedSpiffeIds.has(spiffeId))return{allowed:false,reason:"SPIFFE_ID_NOT_ALLOWED"};

 return{
  allowed:true,
  spiffeId,
  trustDomain,
  certificateFingerprint256:evidence.fingerprint256,
  validTo:new Date(toMs).toISOString(),
  identity:{
   subject:spiffeId,
   claims:{
    identity_type:"SPIFFE_X509_SVID",
    trust_domain:trustDomain,
    certificate_fingerprint_sha256:evidence.fingerprint256,
    certificate_valid_to:new Date(toMs).toISOString(),
    issuer_cn:evidence.issuerCN??""
   }
  }
 };
}

function tlsEvidence(request:IncomingMessage):PeerCertificateEvidence|null{
 const socket=request.socket;
 if(!(socket instanceof TLSSocket))return null;
 let cert:ReturnType<TLSSocket["getPeerCertificate"]>;
 try{cert=socket.getPeerCertificate();}catch{return null;}
 if(!cert||Object.keys(cert).length===0)return null;
 return{
  authorized:socket.authorized,
  subjectAltName:typeof cert.subjectaltname==="string"?cert.subjectaltname:null,
  validFrom:typeof cert.valid_from==="string"?cert.valid_from:null,
  validTo:typeof cert.valid_to==="string"?cert.valid_to:null,
  fingerprint256:typeof cert.fingerprint256==="string"?cert.fingerprint256:null,
  issuerCN:cert.issuer&&typeof cert.issuer.CN==="string"?cert.issuer.CN:null
 };
}

export class TlsSpiffeIdentityVerifier implements IdentityVerifier{
 constructor(private readonly policy:WorkloadIdentityPolicy,private readonly clock:()=>string=()=>new Date().toISOString()){}
 async verify(request:IncomingMessage):Promise<VerifiedIdentity|null>{
  const evidence=tlsEvidence(request);
  if(!evidence)return null;
  const decision=evaluateWorkloadIdentity(evidence,this.policy,this.clock());
  return decision.allowed?decision.identity:null;
 }
}

export interface WorkloadIdentityAuthorization{
 callerSpiffeId:string;
 allowedServices:readonly string[];
 allowedActions?:readonly string[];
}

export function authorizeWorkloadCaller(input:{identity:VerifiedIdentity|null;targetService:string;action?:string;grants:readonly WorkloadIdentityAuthorization[]}){
 if(!input.identity)return{allowed:false,reason:"WORKLOAD_IDENTITY_REQUIRED"} as const;
 const grant=input.grants.find(g=>g.callerSpiffeId===input.identity!.subject);
 if(!grant)return{allowed:false,reason:"WORKLOAD_IDENTITY_NOT_AUTHORIZED"} as const;
 if(!grant.allowedServices.includes(input.targetService))return{allowed:false,reason:"TARGET_SERVICE_NOT_ALLOWED"} as const;
 if(input.action&&grant.allowedActions&& !grant.allowedActions.includes(input.action))return{allowed:false,reason:"ACTION_NOT_ALLOWED"} as const;
 return{allowed:true,reason:null} as const;
}
