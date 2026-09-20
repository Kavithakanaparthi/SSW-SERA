export type InteractionModality="TEXT"|"VOICE";
export type ConcealmentLevel="H0"|"H1"|"H2"|"H3";
export type PresentationSurface="IN_APP"|"LOCK_SCREEN"|"NOTIFICATION"|"WIDGET"|"LIVE_ACTIVITY"|"WEARABLE"|"VOICE_OUTPUT";
export type RevealState="CONCEALED"|"REVEALED";

export interface InteractionSafetyInput{
 modality:InteractionModality;
 voiceDecision:"CONTINUE"|"CLARIFY"|"STOP"|"REQUIRE_INDEPENDENT_AUTHORIZATION"|null;
 consequential:boolean;
 requiresIndependentAuthorization:boolean;
}

export interface ConcealedPresentationInput{
 presentationId:string;
 surface:PresentationSurface;
 concealmentLevel:ConcealmentLevel;
 revealState:RevealState;
 authenticationRequired:boolean;
 authenticated:boolean;
 requiredReviewFields:string[];
 reviewedFields:string[];
 sensitiveFieldNames:string[];
 autoRehideSeconds:number|null;
 revealedAt:string|null;
 now:string;
 appBackgrounded:boolean;
 screenLocked:boolean;
 deviceChanged:boolean;
 explicitHide:boolean;
}

export interface ConcealedPresentationDecision{
 presentationId:string;
 revealState:RevealState;
 maySpeakSensitiveDetails:boolean;
 mayRenderSensitiveDetails:boolean;
 reviewSatisfied:boolean;
 approvalEligible:boolean;
 rehideReason:string|null;
 missingReviewFields:string[];
 authorityEffect:"NONE";
}

export function evaluateInteractionSafety(input:InteractionSafetyInput){
 if(input.modality==="TEXT"){
  return{
   continue:true,
   clarificationRequired:false,
   stop:false,
   independentAuthorizationRequired:input.requiresIndependentAuthorization||input.consequential,
   authorityEffect:"NONE" as const
  };
 }
 if(!input.voiceDecision)throw new Error("VOICE_DECISION_REQUIRED");
 return{
  continue:input.voiceDecision==="CONTINUE"||input.voiceDecision==="REQUIRE_INDEPENDENT_AUTHORIZATION",
  clarificationRequired:input.voiceDecision==="CLARIFY",
  stop:input.voiceDecision==="STOP",
  independentAuthorizationRequired:input.requiresIndependentAuthorization||input.consequential||input.voiceDecision==="REQUIRE_INDEPENDENT_AUTHORIZATION",
  authorityEffect:"NONE" as const
 };
}

function shouldRehide(input:ConcealedPresentationInput){
 if(input.explicitHide)return"EXPLICIT_HIDE";
 if(input.appBackgrounded)return"APP_BACKGROUNDED";
 if(input.screenLocked)return"SCREEN_LOCKED";
 if(input.deviceChanged)return"DEVICE_CHANGED";
 if(input.revealState==="REVEALED"&&input.autoRehideSeconds!==null&&input.revealedAt){
  const elapsed=(Date.parse(input.now)-Date.parse(input.revealedAt))/1000;
  if(elapsed>=input.autoRehideSeconds)return"AUTO_REHIDE_TIMEOUT";
 }
 return null;
}

export function decideConcealedPresentation(input:ConcealedPresentationInput):ConcealedPresentationDecision{
 const rehideReason=shouldRehide(input);
 const effectiveReveal:RevealState=rehideReason?"CONCEALED":input.revealState;
 const authOk=!input.authenticationRequired||input.authenticated;
 const revealAllowed=effectiveReveal==="REVEALED"&&authOk;
 const missing=input.requiredReviewFields.filter(f=>!input.reviewedFields.includes(f));
 const reviewSatisfied=missing.length===0;
 const highConcealment=input.concealmentLevel==="H2"||input.concealmentLevel==="H3";

 return{
  presentationId:input.presentationId,
  revealState:effectiveReveal,
  maySpeakSensitiveDetails:revealAllowed&&!highConcealment,
  mayRenderSensitiveDetails:revealAllowed,
  reviewSatisfied,
  approvalEligible:revealAllowed&&reviewSatisfied,
  rehideReason,
  missingReviewFields:missing,
  authorityEffect:"NONE"
 };
}

export function requestReveal(input:ConcealedPresentationInput){
 if(input.authenticationRequired&&!input.authenticated){
  return{allowed:false,reason:"AUTHENTICATION_REQUIRED",authorityEffect:"NONE" as const};
 }
 return{allowed:true,reason:null,authorityEffect:"NONE" as const};
}

export function assertRevealApprovalSeparation(input:{revealEventRef:string|null;approvalEventRef:string|null}){
 if(input.revealEventRef&&input.approvalEventRef&&input.revealEventRef===input.approvalEventRef)throw new Error("REVEAL_AND_APPROVAL_MUST_BE_DISTINCT");
 return true;
}
