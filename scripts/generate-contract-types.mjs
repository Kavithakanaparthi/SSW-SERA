import { compileFromFile } from "json-schema-to-typescript";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const inputDir = path.resolve("contracts/json-schema");
const outputDir = path.resolve("packages/contracts/src/generated/schema-types");
await mkdir(outputDir, { recursive: true });

const files = (await readdir(inputDir))
  .filter((name) => name.endsWith(".schema.json") && name !== "ssw-common.v1.schema.json")
  .sort();

for (const file of files) {
  const input = path.join(inputDir, file);
  const output = path.join(outputDir, file.replace(/\.schema\.json$/, ".generated.ts"));
  const source = await compileFromFile(input, {
    bannerComment: [
      "/* eslint-disable */",
      "/** GENERATED FROM CONTROLLED JSON SCHEMA. DO NOT EDIT BY HAND. */"
    ].join("\n"),
    cwd: inputDir,
    style: { singleQuote: false, semi: true }
  });
  await writeFile(output, source, "utf8");
}

console.log(`Generated TypeScript for ${files.length} controlled schemas.`);
