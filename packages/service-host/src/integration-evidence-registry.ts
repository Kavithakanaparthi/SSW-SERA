export type IntegrationEvidenceStatus="OPEN"|"EVIDENCE_SUBMITTED"|"VERIFIED"|"REJECTED"|"WAIVED";
export type IntegrationCriticality="RELEASE_BLOCKER"|"CONDITIONAL_BLOCKER"|"CAPABILITY_BLOCKER";
export type EvidenceKind="CI_RUN"|"STAGING_TEST"|"PROVIDER_BINDING"|"NATIVE_TEST"|"SECURITY_TEST"|"ROLLBACK_DRILL"|"MANUAL_APPROVAL"|"CONFIG_ATTESTATION"|"LOG_EXCERPT"|"OTHER";

export interface EvidenceReference{
 kind:EvidenceKind;
 ref:string;
 environment:"development"|"test"|"staging"|"production"|null;
 commitSha:string|null;
 submittedAt:string;
 submittedBy:string;
}

export interface IntegrationEvidenceItem{
 id:string;
 title:string;
 criticality:IntegrationCriticality;
 blocks:string[];
 status:IntegrationEvidenceStatus;
 applicable:boolean;
 evidence:EvidenceReference[];
 verificationNotes:string[];
 verifiedBy:string|null;
 verifiedAt:string|null;
}

export interface IntegrationEvidenceRegistry{
 schema:"ssw.live-integration-evidence-registry.v1";
 generatedAt:string;
 items:IntegrationEvidenceItem[];
}

export function validateEvidenceReference(ref:EvidenceReference){
 const errors:string[]=[];
 if(!ref.ref.trim())errors.push("EVIDENCE_REF_REQUIRED");
 if(!ref.submittedBy.trim())errors.push("SUBMITTED_BY_REQUIRED");
 if(Number.isNaN(Date.parse(ref.submittedAt)))errors.push("SUBMITTED_AT_INVALID");
 if(ref.commitSha!==null&&!/^[a-f0-9]{40}$/i.test(ref.commitSha))errors.push("COMMIT_SHA_INVALID");
 return{valid:errors.length===0,errors};
}

export function canVerifyIntegration(item:IntegrationEvidenceItem){
 if(!item.applicable)return{allowed:false,reasons:["ITEM_NOT_APPLICABLE"]};
 if(item.status!=="EVIDENCE_SUBMITTED")return{allowed:false,reasons:["STATUS_NOT_EVIDENCE_SUBMITTED"]};
 if(item.evidence.length===0)return{allowed:false,reasons:["EVIDENCE_REQUIRED"]};
 const reasons:string[]=[];
 for(const e of item.evidence){
  const v=validateEvidenceReference(e);
  if(!v.valid)reasons.push(...v.errors);
 }
 return{allowed:reasons.length===0,reasons:[...new Set(reasons)].sort()};
}

export function verifyIntegrationItem(item:IntegrationEvidenceItem,input:{verifiedBy:string;verifiedAt:string;notes:string[]}):IntegrationEvidenceItem{
 const c=canVerifyIntegration(item);
 if(!c.allowed)throw new Error("INTEGRATION_EVIDENCE_NOT_VERIFIABLE:"+c.reasons.join(","));
 if(!input.verifiedBy.trim())throw new Error("VERIFIED_BY_REQUIRED");
 if(Number.isNaN(Date.parse(input.verifiedAt)))throw new Error("VERIFIED_AT_INVALID");
 return{...item,status:"VERIFIED",verifiedBy:input.verifiedBy,verifiedAt:input.verifiedAt,verificationNotes:[...item.verificationNotes,...input.notes]};
}

export function rejectIntegrationItem(item:IntegrationEvidenceItem,input:{verifiedBy:string;verifiedAt:string;notes:string[]}):IntegrationEvidenceItem{
 if(item.status!=="EVIDENCE_SUBMITTED")throw new Error("STATUS_NOT_EVIDENCE_SUBMITTED");
 if(!input.verifiedBy.trim())throw new Error("VERIFIED_BY_REQUIRED");
 if(Number.isNaN(Date.parse(input.verifiedAt)))throw new Error("VERIFIED_AT_INVALID");
 return{...item,status:"REJECTED",verifiedBy:input.verifiedBy,verifiedAt:input.verifiedAt,verificationNotes:[...item.verificationNotes,...input.notes]};
}

