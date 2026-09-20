import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";

export type RuntimeEnvironment="development"|"test"|"staging"|"production";
export type ServiceLifecycleState="CONFIGURED"|"STARTING"|"READY"|"DRAINING"|"STOPPED";
export type ErrorCategory="VALIDATION"|"AUTHENTICATION"|"AUTHORIZATION"|"CONFLICT"|"DEPENDENCY"|"UNAVAILABLE"|"INTERNAL";

export interface RuntimeConfig{
 serviceName:string;serviceVersion:string;environment:RuntimeEnvironment;host:string;port:number;
 requestBodyLimitBytes:number;requestTimeoutMs:number;shutdownGraceMs:number;
}
export interface RequestContext{
 requestId:string;correlationId:string|null;actionId:string|null;callerIdentity:string|null;startedAt:string;
}
export interface VerifiedIdentity{subject:string;claims?:Readonly<Record<string,string>>;}
export interface IdentityVerifier{verify(request:IncomingMessage):Promise<VerifiedIdentity|null>;}
export class DenyAllIdentityVerifier implements IdentityVerifier{async verify(){return null;}}
export class StaticIdentityVerifier implements IdentityVerifier{
 constructor(private readonly allowed:ReadonlySet<string>){}
 async verify(request:IncomingMessage){const asserted=request.headers["x-service-identity"];const value=Array.isArray(asserted)?asserted[0]:asserted;return value&&this.allowed.has(value)?{subject:value}:null;}
}

export class ServiceError extends Error{
 constructor(public readonly code:string,public readonly category:ErrorCategory,public readonly retryable:boolean,public readonly statusCode:number,public readonly detailsRef:string|null=null){super(code);}
}
export function toErrorBody(error:ServiceError){return{error:{code:error.code,category:error.category,retryable:error.retryable,details_ref:error.detailsRef}};}

const sensitiveKey=/(secret|token|password|private[_-]?key|seed|biometric|credential|authorization)/i;
export function redactForLog(value:unknown):unknown{
 if(Array.isArray(value))return value.map(redactForLog);
 if(value&&typeof value==="object"){
  const out:Record<string,unknown>={};
  for(const [key,val] of Object.entries(value as Record<string,unknown>))out[key]=sensitiveKey.test(key)?"[REDACTED]":redactForLog(val);
  return out;
 }
 return value;
}
export interface Logger{info(event:string,fields?:Record<string,unknown>):void;warn(event:string,fields?:Record<string,unknown>):void;error(event:string,fields?:Record<string,unknown>):void;}
export class JsonLogger implements Logger{
 constructor(private readonly sink:(line:string)=>void=(line)=>process.stdout.write(line+"\n")){}
 private write(level:string,event:string,fields:Record<string,unknown>={}){this.sink(JSON.stringify({ts:new Date().toISOString(),level,event,...redactForLog(fields) as Record<string,unknown>}));}
 info(event:string,fields?:Record<string,unknown>){this.write("info",event,fields);}
 warn(event:string,fields?:Record<string,unknown>){this.write("warn",event,fields);}
 error(event:string,fields?:Record<string,unknown>){this.write("error",event,fields);}
}

export class ReadinessRegistry{
 private readonly dependencies=new Map<string,{ready:boolean;reason:string|null}>();
 register(name:string,ready=false){this.dependencies.set(name,{ready,reason:ready?null:"NOT_INITIALIZED"});}
 set(name:string,ready:boolean,reason:string|null=null){if(!this.dependencies.has(name))throw new Error("READINESS_DEPENDENCY_UNKNOWN");this.dependencies.set(name,{ready,reason:ready?null:(reason??"NOT_READY")});}
 snapshot(){const deps=[...this.dependencies.entries()].map(([name,v])=>({name,...v}));return{ready:deps.every(x=>x.ready),dependencies:deps};}
}

export function loadRuntimeConfig(env:NodeJS.ProcessEnv):RuntimeConfig{
 const serviceName=env.SERVICE_NAME?.trim();if(!serviceName)throw new Error("SERVICE_NAME_REQUIRED");
 const serviceVersion=env.SERVICE_VERSION?.trim()||"0.0.0";
 const environment=(env.RUNTIME_ENVIRONMENT??"development") as RuntimeEnvironment;
 if(!["development","test","staging","production"].includes(environment))throw new Error("RUNTIME_ENVIRONMENT_INVALID");
 const int=(key:string,fallback:number,min:number,max:number)=>{const raw=env[key];const n=raw===undefined?fallback:Number(raw);if(!Number.isInteger(n)||n<min||n>max)throw new Error(`${key}_INVALID`);return n;};
 return{serviceName,serviceVersion,environment,host:env.SERVICE_HOST?.trim()||"127.0.0.1",port:int("SERVICE_PORT",3000,0,65535),
 requestBodyLimitBytes:int("REQUEST_BODY_LIMIT_BYTES",1_048_576,1024,10_485_760),requestTimeoutMs:int("REQUEST_TIMEOUT_MS",15_000,100,120_000),
 shutdownGraceMs:int("SHUTDOWN_GRACE_MS",10_000,100,120_000)};
}
function header(request:IncomingMessage,name:string){const value=request.headers[name];return Array.isArray(value)?value[0]??null:value??null;}
export async function createRequestContext(request:IncomingMessage,identityVerifier:IdentityVerifier):Promise<RequestContext>{
 const verified=await identityVerifier.verify(request);
 return{requestId:header(request,"x-request-id")??randomUUID(),correlationId:header(request,"x-correlation-id"),actionId:header(request,"x-action-id"),callerIdentity:verified?.subject??null,startedAt:new Date().toISOString()};
}
async function readJsonBody(request:IncomingMessage,limit:number):Promise<unknown>{
 let bytes=0;const chunks:Buffer[]=[];
 for await(const chunk of request){const b=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);bytes+=b.length;if(bytes>limit)throw new ServiceError("REQUEST_BODY_TOO_LARGE","VALIDATION",false,413);chunks.push(b);}
 if(chunks.length===0)return null;try{return JSON.parse(Buffer.concat(chunks).toString("utf8"));}catch{throw new ServiceError("INVALID_JSON","VALIDATION",false,400);}
}
function json(response:ServerResponse,status:number,body:unknown){const payload=JSON.stringify(body);response.writeHead(status,{"content-type":"application/json; charset=utf-8","content-length":Buffer.byteLength(payload)});response.end(payload);}

