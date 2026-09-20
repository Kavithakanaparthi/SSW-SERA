export type WorkspaceKind=
 "ASSET"|"TRANSACTION_REVIEW"|"CREDENTIAL_DISCLOSURE"|"IDENTITY"|"INTELLIGENCE"|
 "CHAIN_COMPARISON"|"COUNTERPARTY"|"BOARDING_PASS"|"QR_PRESENTATION"|"WALLETCONNECT"|
 "POLICY_REV"|"ACTIVITY_EVIDENCE"|"SETTINGS"|"SECURITY";

export type InspectabilityLevel=0|1|2|3|4;
export type CanonicalWalletSurface=
 "ASSETS"|"SEND"|"RECEIVE"|"SWAP"|"CREDENTIALS"|"ACTIVITY"|"SECURITY"|"IDENTITY"|"SETTINGS"|"WALLETCONNECT";

export interface WorkspaceSourceRef{
 sourceType:"WALLET_STATE"|"CREDENTIAL"|"ACTION_CONTRACT"|"ROUTE_DECISION"|"SAEL"|"EXTERNAL_CONTEXT"|"POLICY_DECISION"|"TRUST_DECISION"|"REV_DECISION";
 ref:string;
 authoritative:boolean;
}

export interface WorkspaceAction{
 actionId:string;
 label:string;
 capability:string;
 effect:"READ"|"PREPARE"|"AUTHORIZE"|"NAVIGATE";
 canonicalSurface:CanonicalWalletSurface|null;
 requiresReview:boolean;
}

export interface AdaptiveWorkspaceInput{
 workspaceId:string;
 kind:WorkspaceKind;
 title:string;
 summary:string;
 sourceRefs:WorkspaceSourceRef[];
 actions:WorkspaceAction[];
 fallbackSurface:CanonicalWalletSurface;
 inspectabilityLevel:InspectabilityLevel;
 expiresAt:string|null;
 generatedAt:string;
 externalContentPresent:boolean;
 consequential:boolean;
}

export interface AdaptiveWorkspaceDecision{
 workspaceId:string;
 renderable:boolean;
 title:string;
 summary:string;
 kind:WorkspaceKind;
 fallbackSurface:CanonicalWalletSurface;
 inspectabilityLevel:InspectabilityLevel;
 canShowUnderlyingState:true;
 canNavigateToCanonicalSurface:true;
 authoritativeSourceCount:number;
 externalSourceCount:number;
 externalContentLabeled:boolean;
 allowedActions:WorkspaceAction[];
 blockedActions:{actionId:string;reason:string}[];
 reasons:string[];
}

const consequentialKinds=new Set<WorkspaceKind>(["TRANSACTION_REVIEW","CREDENTIAL_DISCLOSURE","WALLETCONNECT","POLICY_REV","SECURITY"]);

