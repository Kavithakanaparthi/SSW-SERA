# @soulverse/schema-validation

Runtime boundary for validating controlled SSW/SERA machine contracts.

## Rules

- JSON Schema validation runs before semantic validation.
- Validation never coerces input.
- Validation never inserts defaults.
- Validation never removes unknown properties.
- Invalid payloads fail closed.
- Holder DID and SERA Agent DID namespace separation is enforced semantically.
- Successful validation returns a typed contract value.

## Example

```ts
const result = validateContract("action-contract", incoming);
if (!result.ok) return reject(result.errors);
useAction(result.value);
```

Do not use TypeScript casts as a substitute for this boundary.
