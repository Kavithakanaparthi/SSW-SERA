import {randomUUID} from "node:crypto";
import {assertContract} from "@soulverse/schema-validation";
import {PostgresPersistence} from "@soulverse/persistence-postgres";

export type SignalClass="WALLET"|"CHAIN"|"CREDENTIAL"|"SECURITY"|"TRUST"|"NEWS"|"PROFESSIONAL_CONTEXT"|"SERVICE";
export type NotificationClass="LOW_VALUE"|"INFORMATIONAL"|"RELEVANT"|"ACTION_REQUIRED"|"CRITICAL";
export type ProactiveDecision="SUPPRESS"|"RECORD"|"DIGEST"|"SURFACE_IN_CONTEXT"|"NOTIFY"|"INTERRUPT";
export interface AssessmentFactors{exposure:number;relationship:number;actionability:number;riskImpact:number;holderPreference:number;recency:number;duplicatePenalty:number;fatiguePenalty:number;}
export class ProactiveError extends Error{constructor(public readonly code:string){super(code);}}

function clamp(v:number){return Math.max(0,Math.min(1,v));}
function relevance(f:AssessmentFactors,sourceConfidence:number){
 return clamp(.23*f.exposure+.10*f.relationship+.16*f.actionability+.24*f.riskImpact+.09*f.holderPreference+.08*f.recency+.10*sourceConfidence-.10*f.duplicatePenalty-.10*f.fatiguePenalty);
}
function classify(input:{score:number;severity:string;actionability:number;riskImpact:number;sourceClass:string;veracity:string;corroborationCount:number}){
 let notification:NotificationClass;
 if(input.severity==="CRITICAL"&&input.riskImpact>=.8&&input.score>=.72)notification="CRITICAL";
 else if((input.severity==="HIGH"||input.riskImpact>=.7)&&input.actionability>=.55&&input.score>=.60)notification="ACTION_REQUIRED";
 else if(input.score>=.48)notification="RELEVANT";
 else if(input.score>=.25)notification="INFORMATIONAL";
 else notification="LOW_VALUE";

 const external=input.sourceClass==="EXTERNAL_NEWS"||input.sourceClass==="EXTERNAL_PROFESSIONAL";
 const weak=input.veracity==="UNCONFIRMED"||input.veracity==="CONFLICTING"||input.veracity==="STALE";
 if(external&&(weak||input.corroborationCount<1)&&notification==="CRITICAL")notification="RELEVANT";
 if(external&&(weak||input.corroborationCount<1)&&notification==="ACTION_REQUIRED")notification="RELEVANT";

 const urgency=notification==="CRITICAL"?"U4":notification==="ACTION_REQUIRED"?"U3":notification==="RELEVANT"?"U2":notification==="INFORMATIONAL"?"U1":"U0";
 return{notification,urgency};
}

export class ProactiveStore{
 constructor(private readonly db:PostgresPersistence){}

 async saveGrant(input:any){
  const grant=assertContract("monitoring-grant",input) as any;
  await this.db.pool.query(`INSERT INTO ssw.monitoring_grant(grant_id,holder_did,sera_agent_did,signal_class,scope_json,delivery_classes,processing,retention,enabled,authority_effect,created_at,updated_at,expires_at)
    VALUES($1::uuid,$2,$3,$4,$5::jsonb,$6::text[],$7,$8,$9,'NONE',$10::timestamptz,$11::timestamptz,$12::timestamptz)
    ON CONFLICT(grant_id) DO UPDATE SET scope_json=EXCLUDED.scope_json,delivery_classes=EXCLUDED.delivery_classes,processing=EXCLUDED.processing,retention=EXCLUDED.retention,enabled=EXCLUDED.enabled,updated_at=EXCLUDED.updated_at,expires_at=EXCLUDED.expires_at`,
    [grant.grant_id,grant.holder_did,grant.sera_agent_did,grant.signal_class,JSON.stringify(grant.scope),grant.delivery_classes,grant.processing,grant.retention,grant.enabled,grant.created_at,grant.updated_at,grant.expires_at]);
  return grant;
 }
 async activeGrant(input:{holderDid:string;seraAgentDid:string;signalClass:SignalClass;now:string}){
  const r=await this.db.pool.query(`SELECT * FROM ssw.monitoring_grant WHERE holder_did=$1 AND sera_agent_did=$2 AND signal_class=$3 AND enabled=true AND (expires_at IS NULL OR expires_at>$4::timestamptz) ORDER BY updated_at DESC LIMIT 1`,
   [input.holderDid,input.seraAgentDid,input.signalClass,input.now]);return r.rows[0]??null;
 }
 async ingest(signalInput:unknown):Promise<{status:"FRESH"|"DUPLICATE";signal:any}>{
  const signal=assertContract("proactive-signal",signalInput) as any;
  const r=await this.db.pool.query(`INSERT INTO ssw.proactive_signal(signal_id,holder_did,sera_agent_did,signal_class,event_type,source_json,subject_json,severity,freshness_seconds,evidence_refs,dedupe_key,observed_at,created_at)
    VALUES($1::uuid,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8,$9,$10::text[],$11,$12::timestamptz,$13::timestamptz)
    ON CONFLICT(holder_did,dedupe_key) DO NOTHING RETURNING signal_id`,
    [signal.signal_id,signal.holder_did,signal.sera_agent_did,signal.signal_class,signal.event_type,JSON.stringify(signal.source),JSON.stringify(signal.subject),signal.severity,signal.freshness_seconds,signal.evidence_refs,signal.dedupe_key,signal.observed_at,signal.created_at]);
  if(r.rowCount===1)return{status:"FRESH",signal};
  const existing=await this.db.pool.query(`SELECT * FROM ssw.proactive_signal WHERE holder_did=$1 AND dedupe_key=$2`,[signal.holder_did,signal.dedupe_key]);
  return{status:"DUPLICATE",signal:existing.rows[0]};
 }
 async persistAssessment(a:any){
  await this.db.pool.query(`INSERT INTO ssw.proactive_assessment(assessment_id,signal_id,grant_id,holder_did,sera_agent_did,factors_json,relevance_score,urgency,notification_class,decision,reason_codes,evidence_refs,authority_effect,created_at)
    VALUES($1::uuid,$2::uuid,$3::uuid,$4,$5,$6::jsonb,$7,$8,$9,$10,$11::text[],$12::text[],'NONE',$13::timestamptz)`,
    [a.assessment_id,a.signal_id,a.grant_id,a.holder_did,a.sera_agent_did,JSON.stringify(a.factors),a.relevance_score,a.urgency,a.notification_class,a.decision,a.reason_codes,a.evidence_refs,a.created_at]);
 }
}

