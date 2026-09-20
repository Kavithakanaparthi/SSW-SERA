import {createHash,randomUUID} from "node:crypto";

export type TelemetrySensitivity="PUBLIC"|"OPERATIONAL"|"HOLDER_SENSITIVE"|"SECRET";
export type TelemetryKind="LOG"|"METRIC"|"TRACE"|"SECURITY_SIGNAL";

export interface TelemetryAttribute{
 key:string;
 value:string|number|boolean|null;
 sensitivity:TelemetrySensitivity;
}

export interface TelemetryRecord{
 recordId:string;
 kind:TelemetryKind;
 name:string;
 timestamp:string;
 service:string;
 environment:string;
 traceId:string|null;
 spanId:string|null;
 requestId:string|null;
 correlationId:string|null;
 actionId:string|null;
 attributes:Record<string,string|number|boolean|null>;
 droppedKeys:string[];
 redactedKeys:string[];
}

export interface TelemetryPolicy{
 allowedOperationalKeys:ReadonlySet<string>;
 allowHashedHolderIdentifiers:boolean;
 maxAttributeCount:number;
 maxStringLength:number;
}

const secretPattern=/(secret|token|password|private[_-]?key|seed|biometric|credential|authorization|raw[_-]?prompt|prompt|mnemonic|signature|signed[_-]?payload)/i;
const sensitivePattern=/(holder|wallet|address|recipient|counterparty|amount|balance|claim|did|email|phone|name)/i;

function bounded(value:string,max:number){return value.length<=max?value:value.slice(0,max);}
function hashValue(value:string){return "sha256:"+createHash("sha256").update(value).digest("hex");}

export function sanitizeTelemetryAttributes(
 attrs:readonly TelemetryAttribute[],
 policy:TelemetryPolicy
):{attributes:Record<string,string|number|boolean|null>;droppedKeys:string[];redactedKeys:string[]}{
 const attributes:Record<string,string|number|boolean|null>={};
 const droppedKeys:string[]=[];
 const redactedKeys:string[]=[];
 for(const attr of attrs.slice(0,policy.maxAttributeCount)){
  const key=attr.key.trim();
  if(!key){droppedKeys.push(attr.key);continue;}
  if(secretPattern.test(key)||attr.sensitivity==="SECRET"){
   droppedKeys.push(key);
   continue;
  }
  if(attr.sensitivity==="HOLDER_SENSITIVE"||sensitivePattern.test(key)){
   if(policy.allowHashedHolderIdentifiers&&typeof attr.value==="string"&&/(holder|wallet|did|address|recipient|counterparty)/i.test(key)){
    attributes[key+"_hash"]=hashValue(attr.value);
    redactedKeys.push(key);
   }else{
    attributes[key]="[REDACTED]";
    redactedKeys.push(key);
   }
   continue;
  }
  if(attr.sensitivity==="OPERATIONAL"&&!policy.allowedOperationalKeys.has(key)){
   droppedKeys.push(key);
   continue;
  }
  const v=attr.value;
  attributes[key]=typeof v==="string"?bounded(v,policy.maxStringLength):v;
 }
 if(attrs.length>policy.maxAttributeCount)droppedKeys.push("__attribute_limit_exceeded__");
 return{attributes,droppedKeys,redactedKeys};
}

export function createTelemetryRecord(input:{
 kind:TelemetryKind;
 name:string;
 timestamp:string;
 service:string;
 environment:string;
 traceId?:string|null;
 spanId?:string|null;
 requestId?:string|null;
 correlationId?:string|null;
 actionId?:string|null;
 attributes:readonly TelemetryAttribute[];
 policy:TelemetryPolicy;
 recordId?:string;
}):TelemetryRecord{
 const clean=sanitizeTelemetryAttributes(input.attributes,input.policy);
 return{
  recordId:input.recordId??randomUUID(),
  kind:input.kind,
  name:input.name,
  timestamp:input.timestamp,
  service:input.service,
  environment:input.environment,
  traceId:input.traceId??null,
  spanId:input.spanId??null,
  requestId:input.requestId??null,
  correlationId:input.correlationId??null,
  actionId:input.actionId??null,
  attributes:clean.attributes,
  droppedKeys:clean.droppedKeys,
  redactedKeys:clean.redactedKeys
 };
}

export interface MetricPoint{
 name:string;
 value:number;
 unit:"count"|"ms"|"ratio"|"bytes";
 labels:Record<string,string>;
}

const allowedMetricLabel=/^(service|environment|status|result|reason_code|dependency|zone|operation|route|chain_family)$/;

export function createMetricPoint(input:{name:string;value:number;unit:MetricPoint["unit"];labels:Record<string,string>}):MetricPoint{
 if(!Number.isFinite(input.value))throw new Error("METRIC_VALUE_INVALID");
 const labels:Record<string,string>={};
 for(const [k,v] of Object.entries(input.labels)){
  if(!allowedMetricLabel.test(k))throw new Error("METRIC_LABEL_NOT_ALLOWED");
  labels[k]=bounded(v,128);
 }
 return{name:input.name,value:input.value,unit:input.unit,labels};
}

export interface TraceContext{
 traceId:string;
 spanId:string;
 parentSpanId:string|null;
 correlationId:string|null;
 actionId:string|null;
}

export function createTraceContext(input:{traceId?:string;parentSpanId?:string|null;correlationId?:string|null;actionId?:string|null}={}):TraceContext{
 const traceId=input.traceId??randomUUID().replaceAll("-","");
 const spanId=randomUUID().replaceAll("-","").slice(0,16);
 return{traceId,spanId,parentSpanId:input.parentSpanId??null,correlationId:input.correlationId??null,actionId:input.actionId??null};
}

export interface OperationalSignal{
 severity:"INFO"|"WARN"|"CRITICAL";
 code:string;
 service:string;
 zone:"Z0"|"Z1"|"Z2"|"Z3"|"Z4"|"Z5"|"Z6"|"Z7";
 timestamp:string;
 traceId:string|null;
 actionId:string|null;
 evidenceRef:string|null;
 attributes:Record<string,string|number|boolean|null>;
}

export function createOperationalSignal(input:{
 severity:OperationalSignal["severity"];
 code:string;
 service:string;
 zone:OperationalSignal["zone"];
 timestamp:string;
 traceId?:string|null;
 actionId?:string|null;
 evidenceRef?:string|null;
 attributes:readonly TelemetryAttribute[];
 policy:TelemetryPolicy;
}):OperationalSignal{
 const clean=sanitizeTelemetryAttributes(input.attributes,input.policy);
 return{
  severity:input.severity,
  code:input.code,
  service:input.service,
  zone:input.zone,
  timestamp:input.timestamp,
  traceId:input.traceId??null,
  actionId:input.actionId??null,
  evidenceRef:input.evidenceRef??null,
  attributes:clean.attributes
 };
}

export function assertNoSecretTelemetry(record:TelemetryRecord|OperationalSignal){
 const serialized=JSON.stringify(record);
 if(/seed phrase|private key|mnemonic|bearer |authorization:/i.test(serialized))throw new Error("SECRET_TELEMETRY_DETECTED");
 return true;
}
