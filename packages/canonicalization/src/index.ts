import canonicalize from "canonicalize";
import {createHash} from "node:crypto";

export type CanonicalJson=null|boolean|string|number|CanonicalJson[]|{[key:string]:CanonicalJson};

export function canonicalizeJcs(value:CanonicalJson):string{
 const out=canonicalize(value);
 if(typeof out!=="string")throw new TypeError("Value is not RFC 8785 canonicalizable.");
 return out;
}

export function sha256DomainSeparated(domain:string,value:CanonicalJson):{canonical:string;hash:string}{
 const canonical=canonicalizeJcs(value);
 const digest=createHash("sha256").update(domain,"utf8").update(Buffer.from([0])).update(canonical,"utf8").digest("hex");
 return{canonical,hash:`sha256:${digest}`};
}

export const MATERIAL_TERMS_HASH_DOMAIN="SSW:MATERIAL_TERMS:V1" as const;
export const ACTION_HASH_DOMAIN="SSW:ACTION:V1" as const;
export const SIGNING_REQUEST_HASH_DOMAIN="SSW:SIGNING_REQUEST:V1" as const;
export const EVM_PAYLOAD_HASH_DOMAIN="SSW:SIGNING_PAYLOAD:EVM:V1" as const;
export const PRODUCTION_CANONICALIZATION_READY=true as const;
export const CANONICALIZATION_PROFILE="RFC8785-JCS" as const;
