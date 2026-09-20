export type MobilePlatform="IOS"|"ANDROID";
export type MigrationStage="M0"|"M1"|"M2"|"M3"|"M4";
export type ShellMode="CONVENTIONAL"|"SERA_ASSISTANT"|"SERA_COORDINATOR"|"SERA_FIRST"|"READ_ONLY_SERA";
export type FeatureFlag =
 "sera_primary_home"|"sera_voice"|"sera_voice_profile_learning"|"sera_send_prepare"|"sera_swap_prepare"|
 "sera_chain_recommendation"|"sera_credential_prepare"|"sera_proactive_alerts"|"sera_external_news_context"|
 "sera_linkedin_context"|"concealed_detail_default"|"delegated_payments"|"conditional_automation"|
 "autonomous_execution"|"wearable_handoff"|"wearable_approval";

export interface MobileShellInput{
 platform:MobilePlatform;
 appVersion:string;
 migrationStage:MigrationStage;
 featureFlags:Partial<Record<FeatureFlag,boolean>>;
 seraAvailable:boolean;
 walletCoreAvailable:boolean;
 controlPlaneAvailable:boolean;
 signingAvailable:boolean;
 recoveryAvailable:boolean;
 securityControlsAvailable:boolean;
 currentHome:"CONVENTIONAL"|"SERA";
}

export interface MobileShellDecision{
 platform:MobilePlatform;
 mode:ShellMode;
 defaultHome:"CONVENTIONAL"|"SERA";
 fallbackAvailable:true;
 conventionalWalletAccessible:true;
 securityControlsAccessible:boolean;
 recoveryAccessible:boolean;
 allowedSeraCapabilities:string[];
 blockedSeraCapabilities:string[];
 reasons:string[];
}

const allCapabilities=[
 "wallet.query","transaction.explain","credential.lookup","news.context","spam.explain",
 "payment.prepare","swap.prepare","route.recommend","credential.prepare","proactive.alert",
 "delegated.payment","conditional.automation","autonomous.execute"
] as const;

function flag(input:MobileShellInput,name:FeatureFlag){return input.featureFlags[name]===true;}

export function decideMobileShell(input:MobileShellInput):MobileShellDecision{
 const reasons:string[]=[];
 const allowed=new Set<string>();
 const blocked=new Set<string>();

 if(!input.walletCoreAvailable){
  return{
   platform:input.platform,mode:"CONVENTIONAL",defaultHome:"CONVENTIONAL",fallbackAvailable:true,
   conventionalWalletAccessible:true,securityControlsAccessible:input.securityControlsAvailable,
   recoveryAccessible:input.recoveryAvailable,allowedSeraCapabilities:[],
   blockedSeraCapabilities:[...allCapabilities],reasons:["WALLET_CORE_UNAVAILABLE"]
  };
 }

 if(!input.seraAvailable){
  reasons.push("SERA_UNAVAILABLE_FALLBACK");
  return{
   platform:input.platform,mode:"CONVENTIONAL",defaultHome:"CONVENTIONAL",fallbackAvailable:true,
   conventionalWalletAccessible:true,securityControlsAccessible:input.securityControlsAvailable,
   recoveryAccessible:input.recoveryAvailable,allowedSeraCapabilities:[],
   blockedSeraCapabilities:[...allCapabilities],reasons
  };
 }

 if(input.migrationStage!=="M0"){
  allowed.add("wallet.query");allowed.add("transaction.explain");allowed.add("credential.lookup");allowed.add("spam.explain");
  if(flag(input,"sera_external_news_context"))allowed.add("news.context");
 }

 if(input.migrationStage==="M2"||input.migrationStage==="M3"||input.migrationStage==="M4"){
  if(flag(input,"sera_send_prepare"))allowed.add("payment.prepare");
  if(flag(input,"sera_swap_prepare"))allowed.add("swap.prepare");
  if(flag(input,"sera_chain_recommendation"))allowed.add("route.recommend");
  if(flag(input,"sera_credential_prepare"))allowed.add("credential.prepare");
  if(flag(input,"sera_proactive_alerts"))allowed.add("proactive.alert");
 }

 if(input.migrationStage==="M4"){
  if(flag(input,"delegated_payments"))allowed.add("delegated.payment");
  if(flag(input,"conditional_automation"))allowed.add("conditional.automation");
  if(flag(input,"autonomous_execution"))allowed.add("autonomous.execute");
 }

 if(!input.controlPlaneAvailable){
  for(const c of ["payment.prepare","swap.prepare","route.recommend","credential.prepare","delegated.payment","conditional.automation","autonomous.execute"])allowed.delete(c);
  reasons.push("CONTROL_PLANE_UNAVAILABLE");
 }

 if(!input.signingAvailable){
  allowed.delete("delegated.payment");allowed.delete("autonomous.execute");
  reasons.push("SIGNING_UNAVAILABLE");
 }

 for(const c of allCapabilities)if(!allowed.has(c))blocked.add(c);

 const primaryAllowed=(input.migrationStage==="M3"||input.migrationStage==="M4")&&flag(input,"sera_primary_home");
 const coordinator=input.migrationStage==="M2";
 let mode:ShellMode=input.migrationStage==="M0"?"CONVENTIONAL":input.migrationStage==="M1"?"SERA_ASSISTANT":coordinator?"SERA_COORDINATOR":primaryAllowed?"SERA_FIRST":"SERA_COORDINATOR";
 if(!input.controlPlaneAvailable&&(input.migrationStage==="M2"||input.migrationStage==="M3"||input.migrationStage==="M4"))mode="READ_ONLY_SERA";

 const defaultHome=primaryAllowed&&input.securityControlsAvailable&&input.recoveryAvailable?"SERA":"CONVENTIONAL";
 if(primaryAllowed&&defaultHome==="CONVENTIONAL")reasons.push("SERA_PRIMARY_HOME_GATED_BY_FALLBACK_REQUIREMENTS");

 return{
  platform:input.platform,mode,defaultHome,fallbackAvailable:true,conventionalWalletAccessible:true,
  securityControlsAccessible:input.securityControlsAvailable,recoveryAccessible:input.recoveryAvailable,
  allowedSeraCapabilities:[...allowed].sort(),blockedSeraCapabilities:[...blocked].sort(),reasons:[...new Set(reasons)].sort()
 };
}

export function assertMobileShellSafety(decision:MobileShellDecision){
 if(!decision.fallbackAvailable||!decision.conventionalWalletAccessible)throw new Error("DETERMINISTIC_FALLBACK_REQUIRED");
 if(decision.defaultHome==="SERA"&&(!decision.securityControlsAccessible||!decision.recoveryAccessible))throw new Error("SERA_PRIMARY_HOME_REQUIRES_SECURITY_AND_RECOVERY_ACCESS");
 return true;
}