export class ProactiveRuntime{
 constructor(private readonly store:ProactiveStore){}
 async assess(input:{signal:unknown;factors:AssessmentFactors;now:string;assessmentId?:string}){
  const signal=assertContract("proactive-signal",input.signal) as any;
  const ingested=await this.store.ingest(signal);
  const grant=await this.store.activeGrant({holderDid:signal.holder_did,seraAgentDid:signal.sera_agent_did,signalClass:signal.signal_class,now:input.now});
  const reasons:string[]=[];
  if(!grant)reasons.push("MONITORING_GRANT_MISSING");
  if(ingested.status==="DUPLICATE")reasons.push("DUPLICATE_SIGNAL");
  if(signal.source.veracity==="CONFLICTING")reasons.push("SOURCE_CONFLICTING");
  if(signal.source.veracity==="STALE")reasons.push("SOURCE_STALE");
  if(signal.source.confidence<.5)reasons.push("SOURCE_CONFIDENCE_LOW");

  const score=relevance(input.factors,signal.source.confidence);
  let {notification,urgency}=classify({score,severity:signal.severity,actionability:input.factors.actionability,riskImpact:input.factors.riskImpact,sourceClass:signal.source.source_class,veracity:signal.source.veracity,corroborationCount:signal.source.corroboration_count});
  let decision:ProactiveDecision;
  if(!grant)decision="SUPPRESS";
  else if(ingested.status==="DUPLICATE")decision="RECORD";
  else if(notification==="CRITICAL")decision=grant.delivery_classes.includes("CRITICAL")?"INTERRUPT":"RECORD";
  else if(notification==="ACTION_REQUIRED")decision=grant.delivery_classes.includes("ACTION_REQUIRED")?"NOTIFY":"RECORD";
  else if(notification==="RELEVANT")decision=grant.delivery_classes.includes("RELEVANT")?"SURFACE_IN_CONTEXT":"RECORD";
  else if(notification==="INFORMATIONAL")decision=grant.delivery_classes.includes("INFORMATIONAL")?"DIGEST":"RECORD";
  else decision="RECORD";

  const assessment=assertContract("proactive-assessment",{
   schema:"ssw.proactive-assessment.v1",assessment_id:input.assessmentId??randomUUID(),signal_id:signal.signal_id,grant_id:grant?.grant_id??null,
   holder_did:signal.holder_did,sera_agent_did:signal.sera_agent_did,
   factors:{exposure:input.factors.exposure,relationship:input.factors.relationship,actionability:input.factors.actionability,risk_impact:input.factors.riskImpact,holder_preference:input.factors.holderPreference,recency:input.factors.recency,duplicate_penalty:input.factors.duplicatePenalty,fatigue_penalty:input.factors.fatiguePenalty},
   relevance_score:Number(score.toFixed(6)),urgency,notification_class:notification,decision,reason_codes:reasons,evidence_refs:signal.evidence_refs,authority_effect:"NONE",created_at:input.now
  });
  await this.store.persistAssessment(assessment);
  return assessment;
 }
}

export function renderNotification(input:{notificationClass:NotificationClass;locked:boolean;title:string;detail:string}){
 if(input.locked&&(input.notificationClass==="CRITICAL"||input.notificationClass==="ACTION_REQUIRED")){
  return{title:"SERA needs your attention",detail:"Open Soul Super Wallet to review a protected alert."};
 }
 return{title:input.title,detail:input.detail};
}
