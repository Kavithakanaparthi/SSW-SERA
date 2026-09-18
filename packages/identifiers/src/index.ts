export type HolderDid = `did:soul:${string}`;
export type SeraDid = `did:soul:agent:${string}`;
export type ActionId = string;
export const isSeraDid = (v: string): v is SeraDid => v.startsWith('did:soul:agent:');
