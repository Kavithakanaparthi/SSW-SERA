import test,{before,after,beforeEach} from "node:test";import assert from "node:assert/strict";import {resolve} from "node:path";
import {PostgresPersistence,applyMigrations} from "../../packages/persistence-postgres/src/index.js";
import {SeraMemoryStore} from "../../packages/sera-memory/src/index.js";
import {VoiceCorrectionLearner} from "../../packages/sera-voice-runtime/src/index.js";
const url=process.env.DATABASE_URL;const skip=!url;let db:PostgresPersistence;let learner:VoiceCorrectionLearner;const holder="did:soul:holder-alice",sera="did:soul:agent:sera-alice";
before(async()=>{if(skip)return;db=new PostgresPersistence({connectionString:url!,applicationName:"voice-correction-test"});await applyMigrations(db.pool,resolve("db/migrations"));learner=new VoiceCorrectionLearner(new SeraMemoryStore(db));});
beforeEach(async()=>{if(skip)return;await db.pool.query("TRUNCATE ssw.event_outbox,ssw.sera_memory RESTART IDENTITY CASCADE");});after(async()=>{if(!skip)await db.close();});
test("pronunciation correction writes M2 holder correction",{skip},async()=>{const x=await learner.learn({holderDid:holder,seraAgentDid:sera,kind:"PRONUNCIATION",memoryKey:"pronunciation.mira",value:{heard:"Meera",intended:"Mira"},now:"2026-09-19T21:00:00Z"});assert.equal(x.domain,"LANGUAGE_VOICE");assert.equal(x.provenance,"HOLDER_CORRECTION");assert.equal(x.authority_effect,"NONE");});
test("entity correction writes M3 but no authority",{skip},async()=>{const x=await learner.learn({holderDid:holder,seraAgentDid:sera,kind:"ENTITY_ALIAS",memoryKey:"alias.treasury",value:{label:"Soulverse Treasury"},now:"2026-09-19T21:00:00Z"});assert.equal(x.domain,"ENTITY_ALIAS");assert.equal(x.authority_effect,"NONE");});
