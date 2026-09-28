import 'server-only';
import {randomBytes,randomUUID} from 'node:crypto';
import {and,desc,eq,gt,inArray,isNull} from 'drizzle-orm';
import type {Account} from '@/lib/account';
import type {CourseSnapshot} from '@/lib/contracts/round-sync';
import type {SharedWeeklyEventResponse,SharedWeeklySnapshot,WeeklyEventActivity,WeeklyPodState} from '@/lib/contracts/group-event-sync';
import {defaultCourseTee} from '@/lib/course';
import {validateWeeklyEventUpdate,validateWeeklyPodRound,weeklyInviteAccess} from '@/lib/group-event-policy';
import type {Config,Round} from '@/lib/types';
import {database,hashGroupEventInviteToken,hashRoundInviteToken} from './auth';
import {groupEventInvites,groupEventRevisions,groupEvents,groupMembers,groups,holeResults,roundGames,roundInvites,roundPlayers,rounds,userProfiles,users} from './db/schema';

type EventAction='created'|'lineup'|'status'|'round-linked'|'details';
type StoredConfig=Config&{__loop?:{presses:Round['presses'];paid:string[];date:string;started:boolean;groupId?:string;groupEventId?:string;groupPodId?:string}};

function storedConfig(round:Round):StoredConfig{return {...round.config,__loop:{presses:round.presses,paid:round.paid,date:round.date,started:!!round.started,groupId:round.groupId,groupEventId:round.groupEventId,groupPodId:round.groupPodId}}}
function courseSnapshot(round:Round):CourseSnapshot{const tee=round.tee??defaultCourseTee();return {courseName:round.course,location:tee.location,teeName:tee.name,courseRating:tee.courseRating,slopeRating:tee.slopeRating,yardage:tee.yardage,gender:tee.gender,pars:tee.pars,strokeIndexes:tee.strokeIndexes,provider:tee.source,providerCourseId:tee.providerCourseId,attribution:tee.attribution,ended:round.ended}}
function affectedRows(result:unknown){return (((result as unknown[])[0] as {affectedRows?:number})?.affectedRows??0)}

export async function authorizeSharedWeeklyEvent(eventId:string,accountId:string,token?:string|null){
 const db=database(),rows=await db.select().from(groupEvents).where(and(eq(groupEvents.id,eventId),isNull(groupEvents.deletedAt))).limit(1),event=rows[0];
 if(!event)return null;
 if(event.createdByUserId===accountId){let scope:'view'|'organize'='organize';if(token){const invites=await db.select({scope:groupEventInvites.scope}).from(groupEventInvites).where(and(eq(groupEventInvites.eventId,eventId),eq(groupEventInvites.tokenHash,hashGroupEventInviteToken(token)),gt(groupEventInvites.expiresAt,new Date()),isNull(groupEventInvites.revokedAt))).limit(1);scope=invites[0]?.scope??scope}return {event,scope,...weeklyInviteAccess(true,scope)}}
 if(!token)return null;
 const invites=await db.select({scope:groupEventInvites.scope}).from(groupEventInvites).where(and(eq(groupEventInvites.eventId,eventId),eq(groupEventInvites.tokenHash,hashGroupEventInviteToken(token)),gt(groupEventInvites.expiresAt,new Date()),isNull(groupEventInvites.revokedAt))).limit(1),invite=invites[0];
 if(!invite)return null;
 await db.insert(groupMembers).values({groupId:event.localGroupId,userId:accountId,role:'member'}).onDuplicateKeyUpdate({set:{userId:accountId}});
 return {event,scope:invite.scope,...weeklyInviteAccess(false,invite.scope)};
}

async function podStates(snapshot:SharedWeeklySnapshot):Promise<WeeklyPodState[]>{
 const linked=snapshot.event.pods.flatMap(pod=>pod.linkedRoundId?[pod.linkedRoundId]:[]);
 if(!linked.length)return snapshot.event.pods.map(pod=>({podId:pod.id,status:'waiting',holesPlayed:0,revision:0}));
 const db=database();
 const [roundRows,holeRows]=await Promise.all([
  db.select({id:rounds.id,status:rounds.status,revision:rounds.revision}).from(rounds).where(inArray(rounds.id,linked)),
  db.select({roundId:holeResults.roundId,holeNumber:holeResults.holeNumber}).from(holeResults).where(inArray(holeResults.roundId,linked)),
 ]),roundMap=new Map(roundRows.map(row=>[row.id,row])),holes=new Map<string,number>();
 holeRows.forEach(row=>holes.set(row.roundId,(holes.get(row.roundId)??0)+1));
 return snapshot.event.pods.map(pod=>{const row=pod.linkedRoundId?roundMap.get(pod.linkedRoundId):undefined;return {podId:pod.id,roundId:pod.linkedRoundId,status:row?.status??(pod.withdrawnAt?'archived':'waiting'),holesPlayed:pod.linkedRoundId?(holes.get(pod.linkedRoundId)??0):0,revision:row?.revision??0}});
}

