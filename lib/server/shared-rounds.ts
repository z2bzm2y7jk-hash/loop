import 'server-only';
import {randomBytes,randomUUID} from 'node:crypto';
import {and,asc,desc,eq,gt,isNull} from 'drizzle-orm';
import type {Account} from '@/lib/account';
import type {CourseSnapshot,HolePayload,RoundActivity,SharedRoundResponse} from '@/lib/contracts/round-sync';
import {defaultCourseTee} from '@/lib/course';
import type {Config,Hole,Round} from '@/lib/types';
import {database,hashRoundInviteToken} from './auth';
import {holeResults,holeRevisions,roundGames,roundInvites,roundPlayers,rounds,userProfiles,users} from './db/schema';

type InviteScope='view'|'score'|'captain';
type StoredConfig=Config&{__loop?:{presses:Round['presses'];paid:string[];date:string;started:boolean}};

function courseSnapshot(round:Round):CourseSnapshot{
 const tee=round.tee??defaultCourseTee();
 return {courseName:round.course,location:tee.location,teeName:tee.name,courseRating:tee.courseRating,slopeRating:tee.slopeRating,yardage:tee.yardage,gender:tee.gender,pars:tee.pars,strokeIndexes:tee.strokeIndexes,provider:tee.source,providerCourseId:tee.providerCourseId,attribution:tee.attribution,ended:round.ended};
}

function holePayload(hole:Hole):HolePayload{
 return {scores:hole.scores.map((strokes,seatIndex)=>({seatIndex,strokes})),decisions:{hole}};
}

function holeFromPayload(payload:HolePayload):Hole{
 const stored=(payload.decisions as {hole?:Hole}).hole;
 if(stored)return stored;
 return {scores:[...payload.scores].sort((a,b)=>a.seatIndex-b.seatIndex).map(item=>item.strokes),greenie:null,sandies:[],dots:[],snake:null};
}

export async function createSharedRound(account:Account,round:Round,scope:'view'|'score'){
 const db=database();
 const existing=await db.select({owner:rounds.createdByUserId}).from(rounds).where(eq(rounds.id,round.id)).limit(1);
 if(existing[0]&&existing[0].owner!==account.id)throw new Error('ROUND_ID_IN_USE');
 if(!existing[0]){
  const snapshot=courseSnapshot(round),storedConfig:StoredConfig={...round.config,__loop:{presses:round.presses,paid:round.paid,date:round.date,started:!!round.started}};
  await db.transaction(async tx=>{
   await tx.insert(rounds).values({id:round.id,createdByUserId:account.id,status:round.ended?'archived':round.started?'active':'draft',playedOn:new Date(round.date),holes:round.holes,courseSnapshot:snapshot,revision:round.results.length,startedAt:round.started?new Date(round.date):null});
   await tx.insert(roundPlayers).values(round.players.map((player,seatIndex)=>({roundId:round.id,seatIndex,linkedUserId:player.id===account.id?account.id:null,displayName:player.name,handicap:String(player.handicap),color:player.color})));
   await tx.insert(roundGames).values(round.games.map((game,position)=>({id:randomUUID(),roundId:round.id,position,gameKey:game,rulesVersion:1,config:storedConfig as unknown as Record<string,unknown>})));
   for(let index=0;index<round.results.length;index++){
    const revision=index+1,payload=holePayload(round.results[index]),savedAt=new Date();
    await tx.insert(holeResults).values({roundId:round.id,holeNumber:index+1,revision,payload,savedByUserId:account.id,savedAt});
    await tx.insert(holeRevisions).values({roundId:round.id,holeNumber:index+1,revision,commandId:randomUUID(),payload,savedByUserId:account.id,savedAt});
   }
  });
 }
 const token=randomBytes(24).toString('base64url'),expiresAt=new Date(Date.now()+30*24*60*60*1000);
 await db.insert(roundInvites).values({id:randomUUID(),roundId:round.id,tokenHash:hashRoundInviteToken(token),scope,expiresAt,createdByUserId:account.id});
 return {roundId:round.id,token,scope,revision:round.results.length};
}

