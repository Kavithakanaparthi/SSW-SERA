import {
  MATERIAL_TERMS_HASH_DOMAIN,
  sha256DomainSeparated,
  type CanonicalJson
} from "@soulverse/canonicalization";
import {
  type ActionContract,
  type ResolvedIntent
} from "@soulverse/contracts";
import { assertContract } from "@soulverse/schema-validation";

export type AmbiguityReason =
  | "AMBIGUOUS_RECIPIENT"
  | "AMBIGUOUS_AMOUNT"
  | "AMBIGUOUS_ASSET"
  | "AMBIGUOUS_CHAIN";

export interface PaymentSendMaterialTerms {
  asset: { asset_id: string; decimals: number };
  amount: { atomic: string; decimals: number };
  counterparty: { canonical_id: string; resolution_source: string };
  network: { chain_id: string };
}

export interface ActionBuildContext {
  actionId: string;
  saelCorrelationId: string;
  idempotencyKey: string;
  replayToken: string;
  createdAt: string;
  expiresAt: string;
}

export type PaymentBuildResult =
  | {
      status: "BUILT";
      actionContract: ActionContract;
      materialTermsHash: string;
      canonicalMaterialBinding: string;
    }
  | {
      status: "BLOCKED_AMBIGUITY";
      reasonCodes: readonly AmbiguityReason[];
    };

function ambiguityReasons(intent: ResolvedIntent): AmbiguityReason[] {
  const reasons = new Set<AmbiguityReason>();

  for (const raw of intent.ambiguity.items) {
    if (
      raw === "AMBIGUOUS_RECIPIENT" ||
      raw === "AMBIGUOUS_AMOUNT" ||
      raw === "AMBIGUOUS_ASSET" ||
      raw === "AMBIGUOUS_CHAIN"
    ) reasons.add(raw);
  }

  const e = intent.entities;
  const required: [string, AmbiguityReason][] = [
    ["counterparty", "AMBIGUOUS_RECIPIENT"],
    ["amount", "AMBIGUOUS_AMOUNT"],
    ["asset", "AMBIGUOUS_ASSET"],
    ["chain", "AMBIGUOUS_CHAIN"]
  ];

  for (const [name, reason] of required) {
    const entity = e[name];
    if (!entity || entity.resolution === "UNRESOLVED" || entity.resolution === "INFERRED_NON_MATERIAL") {
      reasons.add(reason);
    }
  }

  if (intent.ambiguity.material && reasons.size === 0) {
    reasons.add("AMBIGUOUS_RECIPIENT");
  }

  return [...reasons];
}

function objectValue(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must resolve to an object.`);
  }
  return value as Record<string, unknown>;
}

function buildPaymentTerms(intent: ResolvedIntent): PaymentSendMaterialTerms {
  const asset = objectValue(intent.entities.asset!.value, "asset");
  const amount = objectValue(intent.entities.amount!.value, "amount");
  const counterparty = objectValue(intent.entities.counterparty!.value, "counterparty");
  const chain = objectValue(intent.entities.chain!.value, "chain");

  const terms: PaymentSendMaterialTerms = {
    asset: {
      asset_id: String(asset.asset_id),
      decimals: Number(asset.decimals)
    },
    amount: {
      atomic: String(amount.atomic),
      decimals: Number(amount.decimals)
    },
    counterparty: {
      canonical_id: String(counterparty.canonical_id),
      resolution_source: String(counterparty.resolution_source)
    },
    network: {
      chain_id: String(chain.chain_id)
    }
  };

  return terms;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
}

export function buildPaymentSendAction(
  unknownIntent: unknown,
  context: ActionBuildContext
): PaymentBuildResult {
  const intent = assertContract("resolved-intent", unknownIntent);

  if (intent.intent_type !== "payment.send") {
    throw new TypeError(`Unsupported intent_type for payment builder: ${intent.intent_type}`);
  }

  const blocked = ambiguityReasons(intent);
  if (blocked.length) return { status: "BLOCKED_AMBIGUITY", reasonCodes: blocked };

  const terms = deepFreeze(buildPaymentTerms(intent));
  const binding = sha256DomainSeparated(MATERIAL_TERMS_HASH_DOMAIN, {
    action_type: "payment.send",
    material_terms: terms as unknown as CanonicalJson
  });

  const action: ActionContract = {
    schema: "ssw.action-contract.v1",
    action_id: context.actionId,
    intent_id: intent.intent_id,
    correlation_id: intent.correlation_id,
    action_type: "payment.send",
    version: 1,
    created_at: context.createdAt,
    expires_at: context.expiresAt,
    principal: {
      holder_did: intent.holder_did,
      sera_agent_did: intent.sera_agent_did,
      sera_runtime_id: intent.sera_runtime_id,
      device_id: intent.device_id
    },
    authority: {
      class: "A2",
      approval_required: true,
      mandate_id: null
    },
    risk: {
      class: "R3",
      reasons: []
    },
    material_terms: terms,
    policy: {
      policy_refs: [],
      device_eligible: false,
      runtime_eligible: false
    },
    trust: {
      trust_protocol_required: true,
      trust_protocol_ref: null,
      rev_required: true,
      rev_ref: null
    },
    presentation: {
      concealed: true,
      reveal_required: true,
      authenticated_reveal_required: false,
      review_hash: null
    },
    approval: {
      status: "REQUIRED",
      approval_id: null,
      approved_terms_hash: null
    },
    execution: {
      idempotency_key: context.idempotencyKey,
      replay_token: context.replayToken,
      status: "NOT_READY"
    },
    evidence: {
      sael_correlation_id: context.saelCorrelationId
    }
  };

  const validated = assertContract("action-contract", action);

  return {
    status: "BUILT",
    actionContract: deepFreeze(validated),
    materialTermsHash: binding.hash,
    canonicalMaterialBinding: binding.canonical
  };
}
