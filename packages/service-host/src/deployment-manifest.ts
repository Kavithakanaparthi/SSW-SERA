import type {DeploymentEnvironment,EnvironmentProfile} from "./environment-controls.js";
import {validateEnvironmentProfile} from "./environment-controls.js";

export type TrustZone="Z0"|"Z1"|"Z2"|"Z3"|"Z4"|"Z5"|"Z6"|"Z7";
export type Exposure="PUBLIC_EDGE"|"INTERNAL"|"NO_INGRESS";
export type DataClass="EPHEMERAL"|"OPERATIONAL"|"HOLDER_METADATA"|"AUTHORITY"|"EVIDENCE"|"INTELLIGENCE_CACHE";

export interface DeploymentService{
 name:string;
 zone:TrustZone;
 exposure:Exposure;
 workloadIdentityRequired:boolean;
 allowedCallers:string[];
 secretRefs:string[];
 databaseRefs:string[];
 telemetryEnabled:boolean;
 replicas:{min:number;max:number};
}

export interface DeploymentDataStore{
 name:string;
 dataClass:DataClass;
 zone:TrustZone;
 namespace:string;
 encryptedAtRest:boolean;
 backupRequired:boolean;
 secretRef:string|null;
}

export interface DeploymentManifest{
 schema:"ssw.deployment-manifest.v1";
 environment:DeploymentEnvironment;
 profile:EnvironmentProfile;
 services:DeploymentService[];
 dataStores:DeploymentDataStore[];
 externalProviders:{name:string;adapterService:string;credentialSecretRef:string|null;productionCapable:boolean}[];
 productionSigningEnabled:false;
 productionAssetMovementEnabled:false;
}

