import test from "node:test";import assert from "node:assert/strict";import {CapabilityRegistry,SSW_CAPABILITIES} from "../../packages/ssw-capability-adapters/src/index.js";
test("capability baseline exposes only read or prepare effects",()=>{assert.ok(SSW_CAPABILITIES.length>=8);for(const c of SSW_CAPABILITIES)assert.ok(c.effect==="READ"||c.effect==="PREPARE");});
test("payment prepare requires canonical counterparty",()=>{const c=new CapabilityRegistry().get("payment.prepare");assert.equal(c?.requiresCanonicalCounterparty,true);assert.equal(c?.effect,"PREPARE");});
test("no generic signing or broadcast capability exists",()=>{const ids=SSW_CAPABILITIES.map(x=>x.id);assert.equal(ids.some(x=>/sign|broadcast|submit/.test(x)),false);});
