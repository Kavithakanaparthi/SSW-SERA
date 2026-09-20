import test from "node:test";
import assert from "node:assert/strict";
import {assertMobileShellSafety,decideMobileShell} from "../../packages/ssw-capability-adapters/src/mobile-shell.js";

const base={
 platform:"IOS" as const,appVersion:"1.0.0",migrationStage:"M1" as const,featureFlags:{},
 seraAvailable:true,walletCoreAvailable:true,controlPlaneAvailable:true,signingAvailable:true,
 recoveryAvailable:true,securityControlsAvailable:true,currentHome:"CONVENTIONAL" as const
};

test("M1 is additive and preserves conventional wallet",()=>{
 const d=decideMobileShell(base);
 assert.equal(d.mode,"SERA_ASSISTANT");
 assert.equal(d.defaultHome,"CONVENTIONAL");
 assert.equal(d.conventionalWalletAccessible,true);
 assert.equal(d.fallbackAvailable,true);
 assert.ok(d.allowedSeraCapabilities.includes("wallet.query"));
 assert.ok(!d.allowedSeraCapabilities.includes("payment.prepare"));
});

test("M2 enables only flagged preparation capabilities",()=>{
 const d=decideMobileShell({...base,migrationStage:"M2",featureFlags:{sera_send_prepare:true,sera_chain_recommendation:true}});
 assert.equal(d.mode,"SERA_COORDINATOR");
 assert.ok(d.allowedSeraCapabilities.includes("payment.prepare"));
 assert.ok(d.allowedSeraCapabilities.includes("route.recommend"));
 assert.ok(!d.allowedSeraCapabilities.includes("swap.prepare"));
});

test("M3 SERA-first home requires feature flag plus recovery and security access",()=>{
 const green=decideMobileShell({...base,migrationStage:"M3",featureFlags:{sera_primary_home:true}});
 assert.equal(green.defaultHome,"SERA");
 assert.equal(green.mode,"SERA_FIRST");
 assert.equal(assertMobileShellSafety(green),true);
 const gated=decideMobileShell({...base,migrationStage:"M3",featureFlags:{sera_primary_home:true},recoveryAvailable:false});
 assert.equal(gated.defaultHome,"CONVENTIONAL");
 assert.ok(gated.reasons.includes("SERA_PRIMARY_HOME_GATED_BY_FALLBACK_REQUIREMENTS"));
});

test("SERA outage deterministically falls back to conventional wallet",()=>{
 const d=decideMobileShell({...base,seraAvailable:false,migrationStage:"M3",featureFlags:{sera_primary_home:true}});
 assert.equal(d.defaultHome,"CONVENTIONAL");
 assert.equal(d.mode,"CONVENTIONAL");
 assert.equal(d.conventionalWalletAccessible,true);
 assert.ok(d.reasons.includes("SERA_UNAVAILABLE_FALLBACK"));
});

test("control plane outage degrades M3 to read-only SERA and removes consequential preparation",()=>{
 const d=decideMobileShell({...base,migrationStage:"M3",controlPlaneAvailable:false,featureFlags:{sera_primary_home:true,sera_send_prepare:true,sera_swap_prepare:true,sera_credential_prepare:true}});
 assert.equal(d.mode,"READ_ONLY_SERA");
 assert.ok(d.allowedSeraCapabilities.includes("wallet.query"));
 assert.ok(!d.allowedSeraCapabilities.includes("payment.prepare"));
 assert.ok(!d.allowedSeraCapabilities.includes("credential.prepare"));
});

test("M4 delegated/autonomous functions remain independently feature flagged",()=>{
 const d=decideMobileShell({...base,platform:"ANDROID",migrationStage:"M4",featureFlags:{sera_primary_home:true,delegated_payments:true,conditional_automation:true,autonomous_execution:false}});
 assert.equal(d.defaultHome,"SERA");
 assert.ok(d.allowedSeraCapabilities.includes("delegated.payment"));
 assert.ok(d.allowedSeraCapabilities.includes("conditional.automation"));
 assert.ok(!d.allowedSeraCapabilities.includes("autonomous.execute"));
});

test("signer outage blocks execution authority without disabling safe SERA functions",()=>{
 const d=decideMobileShell({...base,migrationStage:"M4",signingAvailable:false,featureFlags:{sera_primary_home:true,delegated_payments:true,autonomous_execution:true}});
 assert.ok(d.allowedSeraCapabilities.includes("wallet.query"));
 assert.ok(!d.allowedSeraCapabilities.includes("delegated.payment"));
 assert.ok(!d.allowedSeraCapabilities.includes("autonomous.execute"));
 assert.ok(d.reasons.includes("SIGNING_UNAVAILABLE"));
});
