import { createHash } from "node:crypto";

export type CanonicalJson =
  | null
  | boolean
  | string
  | number
  | CanonicalJson[]
  | { [key: string]: CanonicalJson };

function assertSupportedNumber(value: number): void {
  if (!Number.isFinite(value)) throw new TypeError("Non-finite numbers are not canonicalizable.");
}

export function canonicalizeDeterministicV1(value: CanonicalJson): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    assertSupportedNumber(value);
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalizeDeterministicV1).join(",")}]`;
  }

  const keys = Object.keys(value).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${canonicalizeDeterministicV1(value[key]!)}`)
    .join(",")}}`;
}

export function sha256DomainSeparated(domain: string, value: CanonicalJson): {
  canonical: string;
  hash: string;
} {
  const canonical = canonicalizeDeterministicV1(value);
  const digest = createHash("sha256")
    .update(domain, "utf8")
    .update("\n", "utf8")
    .update(canonical, "utf8")
    .digest("hex");

  return { canonical, hash: `sha256:${digest}` };
}

export const MATERIAL_TERMS_HASH_DOMAIN = "SSW:MATERIAL_TERMS:V1" as const;
export const PRODUCTION_CANONICALIZATION_READY = false as const;