export function summarizeRegistry(registry:IntegrationEvidenceRegistry){
 const applicable=registry.items.filter(i=>i.applicable);
 const releaseBlockers=applicable.filter(i=>i.criticality==="RELEASE_BLOCKER");
 const conditional=applicable.filter(i=>i.criticality==="CONDITIONAL_BLOCKER");
 const capability=applicable.filter(i=>i.criticality==="CAPABILITY_BLOCKER");
 const verified=applicable.filter(i=>i.status==="VERIFIED");
 const blockingOpen=releaseBlockers.filter(i=>i.status!=="VERIFIED"&&i.status!=="WAIVED");
 const conditionalOpen=conditional.filter(i=>i.status!=="VERIFIED"&&i.status!=="WAIVED");
 return{
  applicable:applicable.length,
  verified:verified.length,
  releaseBlockersOpen:blockingOpen.map(i=>i.id).sort(),
  conditionalBlockersOpen:conditionalOpen.map(i=>i.id).sort(),
  capabilityBlockersOpen:capability.filter(i=>i.status!=="VERIFIED"&&i.status!=="WAIVED").map(i=>i.id).sort(),
  pilotGateEligible:blockingOpen.length===0
 };
}

export function buildDefaultIntegrationRegistry(now:string):IntegrationEvidenceRegistry{
 const release=(id:string,title:string,blocks:string[]):IntegrationEvidenceItem=>({id,title,criticality:"RELEASE_BLOCKER",blocks,status:"OPEN",applicable:true,evidence:[],verificationNotes:[],verifiedBy:null,verifiedAt:null});
 const conditional=(id:string,title:string,blocks:string[]):IntegrationEvidenceItem=>({id,title,criticality:"CONDITIONAL_BLOCKER",blocks,status:"OPEN",applicable:true,evidence:[],verificationNotes:[],verifiedBy:null,verifiedAt:null});
 const capability=(id:string,title:string,blocks:string[]):IntegrationEvidenceItem=>({id,title,criticality:"CAPABILITY_BLOCKER",blocks,status:"OPEN",applicable:true,evidence:[],verificationNotes:[],verifiedBy:null,verifiedAt:null});
 return{
  schema:"ssw.live-integration-evidence-registry.v1",
  generatedAt:now,
  items:[
   release("DEV-OPEN-001","Soul ID portable signing-key production binding",["Signing Gate","Release Gate"]),
   release("DEV-OPEN-002","SoulScan recovery authorization production binding",["Signing Gate","Recovery Gate","Release Gate"]),
   release("DEV-OPEN-003","SERA portable signing-key production binding",["Signing Gate","Release Gate"]),
   release("DEV-OPEN-004","Production EVM RPC / signed-payload resolver binding",["Execution Gate","Release Gate"]),
   release("DEV-OPEN-005","SAEL checkpoint signer / encrypted archive binding",["SAEL Gate","Release Gate"]),
   release("DEV-OPEN-006","Existing SSW capability / multi-chain provider binding",["Mobile Integration Gate"]),
   conditional("DEV-OPEN-007","News / professional context / asset-risk provider binding",["External Intelligence Capability"]),
   capability("DEV-OPEN-008","Soulogram / OpenID4VP live credential presentation binding",["Credential Presentation Capability"]),
   capability("DEV-OPEN-009","Soul ID holder context / SERA governance live binding",["Soul ID Live Capability"]),
   capability("DEV-OPEN-010","SVID4AI agent identity / holder delegation live binding",["SVID4AI Live Capability"]),
   release("DEV-OPEN-011","Native iOS / Android SERA shell binding",["Mobile Integration Gate"]),
   release("DEV-OPEN-012","Native adaptive workspace / fallback rendering",["Mobile Integration Gate"]),
   release("DEV-OPEN-013","Native voice/text / concealed-detail binding",["Mobile Integration Gate"]),
   release("DEV-OPEN-014","Native cross-device / OS proactive surface binding",["Mobile Integration Gate"]),
   release("DEV-OPEN-015","Production feature-flag / cohort / telemetry / rollback binding",["Mobile Integration Gate"]),
   release("DEV-OPEN-016","Production workload identity issuance / mTLS-SPIFFE binding",["Infrastructure Gate"]),
   release("DEV-OPEN-017","Production observability exporter / retention / residency binding",["Infrastructure Gate"]),
   release("DEV-OPEN-018","Live environment separation / secret namespace / promotion binding",["Infrastructure Gate"]),
   release("DEV-OPEN-019","Provider-specific IaC / network / deployment binding",["Production Deployment Gate"]),
   release("DEV-OPEN-020","Live deployment evidence / Production Deployment Gate closure",["Production Deployment Gate"]),
   release("DEV-OPEN-021","Controlled pilot execution / final release evidence",["Pilot Gate","Production Release Gate"])
  ]
 };
}
