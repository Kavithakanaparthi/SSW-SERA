export {InMemorySaelStore,SAEL_EVENT_HASH_DOMAIN} from "@soulverse/sael-runtime";
export type {SaelEvent,SaelIngestResult,SaelReservation} from "@soulverse/sael-runtime";
export const serviceName="sael" as const;
export const implementationStatus="REFERENCE_RUNTIME_IMPLEMENTED" as const;

export {PostgresSaelStore,SaelPersistenceError,merkleRoot} from "@soulverse/sael-postgres";
export type {SaelCheckpointSigner,SaelArchiveWriter,SaelCheckpointRecord,SaelStoredEvent} from "@soulverse/sael-postgres";