const secretValuePattern=/(BEGIN PRIVATE KEY|mnemonic|seed phrase|Bearer\s+|api[_-]?key\s*[:=]\s*[^$<{])/i;

export function validateDeploymentManifest(manifest:DeploymentManifest){
 const errors:string[]=[];
 const profile=validateEnvironmentProfile(manifest.profile);
 if(!profile.valid)errors.push(...profile.errors.map(e=>"PROFILE_"+e));
 if(manifest.environment!==manifest.profile.environment)errors.push("ENVIRONMENT_PROFILE_MISMATCH");
 if(manifest.productionSigningEnabled!==false)errors.push("PRODUCTION_SIGNING_MUST_BE_FALSE");
 if(manifest.productionAssetMovementEnabled!==false)errors.push("PRODUCTION_ASSET_MOVEMENT_MUST_BE_FALSE");

 const serviceNames=new Set<string>();
 for(const s of manifest.services){
  if(serviceNames.has(s.name))errors.push("DUPLICATE_SERVICE:"+s.name);
  serviceNames.add(s.name);
  if(s.replicas.min<1||s.replicas.max<s.replicas.min)errors.push("INVALID_REPLICA_RANGE:"+s.name);
  if((manifest.environment==="staging"||manifest.environment==="production")&&s.exposure!=="PUBLIC_EDGE"&&!s.workloadIdentityRequired)errors.push("WORKLOAD_IDENTITY_REQUIRED:"+s.name);
  if(s.zone==="Z3"&&s.exposure==="PUBLIC_EDGE")errors.push("INTELLIGENCE_ZONE_PUBLIC_EXPOSURE_PROHIBITED:"+s.name);
  if(s.zone==="Z6"&&s.exposure==="PUBLIC_EDGE")errors.push("EVIDENCE_ZONE_PUBLIC_EXPOSURE_PROHIBITED:"+s.name);
  for(const ref of s.secretRefs){
   if(!ref.startsWith(manifest.profile.secretNamespace+"/"))errors.push("SECRET_NAMESPACE_MISMATCH:"+s.name);
   if(secretValuePattern.test(ref))errors.push("INLINE_SECRET_PROHIBITED:"+s.name);
  }
 }
 const storeNames=new Set<string>();
 for(const d of manifest.dataStores){
  if(storeNames.has(d.name))errors.push("DUPLICATE_DATASTORE:"+d.name);
  storeNames.add(d.name);
  if(!d.encryptedAtRest)errors.push("ENCRYPTION_AT_REST_REQUIRED:"+d.name);
  if(!d.namespace.startsWith(manifest.profile.databaseNamespace))errors.push("DATABASE_NAMESPACE_MISMATCH:"+d.name);
  if((d.dataClass==="AUTHORITY"||d.dataClass==="EVIDENCE")&&!d.backupRequired)errors.push("BACKUP_REQUIRED:"+d.name);
  if(d.secretRef&&!d.secretRef.startsWith(manifest.profile.secretNamespace+"/"))errors.push("DATASTORE_SECRET_NAMESPACE_MISMATCH:"+d.name);
 }
 for(const p of manifest.externalProviders){
  if(!serviceNames.has(p.adapterService))errors.push("PROVIDER_ADAPTER_SERVICE_UNKNOWN:"+p.name);
  if(p.credentialSecretRef&&!p.credentialSecretRef.startsWith(manifest.profile.secretNamespace+"/"))errors.push("PROVIDER_SECRET_NAMESPACE_MISMATCH:"+p.name);
  if(manifest.environment!=="production"&&p.productionCapable)errors.push("PRODUCTION_PROVIDER_IN_NON_PRODUCTION:"+p.name);
 }
 return{valid:errors.length===0,errors:[...new Set(errors)].sort()};
}

export function assertDeploymentManifest(manifest:DeploymentManifest){
 const v=validateDeploymentManifest(manifest);
 if(!v.valid)throw new Error("DEPLOYMENT_MANIFEST_INVALID:"+v.errors.join(","));
 return manifest;
}

export function buildReferenceDeploymentManifest(environment:DeploymentEnvironment,profile:EnvironmentProfile):DeploymentManifest{
 const controlled=environment==="staging"||environment==="production";
 const secret=(name:string)=>profile.secretNamespace+"/"+name;
 const db=(name:string)=>profile.databaseNamespace+"_"+name;
 return{
  schema:"ssw.deployment-manifest.v1",
  environment,
  profile,
  productionSigningEnabled:false,
  productionAssetMovementEnabled:false,
  services:[
   {name:"wallet-api-gateway",zone:"Z2",exposure:"PUBLIC_EDGE",workloadIdentityRequired:controlled,allowedCallers:[],secretRefs:[],databaseRefs:[],telemetryEnabled:true,replicas:{min:2,max:8}},
   {name:"wallet-control-plane",zone:"Z2",exposure:"INTERNAL",workloadIdentityRequired:controlled,allowedCallers:["wallet-api-gateway","sera-agent-runtime"],secretRefs:[secret("control-plane")],databaseRefs:[db("authority"),db("policy")],telemetryEnabled:true,replicas:{min:2,max:12}},
   {name:"sera-agent-runtime",zone:"Z3",exposure:"INTERNAL",workloadIdentityRequired:controlled,allowedCallers:["wallet-control-plane"],secretRefs:[secret("model-adapters")],databaseRefs:[db("context")],telemetryEnabled:true,replicas:{min:2,max:12}},
   {name:"execution-adapter",zone:"Z4",exposure:"INTERNAL",workloadIdentityRequired:controlled,allowedCallers:["wallet-control-plane"],secretRefs:[secret("providers")],databaseRefs:[],telemetryEnabled:true,replicas:{min:2,max:8}},
   {name:"evidence-service",zone:"Z6",exposure:"NO_INGRESS",workloadIdentityRequired:controlled,allowedCallers:["wallet-control-plane","execution-adapter"],secretRefs:[secret("evidence")],databaseRefs:[db("evidence")],telemetryEnabled:true,replicas:{min:2,max:6}},
   {name:"operations",zone:"Z7",exposure:"INTERNAL",workloadIdentityRequired:controlled,allowedCallers:[],secretRefs:[secret("operations")],databaseRefs:[],telemetryEnabled:true,replicas:{min:1,max:3}}
  ],
  dataStores:[
   {name:"authority-store",dataClass:"AUTHORITY",zone:"Z2",namespace:db("authority"),encryptedAtRest:true,backupRequired:true,secretRef:secret("db-authority")},
   {name:"policy-store",dataClass:"OPERATIONAL",zone:"Z2",namespace:db("policy"),encryptedAtRest:true,backupRequired:true,secretRef:secret("db-policy")},
   {name:"context-store",dataClass:"HOLDER_METADATA",zone:"Z2",namespace:db("context"),encryptedAtRest:true,backupRequired:true,secretRef:secret("db-context")},
   {name:"evidence-store",dataClass:"EVIDENCE",zone:"Z6",namespace:db("evidence"),encryptedAtRest:true,backupRequired:true,secretRef:secret("db-evidence")}
  ],
  externalProviders:[]
 };
}
