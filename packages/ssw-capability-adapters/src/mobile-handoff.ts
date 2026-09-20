export type DeviceClass="PRIMARY_PHONE"|"SECONDARY_PHONE"|"DESKTOP"|"WEB"|"APPLE_WATCH"|"WEAR_OS"|"WIDGET"|"NOTIFICATION_SURFACE";
export type HandoffRisk="LOW"|"MODERATE"|"HIGH"|"CRITICAL";
export type SurfaceClass="IN_APP"|"LOCK_SCREEN"|"NOTIFICATION"|"WIDGET"|"LIVE_ACTIVITY"|"DYNAMIC_ISLAND"|"WEARABLE"|"DESKTOP";

export interface DeviceCapabilityContext{
 deviceId:string;
 deviceClass:DeviceClass;
 trustState:"TRUSTED"|"LIMITED"|"SUSPENDED"|"REVOKED"|"UNKNOWN";
 allowedCapabilities:string[];
 attestedAt:string|null;
 attestationValidUntil:string|null;
}

export interface HandoffRequest{
 handoffId:string;
 holderDid:string;
 seraAgentDid:string;
 taskRef:string;
 actionRef:string|null;
 sourceDevice:DeviceCapabilityContext;
 targetDevice:DeviceCapabilityContext;
 requestedCapability:string;
 risk:HandoffRisk;
 createdAt:string;
 expiresAt:string;
}

export interface HandoffDecision{
 handoffId:string;
 allowed:boolean;
 targetDeviceId:string;
 taskStateTransferAllowed:boolean;
 authorityTransferred:false;
 freshControlPlaneRequired:boolean;
 freshAuthenticationRequired:boolean;
 reasonCodes:string[];
}

export function decideCrossDeviceHandoff(input:HandoffRequest,now:string):HandoffDecision{
 const reasons:string[]=[];
 if(Date.parse(input.expiresAt)<=Date.parse(now))reasons.push("HANDOFF_EXPIRED");
 if(input.sourceDevice.trustState==="REVOKED"||input.sourceDevice.trustState==="SUSPENDED")reasons.push("SOURCE_DEVICE_INELIGIBLE");
 if(input.targetDevice.trustState!=="TRUSTED"&&input.targetDevice.trustState!=="LIMITED")reasons.push("TARGET_DEVICE_INELIGIBLE");
 if(!input.targetDevice.allowedCapabilities.includes(input.requestedCapability))reasons.push("TARGET_CAPABILITY_NOT_ALLOWED");
 if(input.targetDevice.attestationValidUntil&&Date.parse(input.targetDevice.attestationValidUntil)<=Date.parse(now))reasons.push("TARGET_ATTESTATION_STALE");

 const high=input.risk==="HIGH"||input.risk==="CRITICAL";
 const wearable=input.targetDevice.deviceClass==="APPLE_WATCH"||input.targetDevice.deviceClass==="WEAR_OS";
 if(high&&wearable)reasons.push("HIGH_RISK_REQUIRES_FULL_SURFACE_HANDOFF");

 const allowed=reasons.length===0;
 return{
  handoffId:input.handoffId,
  allowed,
  targetDeviceId:input.targetDevice.deviceId,
  taskStateTransferAllowed:allowed,
  authorityTransferred:false,
  freshControlPlaneRequired:true,
  freshAuthenticationRequired:high||wearable,
  reasonCodes:reasons
 };
}

export interface ProactiveSurfaceInput{
 eventId:string;
 priority:"P0"|"P1"|"P2"|"P3"|"P4";
 surface:SurfaceClass;
 device:DeviceCapabilityContext;
 locked:boolean;
 concealmentLevel:"H0"|"H1"|"H2"|"H3";
 category:string;
 title:string;
 summary:string;
 sensitiveFieldsPresent:boolean;
 requestedActionCapability:string|null;
 freshnessExpiresAt:string|null;
}

export interface ProactiveSurfaceDecision{
 eventId:string;
 deliver:boolean;
 renderedTitle:string;
 renderedSummary:string;
 actionVisible:boolean;
 actionCapability:string|null;
 actionExecutesDirectly:false;
 requiresOpenTrustedSurface:boolean;
 authorityEffect:"NONE";
 reasonCodes:string[];
}

export function decideProactiveSurface(input:ProactiveSurfaceInput,now:string):ProactiveSurfaceDecision{
 const reasons:string[]=[];
 if(input.priority==="P4")reasons.push("LOW_VALUE_SUPPRESSED");
 if(input.device.trustState==="REVOKED"||input.device.trustState==="SUSPENDED"||input.device.trustState==="UNKNOWN")reasons.push("DEVICE_INELIGIBLE");
 if(input.freshnessExpiresAt&&Date.parse(input.freshnessExpiresAt)<=Date.parse(now))reasons.push("EVENT_STALE");

 const concealed=input.locked||input.concealmentLevel!=="H0";
 const genericTitle=input.priority==="P0"?"SERA security alert":"SERA needs your attention";
 const renderedTitle=concealed?genericTitle:input.title;
 const renderedSummary=concealed?(input.priority==="P0"?"Open Soul Super Wallet to review securely.":"Open SERA to review details."):input.summary;

 let actionVisible=false;
 let requiresOpenTrustedSurface=false;
 if(input.requestedActionCapability){
  const permitted=input.device.allowedCapabilities.includes(input.requestedActionCapability);
  const fullSurface=input.surface==="IN_APP"||input.surface==="DESKTOP";
  actionVisible=permitted&&fullSurface&&!concealed;
  requiresOpenTrustedSurface=!actionVisible;
  if(!permitted)reasons.push("SURFACE_CAPABILITY_NOT_ALLOWED");
 }

 return{
  eventId:input.eventId,
  deliver:!reasons.includes("LOW_VALUE_SUPPRESSED")&&!reasons.includes("DEVICE_INELIGIBLE")&&!reasons.includes("EVENT_STALE"),
  renderedTitle,
  renderedSummary,
  actionVisible,
  actionCapability:actionVisible?input.requestedActionCapability:null,
  actionExecutesDirectly:false,
  requiresOpenTrustedSurface,
  authorityEffect:"NONE",
  reasonCodes:[...new Set(reasons)].sort()
 };
}
