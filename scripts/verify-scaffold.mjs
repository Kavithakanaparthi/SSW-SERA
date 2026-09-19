import { access } from "node:fs/promises";
const required=[
 "contracts/enums/ssw-enums.v1.json",
 "contracts/json-schema/ssw-action-contract.v1.schema.json",
 "contracts/json-schema/ssw-intent-envelope.v1.schema.json",
 "contracts/json-schema/ssw-resolved-intent.v1.schema.json",
 "contracts/openapi/ssw-internal-api.v1.yaml",
 "packages/canonicalization/src/index.ts",
 "packages/schema-validation/src/index.ts",
 "packages/action-contract-builder/src/index.ts",
 "packages/dmcl/src/index.ts",
 "services/orchestrator/src/index.ts",
 "services/signing/src/index.ts",
 "services/execution/src/index.ts",
 "services/sael/src/index.ts",
 "tests/contract/scaffold.test.mjs",
 "tests/contract/schema-validation.test.ts",
 "tests/contract/action-contract-builder.test.ts"
];
for(const path of required)await access(path);
console.log(`Scaffold OK: ${required.length} required anchors present.`);
