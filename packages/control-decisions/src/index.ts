import type { ActionContract, AuthorityClass, RiskClass } from "@soulverse/contracts";
import { assertContract } from "@soulverse/schema-validation";

export type AuthorityDecisionStatus =
  | "PASS"
  | "REQUIRE_APPROVAL"
  | "REQUIRE_MANDATE_VALIDATION"
  | "FAIL"
  | "PROHIBITED";

export type RiskSignal =
  | "NEW_COUNTERPARTY"
  | "SUSPICIOUS_ASSET"
  | "BRIDGE_REQUIRED"
  | "HIGH_VALUE_POLICY_HIT"
  | "EXTERNAL_REQUEST"
  | "UNTRUSTED_ORIGIN"
  | "RECOVERY_CONTEXT"
  | "DEGRADED_RUNTIME";

export interface EvaluationIds {
  authorityDecisionId: string;
  riskDecisionId: string;
  policyDecisionId: string;
}

export interface AuthorityDecisionInput {
  action: ActionContract;
  materialTermsHash: string;
  decisionId: string;
  evaluatedAt: string;
}

export interface AuthorityDecision {
  schema: "ssw.authority-decision.v1";
  decision_id: string;
  action_id: string;
  action_version: number;
  material_terms_hash: string;
  authority_class: AuthorityClass;
  status: AuthorityDecisionStatus;
  reason_codes: string[];
  approval_ref: string | null;
  mandate_ref: string | null;
  evaluated_at: string;
}

const riskRank: Readonly<Record<RiskClass, number>> = {
  R0:0,R1:1,R2:2,R3:3,R4:4,R5:5
};
const rankRisk = ["R0","R1","R2","R3","R4","R5"] as const;

function maxRisk(...classes: RiskClass[]): RiskClass {
  return rankRisk[Math.max(...classes.map((c)=>riskRank[c]))]!;
}

export function evaluateAuthority(input: AuthorityDecisionInput): AuthorityDecision {
  const action=assertContract("action-contract",input.action);
  const cls=action.authority.class;
  let status:AuthorityDecisionStatus;
  const reasons:string[]=[];

  if(cls==="A0"||cls==="A1"){
    status="PASS";
  } else if(cls==="A2"){
    if(action.approval.status!=="APPROVED"){
      status="REQUIRE_APPROVAL";
      reasons.push("AUTHENTICATION_REQUIRED");
    } else if(action.approval.approved_terms_hash!==input.materialTermsHash){
      status="FAIL";
      reasons.push("MATERIAL_TERMS_HASH_MISMATCH");
    } else {
      status="PASS";
    }
  } else if(cls==="A3"||cls==="A4"){
    status="REQUIRE_MANDATE_VALIDATION";
    reasons.push(action.authority.mandate_id ? "MANDATE_NOT_ACTIVE" : "MANDATE_NOT_ACTIVE");
  } else {
    status="PROHIBITED";
    reasons.push("ACTION_NOT_IN_SCOPE");
  }

  const decision:AuthorityDecision={
    schema:"ssw.authority-decision.v1",
    decision_id:input.decisionId,
    action_id:action.action_id,
    action_version:action.version,
    material_terms_hash:input.materialTermsHash,
    authority_class:cls,
    status,
    reason_codes:reasons,
    approval_ref:action.approval.approval_id,
    mandate_ref:action.authority.mandate_id,
    evaluated_at:input.evaluatedAt
  };
  return assertContract("authority-decision",decision) as unknown as AuthorityDecision;
}

const baselineByAction:Readonly<Record<string,RiskClass>>={
  "payment.send":"R3",
  "tx.prepare_send":"R2",
  "credential.inspect":"R1",
  "credential.present":"R3",
  "security.revoke_device":"R4",
  "security.revoke_mandate":"R4"
};

const signalFloor:Readonly<Record<RiskSignal,RiskClass>>={
  NEW_COUNTERPARTY:"R4",
  SUSPICIOUS_ASSET:"R5",
  BRIDGE_REQUIRED:"R4",
  HIGH_VALUE_POLICY_HIT:"R4",
  EXTERNAL_REQUEST:"R3",
  UNTRUSTED_ORIGIN:"R5",
  RECOVERY_CONTEXT:"R5",
  DEGRADED_RUNTIME:"R4"
};

export interface RiskDecisionInput {
  action: ActionContract;
  materialTermsHash: string;
  decisionId: string;
  evaluatedAt: string;
  signals?: readonly RiskSignal[];
}

export interface RiskDecision {
  schema:"ssw.risk-decision.v1";
  decision_id:string;
  action_id:string;
  action_version:number;
  material_terms_hash:string;
  declared_class:RiskClass;
  baseline_class:RiskClass;
  final_class:RiskClass;
  status:"CLASSIFIED"|"RESTRICTED";
  reason_codes:string[];
  evaluated_at:string;
}

