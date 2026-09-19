export type DmclDecision="TRUE"|"FALSE"|"INDETERMINATE";
export type DmclContext=Readonly<Record<string,unknown>>;

function readPath(ctx:DmclContext,path:string):unknown{
 const parts=path.split(".");
 let cur:unknown=ctx;
 for(const part of parts){
  if(!cur||typeof cur!=="object"||!(part in (cur as Record<string,unknown>)))return undefined;
  cur=(cur as Record<string,unknown>)[part];
 }
 return cur;
}
function operand(node:any,ctx:DmclContext):unknown{
 if(node&&typeof node==="object"&&"ref" in node)return readPath(ctx,String(node.ref));
 if(node&&typeof node==="object"&&"literal" in node)return node.literal;
 return undefined;
}
function compare(a:unknown,b:unknown,op:string,typeHint?:string):DmclDecision{
 if(a===undefined||b===undefined)return"INDETERMINATE";
 try{
  let left:any=a,right:any=b;
  if(typeHint==="integer_string"||(typeof a==="string"&&typeof b==="string"&&/^-?\d+$/.test(a)&&/^-?\d+$/.test(b))){
   left=BigInt(a as string);right=BigInt(b as string);
  } else if(typeHint==="timestamp"){
   left=Date.parse(String(a));right=Date.parse(String(b));if(Number.isNaN(left)||Number.isNaN(right))return"INDETERMINATE";
  }
  const result=op==="eq"?left===right:op==="neq"?left!==right:op==="lt"?left<right:op==="lte"?left<=right:op==="gt"?left>right:op==="gte"?left>=right:false;
  return result?"TRUE":"FALSE";
 }catch{return"INDETERMINATE";}
}
export function evaluateDmcl(expression:any,ctx:DmclContext):DmclDecision{
 if(!expression||typeof expression!=="object")return"INDETERMINATE";
 const op=expression.op;
 if(op==="and"){let ind=false;for(const x of expression.args??[]){const r=evaluateDmcl(x,ctx);if(r==="FALSE")return"FALSE";if(r==="INDETERMINATE")ind=true;}return ind?"INDETERMINATE":"TRUE";}
 if(op==="or"){let ind=false;for(const x of expression.args??[]){const r=evaluateDmcl(x,ctx);if(r==="TRUE")return"TRUE";if(r==="INDETERMINATE")ind=true;}return ind?"INDETERMINATE":"FALSE";}
 if(op==="not"){const r=evaluateDmcl(expression.arg,ctx);return r==="TRUE"?"FALSE":r==="FALSE"?"TRUE":"INDETERMINATE";}
 if(["eq","neq","lt","lte","gt","gte"].includes(op)){
  const l=operand(expression.left,ctx),r=operand(expression.right,ctx);
  const hint=expression.left?.type??expression.right?.type;
  return compare(l,r,op,hint);
 }
 if(op==="in"||op==="not_in"){
  const l=operand(expression.left,ctx);if(l===undefined)return"INDETERMINATE";
  const set=expression.right?.set;if(!Array.isArray(set))return"INDETERMINATE";
  const found=set.some((x:any)=>x===l);return(op==="in"?found:!found)?"TRUE":"FALSE";
 }
 if(op==="exists"||op==="not_exists"){
  const value=readPath(ctx,String(expression.value?.ref??""));const exists=value!==undefined;
  return(op==="exists"?exists:!exists)?"TRUE":"FALSE";
 }
 if(op==="before"||op==="after"){
  const l=operand(expression.value,ctx),r=expression.reference?operand(expression.reference,ctx):readPath(ctx,"evaluation.now");
  if(l===undefined||r===undefined)return"INDETERMINATE";
  return compare(l,r,op==="before"?"lt":"gt","timestamp");
 }
 if(["count_lte","cumulative_lte","frequency_lte"].includes(op)){
  const l=operand(expression.left,ctx),r=operand(expression.right,ctx);
  return compare(l,r,"lte","integer_string");
 }
 if(op==="time_of_day_between")return"INDETERMINATE";
 return"INDETERMINATE";
}
export interface DmclEvaluator{evaluate(expression:unknown,signals:DmclContext):DmclDecision;}
export const deterministicDmclEvaluator:DmclEvaluator={evaluate:evaluateDmcl};
