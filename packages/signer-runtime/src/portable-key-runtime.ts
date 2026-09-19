import {assertContract} from "@soulverse/schema-validation";

export interface PortableKeyRuntimeInput{
 manifest:unknown;
 authorization:unknown;
 encryptedObjectRef:unknown;
 expectedHolderDid:string;
 expectedSubjectDid:string;
 expectedKeyRef:string;
 now:string;
 minimumKeyVersion:number;
}

export interface PortableKeyRuntimeDecision{
 status:"PASS"|"FAIL";
 reasonCodes:string[];
 keyRef:string|null;
 cid:string|null;
 keyVersion:number|null;
}

export function evaluatePortableKeyRuntime(input:PortableKeyRuntimeInput):PortableKeyRuntimeDecision{
 const reasons:string[]=[];
 const manifest=assertContract("portable-key-manifest",input.manifest) as any;
 const auth=assertContract("soulscan-recovery-authorization",input.authorization) as any;
 const objectRef=assertContract("encrypted-key-object-ref",input.encryptedObjectRef) as any;

 if(manifest.status!=="ACTIVE")reasons.push("KEY_MANIFEST_NOT_ACTIVE");
 if(manifest.governing_holder_did!==input.expectedHolderDid)reasons.push("KEY_MANIFEST_HOLDER_MISMATCH");
 if(manifest.subject_did!==input.expectedSubjectDid)reasons.push("KEY_MANIFEST_SUBJECT_MISMATCH");
 if(manifest.key_ref!==input.expectedKeyRef)reasons.push("KEY_REFERENCE_MISMATCH");
 if(manifest.key_version<input.minimumKeyVersion)reasons.push("KEY_MANIFEST_ROLLBACK_DETECTED");
 if(manifest.expires_at&&Date.parse(manifest.expires_at)<=Date.parse(input.now))reasons.push("KEY_MANIFEST_EXPIRED");

 if(auth.status!=="PASS")reasons.push("SOULSCAN_RECOVERY_NOT_AUTHORIZED");
 if(auth.proof_class!=="RP2")reasons.push("SOULSCAN_PROOF_CLASS_REQUIRED");
 if(Date.parse(auth.expires_at)<=Date.parse(input.now))reasons.push("SOULSCAN_RECOVERY_AUTHORIZATION_EXPIRED");
 if(auth.holder_did!==input.expectedHolderDid)reasons.push("SOULSCAN_HOLDER_MISMATCH");
 const expectedSera=input.expectedSubjectDid.startsWith("did:soul:agent:")?input.expectedSubjectDid:null;
 if(auth.sera_agent_did!==expectedSera)reasons.push("SOULSCAN_SERA_BINDING_MISMATCH");
 if(auth.key_ref!==input.expectedKeyRef)reasons.push("SOULSCAN_KEY_REFERENCE_MISMATCH");

 if(objectRef.key_ref!==manifest.key_ref)reasons.push("KEY_OBJECT_REFERENCE_MISMATCH");
 if(objectRef.cid!==manifest.encrypted_key_cid)reasons.push("KEY_OBJECT_CID_MISMATCH");
 if(objectRef.key_version!==manifest.key_version)reasons.push("KEY_OBJECT_VERSION_MISMATCH");
 if(objectRef.subject_did!==manifest.subject_did)reasons.push("KEY_OBJECT_SUBJECT_MISMATCH");
 if(objectRef.governing_holder_did!==manifest.governing_holder_did)reasons.push("KEY_OBJECT_HOLDER_MISMATCH");
 if(objectRef.encryption_profile!==manifest.encryption_profile)reasons.push("KEY_OBJECT_ENCRYPTION_PROFILE_MISMATCH");

 return{status:reasons.length?"FAIL":"PASS",reasonCodes:reasons,keyRef:reasons.length?null:manifest.key_ref,cid:reasons.length?null:manifest.encrypted_key_cid,keyVersion:reasons.length?null:manifest.key_version};
}
