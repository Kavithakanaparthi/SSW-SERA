import test from "node:test";
import assert from "node:assert/strict";
import {assertFallbackCriticalAccess,buildDeterministicFallbackTray,decideAdaptiveWorkspace} from "../../packages/ssw-capability-adapters/src/mobile-workspace.js";

const now="2026-09-20T03:00:00Z";

test("read-only asset workspace renders from authoritative wallet state",()=>{
 const d=decideAdaptiveWorkspace({
  workspaceId:"w1",kind:"ASSET",title:"USDC",summary:"Balances across chains",
  sourceRefs:[{sourceType:"WALLET_STATE",ref:"balance:usdc",authoritative:true}],
  actions:[{actionId:"show",label:"Show details",capability:"wallet.balance.read",effect:"READ",canonicalSurface:"ASSETS",requiresReview:false}],
  fallbackSurface:"ASSETS",inspectabilityLevel:2,expiresAt:null,generatedAt:now,externalContentPresent:false,consequential:false
 },now);
 assert.equal(d.renderable,true);
 assert.equal(d.canShowUnderlyingState,true);
 assert.equal(d.canNavigateToCanonicalSurface,true);
 assert.equal(d.authoritativeSourceCount,1);
});

test("consequential workspace requires authoritative source",()=>{
 const d=decideAdaptiveWorkspace({
  workspaceId:"w2",kind:"TRANSACTION_REVIEW",title:"Review payment",summary:"Send funds",
  sourceRefs:[{sourceType:"EXTERNAL_CONTEXT",ref:"news:1",authoritative:false}],
  actions:[{actionId:"prepare",label:"Prepare",capability:"payment.prepare",effect:"PREPARE",canonicalSurface:"SEND",requiresReview:true}],
  fallbackSurface:"SEND",inspectabilityLevel:3,expiresAt:null,generatedAt:now,externalContentPresent:true,consequential:true
 },now);
 assert.equal(d.renderable,false);
 assert.ok(d.reasons.includes("AUTHORITATIVE_SOURCE_REQUIRED"));
 assert.equal(d.allowedActions.length,0);
});

test("workspace cannot itself authorize an action",()=>{
 const d=decideAdaptiveWorkspace({
  workspaceId:"w3",kind:"CREDENTIAL_DISCLOSURE",title:"Credential request",summary:"Age proof",
  sourceRefs:[{sourceType:"CREDENTIAL",ref:"cred:1",authoritative:true}],
  actions:[{actionId:"approve",label:"Approve",capability:"credential.present",effect:"AUTHORIZE",canonicalSurface:"CREDENTIALS",requiresReview:true}],
  fallbackSurface:"CREDENTIALS",inspectabilityLevel:3,expiresAt:null,generatedAt:now,externalContentPresent:false,consequential:true
 },now);
 assert.equal(d.renderable,true);
 assert.equal(d.allowedActions.length,0);
 assert.equal(d.blockedActions[0]?.reason,"WORKSPACE_CANNOT_AUTHORIZE");
});

test("external intelligence is visibly labeled and cannot masquerade as wallet authority",()=>{
 const d=decideAdaptiveWorkspace({
  workspaceId:"w4",kind:"INTELLIGENCE",title:"Briefing",summary:"Relevant news",
  sourceRefs:[{sourceType:"EXTERNAL_CONTEXT",ref:"news:protocol-x",authoritative:false}],
  actions:[{actionId:"read",label:"Read source",capability:"news.read",effect:"READ",canonicalSurface:null,requiresReview:false}],
  fallbackSurface:"ACTIVITY",inspectabilityLevel:2,expiresAt:null,generatedAt:now,externalContentPresent:true,consequential:false
 },now);
 assert.equal(d.renderable,true);
 assert.equal(d.externalContentLabeled,true);
 assert.equal(d.authoritativeSourceCount,0);
});

test("expired workspace fails closed",()=>{
 const d=decideAdaptiveWorkspace({
  workspaceId:"w5",kind:"CHAIN_COMPARISON",title:"Routes",summary:"Compare chains",
  sourceRefs:[{sourceType:"ROUTE_DECISION",ref:"route:1",authoritative:true}],actions:[],
  fallbackSurface:"SEND",inspectabilityLevel:2,expiresAt:"2026-09-20T02:59:00Z",generatedAt:"2026-09-20T02:55:00Z",externalContentPresent:false,consequential:false
 },now);
 assert.equal(d.renderable,false);
 assert.ok(d.reasons.includes("WORKSPACE_EXPIRED"));
});

test("fallback tray preserves deterministic manual wallet surfaces",()=>{
 const tray=buildDeterministicFallbackTray({
  walletCoreAvailable:true,signingAvailable:true,credentialsAvailable:true,activityAvailable:true,
  securityAvailable:true,identityAvailable:true,walletConnectAvailable:true,settingsAvailable:true
 });
 for(const surface of ["ASSETS","SEND","RECEIVE","SWAP","CREDENTIALS","ACTIVITY","SECURITY"]){
  assert.equal(tray.find(x=>x.surface===surface)?.enabled,true);
 }
 assert.equal(assertFallbackCriticalAccess(tray),true);
});

test("signer outage disables manual send/swap but keeps inspection and safety surfaces",()=>{
 const tray=buildDeterministicFallbackTray({
  walletCoreAvailable:true,signingAvailable:false,credentialsAvailable:true,activityAvailable:true,
  securityAvailable:true,identityAvailable:true,walletConnectAvailable:true,settingsAvailable:true
 });
 assert.equal(tray.find(x=>x.surface==="SEND")?.enabled,false);
 assert.equal(tray.find(x=>x.surface==="SWAP")?.enabled,false);
 assert.equal(tray.find(x=>x.surface==="ASSETS")?.enabled,true);
 assert.equal(tray.find(x=>x.surface==="SECURITY")?.enabled,true);
 assert.equal(assertFallbackCriticalAccess(tray),true);
});
