import test from "node:test";
import assert from "node:assert/strict";
import {assertRevealApprovalSeparation,decideConcealedPresentation,evaluateInteractionSafety,requestReveal} from "../../packages/ssw-capability-adapters/src/mobile-interaction.js";

test("voice consequential interaction inherits independent authorization requirement",()=>{
 const d=evaluateInteractionSafety({modality:"VOICE",voiceDecision:"CONTINUE",consequential:true,requiresIndependentAuthorization:false});
 assert.equal(d.continue,true);
 assert.equal(d.independentAuthorizationRequired,true);
 assert.equal(d.authorityEffect,"NONE");
});

test("voice ambiguity blocks forward progress into approval",()=>{
 const d=evaluateInteractionSafety({modality:"VOICE",voiceDecision:"CLARIFY",consequential:true,requiresIndependentAuthorization:false});
 assert.equal(d.continue,false);
 assert.equal(d.clarificationRequired,true);
});

test("authenticated reveal still does not authorize",()=>{
 const input={
  presentationId:"p1",surface:"IN_APP" as const,concealmentLevel:"H1" as const,revealState:"REVEALED" as const,
  authenticationRequired:true,authenticated:true,requiredReviewFields:["amount","recipient"],reviewedFields:["amount","recipient"],
  sensitiveFieldNames:["amount","recipient"],autoRehideSeconds:30,revealedAt:"2026-09-20T03:10:00Z",now:"2026-09-20T03:10:10Z",
  appBackgrounded:false,screenLocked:false,deviceChanged:false,explicitHide:false
 };
 const d=decideConcealedPresentation(input);
 assert.equal(d.mayRenderSensitiveDetails,true);
 assert.equal(d.reviewSatisfied,true);
 assert.equal(d.approvalEligible,true);
 assert.equal(d.authorityEffect,"NONE");
});

test("missing required review field prevents approval eligibility",()=>{
 const d=decideConcealedPresentation({
  presentationId:"p2",surface:"IN_APP",concealmentLevel:"H1",revealState:"REVEALED",
  authenticationRequired:false,authenticated:false,requiredReviewFields:["amount","recipient","network"],reviewedFields:["amount","recipient"],
  sensitiveFieldNames:["amount","recipient","network"],autoRehideSeconds:null,revealedAt:null,now:"2026-09-20T03:10:00Z",
  appBackgrounded:false,screenLocked:false,deviceChanged:false,explicitHide:false
 });
 assert.equal(d.approvalEligible,false);
 assert.deepEqual(d.missingReviewFields,["network"]);
});

test("backgrounding re-conceals revealed sensitive details",()=>{
 const d=decideConcealedPresentation({
  presentationId:"p3",surface:"IN_APP",concealmentLevel:"H1",revealState:"REVEALED",
  authenticationRequired:false,authenticated:false,requiredReviewFields:[],reviewedFields:[],sensitiveFieldNames:["amount"],
  autoRehideSeconds:30,revealedAt:"2026-09-20T03:10:00Z",now:"2026-09-20T03:10:05Z",
  appBackgrounded:true,screenLocked:false,deviceChanged:false,explicitHide:false
 });
 assert.equal(d.revealState,"CONCEALED");
 assert.equal(d.rehideReason,"APP_BACKGROUNDED");
 assert.equal(d.mayRenderSensitiveDetails,false);
});

test("H3 voice output never speaks sensitive details even after reveal",()=>{
 const d=decideConcealedPresentation({
  presentationId:"p4",surface:"VOICE_OUTPUT",concealmentLevel:"H3",revealState:"REVEALED",
  authenticationRequired:true,authenticated:true,requiredReviewFields:[],reviewedFields:[],sensitiveFieldNames:["amount"],
  autoRehideSeconds:null,revealedAt:null,now:"2026-09-20T03:10:00Z",
  appBackgrounded:false,screenLocked:false,deviceChanged:false,explicitHide:false
 });
 assert.equal(d.maySpeakSensitiveDetails,false);
 assert.equal(d.mayRenderSensitiveDetails,true);
});

test("reveal requiring authentication fails closed before auth",()=>{
 const r=requestReveal({
  presentationId:"p5",surface:"IN_APP",concealmentLevel:"H3",revealState:"CONCEALED",
  authenticationRequired:true,authenticated:false,requiredReviewFields:[],reviewedFields:[],sensitiveFieldNames:["amount"],
  autoRehideSeconds:null,revealedAt:null,now:"2026-09-20T03:10:00Z",
  appBackgrounded:false,screenLocked:false,deviceChanged:false,explicitHide:false
 });
 assert.equal(r.allowed,false);
 assert.equal(r.reason,"AUTHENTICATION_REQUIRED");
});

test("reveal and approval evidence references must remain distinct",()=>{
 assert.equal(assertRevealApprovalSeparation({revealEventRef:"sael:reveal:1",approvalEventRef:"sael:approval:1"}),true);
 assert.throws(()=>assertRevealApprovalSeparation({revealEventRef:"sael:event:1",approvalEventRef:"sael:event:1"}),/REVEAL_AND_APPROVAL_MUST_BE_DISTINCT/);
});