export async function readSharedWeeklyEvent(eventId:string,accountId:string,token?:string|null):Promise<SharedWeeklyEventResponse|null>{
 const access=await authorizeSharedWeeklyEvent(eventId,accountId,token);if(!access)return null;
 const db=database(),[activityRows,states,claims]=await Promise.all([
  db.select({revision:groupEventRevisions.revision,action:groupEventRevisions.action,editorName:users.displayName,preferences:userProfiles.preferences,savedAt:groupEventRevisions.savedAt}).from(groupEventRevisions).leftJoin(users,eq(groupEventRevisions.savedByUserId,users.id)).leftJoin(userProfiles,eq(groupEventRevisions.savedByUserId,userProfiles.userId)).where(eq(groupEventRevisions.eventId,eventId)).orderBy(desc(groupEventRevisions.revision)).limit(12),
  podStates(access.event.snapshot),
  db.select({userId:groupMembers.userId,playerId:groupMembers.playerId}).from(groupMembers).where(eq(groupMembers.groupId,access.event.localGroupId)),
 ]);
 const finished=states.length>0&&states.every(state=>state.status==='completed'||state.status==='archived'),started=states.some(state=>state.status!=='waiting');
 const status=finished?'complete':started?'active':access.event.snapshot.event.status;
 const snapshot={...access.event.snapshot,event:{...access.event.snapshot.event,status}} as SharedWeeklySnapshot;
 const activity:WeeklyEventActivity[]=activityRows.map(row=>({revision:row.revision,action:row.action,editorName:row.editorName??'A player',editorColor:row.preferences?.color??'#d9e4d2',savedAt:row.savedAt.toISOString()}));
 return {snapshot,revision:access.event.revision,role:access.role,scope:access.scope,canEdit:access.canEdit,claimedPlayerId:claims.find(item=>item.userId===accountId)?.playerId??undefined,claimedPlayerIds:claims.flatMap(item=>item.playerId?[item.playerId]:[]),activity,podStates:states};
}

async function writeWeeklySnapshot(account:Account,eventId:string,expectedRevision:number,snapshot:SharedWeeklySnapshot,action:Exclude<EventAction,'created'>){
 const revision=expectedRevision+1,savedAt=new Date(),db=database();
 try{
  await db.transaction(async tx=>{
   const updated=await tx.update(groupEvents).set({snapshot,status:snapshot.event.status,revision}).where(and(eq(groupEvents.id,eventId),eq(groupEvents.revision,expectedRevision)));
   if(affectedRows(updated)!==1)throw new Error('EVENT_CONFLICT');
   await tx.insert(groupEventRevisions).values({eventId,revision,action,snapshot,savedByUserId:account.id,savedAt});
  });
 }catch(error){if(error instanceof Error&&error.message==='EVENT_CONFLICT')return {kind:'conflict' as const};throw error}
 return {kind:'ok' as const};
}