export async function authorizeSharedRound(roundId:string,accountId:string,token?:string|null){
 const db=database();
 const row=await db.select().from(rounds).where(eq(rounds.id,roundId)).limit(1);
 if(!row[0])return null;
 if(row[0].createdByUserId===accountId){
  let inviteScope:InviteScope='view';
  if(token){const invite=await db.select({scope:roundInvites.scope}).from(roundInvites).where(and(eq(roundInvites.roundId,roundId),eq(roundInvites.tokenHash,hashRoundInviteToken(token)),gt(roundInvites.expiresAt,new Date()),isNull(roundInvites.revokedAt))).limit(1);inviteScope=invite[0]?.scope??'view'}
  return {round:row[0],scope:inviteScope,role:'captain' as const,canEdit:true};
 }
 if(!token)return null;
 const invite=await db.select({scope:roundInvites.scope}).from(roundInvites).where(and(eq(roundInvites.roundId,roundId),eq(roundInvites.tokenHash,hashRoundInviteToken(token)),gt(roundInvites.expiresAt,new Date()),isNull(roundInvites.revokedAt))).limit(1);
 if(!invite[0])return null;
 return {round:row[0],scope:invite[0].scope,role:invite[0].scope==='view'?'viewer' as const:'editor' as const,canEdit:invite[0].scope!=='view'};
}

export async function readSharedRound(roundId:string,accountId:string,token?:string|null):Promise<SharedRoundResponse|null>{
 const access=await authorizeSharedRound(roundId,accountId,token);
 if(!access)return null;
 const db=database();
 const [playerRows,gameRows,resultRows,activityRows]=await Promise.all([
  db.select().from(roundPlayers).where(eq(roundPlayers.roundId,roundId)).orderBy(asc(roundPlayers.seatIndex)),
  db.select().from(roundGames).where(eq(roundGames.roundId,roundId)).orderBy(asc(roundGames.position)),
  db.select().from(holeResults).where(eq(holeResults.roundId,roundId)).orderBy(asc(holeResults.holeNumber)),
  db.select({revision:holeRevisions.revision,holeNumber:holeRevisions.holeNumber,editorName:users.displayName,preferences:userProfiles.preferences,savedAt:holeRevisions.savedAt}).from(holeRevisions).leftJoin(users,eq(holeRevisions.savedByUserId,users.id)).leftJoin(userProfiles,eq(holeRevisions.savedByUserId,userProfiles.userId)).where(eq(holeRevisions.roundId,roundId)).orderBy(desc(holeRevisions.revision)).limit(12),
 ]);
 const snapshot=access.round.courseSnapshot,stored=(gameRows[0]?.config??{}) as StoredConfig,loop=stored.__loop;
 const {__loop:ignored,...config}=stored;void ignored;
 const source=snapshot.provider==='opengolf'?'opengolf':snapshot.provider==='manual'?'manual':'demo';
 const round:Round={id:access.round.id,course:snapshot.courseName,holes:access.round.holes,players:playerRows.map(row=>({id:row.playerId??row.linkedUserId??`${roundId}-${row.seatIndex}`,name:row.displayName,handicap:Number(row.handicap),color:row.color})),games:gameRows.map(row=>row.gameKey as Round['games'][number]),config:config as Config,results:resultRows.map(row=>holeFromPayload(row.payload)),presses:loop?.presses??[],paid:loop?.paid??[],date:loop?.date??access.round.playedOn.toISOString(),started:loop?.started??access.round.status!=='draft',ended:snapshot.ended,tee:{name:snapshot.teeName,location:snapshot.location,courseRating:snapshot.courseRating,slopeRating:snapshot.slopeRating,pars:snapshot.pars,strokeIndexes:snapshot.strokeIndexes,source,providerCourseId:snapshot.providerCourseId,gender:snapshot.gender,yardage:snapshot.yardage,attribution:snapshot.attribution}};
 const activity:RoundActivity[]=activityRows.map(row=>({revision:row.revision,holeNumber:row.holeNumber,editorName:row.editorName??'A player',editorColor:row.preferences?.color??'#d9e4d2',savedAt:row.savedAt.toISOString()}));
 return {round,revision:access.round.revision,status:access.round.status,role:access.role,scope:access.scope==='view'?'view':'score',canEdit:access.canEdit,activity};
}

