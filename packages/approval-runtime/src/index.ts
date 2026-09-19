import type {ActionContract,RiskClass} from "@soulverse/contracts";
import {assertContract} from "@soulverse/schema-validation";

export interface ReviewRecord{
 schema:"ssw.review-record.v1";review_id:string;presentation_ref:string;action_id:string;action_version:number;material_terms_hash:string;
 holder_did:string;device_id:string;runtime_id:string;status:"REVIEWED"|"INVALIDATED"|"EXPIRED";reviewed_at:string;
}
export interface AuthenticationEvidence{
 schema:"ssw.authentication-evidence.v1";auth_id:string;purpose:"REVEAL"|"ACTION_APPROVAL"|"MANDATE_CREATION"|"RECOVERY"|"SECURITY_ACTION";
 method:"DEVICE_BIOMETRIC"|"DEVICE_PASSCODE"|"HARDWARE_KEY"|"PLATFORM_CREDENTIAL"|"WALLET_KEY_CONFIRMATION"|"SOULSCAN_FACE";
 assurance_level:"AL1"|"AL2"|"AL3"|"AL4";status:"PASS"|"FAIL"|"EXPIRED"|"CANCELLED";holder_did:string;
 action_id:string|null;action_version:number|null;material_terms_hash:string|null;device_id:string;runtime_id:string;challenge_ref:string;
 verifier_identity:string;issued_at:string;expires_at:string;integrity:{evidence_hash:string;signature_ref:string};
}
export interface ApprovalRecord{
 schema:"ssw.approval-record.v1";approval_id:string;action_id:string;action_version:number;material_terms_hash:string;holder_did:string;
 device_id:string;runtime_id:string;review_ref:string;authentication_ref:string;status:"APPROVED"|"REJECTED"|"EXPIRED"|"INVALIDATED";
 approved_at:string;expires_at:string;integrity:{approval_hash:string;signature_ref:string};
}
const assuranceRank={AL1:1,AL2:2,AL3:3,AL4:4} as const;
const riskApprovalMinimum:Record<RiskClass,keyof typeof assuranceRank>={R0:"AL1",R1:"AL1",R2:"AL1",R3:"AL2",R4:"AL3",R5:"AL4"};

export function createReviewRecord(input:{
 action:ActionContract;materialTermsHash:string;reviewId:string;presentationRef:string;reviewedAt:string;
}):ReviewRecord{
 const a=assertContract("action-contract",input.action);
 const record:ReviewRecord={schema:"ssw.review-record.v1",review_id:input.reviewId,presentation_ref:input.presentationRef,action_id:a.action_id,
 action_version:a.version,material_terms_hash:input.materialTermsHash,holder_did:a.principal.holder_did,device_id:a.principal.device_id,
 runtime_id:a.principal.sera_runtime_id,status:"REVIEWED",reviewed_at:input.reviewedAt};
 return assertContract("review-record",record) as ReviewRecord;
}

export function createApprovalRecord(input:{
 action:ActionContract;materialTermsHash:string;review:ReviewRecord;authentication:AuthenticationEvidence;
 approvalId:string;approvedAt:string;expiresAt:string;approvalHash:string;approvalSignatureRef:string;
}):ApprovalRecord{
 const a=assertContract("action-contract",input.action);
 const review=assertContract("review-record",input.review) as ReviewRecord;
 const auth=assertContract("authentication-evidence",input.authentication) as AuthenticationEvidence;
 if(a.authority.class!=="A2"||!a.authority.approval_required)throw new Error("Approval Record requires A2 approval path.");
 if(Date.parse(a.expires_at)<=Date.parse(input.approvedAt))throw new Error("Action expired before approval.");
 if(review.status!=="REVIEWED")throw new Error("Exact terms were not reviewed.");
 if(review.action_id!==a.action_id||review.action_version!==a.version||review.material_terms_hash!==input.materialTermsHash)throw new Error("Review is not bound to current action terms.");
 if(review.holder_did!==a.principal.holder_did||review.device_id!==a.principal.device_id||review.runtime_id!==a.principal.sera_runtime_id)throw new Error("Review context mismatch.");
 if(auth.status!=="PASS")throw new Error("Authentication did not pass.");
 if(auth.purpose!=="ACTION_APPROVAL")throw new Error("Authentication purpose does not authorize action approval.");
 if(auth.holder_did!==a.principal.holder_did)throw new Error("Authentication holder mismatch.");
 if(auth.action_id!==a.action_id||auth.action_version!==a.version||auth.material_terms_hash!==input.materialTermsHash)throw new Error("Authentication is not bound to current action terms.");
 if(auth.device_id!==a.principal.device_id||auth.runtime_id!==a.principal.sera_runtime_id)throw new Error("Authentication runtime context mismatch.");
 if(Date.parse(auth.expires_at)<=Date.parse(input.approvedAt))throw new Error("Authentication evidence expired.");
 const minimum=riskApprovalMinimum[a.risk.class];
 if(assuranceRank[auth.assurance_level]<assuranceRank[minimum])throw new Error("Authentication assurance insufficient for action risk.");
 const record:ApprovalRecord={schema:"ssw.approval-record.v1",approval_id:input.approvalId,action_id:a.action_id,action_version:a.version,
 material_terms_hash:input.materialTermsHash,holder_did:a.principal.holder_did,device_id:a.principal.device_id,runtime_id:a.principal.sera_runtime_id,
 review_ref:review.review_id,authentication_ref:auth.auth_id,status:"APPROVED",approved_at:input.approvedAt,expires_at:input.expiresAt,
 integrity:{approval_hash:input.approvalHash,signature_ref:input.approvalSignatureRef}};
 return assertContract("approval-record",record) as ApprovalRecord;
}

export function applyApprovalToAction(actionInput:ActionContract,approvalInput:ApprovalRecord,reviewInput:ReviewRecord):ActionContract{
 const a=assertContract("action-contract",actionInput);
 const approval=assertContract("approval-record",approvalInput) as ApprovalRecord;
 const review=assertContract("review-record",reviewInput) as ReviewRecord;
 if(approval.status!=="APPROVED")throw new Error("Approval Record is not approved.");
 if(approval.action_id!==a.action_id||approval.action_version!==a.version)throw new Error("Approval action mismatch.");
 if(approval.material_terms_hash!==review.material_terms_hash)throw new Error("Approval/review terms mismatch.");
 if(review.action_id!==a.action_id||review.action_version!==a.version)throw new Error("Review action mismatch.");
 const next=structuredClone(a);
 next.approval.status="APPROVED";next.approval.approval_id=approval.approval_id;next.approval.approved_terms_hash=approval.material_terms_hash;
 next.presentation.review_hash=review.material_terms_hash;
 return assertContract("action-contract",next);
}
