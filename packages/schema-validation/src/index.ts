import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  contractKindToSchemaId,
  type ContractKind,
  type ContractTypeMap
} from "@soulverse/contracts";

export type ValidationErrorSource = "SCHEMA" | "SEMANTIC";
export interface ContractValidationError { source: ValidationErrorSource; path: string; code: string; message: string; }
export type ContractValidationResult<T> = { ok: true; value: T } | { ok: false; errors: readonly ContractValidationError[] };

export class ContractValidationException extends Error {
  constructor(public readonly kind: ContractKind, public readonly errors: readonly ContractValidationError[]) {
    super(`Contract validation failed for ${kind}: ${errors.map((e) => e.code).join(", ")}`);
    this.name = "ContractValidationException";
  }
}

const schemaFiles = [
  "ssw-common.v1.schema.json",
  "ssw-intent-envelope.v1.schema.json",
  "ssw-resolved-intent.v1.schema.json",
  "ssw-action-contract.v1.schema.json",
  "ssw-device-record.v1.schema.json",
  "ssw-runtime-record.v1.schema.json",
  "ssw-session-eligibility-decision.v1.schema.json",
  "ssw-authority-decision.v1.schema.json",
  "ssw-risk-decision.v1.schema.json",
  "ssw-policy-decision.v1.schema.json",
  "ssw-mandate.v1.schema.json",
  "ssw-mandate-evaluation-decision.v1.schema.json",
  "ssw-offline-authorization-package.v1.schema.json",
  "ssw-dmcl-expression.v1.schema.json",
  "ssw-attestation-evidence.v1.schema.json",
  "ssw-recovery-proof.v1.schema.json",
  "ssw-wrapped-state-key.v1.schema.json",
  "ssw-counterparty-resolution.v1.schema.json"
] as const;

function loadSchema(file: string): object {
  return JSON.parse(readFileSync(path.resolve(process.cwd(), "contracts/json-schema", file), "utf8")) as object;
}

const ajv = new Ajv2020({
  allErrors: true, strict: true, validateFormats: true, allowUnionTypes: true,
  coerceTypes: false, useDefaults: false, removeAdditional: false
});
addFormats(ajv);
for (const file of schemaFiles) ajv.addSchema(loadSchema(file));

const validators = new Map<ContractKind, ValidateFunction>();
for (const [kind, schemaId] of Object.entries(contractKindToSchemaId) as [ContractKind, string][]) {
  const validator = ajv.getSchema(schemaId);
  if (!validator) throw new Error(`Validator unavailable for ${kind}: ${schemaId}`);
  validators.set(kind, validator);
}

function schemaErrors(errors: ErrorObject[] | null | undefined): ContractValidationError[] {
  return (errors ?? []).map((error) => ({
    source:"SCHEMA", path:error.instancePath || "/", code:`SCHEMA_${error.keyword.toUpperCase()}`,
    message:error.message ?? "Schema validation failed"
  }));
}

function getIdentityPair(kind: ContractKind, value: unknown): { holderDid?: unknown; seraDid?: unknown } {
  if (!value || typeof value !== "object") return {};
  const v=value as Record<string, any>;
  if (kind === "action-contract" || kind === "mandate") {
    return {holderDid:v.principal?.holder_did,seraDid:v.principal?.sera_agent_did};
  }
  if (kind === "intent-envelope" || kind === "resolved-intent" || kind === "offline-authorization-package" || kind === "recovery-proof" || kind === "wrapped-state-key") {
    return {holderDid:v.holder_did,seraDid:v.sera_agent_did};
  }
  if (kind === "counterparty-resolution") return {holderDid:v.holder_did};
  return {};
}

function semanticErrors(kind: ContractKind,value: unknown): ContractValidationError[] {
  const errors:ContractValidationError[]=[];
  const {holderDid,seraDid}=getIdentityPair(kind,value);
  const principalPath=kind==="action-contract"||kind==="mandate";
  if(typeof holderDid==="string"&&holderDid.startsWith("did:soul:agent:")){
    errors.push({source:"SEMANTIC",path:principalPath?"/principal/holder_did":"/holder_did",code:"HOLDER_DID_AGENT_NAMESPACE_FORBIDDEN",message:"Holder DID cannot use the did:soul:agent namespace."});
  }
  if(seraDid!==undefined&&typeof seraDid==="string"&&!seraDid.startsWith("did:soul:agent:")){
    errors.push({source:"SEMANTIC",path:principalPath?"/principal/sera_agent_did":"/sera_agent_did",code:"SERA_DID_AGENT_NAMESPACE_REQUIRED",message:"SERA Agent DID must use the did:soul:agent namespace."});
  }
  if(typeof holderDid==="string"&&typeof seraDid==="string"&&holderDid===seraDid){
    errors.push({source:"SEMANTIC",path:"/",code:"HOLDER_SERA_IDENTITY_COLLISION",message:"Holder DID and SERA Agent DID must be distinct identities."});
  }
  return errors;
}

export function validateContract<K extends ContractKind>(kind:K,value:unknown):ContractValidationResult<ContractTypeMap[K]>{
  const validator=validators.get(kind);
  if(!validator)return{ok:false,errors:[{source:"SCHEMA",path:"/",code:"SCHEMA_NOT_REGISTERED",message:`No validator for ${kind}`}]};
  const valid=validator(value);
  if(!valid)return{ok:false,errors:schemaErrors(validator.errors)};
  const semantic=semanticErrors(kind,value);
  if(semantic.length)return{ok:false,errors:semantic};
  return{ok:true,value:value as ContractTypeMap[K]};
}

export function assertContract<K extends ContractKind>(kind:K,value:unknown):ContractTypeMap[K]{
  const result=validateContract(kind,value);
  if(!result.ok)throw new ContractValidationException(kind,result.errors);
  return result.value;
}
export function registeredContractKinds():readonly ContractKind[]{return[...validators.keys()];}
