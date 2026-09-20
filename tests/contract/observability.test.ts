import test from "node:test";
import assert from "node:assert/strict";
import {assertNoSecretTelemetry,createMetricPoint,createOperationalSignal,createTelemetryRecord,createTraceContext,sanitizeTelemetryAttributes} from "../../packages/service-host/src/observability.js";

const policy={
 allowedOperationalKeys:new Set(["status","reason_code","duration_ms","dependency","zone","operation","result"]),
 allowHashedHolderIdentifiers:true,
 maxAttributeCount:12,
 maxStringLength:64
};

test("secret-like telemetry fields are dropped",()=>{
 const r=sanitizeTelemetryAttributes([
  {key:"api_token",value:"abc",sensitivity:"OPERATIONAL"},
  {key:"private_key",value:"xyz",sensitivity:"SECRET"},
  {key:"status",value:"ok",sensitivity:"OPERATIONAL"}
 ],policy);
 assert.equal(r.attributes.status,"ok");
 assert.ok(r.droppedKeys.includes("api_token"));
 assert.ok(r.droppedKeys.includes("private_key"));
});

test("holder identifiers are hashed while amounts are redacted",()=>{
 const r=sanitizeTelemetryAttributes([
  {key:"holder_did",value:"did:soul:alice",sensitivity:"HOLDER_SENSITIVE"},
  {key:"amount",value:"1000",sensitivity:"HOLDER_SENSITIVE"}
 ],policy);
 assert.match(String(r.attributes.holder_did_hash),/^sha256:/);
 assert.equal(r.attributes.amount,"[REDACTED]");
});

test("unapproved operational attributes are dropped",()=>{
 const r=sanitizeTelemetryAttributes([
  {key:"status",value:"ready",sensitivity:"OPERATIONAL"},
  {key:"freeform_context",value:"should not escape",sensitivity:"OPERATIONAL"}
 ],policy);
 assert.equal(r.attributes.status,"ready");
 assert.ok(!("freeform_context" in r.attributes));
});

test("metric labels reject high-cardinality or sensitive dimensions",()=>{
 assert.throws(()=>createMetricPoint({name:"wallet.tx",value:1,unit:"count",labels:{holder_did:"did:soul:alice"}}),/METRIC_LABEL_NOT_ALLOWED/);
 const m=createMetricPoint({name:"service.request.duration",value:12,unit:"ms",labels:{service:"policy-runtime",status:"200"}});
 assert.equal(m.labels.service,"policy-runtime");
});

test("trace context carries correlation without payload content",()=>{
 const t=createTraceContext({correlationId:"corr-1",actionId:"action-1"});
 assert.equal(t.correlationId,"corr-1");
 assert.equal(t.actionId,"action-1");
 assert.ok(t.traceId.length>0);
 assert.ok(t.spanId.length>0);
});

test("telemetry record keeps references but redacts sensitive action material",()=>{
 const r=createTelemetryRecord({
  kind:"TRACE",name:"action.evaluate",timestamp:"2026-09-20T13:30:00Z",service:"policy-runtime",environment:"staging",
  requestId:"req-1",correlationId:"corr-1",actionId:"action-1",
  attributes:[
   {key:"status",value:"PASS",sensitivity:"OPERATIONAL"},
   {key:"recipient_address",value:"0xabc",sensitivity:"HOLDER_SENSITIVE"},
   {key:"authorization",value:"Bearer secret",sensitivity:"SECRET"}
  ],policy,recordId:"record-1"
 });
 assert.equal(r.attributes.status,"PASS");
 assert.match(String(r.attributes.recipient_address_hash),/^sha256:/);
 assert.ok(!("authorization" in r.attributes));
 assert.equal(assertNoSecretTelemetry(r),true);
});

test("security signal remains reference-oriented",()=>{
 const s=createOperationalSignal({
  severity:"CRITICAL",code:"REV_UPSTREAM_UNAVAILABLE",service:"rev-runtime",zone:"Z2",timestamp:"2026-09-20T13:30:00Z",
  traceId:"trace-1",actionId:"action-1",evidenceRef:"sael:event:1",
  attributes:[{key:"dependency",value:"rev-provider",sensitivity:"OPERATIONAL"}],policy
 });
 assert.equal(s.evidenceRef,"sael:event:1");
 assert.equal(s.attributes.dependency,"rev-provider");
 assert.equal(assertNoSecretTelemetry(s),true);
});
