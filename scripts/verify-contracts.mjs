import { readFile, readdir } from "node:fs/promises";

const schemas = (await readdir("contracts/json-schema")).filter(x => x.endsWith(".json"));
for (const name of schemas) JSON.parse(await readFile(`contracts/json-schema/${name}`, "utf8"));
JSON.parse(await readFile("contracts/enums/ssw-enums.v1.json", "utf8"));

const openapi = await readFile("contracts/openapi/ssw-internal-api.v1.yaml", "utf8");
if (!openapi.startsWith("openapi: 3.1.0")) throw new Error("OpenAPI baseline header is not 3.1.0");

console.log(`Contracts OK: ${schemas.length} JSON Schemas, enum registry, OpenAPI baseline readable.`);
