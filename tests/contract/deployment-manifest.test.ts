import test from "node:test";
import assert from "node:assert/strict";
import {buildReferenceDeploymentManifest,validateDeploymentManifest} from "../../packages/service-host/src/deployment-manifest.js";
import {productionSafeDefaults} from "../../packages/service-host/src/environment-controls.js";

test("reference manifests validate for all environments",()=>{
 for(const env of ["development","test","staging","production"] as const){
  const m=buildReferenceDeploymentManifest(env,productionSafeDefaults(env));
  const v=validateDeploymentManifest(m);
  assert.equal(v.valid,true,v.errors.join(","));
 }
});

test("staging internal services require workload identity",()=>{
 const m=buildReferenceDeploymentManifest("staging",productionSafeDefaults("staging"));
 m.services[1]!.workloadIdentityRequired=false;
 const v=validateDeploymentManifest(m);
 assert.equal(v.valid,false);
 assert.ok(v.errors.includes("WORKLOAD_IDENTITY_REQUIRED:wallet-control-plane"));
});

test("intelligence service may not be public edge",()=>{
 const m=buildReferenceDeploymentManifest("staging",productionSafeDefaults("staging"));
 m.services.find(x=>x.name==="sera-agent-runtime")!.exposure="PUBLIC_EDGE";
 const v=validateDeploymentManifest(m);
 assert.ok(v.errors.includes("INTELLIGENCE_ZONE_PUBLIC_EXPOSURE_PROHIBITED:sera-agent-runtime"));
});

test("authority and evidence stores require backups",()=>{
 const m=buildReferenceDeploymentManifest("staging",productionSafeDefaults("staging"));
 m.dataStores.find(x=>x.name==="authority-store")!.backupRequired=false;
 m.dataStores.find(x=>x.name==="evidence-store")!.backupRequired=false;
 const v=validateDeploymentManifest(m);
 assert.ok(v.errors.includes("BACKUP_REQUIRED:authority-store"));
 assert.ok(v.errors.includes("BACKUP_REQUIRED:evidence-store"));
});

test("secrets must reference current environment namespace",()=>{
 const m=buildReferenceDeploymentManifest("production",productionSafeDefaults("production"));
 m.services.find(x=>x.name==="wallet-control-plane")!.secretRefs=["ssw-sera/staging/control-plane"];
 const v=validateDeploymentManifest(m);
 assert.ok(v.errors.includes("SECRET_NAMESPACE_MISMATCH:wallet-control-plane"));
});

test("non-production manifests reject production-capable providers",()=>{
 const m=buildReferenceDeploymentManifest("staging",productionSafeDefaults("staging"));
 m.externalProviders.push({name:"live-chain-rpc",adapterService:"execution-adapter",credentialSecretRef:m.profile.secretNamespace+"/rpc",productionCapable:true});
 const v=validateDeploymentManifest(m);
 assert.ok(v.errors.includes("PRODUCTION_PROVIDER_IN_NON_PRODUCTION:live-chain-rpc"));
});

test("manifest always keeps signing and asset movement disabled",()=>{
 const m=buildReferenceDeploymentManifest("production",productionSafeDefaults("production"));
 assert.equal(m.productionSigningEnabled,false);
 assert.equal(m.productionAssetMovementEnabled,false);
});
