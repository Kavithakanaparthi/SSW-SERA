import {randomUUID} from "node:crypto";
import {assertContract} from "@soulverse/schema-validation";
import type {SeraMemoryStore} from "@soulverse/sera-memory";

export type VoiceRiskClass="V0"|"V1"|"V2"|"V3"|"V4"|"V5";
export type VoiceDecision="CONTINUE"|"CLARIFY"|"STOP"|"REQUIRE_INDEPENDENT_AUTHORIZATION";
export interface VoiceSignals{acoustic:number;transcript:number;holderAdaptation:number|null;intent:number;entity:number;numeric:number;negation:number;context:number;environment:number;}
export interface VoiceAmbiguity{protectedNumeric:boolean;recipient:boolean;asset:boolean;negation:boolean;multipleSpeakers:boolean;}

const thresholds:Record<VoiceRiskClass,{base:number;entity:number;numeric:number;negation:number}>={
 V0:{base:.55,entity:.40,numeric:.40,negation:.55},
 V1:{base:.65,entity:.55,numeric:.55,negation:.65},
 V2:{base:.72,entity:.70,numeric:.70,negation:.78},
 V3:{base:.80,entity:.82,numeric:.90,negation:.93},
 V4:{base:.88,entity:.92,numeric:.96,negation:.97},
 V5:{base:.90,entity:.94,numeric:.97,negation:.98}
};

function min(...values:number[]){return Math.min(...values);}
export function evaluateVoiceSafety(input:{
 voiceEventId?:string;holderDid:string;seraAgentDid:string;riskClass:VoiceRiskClass;signals:VoiceSignals;ambiguity:VoiceAmbiguity;
 protectedNumericCandidates?:string[];createdAt:string;
}){
 const t=thresholds[input.riskClass];const reasons:string[]=[];
 if(input.ambiguity.multipleSpeakers)reasons.push("MULTIPLE_SPEAKERS");
 if(input.ambiguity.negation||input.signals.negation<t.negation)reasons.push("NEGATION_UNCERTAIN");
 if(input.ambiguity.protectedNumeric||(input.protectedNumericCandidates?.length??0)>1||input.signals.numeric<t.numeric)reasons.push("PROTECTED_NUMERIC_UNCERTAIN");
 if(input.ambiguity.recipient||input.signals.entity<t.entity)reasons.push("RECIPIENT_UNCERTAIN");
 if(input.ambiguity.asset)reasons.push("ASSET_UNCERTAIN");
 const base=min(input.signals.acoustic,input.signals.transcript,input.signals.intent,input.signals.context,input.signals.environment);
 if(base<t.base)reasons.push("VOICE_CONFIDENCE_INSUFFICIENT");

 let decision:VoiceDecision;
 if(reasons.includes("NEGATION_UNCERTAIN")&&(input.riskClass==="V3"||input.riskClass==="V4"||input.riskClass==="V5"))decision="STOP";
 else if(reasons.length)decision="CLARIFY";
 else if(input.riskClass==="V4"||input.riskClass==="V5")decision="REQUIRE_INDEPENDENT_AUTHORIZATION";
 else decision="CONTINUE";

 return assertContract("voice-confidence-envelope",{
  schema:"ssw.voice-confidence-envelope.v1",voice_event_id:input.voiceEventId??randomUUID(),holder_did:input.holderDid,sera_agent_did:input.seraAgentDid,
  risk_class:input.riskClass,
  signals:{acoustic:input.signals.acoustic,transcript:input.signals.transcript,holder_adaptation:input.signals.holderAdaptation,intent:input.signals.intent,entity:input.signals.entity,numeric:input.signals.numeric,negation:input.signals.negation,context:input.signals.context,environment:input.signals.environment},
  ambiguity:{protected_numeric:input.ambiguity.protectedNumeric,recipient:input.ambiguity.recipient,asset:input.ambiguity.asset,negation:input.ambiguity.negation,multiple_speakers:input.ambiguity.multipleSpeakers},
  protected_numeric_candidates:input.protectedNumericCandidates??[],decision,reason_codes:reasons,created_at:input.createdAt
 });
}

export type VoiceCorrectionKind="PRONUNCIATION"|"VOCABULARY"|"ENTITY_ALIAS"|"LANGUAGE_PREFERENCE"|"NUMERIC_CONFUSION";
export class VoiceCorrectionLearner{
 constructor(private readonly memory:SeraMemoryStore){}
 async learn(input:{holderDid:string;seraAgentDid:string;kind:VoiceCorrectionKind;memoryKey:string;value:Record<string,unknown>;now:string;confidence?:number}){
  const domain=input.kind==="ENTITY_ALIAS"?"ENTITY_ALIAS":"LANGUAGE_VOICE";
  const retention=input.kind==="ENTITY_ALIAS"?"RT3":"RT3";
  return await this.memory.write({
   holderDid:input.holderDid,seraAgentDid:input.seraAgentDid,domain,memoryKey:input.memoryKey,value:input.value,
   provenance:"HOLDER_CORRECTION",confidence:input.confidence??1,retentionClass:retention,contextTier:"C2",
   externalTransmissionAllowed:false,deviceScope:"ALL_AUTHORIZED_DEVICES",now:input.now
  });
 }
}
