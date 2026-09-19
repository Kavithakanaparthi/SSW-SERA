export interface PortableKeyManifest{
 schema:"ssw.portable-key-manifest.v1";
 keyRef:string;
 subjectDid:string;
 governingHolderDid:string;
 keyClass:string;
 keyVersion:number;
 encryptedKeyCid:string;
 encryptionProfile:string;
 recoveryPolicyRef:string;
 createdAt:string;
 supersedesKeyRef:string|null;
 status:"ACTIVE"|"ROTATED"|"REVOKED";
 integrity:{manifestHash:string;signatureRef:string};
}

export interface SoulScanRecoveryAuthorization{
 recoveryId:string;
 holderDid:string;
 seraAgentDid:string|null;
 status:"PASS"|"FAIL";
 assuranceLevel:string;
 issuedAt:string;
 expiresAt:string;
 evidenceRef:string;
}

export interface PortableEncryptedKeyObject{
 cid:string;
 ciphertext:Uint8Array;
 encryptionProfile:string;
 integrityHash:string;
}

export interface PortableKeyRecoveryProvider{
 resolveManifest(keyRef:string):Promise<PortableKeyManifest|null>;
 fetchEncryptedKey(cid:string):Promise<PortableEncryptedKeyObject>;
 authorizeRecovery(input:{holderDid:string;seraAgentDid:string|null;keyRef:string;purpose:"SIGN"}):Promise<SoulScanRecoveryAuthorization>;
 openSigningSession(input:{manifest:PortableKeyManifest;encryptedKey:PortableEncryptedKeyObject;authorization:SoulScanRecoveryAuthorization}):Promise<PortableSigningSession>;
}

export interface PortableSigningSession{
 keyRef:string;
 subjectDid:string;
 signDigest(digest:Uint8Array,digestProfile:string):Promise<{signature:Uint8Array;signatureFormat:string;operationRef:string}>;
 close():Promise<void>;
}