export function decideAdaptiveWorkspace(input:AdaptiveWorkspaceInput,now:string):AdaptiveWorkspaceDecision{
 const reasons:string[]=[];
 const blocked:{actionId:string;reason:string}[]=[];
 const allowed:WorkspaceAction[]=[];

 if(input.expiresAt&&Date.parse(input.expiresAt)<=Date.parse(now))reasons.push("WORKSPACE_EXPIRED");
 if(!input.sourceRefs.length)reasons.push("SOURCE_REFERENCE_REQUIRED");

 const authoritative=input.sourceRefs.filter(s=>s.authoritative).length;
 const external=input.sourceRefs.filter(s=>s.sourceType==="EXTERNAL_CONTEXT").length;
 const mustHaveAuthoritative=input.consequential||consequentialKinds.has(input.kind);

 if(mustHaveAuthoritative&&authoritative===0)reasons.push("AUTHORITATIVE_SOURCE_REQUIRED");

 for(const a of input.actions){
  if(!a.actionId.trim()||!a.capability.trim()){blocked.push({actionId:a.actionId,reason:"INVALID_ACTION"});continue;}
  if(a.effect==="AUTHORIZE"){
   blocked.push({actionId:a.actionId,reason:"WORKSPACE_CANNOT_AUTHORIZE"});
   continue;
  }
  if(a.effect==="PREPARE"&&mustHaveAuthoritative&&authoritative===0){
   blocked.push({actionId:a.actionId,reason:"AUTHORITATIVE_SOURCE_REQUIRED"});
   continue;
  }
  allowed.push({...a,requiresReview:a.effect==="PREPARE"?true:a.requiresReview});
 }

 const fatal=reasons.some(r=>r==="WORKSPACE_EXPIRED"||r==="SOURCE_REFERENCE_REQUIRED"||r==="AUTHORITATIVE_SOURCE_REQUIRED");
 return{
  workspaceId:input.workspaceId,
  renderable:!fatal,
  title:input.title,
  summary:input.summary,
  kind:input.kind,
  fallbackSurface:input.fallbackSurface,
  inspectabilityLevel:input.inspectabilityLevel,
  canShowUnderlyingState:true,
  canNavigateToCanonicalSurface:true,
  authoritativeSourceCount:authoritative,
  externalSourceCount:external,
  externalContentLabeled:input.externalContentPresent||external>0,
  allowedActions:allowed,
  blockedActions:blocked,
  reasons:[...new Set(reasons)].sort()
 };
}

export interface FallbackTrayItem{
 surface:CanonicalWalletSurface;
 enabled:boolean;
 reason:string|null;
}

const canonicalOrder:CanonicalWalletSurface[]=[
 "ASSETS","SEND","RECEIVE","SWAP","CREDENTIALS","ACTIVITY","SECURITY","IDENTITY","WALLETCONNECT","SETTINGS"
];

export function buildDeterministicFallbackTray(input:{
 walletCoreAvailable:boolean;
 signingAvailable:boolean;
 credentialsAvailable:boolean;
 activityAvailable:boolean;
 securityAvailable:boolean;
 identityAvailable:boolean;
 walletConnectAvailable:boolean;
 settingsAvailable:boolean;
}):FallbackTrayItem[]{
 return canonicalOrder.map(surface=>{
  if(!input.walletCoreAvailable)return{surface,enabled:surface==="SECURITY"&&input.securityAvailable,reason:"WALLET_CORE_UNAVAILABLE"};
  if(surface==="SEND"||surface==="SWAP")return{surface,enabled:input.signingAvailable,reason:input.signingAvailable?null:"SIGNING_UNAVAILABLE"};
  if(surface==="CREDENTIALS")return{surface,enabled:input.credentialsAvailable,reason:input.credentialsAvailable?null:"CREDENTIALS_UNAVAILABLE"};
  if(surface==="ACTIVITY")return{surface,enabled:input.activityAvailable,reason:input.activityAvailable?null:"ACTIVITY_UNAVAILABLE"};
  if(surface==="SECURITY")return{surface,enabled:input.securityAvailable,reason:input.securityAvailable?null:"SECURITY_UNAVAILABLE"};
  if(surface==="IDENTITY")return{surface,enabled:input.identityAvailable,reason:input.identityAvailable?null:"IDENTITY_UNAVAILABLE"};
  if(surface==="WALLETCONNECT")return{surface,enabled:input.walletConnectAvailable,reason:input.walletConnectAvailable?null:"WALLETCONNECT_UNAVAILABLE"};
  if(surface==="SETTINGS")return{surface,enabled:input.settingsAvailable,reason:input.settingsAvailable?null:"SETTINGS_UNAVAILABLE"};
  return{surface,enabled:true,reason:null};
 });
}

export function assertFallbackCriticalAccess(items:FallbackTrayItem[]){
 const security=items.find(x=>x.surface==="SECURITY");
 const identity=items.find(x=>x.surface==="IDENTITY");
 if(!security?.enabled)throw new Error("SECURITY_FALLBACK_REQUIRED");
 if(!identity?.enabled)throw new Error("IDENTITY_FALLBACK_REQUIRED");
 return true;
}
