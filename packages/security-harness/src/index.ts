export interface SecurityCase{
 id:string;boundary:string;attack:string;expected:string;productionGate:boolean;
}
export const securityConformanceManifest:readonly SecurityCase[]=[
 {id:"SEC-001",boundary:"Signing",attack:"Replay token reuse",expected:"REPLAY_DETECTED",productionGate:true},
 {id:"SEC-002",boundary:"Signing",attack:"Idempotency key reused with different request",expected:"IDEMPOTENCY_CONFLICT",productionGate:true},
 {id:"SEC-003",boundary:"Signing",attack:"Action hash mutation",expected:"ACTION_HASH_MISMATCH",productionGate:true},
 {id:"SEC-004",boundary:"Approval",attack:"Material terms changed after approval",expected:"MATERIAL_TERMS_HASH_MISMATCH",productionGate:true},
 {id:"SEC-005",boundary:"Approval",attack:"Approval from another action substituted",expected:"APPROVAL_INVALID",productionGate:true},
 {id:"SEC-006",boundary:"Mandate",attack:"Action outside mandate scope",expected:"OUT_OF_SCOPE",productionGate:true},
 {id:"SEC-007",boundary:"DMCL",attack:"Required signal unavailable",expected:"INDETERMINATE",productionGate:true},
 {id:"SEC-008",boundary:"Trust",attack:"Expired Trust PASS",expected:"TRUST_PROTOCOL_EXPIRED",productionGate:true},
 {id:"SEC-009",boundary:"REV",attack:"Expired REV PASS",expected:"REV_EXPIRED",productionGate:true},
 {id:"SEC-010",boundary:"Runtime",attack:"Wrong Holder DID / SERA DID context",expected:"INELIGIBLE",productionGate:true},
 {id:"SEC-011",boundary:"Counterparty",attack:"Alias resolves to multiple identities",expected:"COUNTERPARTY_AMBIGUOUS",productionGate:true},
 {id:"SEC-012",boundary:"Recovery",attack:"Older state manifest restored",expected:"STATE_ROLLBACK_DETECTED",productionGate:true},
 {id:"SEC-013",boundary:"Signing",attack:"Model service calls signer",expected:"CALLER_NOT_AUTHORIZED",productionGate:true},
 {id:"SEC-014",boundary:"Execution",attack:"Payload amount changes after signing authorization",expected:"PAYLOAD_HASH_MISMATCH",productionGate:true},
 {id:"SEC-015",boundary:"SAEL",attack:"Producer emits another namespace",expected:"SAEL_PRODUCER_NOT_AUTHORIZED",productionGate:true},
 {id:"SEC-016",boundary:"SAEL",attack:"Previous hash altered",expected:"SAEL_PREVIOUS_HASH_MISMATCH",productionGate:true},
 {id:"SEC-017",boundary:"SAEL",attack:"Query requests disclosure above ceiling",expected:"SAEL_DISCLOSURE_NOT_AUTHORIZED",productionGate:true},
 {id:"SEC-018",boundary:"Offline",attack:"OAP replay",expected:"OFFLINE_REPLAY_BLOCK",productionGate:true}
] as const;

export function mutate<T>(value:T,fn:(copy:T)=>void):T{const copy=structuredClone(value);fn(copy);return copy;}
export function manifestCoverage(ids:readonly string[]){const required=securityConformanceManifest.filter(x=>x.productionGate).map(x=>x.id);return{required,missing:required.filter(x=>!ids.includes(x)),complete:required.every(x=>ids.includes(x))};}
