import test from "node:test";
import assert from "node:assert/strict";
import {authorizeWorkloadCaller,evaluateWorkloadIdentity} from "../../packages/service-host/src/workload-identity.js";

const base={
 authorized:true,
 subjectAltName:"URI:spiffe://soulverse.internal/ns/ssw/sa/policy-runtime",
 validFrom:"Sep 20 02:00:00 2026 GMT",
 validTo:"Sep 20 04:00:00 2026 GMT",
 fingerprint256:"AA:BB:CC",
 issuerCN:"Soulverse Workload CA"
};

test("valid authorized SPIFFE X509 identity is accepted",()=>{
 const d=evaluateWorkloadIdentity(base,{trustDomains:["soulverse.internal"]},"2026-09-20T03:00:00Z");
 assert.equal(d.allowed,true);
 if(d.allowed){
  assert.equal(d.identity.subject,"spiffe://soulverse.internal/ns/ssw/sa/policy-runtime");
  assert.equal(d.trustDomain,"soulverse.internal");
 }
});

test("asserted identity without authorized TLS is rejected",()=>{
 const d=evaluateWorkloadIdentity({...base,authorized:false},{trustDomains:["soulverse.internal"]},"2026-09-20T03:00:00Z");
 assert.deepEqual(d,{allowed:false,reason:"TLS_PEER_NOT_AUTHORIZED"});
});

test("wrong SPIFFE trust domain is rejected",()=>{
 const d=evaluateWorkloadIdentity({...base,subjectAltName:"URI:spiffe://attacker.invalid/ns/x/sa/y"},{trustDomains:["soulverse.internal"]},"2026-09-20T03:00:00Z");
 assert.deepEqual(d,{allowed:false,reason:"SPIFFE_TRUST_DOMAIN_NOT_ALLOWED"});
});

test("expired workload certificate is rejected",()=>{
 const d=evaluateWorkloadIdentity({...base,validTo:"Sep 20 02:59:59 2026 GMT"},{trustDomains:["soulverse.internal"]},"2026-09-20T03:00:00Z");
 assert.deepEqual(d,{allowed:false,reason:"CERTIFICATE_EXPIRED"});
});

test("multiple SPIFFE IDs fail closed as ambiguous",()=>{
 const d=evaluateWorkloadIdentity({...base,subjectAltName:"URI:spiffe://soulverse.internal/a, URI:spiffe://soulverse.internal/b"},{trustDomains:["soulverse.internal"]},"2026-09-20T03:00:00Z");
 assert.deepEqual(d,{allowed:false,reason:"AMBIGUOUS_SPIFFE_ID"});
});

test("service authorization is explicit after identity verification",()=>{
 const identity={subject:"spiffe://soulverse.internal/ns/ssw/sa/sera-orchestrator"};
 const grants=[{callerSpiffeId:identity.subject,allowedServices:["policy-runtime"],allowedActions:["action.evaluate"]}];
 assert.deepEqual(authorizeWorkloadCaller({identity,targetService:"policy-runtime",action:"action.evaluate",grants}),{allowed:true,reason:null});
 assert.deepEqual(authorizeWorkloadCaller({identity,targetService:"signer-runtime",action:"sign",grants}),{allowed:false,reason:"TARGET_SERVICE_NOT_ALLOWED"});
});

test("workload identity does not imply arbitrary action authorization",()=>{
 const identity={subject:"spiffe://soulverse.internal/ns/ssw/sa/sera-orchestrator"};
 const grants=[{callerSpiffeId:identity.subject,allowedServices:["policy-runtime"],allowedActions:["action.evaluate"]}];
 assert.deepEqual(authorizeWorkloadCaller({identity,targetService:"policy-runtime",action:"admin.override",grants}),{allowed:false,reason:"ACTION_NOT_ALLOWED"});
});