export async function createSharedWeeklyEvent(account:Account,snapshot:SharedWeeklySnapshot,scope:'view'|'organize'){
 const db=database(),[existing,existingGroups,ownerMembership]=await Promise.all([
  db.select().from(groupEvents).where(eq(groupEvents.id,snapshot.event.id)).limit(1),
  db.select({owner:groups.ownerUserId}).from(groups).where(eq(groups.id,snapshot.group.id)).limit(1),
  db.select({userId:groupMembers.userId}).from(groupMembers).where(and(eq(groupMembers.groupId,snapshot.group.id),eq(groupMembers.userId,account.id))).limit(1),
 ]);
 if(existing[0]&&existing[0].createdByUserId!==account.id)throw new Error('EVENT_ID_IN_USE');
 if(existingGroups[0]&&existingGroups[0].owner!==account.id)throw new Error('GROUP_ID_IN_USE');
 if(!existing[0]){
  const savedAt=new Date();
  await db.transaction(async tx=>{
   if(!existingGroups[0])await tx.insert(groups).values({id:snapshot.group.id,ownerUserId:account.id,name:snapshot.group.name});
   if(!ownerMembership[0])await tx.insert(groupMembers).values({groupId:snapshot.group.id,userId:account.id,role:'owner'});
   await tx.insert(groupEvents).values({id:snapshot.event.id,localGroupId:snapshot.group.id,createdByUserId:account.id,snapshot,status:snapshot.event.status,revision:1});
   await tx.insert(groupEventRevisions).values({eventId:snapshot.event.id,revision:1,action:'created',snapshot,savedByUserId:account.id,savedAt});
  });
 }else if(JSON.stringify(existing[0].snapshot)!==JSON.stringify(snapshot)){
  const sameContext=JSON.stringify({...existing[0].snapshot,event:undefined})===JSON.stringify({...snapshot,event:undefined});
  const policy=sameContext?validateWeeklyEventUpdate(existing[0].snapshot,snapshot.event.id,snapshot.event):{ok:false as const,reason:'The shared group details changed.'};
  if(!policy.ok)throw new Error('EVENT_CONFLICT');
  const written=await writeWeeklySnapshot(account,snapshot.event.id,existing[0].revision,policy.snapshot,policy.action);
  if(written.kind!=='ok')throw new Error('EVENT_CONFLICT');
 }
 const ownerPlayer=snapshot.roster.find(player=>player.id===account.id);
 if(ownerPlayer)await db.update(groupMembers).set({playerId:ownerPlayer.id}).where(and(eq(groupMembers.groupId,snapshot.group.id),eq(groupMembers.userId,account.id)));
 const token=randomBytes(24).toString('base64url'),expiresAt=new Date(Date.now()+30*24*60*60*1000);
 await db.insert(groupEventInvites).values({id:randomUUID(),eventId:snapshot.event.id,tokenHash:hashGroupEventInviteToken(token),scope,expiresAt,createdByUserId:account.id});
 const shared=await readSharedWeeklyEvent(snapshot.event.id,account.id,token);if(!shared)throw new Error('EVENT_NOT_FOUND');
 return {shared,token};
}

export async function claimSharedWeeklyPlayer(account:Account,token:string|null,eventId:string,playerId:string){
 const access=await authorizeSharedWeeklyEvent(eventId,account.id,token);if(!access)return {kind:'forbidden' as const};
 const player=access.event.snapshot.roster.find(item=>item.id===playerId);if(!player)return {kind:'missing' as const};
 const db=database(),claimed=await db.select({userId:groupMembers.userId}).from(groupMembers).where(and(eq(groupMembers.groupId,access.event.localGroupId),eq(groupMembers.playerId,playerId))).limit(1);
 if(claimed[0]&&claimed[0].userId!==account.id)return {kind:'taken' as const};
 try{await db.update(groupMembers).set({playerId}).where(and(eq(groupMembers.groupId,access.event.localGroupId),eq(groupMembers.userId,account.id)))}catch(error){if((error as {code?:string}).code==='ER_DUP_ENTRY')return {kind:'taken' as const};throw error}
 return {kind:'ok' as const,current:await readSharedWeeklyEvent(eventId,account.id,token)};
}

export async function revokeSharedWeeklyInvite(account:Account,token:string|null,eventId:string){
 if(!token)return {kind:'forbidden' as const};
 const db=database(),events=await db.select({owner:groupEvents.createdByUserId}).from(groupEvents).where(and(eq(groupEvents.id,eventId),isNull(groupEvents.deletedAt))).limit(1);
 if(events[0]?.owner!==account.id)return {kind:'forbidden' as const};
 const revokedAt=new Date(),updated=await db.update(groupEventInvites).set({revokedAt}).where(and(eq(groupEventInvites.eventId,eventId),eq(groupEventInvites.tokenHash,hashGroupEventInviteToken(token)),gt(groupEventInvites.expiresAt,revokedAt),isNull(groupEventInvites.revokedAt)));
 return affectedRows(updated)===1?{kind:'ok' as const}:{kind:'missing' as const};
}