export async function saveSharedHole(account:Account,token:string|null,roundId:string,holeNumber:number,expectedRevision:number,commandId:string,round:Round){
 const access=await authorizeSharedRound(roundId,account.id,token);
 if(!access||!access.canEdit)return {kind:'forbidden' as const};
 if(access.round.status!=='active')return {kind:'closed' as const};
 const db=database();
 const duplicate=await db.select({revision:holeRevisions.revision}).from(holeRevisions).where(eq(holeRevisions.commandId,commandId)).limit(1);
 if(duplicate[0])return {kind:'ok' as const,revision:duplicate[0].revision};
 if(access.round.revision!==expectedRevision)return {kind:'conflict' as const,current:await readSharedRound(roundId,account.id,token)};
 const revision=expectedRevision+1,hole=round.results[holeNumber-1],payload=holePayload(hole),savedAt=new Date(),storedConfig:StoredConfig={...round.config,__loop:{presses:round.presses,paid:round.paid,date:round.date,started:!!round.started}};
 try{
  await db.transaction(async tx=>{
   const updated=await tx.update(rounds).set({revision,status:round.results.length===round.holes?'completed':'active',completedAt:round.results.length===round.holes?savedAt:null,courseSnapshot:courseSnapshot(round)}).where(and(eq(rounds.id,roundId),eq(rounds.revision,expectedRevision)));
   if(((updated[0] as {affectedRows?:number}).affectedRows??0)!==1)throw new Error('ROUND_CONFLICT');
   await tx.delete(roundGames).where(eq(roundGames.roundId,roundId));
   await tx.insert(roundGames).values(round.games.map((game,position)=>({id:randomUUID(),roundId,position,gameKey:game,rulesVersion:1,config:storedConfig as unknown as Record<string,unknown>})));
   await tx.insert(holeResults).values({roundId,holeNumber,revision,payload,savedByUserId:account.id,savedAt}).onDuplicateKeyUpdate({set:{revision,payload,savedByUserId:account.id,savedAt}});
   await tx.insert(holeRevisions).values({roundId,holeNumber,revision,commandId,payload,savedByUserId:account.id,savedAt});
  });
 }catch(error){if(error instanceof Error&&error.message==='ROUND_CONFLICT')return {kind:'conflict' as const,current:await readSharedRound(roundId,account.id,token)};throw error}
 return {kind:'ok' as const,revision};
}

export async function cancelSharedRound(account:Account,token:string|null,roundId:string,expectedRevision:number,reason:string,keepBets:boolean){
 const access=await authorizeSharedRound(roundId,account.id,token);
 if(!access||access.role!=='captain')return {kind:'forbidden' as const};
 if(access.round.revision!==expectedRevision)return {kind:'conflict' as const,current:await readSharedRound(roundId,account.id,token)};
 const current=await readSharedRound(roundId,account.id,token);if(!current)return {kind:'forbidden' as const};
 const ended={kind:'cancelled' as const,reason,keepBets:keepBets&&current.round.results.length>0,endedAt:new Date().toISOString(),holesPlayed:current.round.results.length};
 await database().update(rounds).set({status:'archived',revision:expectedRevision+1,courseSnapshot:{...access.round.courseSnapshot,ended}}).where(and(eq(rounds.id,roundId),eq(rounds.revision,expectedRevision)));
 return {kind:'ok' as const,revision:expectedRevision+1,ended};
}
