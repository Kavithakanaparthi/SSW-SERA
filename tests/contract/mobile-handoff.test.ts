import test from "node:test";
import assert from "node:assert/strict";
import {decideCrossDeviceHandoff,decideProactiveSurface} from "../../packages/ssw-capability-adapters/src/mobile-handoff.js";

const now="2026-09-20T03:20:00Z";
const phone={deviceId:"phone-1",deviceClass:"PRIMARY_PHONE" as const,trustState:"TRUSTED" as const,allowedCapabilities:["payment.review","credential.review","wallet.read"],attestedAt:"2026-09-20T03:00:00Z",attestationValidUntil:"2026-09-20T04:00:00Z"};
const watch={deviceId:"watch-1",deviceClass:"APPLE_WATCH" as const,trustState:"LIMITED" as const,allowedCapabilities:["wallet.read","approval.low_risk"],attestedAt:"2026-09-20T03:00:00Z",attestationValidUntil:"2026-09-20T03:40:00Z"};

test("handoff transfers task state but never authority",()=>{
 const d=decideCrossDeviceHandoff({handoffId:"h1",holderDid:"did:soul:alice",seraAgentDid:"did:soul:agent:sera",taskRef:"task:1",actionRef:"action:1",sourceDevice:watch,targetDevice:phone,requestedCapability:"payment.review",risk:"HIGH",createdAt:now,expiresAt:"2026-09-20T03:25:00Z"},now);
 assert.equal(d.allowed,true);
 assert.equal(d.taskStateTransferAllowed,true);
 assert.equal(d.authorityTransferred,false);
 assert.equal(d.freshControlPlaneRequired,true);
 assert.equal(d.freshAuthenticationRequired,true);
});

test("wearable cannot receive unsupported payment review capability",()=>{
 const d=decideCrossDeviceHandoff({handoffId:"h2",holderDid:"did:soul:alice",seraAgentDid:"did:soul:agent:sera",taskRef:"task:2",actionRef:"action:2",sourceDevice:phone,targetDevice:watch,requestedCapability:"payment.review",risk:"MODERATE",createdAt:now,expiresAt:"2026-09-20T03:25:00Z"},now);
 assert.equal(d.allowed,false);
 assert.ok(d.reasonCodes.includes("TARGET_CAPABILITY_NOT_ALLOWED"));
});

test("high-risk wearable target is forced to full-surface handoff",()=>{
 const d=decideCrossDeviceHandoff({handoffId:"h3",holderDid:"did:soul:alice",seraAgentDid:"did:soul:agent:sera",taskRef:"task:3",actionRef:"action:3",sourceDevice:phone,targetDevice:{...watch,allowedCapabilities:[...watch.allowedCapabilities,"payment.review"]},requestedCapability:"payment.review",risk:"HIGH",createdAt:now,expiresAt:"2026-09-20T03:25:00Z"},now);
 assert.equal(d.allowed,false);
 assert.ok(d.reasonCodes.includes("HIGH_RISK_REQUIRES_FULL_SURFACE_HANDOFF"));
});

test("locked notification conceals sensitive details and cannot execute action directly",()=>{
 const d=decideProactiveSurface({eventId:"e1",priority:"P1",surface:"NOTIFICATION",device:phone,locked:true,concealmentLevel:"H3",category:"approval",title:"Approve 5000 USDC to Acme",summary:"Polygon fee 0.04",sensitiveFieldsPresent:true,requestedActionCapability:"payment.review",freshnessExpiresAt:"2026-09-20T03:25:00Z"},now);
 assert.equal(d.deliver,true);
 assert.equal(d.renderedTitle,"SERA needs your attention");
 assert.equal(d.actionVisible,false);
 assert.equal(d.actionExecutesDirectly,false);
 assert.equal(d.requiresOpenTrustedSurface,true);
 assert.doesNotMatch(d.renderedSummary,/5000|Acme|Polygon/);
});

test("low-value P4 proactive event is suppressed",()=>{
 const d=decideProactiveSurface({eventId:"e2",priority:"P4",surface:"WIDGET",device:phone,locked:false,concealmentLevel:"H0",category:"news",title:"Minor update",summary:"Low materiality",sensitiveFieldsPresent:false,requestedActionCapability:null,freshnessExpiresAt:null},now);
 assert.equal(d.deliver,false);
 assert.ok(d.reasonCodes.includes("LOW_VALUE_SUPPRESSED"));
});

test("trusted in-app surface may expose review affordance but never direct execution",()=>{
 const d=decideProactiveSurface({eventId:"e3",priority:"P1",surface:"IN_APP",device:phone,locked:false,concealmentLevel:"H0",category:"approval",title:"Payment review",summary:"Prepared action",sensitiveFieldsPresent:true,requestedActionCapability:"payment.review",freshnessExpiresAt:"2026-09-20T03:25:00Z"},now);
 assert.equal(d.actionVisible,true);
 assert.equal(d.actionCapability,"payment.review");
 assert.equal(d.actionExecutesDirectly,false);
 assert.equal(d.authorityEffect,"NONE");
});