export async function updateSharedWeeklyEvent(account:Account,token:string|null,eventId:string,expectedRevision:number,event:SharedWeeklySnapshot['event']){
 const access=await authorizeSharedWeeklyEvent(eventId,account.id,token);if(!access||!access.canEdit)return {kind:'forbidden' as const};
 if(access.event.revision!==expectedRevision)return {kind:'conflict' as const,current:await readSharedWeeklyEvent(eventId,account.id,token)};
 const policy=validateWeeklyEventUpdate(access.event.snapshot,eventId,event);
 if(!policy.ok)return {kind:'invalid' as const,reason:policy.reason};
 const written=await writeWeeklySnapshot(account,eventId,expectedRevision,policy.snapshot,policy.action);
 if(written.kind!=='ok')return {kind:'conflict' as const,current:await readSharedWeeklyEvent(eventId,account.id,token)};
 return {kind:'ok' as const,current:await readSharedWeeklyEvent(eventId,account.id,token)};
}

export async function startSharedWeeklyPod(account:Account,token:string|null,eventId:string,podId:string,round:Round,scope:'view'|'score'){
 const access=await authorizeSharedWeeklyEvent(eventId,account.id,token);if(!access||!access.canEdit)return {kind:'forbidden' as const};
 const pod=access.event.snapshot.event.pods.find(item=>item.id===podId);if(!pod)return {kind:'missing' as const};
 if(pod.linkedRoundId)return {kind:'taken' as const,current:await readSharedWeeklyEvent(eventId,account.id,token)};
 const policy=validateWeeklyPodRound(access.event.snapshot,podId,round);if(!policy.ok)return {kind:'invalid' as const,reason:policy.reason};
 const db=database(),existingRound=await db.select({id:rounds.id}).from(rounds).where(eq(rounds.id,round.id)).limit(1);
 if(existingRound[0])return {kind:'taken' as const,current:await readSharedWeeklyEvent(eventId,account.id,token)};
 const tokenValue=randomBytes(24).toString('base64url'),expiresAt=new Date(Date.now()+30*24*60*60*1000),revision=access.event.revision+1,savedAt=new Date();
 const nextEvent={...access.event.snapshot.event,status:'active' as const,pods:access.event.snapshot.event.pods.map(item=>item.id===podId?{...item,linkedRoundId:round.id}:item)};
 const snapshot={...access.event.snapshot,event:nextEvent},teeSnapshot=courseSnapshot(round),config=storedConfig(round);
 try{
  await db.transaction(async tx=>{
   const updated=await tx.update(groupEvents).set({snapshot,status:'active',revision}).where(and(eq(groupEvents.id,eventId),eq(groupEvents.revision,access.event.revision)));
   if(affectedRows(updated)!==1)throw new Error('EVENT_CONFLICT');
   const claims=await tx.select({userId:groupMembers.userId,playerId:groupMembers.playerId}).from(groupMembers).where(eq(groupMembers.groupId,access.event.localGroupId)),claimedUsers=new Map(claims.flatMap(item=>item.playerId?[[item.playerId,item.userId] as const]:[]));
   await tx.insert(rounds).values({id:round.id,groupId:access.event.localGroupId,createdByUserId:account.id,status:'draft',playedOn:new Date(round.date),holes:round.holes,courseSnapshot:teeSnapshot,revision:0,startedAt:null});
   await tx.insert(roundPlayers).values(round.players.map((player,seatIndex)=>({roundId:round.id,seatIndex,linkedUserId:claimedUsers.get(player.id)??null,displayName:player.name,handicap:String(player.handicap),color:player.color})));
   await tx.insert(roundGames).values(round.games.map((game,position)=>({id:randomUUID(),roundId:round.id,position,gameKey:game,rulesVersion:1,config:config as unknown as Record<string,unknown>})));
   await tx.insert(roundInvites).values({id:randomUUID(),roundId:round.id,tokenHash:hashRoundInviteToken(tokenValue),scope,expiresAt,createdByUserId:account.id});
   await tx.insert(groupEventRevisions).values({eventId,revision,action:'round-linked',snapshot,savedByUserId:account.id,savedAt});
  });
 }catch(error){
  if(error instanceof Error&&error.message==='EVENT_CONFLICT')return {kind:'conflict' as const,current:await readSharedWeeklyEvent(eventId,account.id,token)};
  if((error as {code?:string}).code==='ER_DUP_ENTRY')return {kind:'taken' as const,current:await readSharedWeeklyEvent(eventId,account.id,token)};
  throw error;
 }
 return {kind:'ok' as const,sharedRound:{roundId:round.id,token:tokenValue,scope,revision:0},current:await readSharedWeeklyEvent(eventId,account.id,token)};
}
