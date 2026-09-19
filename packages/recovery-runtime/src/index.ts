import {assertContract} from "@soulverse/schema-validation";

export interface RecoverySession{schema:"ssw.recovery-session.v1";recovery_id:string;mode:string;holder_did:string;sera_agent_did:string;source_device_id:string|null;target_device_id:string|null;target_runtime_id:string|null;state:string;started_at:string;expires_at:string;risk_class:"R5";authority_class:"A5";sael_correlation_id:string;}
export interface StateManifest{schema:"ssw.sera-state-manifest.v1";holder_did:string;sera_agent_did:string;state_version:number;previous_state_cid:string|null;current_state_cid:string;schema_version:string;created_at:string;status:"CURRENT"|"SUPERSEDED"|"REVOKED";integrity:{manifest_hash:string;signature_ref:string};}
export interface RecoveryPlan{recoveryId:string;holderDid:string;seraAgentDid:string;stateCid:string;stateVersion:number;targetDeviceId:string|null;targetRuntimeId:string|null;restoreCompartments:string[];invalidateOldSessions:true;preserveRevokedDevices:true;restoreApprovals:false;restoreMandateAuthority:false;requiresFreshDeviceTrust:true;requiresFreshRuntimeEligibility:true;requiresFreshTrustRev:true;}

const allowedCompartments=new Set(["preferences","language","voice_adaptation","aliases","notifications","concealment","memory","non_secret_automation_preferences"]);

export function createRecoveryPlan(input:{session:RecoverySession;proof:unknown;manifest:StateManifest;wrappedStateKey:unknown;latestKnownStateVersion:number;requestedCompartments:string[];now:string}):RecoveryPlan{
 const s=assertContract("recovery-session",input.session) as unknown as RecoverySession;
 const proof=assertContract("recovery-proof",input.proof) as unknown as any;
 const manifest=assertContract("sera-state-manifest",input.manifest) as unknown as StateManifest;
 const key=assertContract("wrapped-state-key",input.wrappedStateKey) as unknown as any;
 if(Date.parse(s.expires_at)<=Date.parse(input.now))throw new Error("RECOVERY_SESSION_EXPIRED");
 if(proof.status!=="PASS"||Date.parse(proof.expires_at)<=Date.parse(input.now))throw new Error("RECOVERY_PROOF_INVALID");
 if(proof.recovery_id!==s.recovery_id||proof.holder_did!==s.holder_did||proof.sera_agent_did!==s.sera_agent_did)throw new Error("RECOVERY_IDENTITY_MISMATCH");
 if(manifest.holder_did!==s.holder_did||manifest.sera_agent_did!==s.sera_agent_did||manifest.status!=="CURRENT")throw new Error("STATE_MANIFEST_INVALID");
 if(manifest.state_version<input.latestKnownStateVersion)throw new Error("STATE_ROLLBACK_DETECTED");
 if(key.status!=="ACTIVE"||key.holder_did!==s.holder_did||key.sera_agent_did!==s.sera_agent_did)throw new Error("WRAPPED_STATE_KEY_INVALID");
 if(key.wrapping_profile!=="SOUL_ID_RECOVERY"&&key.wrapping_profile!=="RECOVERY_CREDENTIAL"&&key.wrapping_profile!=="THRESHOLD_RECOVERY")throw new Error("WRAPPING_PROFILE_NOT_RECOVERY_ELIGIBLE");
 const compartments=input.requestedCompartments.filter(x=>allowedCompartments.has(x));
 if(compartments.length!==input.requestedCompartments.length)throw new Error("RECOVERY_COMPARTMENT_PROHIBITED");
 return{recoveryId:s.recovery_id,holderDid:s.holder_did,seraAgentDid:s.sera_agent_did,stateCid:manifest.current_state_cid,stateVersion:manifest.state_version,targetDeviceId:s.target_device_id,targetRuntimeId:s.target_runtime_id,restoreCompartments:compartments,invalidateOldSessions:true,preserveRevokedDevices:true,restoreApprovals:false,restoreMandateAuthority:false,requiresFreshDeviceTrust:true,requiresFreshRuntimeEligibility:true,requiresFreshTrustRev:true};
}

export function advanceRecoveryState(session:RecoverySession,next:RecoverySession["state"]):RecoverySession{
 const order=["RECOVERY_INITIATED","HOLDER_DID_RECOVERED","WALLET_CONTEXT_ESTABLISHED","SERA_DID_RESOLVED","STATE_MANIFEST_VERIFIED","STATE_RESTORED","DEVICE_REGISTERED","RUNTIME_REGISTERED","TRUST_REESTABLISHED","AUTHORITY_REESTABLISHED","RECOVERY_COMPLETED"];
 const s=assertContract("recovery-session",session) as unknown as RecoverySession;if(next==="RECOVERY_FAILED"||next==="RECOVERY_SUSPENDED")return assertContract("recovery-session",{...s,state:next}) as unknown as RecoverySession;
 if(order.indexOf(next)!==order.indexOf(s.state)+1)throw new Error("RECOVERY_STATE_TRANSITION_INVALID");
 return assertContract("recovery-session",{...s,state:next}) as unknown as RecoverySession;
}