export interface RouteRequest{method:string;path:string;headers:IncomingMessage["headers"];body:unknown;context:RequestContext;}
export interface RouteResponse{status:number;body:unknown;}
export interface ServiceRoute{method:"GET"|"POST"|"PUT"|"PATCH"|"DELETE";path:string;requireServiceIdentity?:boolean;handler(request:RouteRequest):Promise<RouteResponse>|RouteResponse;}
export interface ServiceHostOptions{config:RuntimeConfig;identityVerifier?:IdentityVerifier;logger?:Logger;readiness?:ReadinessRegistry;routes?:readonly ServiceRoute[];}

export class ServiceHost{
 private server:Server|null=null;private state:ServiceLifecycleState="CONFIGURED";
 readonly readiness:ReadinessRegistry;private readonly logger:Logger;private readonly identityVerifier:IdentityVerifier;
 constructor(private readonly options:ServiceHostOptions){this.readiness=options.readiness??new ReadinessRegistry();this.logger=options.logger??new JsonLogger();this.identityVerifier=options.identityVerifier??new DenyAllIdentityVerifier();}
 get lifecycle(){return this.state;}
 async start():Promise<{host:string;port:number}>{
  if(this.server)throw new Error("SERVICE_ALREADY_STARTED");this.state="STARTING";
  this.server=createServer({requestTimeout:this.options.config.requestTimeoutMs},async(req,res)=>{
   const started=Date.now();let context:RequestContext|undefined;
   try{
    const url=new URL(req.url??"/","http://internal");const method=req.method??"GET";
    if(method==="GET"&&url.pathname==="/health/live")return json(res,200,{status:"LIVE",service:this.options.config.serviceName,state:this.state});
    if(method==="GET"&&url.pathname==="/health/ready"){const snap=this.readiness.snapshot();return json(res,snap.ready&&this.state==="READY"?200:503,{status:snap.ready&&this.state==="READY"?"READY":"NOT_READY",service:this.options.config.serviceName,...snap});}
    if(method==="GET"&&url.pathname==="/meta")return json(res,200,{service:this.options.config.serviceName,version:this.options.config.serviceVersion,environment:this.options.config.environment,state:this.state});
    context=await createRequestContext(req,this.identityVerifier);
    const route=this.options.routes?.find(r=>r.method===method&&r.path===url.pathname);if(!route)throw new ServiceError("ROUTE_NOT_FOUND","VALIDATION",false,404);
    if(route.requireServiceIdentity&&context.callerIdentity===null)throw new ServiceError("SERVICE_IDENTITY_REQUIRED","AUTHENTICATION",false,401);
    const body=["POST","PUT","PATCH"].includes(method)?await readJsonBody(req,this.options.config.requestBodyLimitBytes):null;
    const out=await route.handler({method,path:url.pathname,headers:req.headers,body,context});json(res,out.status,out.body);
   }catch(error){
    const controlled=error instanceof ServiceError?error:new ServiceError("INTERNAL_ERROR","INTERNAL",false,500);
    this.logger.error("service.request.failed",{request_id:context?.requestId??null,code:controlled.code,category:controlled.category});
    json(res,controlled.statusCode,toErrorBody(controlled));
   }finally{this.logger.info("service.request.completed",{request_id:context?.requestId??null,method:req.method,path:req.url,duration_ms:Date.now()-started,status_code:res.statusCode});}
  });
  await new Promise<void>((resolve,reject)=>{this.server!.once("error",reject);this.server!.listen(this.options.config.port,this.options.config.host,()=>resolve());});
  this.state="READY";const address=this.server.address();const port=typeof address==="object"&&address?address.port:this.options.config.port;
  this.logger.info("service.started",{service:this.options.config.serviceName,environment:this.options.config.environment,host:this.options.config.host,port});
  return{host:this.options.config.host,port};
 }
 async stop(){if(!this.server){this.state="STOPPED";return;}this.state="DRAINING";const server=this.server;await new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>{server.closeAllConnections();},this.options.config.shutdownGraceMs);server.close(err=>{clearTimeout(timer);err?reject(err):resolve();});});this.server=null;this.state="STOPPED";this.logger.info("service.stopped",{service:this.options.config.serviceName});}
}

export * from "./workload-identity.js";

export * from "./observability.js";

export * from "./environment-controls.js";

export * from "./deployment-manifest.js";
