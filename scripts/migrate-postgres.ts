import {resolve} from "node:path";
import {PostgresPersistence,applyMigrations} from "../packages/persistence-postgres/src/index.js";

async function main(){
  const connectionString=process.env.DATABASE_URL;
  if(!connectionString)throw new Error("DATABASE_URL_REQUIRED");
  const db=new PostgresPersistence({connectionString,applicationName:"ssw-sera-migrate"});
  try{
    await applyMigrations(db.pool,resolve("db/migrations"));
    console.log("PostgreSQL migrations applied.");
  }finally{
    await db.close();
  }
}

main().catch((error)=>{
  console.error(error);
  process.exitCode=1;
});
