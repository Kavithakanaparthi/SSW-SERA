import test from "node:test";
import assert from "node:assert/strict";
import {buildDefaultIntegrationRegistry,canVerifyIntegration,summarizeRegistry,verifyIntegrationItem} from "../../packages/service-host/src/integration-evidence-registry.js";

test("default registry includes DEV-OPEN-001 through DEV-OPEN-021",()=>{
 const r=buildDefaultIntegrationRegistry("2026-09-20T14:30:00Z");
 assert.equal(r.items.length,21);
 assert.equal(r.items[0]!.id,"DEV-OPEN-001");
 assert.equal(r.items[20]!.id,"DEV-OPEN-021");
});

test("open item cannot be verified before evidence submission",()=>{
 const r=buildDefaultIntegrationRegistry("2026-09-20T14:30:00Z");
 const c=canVerifyIntegration(r.items[0]!);
 assert.equal(c.allowed,false);
 assert.ok(c.reasons.includes("STATUS_NOT_EVIDENCE_SUBMITTED"));
});

test("submitted evidence must contain a valid reference",()=>{
 const r=buildDefaultIntegrationRegistry("2026-09-20T14:30:00Z");
 const item={...r.items[0]!,status:"EVIDENCE_SUBMITTED" as const,evidence:[{kind:"STAGING_TEST" as const,ref:"",environment:"staging" as const,commitSha:"bad",submittedAt:"bad-date",submittedBy:""}]};
 const c=canVerifyIntegration(item);
 assert.equal(c.allowed,false);
 assert.ok(c.reasons.includes("EVIDENCE_REF_REQUIRED"));
 assert.ok(c.reasons.includes("COMMIT_SHA_INVALID"));
});

test("valid submitted evidence can be verified",()=>{
 const r=buildDefaultIntegrationRegistry("2026-09-20T14:30:00Z");
 const item={...r.items[0]!,status:"EVIDENCE_SUBMITTED" as const,evidence:[{kind:"STAGING_TEST" as const,ref:"staging-run-42",environment:"staging" as const,commitSha:"a".repeat(40),submittedAt:"2026-09-20T14:30:00Z",submittedBy:"platform-team"}]};
 const verified=verifyIntegrationItem(item,{verifiedBy:"security-reviewer",verifiedAt:"2026-09-20T14:31:00Z",notes:["staging evidence reviewed"]});
 assert.equal(verified.status,"VERIFIED");
 assert.equal(verified.verifiedBy,"security-reviewer");
});

test("pilot eligibility remains false while release blockers are open",()=>{
 const r=buildDefaultIntegrationRegistry("2026-09-20T14:30:00Z");
 const s=summarizeRegistry(r);
 assert.equal(s.pilotGateEligible,false);
 assert.ok(s.releaseBlockersOpen.includes("DEV-OPEN-001"));
 assert.ok(s.releaseBlockersOpen.includes("DEV-OPEN-021"));
});

test("DEV-OPEN-007 is tracked as conditional rather than universal release blocker",()=>{
 const r=buildDefaultIntegrationRegistry("2026-09-20T14:30:00Z");
 const item=r.items.find(i=>i.id==="DEV-OPEN-007")!;
 assert.equal(item.criticality,"CONDITIONAL_BLOCKER");
});
