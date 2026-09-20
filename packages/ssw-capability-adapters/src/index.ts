export type CapabilityEffect="READ"|"PREPARE";
export interface CapabilityDescriptor{
 id:string;version:1;effect:CapabilityEffect;riskFloor:"R0"|"R1"|"R2"|"R3";requiresCanonicalCounterparty:boolean;description:string;
}
export const SSW_CAPABILITIES:readonly CapabilityDescriptor[]=[
 {id:"asset.get_balances",version:1,effect:"READ",riskFloor:"R1",requiresCanonicalCounterparty:false,description:"Retrieve holder asset balances with chain provenance."},
 {id:"payment.prepare",version:1,effect:"PREPARE",riskFloor:"R2",requiresCanonicalCounterparty:true,description:"Prepare a payment without signing or broadcasting."},
 {id:"payment.receive.prepare",version:1,effect:"PREPARE",riskFloor:"R1",requiresCanonicalCounterparty:false,description:"Prepare a receive request or address/QR payload."},
 {id:"swap.prepare",version:1,effect:"PREPARE",riskFloor:"R2",requiresCanonicalCounterparty:false,description:"Prepare a swap quote/route without execution."},
 {id:"walletconnect.inspect",version:1,effect:"READ",riskFloor:"R2",requiresCanonicalCounterparty:false,description:"Inspect and explain a WalletConnect request without approving it."},
 {id:"credential.list",version:1,effect:"READ",riskFloor:"R1",requiresCanonicalCounterparty:false,description:"List minimized credential metadata."},
 {id:"credential.presentation.prepare",version:1,effect:"PREPARE",riskFloor:"R2",requiresCanonicalCounterparty:true,description:"Prepare a selective credential presentation without disclosure."},
 {id:"asset.risk.get",version:1,effect:"READ",riskFloor:"R1",requiresCanonicalCounterparty:false,description:"Retrieve spam/reputation/risk signals for an asset."}
] as const;

export class CapabilityRegistry{
 private readonly byId=new Map(SSW_CAPABILITIES.map(x=>[x.id,x]));
 get(id:string){return this.byId.get(id)??null;}
 list(){return [...this.byId.values()];}
}

export interface BalanceRecord{assetId:string;chainId:string;atomic:string;decimals:number;sourceRef:string;observedAt:string;}
export interface BalanceServiceAdapter{getBalances(input:{holderDid:string;assetId?:string;chainIds?:string[]}):Promise<BalanceRecord[]>;}
export interface FeeQuote{chainId:string;assetId:string;feeAtomic:string;feeAssetId:string;estimatedSettlementSeconds:number;sourceRef:string;validUntil:string;}
export interface FeeQuoteServiceAdapter{quote(input:{chainId:string;actionType:string;assetId:string;amountAtomic:string;recipientId:string}):Promise<FeeQuote>;}
export interface PaymentPreparationAdapter{prepare(input:{holderDid:string;assetId:string;amountAtomic:string;recipientCanonicalId:string;chainId:string;routeDecisionId:string}):Promise<{preparationRef:string;materialTerms:Record<string,unknown>}>;}
export interface ReceiveRequestAdapter{prepare(input:{holderDid:string;assetId:string;chainId:string;amountAtomic?:string|null}):Promise<{receiveRef:string;addressOrUri:string}>;}
export interface SwapPreparationAdapter{prepare(input:{holderDid:string;fromAssetId:string;toAssetId:string;fromAmountAtomic:string;chainId:string}):Promise<{swapRef:string;quote:Record<string,unknown>;expiresAt:string}>;}
export interface WalletConnectInspectionAdapter{inspect(input:{holderDid:string;requestRef:string}):Promise<{requestRef:string;origin:string;methods:string[];chains:string[];riskSignals:string[]}>;}
export interface CredentialAdapter{
 list(input:{holderDid:string}):Promise<{credentialRef:string;type:string;status:string;issuerRef:string}[]>;
 preparePresentation(input:{holderDid:string;credentialRef:string;verifierCanonicalId:string;requestedClaims:string[]}):Promise<{presentationRef:string;disclosedClaims:string[]}>;
}
export interface AssetRiskAdapter{get(input:{assetId:string;chainId:string}):Promise<{status:"KNOWN_SAFE"|"LOW_RISK"|"UNKNOWN"|"SUSPICIOUS"|"HIGH_RISK"|"KNOWN_MALICIOUS";reasonCodes:string[];sourceRefs:string[];observedAt:string}>;}

export interface SswCapabilityAdapters{
 balances:BalanceServiceAdapter;
 fees:FeeQuoteServiceAdapter;
 payment:PaymentPreparationAdapter;
 receive:ReceiveRequestAdapter;
 swap:SwapPreparationAdapter;
 walletConnect:WalletConnectInspectionAdapter;
 credentials:CredentialAdapter;
 assetRisk:AssetRiskAdapter;
}