export function evaluateRisk(input:RiskDecisionInput):RiskDecision{
  const action=assertContract("action-contract",input.action);
  const baseline=baselineByAction[action.action_type] ?? action.risk.class;
  const signals=input.signals ?? [];
  const floors=signals.map((s)=>signalFloor[s]);
  const finalClass=maxRisk(action.risk.class,baseline,...floors);
  const reasons=[...new Set([...action.risk.reasons,...signals])];
  const decision:RiskDecision={
    schema:"ssw.risk-decision.v1",
    decision_id:input.decisionId,
    action_id:action.action_id,
    action_version:action.version,
    material_terms_hash:input.materialTermsHash,
    declared_class:action.risk.class,
    baseline_class:baseline,
    final_class:finalClass,
    status:finalClass==="R5"?"RESTRICTED":"CLASSIFIED",
    reason_codes:reasons,
    evaluated_at:input.evaluatedAt
  };
  return assertContract("risk-decision",decision) as unknown as RiskDecision;
}

export interface PolicyProfile {
  policyId:string;
  allowedAuthorityClasses:readonly AuthorityClass[];
  maxRiskClass:RiskClass;
  requireDeviceRuntimeForRiskAtOrAbove:RiskClass;
}

export const phase1DefaultPolicy:PolicyProfile={
  policyId:"policy:ssw-phase1-default-v1",
  allowedAuthorityClasses:["A0","A1","A2","A3","A4"],
  maxRiskClass:"R4",
  requireDeviceRuntimeForRiskAtOrAbove:"R2"
};

export interface PolicyDecision {
  schema:"ssw.policy-decision.v1";
  decision_id:string;
  action_id:string;
  action_version:number;
  material_terms_hash:string;
  policy_id:string;
  status:"ALLOW_CONTINUE"|"REQUIRE_AUTHORITY"|"REQUIRE_DEVICE_RUNTIME"|"REQUIRE_TRUST_REV"|"DENY"|"PROHIBITED";
  reason_codes:string[];
  authority_decision_ref:string;
  risk_decision_ref:string;
  evaluated_at:string;
}

export function evaluatePolicy(input:{
  action:ActionContract;
  materialTermsHash:string;
  authorityDecision:AuthorityDecision;
  riskDecision:RiskDecision;
  decisionId:string;
  evaluatedAt:string;
  profile?:PolicyProfile;
}):PolicyDecision{
  const action=assertContract("action-contract",input.action);
  const profile=input.profile ?? phase1DefaultPolicy;
  let status:PolicyDecision["status"]="ALLOW_CONTINUE";
  const reasons:string[]=[];

  if(!profile.allowedAuthorityClasses.includes(action.authority.class) || action.authority.class==="A5"){
    status="PROHIBITED";
    reasons.push("ACTION_NOT_IN_SCOPE");
  } else if(riskRank[input.riskDecision.final_class] > riskRank[profile.maxRiskClass]){
    status="DENY";
    reasons.push("RISK_CEILING_EXCEEDED");
  } else if(input.authorityDecision.status!=="PASS"){
    status="REQUIRE_AUTHORITY";
    reasons.push(...input.authorityDecision.reason_codes);
  } else if(
    riskRank[input.riskDecision.final_class] >= riskRank[profile.requireDeviceRuntimeForRiskAtOrAbove] &&
    (!action.policy.device_eligible || !action.policy.runtime_eligible)
  ){
    status="REQUIRE_DEVICE_RUNTIME";
    if(!action.policy.device_eligible)reasons.push("DEVICE_NOT_ELIGIBLE");
    if(!action.policy.runtime_eligible)reasons.push("RUNTIME_NOT_ELIGIBLE");
  } else if(
    (action.trust.trust_protocol_required && !action.trust.trust_protocol_ref) ||
    (action.trust.rev_required && !action.trust.rev_ref)
  ){
    status="REQUIRE_TRUST_REV";
    if(action.trust.trust_protocol_required && !action.trust.trust_protocol_ref)reasons.push("TRUST_PROTOCOL_UNAVAILABLE");
    if(action.trust.rev_required && !action.trust.rev_ref)reasons.push("REV_UNAVAILABLE");
  }

  const decision:PolicyDecision={
    schema:"ssw.policy-decision.v1",
    decision_id:input.decisionId,
    action_id:action.action_id,
    action_version:action.version,
    material_terms_hash:input.materialTermsHash,
    policy_id:profile.policyId,
    status,
    reason_codes:[...new Set(reasons)],
    authority_decision_ref:input.authorityDecision.decision_id,
    risk_decision_ref:input.riskDecision.decision_id,
    evaluated_at:input.evaluatedAt
  };
  return assertContract("policy-decision",decision) as unknown as PolicyDecision;
}
