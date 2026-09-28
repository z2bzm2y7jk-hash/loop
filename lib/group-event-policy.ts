import {sharedWeeklySnapshotSchema,type SharedWeeklySnapshot} from './contracts/group-event-sync';
import type {GroupEvent} from './product-model';
import type {Round} from './types';

function sameJson(left:unknown,right:unknown){return JSON.stringify(left)===JSON.stringify(right)}
function sameMembers(left:string[],right:string[]){return left.length===right.length&&new Set(left).size===left.length&&new Set(right).size===right.length&&left.every(id=>right.includes(id))}

export function weeklyInviteAccess(owner:boolean,scope:'view'|'organize'){
 return owner?{role:'captain' as const,canEdit:true}:scope==='organize'?{role:'editor' as const,canEdit:true}:{role:'viewer' as const,canEdit:false};
}

export function validateWeeklyEventUpdate(snapshot:SharedWeeklySnapshot,eventId:string,next:GroupEvent){
 const current=snapshot.event;
 if(next.id!==eventId||current.id!==eventId)return {ok:false as const,reason:'The weekly-game identity cannot change.'};
 const immutableCurrent={date:current.date,course:current.course,attendeeIds:current.attendeeIds,houseRuleId:current.houseRuleId,createdAt:current.createdAt,status:current.status};
 const immutableNext={date:next.date,course:next.course,attendeeIds:next.attendeeIds,houseRuleId:next.houseRuleId,createdAt:next.createdAt,status:next.status};
 if(!sameJson(immutableCurrent,immutableNext))return {ok:false as const,reason:'Shared event details and status cannot be changed from the lineup editor.'};
 if(current.status!=='planned')return {ok:false as const,reason:'Playing groups lock after a scorecard starts.'};
 if(current.pods.length!==next.pods.length)return {ok:false as const,reason:'Playing groups cannot be added or removed after sharing.'};
 for(const pod of current.pods){const candidate=next.pods.find(item=>item.id===pod.id);if(!candidate||candidate.linkedRoundId!==pod.linkedRoundId||candidate.withdrawnAt!==pod.withdrawnAt)return {ok:false as const,reason:'Playing-group identities and linked rounds cannot be changed here.'}}
 const merged={...snapshot,event:next},parsed=sharedWeeklySnapshotSchema.safeParse(merged);
 if(!parsed.success)return {ok:false as const,reason:'Every attendee must appear once in a playing group of two to four.'};
 const lineupChanged=current.pods.some(pod=>!sameMembers(pod.playerIds,next.pods.find(item=>item.id===pod.id)!.playerIds));
 return {ok:true as const,snapshot:parsed.data as SharedWeeklySnapshot,action:lineupChanged?'lineup' as const:'details' as const};
}

export function validateWeeklyPodRound(snapshot:SharedWeeklySnapshot,podId:string,round:Round){
 const pod=snapshot.event.pods.find(item=>item.id===podId);
 if(!pod)return {ok:false as const,reason:'That playing group no longer exists.'};
 if(pod.linkedRoundId)return {ok:false as const,reason:'Another player already started this group.'};
 if(round.groupId!==snapshot.group.id||round.groupEventId!==snapshot.event.id||round.groupPodId!==podId)return {ok:false as const,reason:'The round is not linked to this playing group.'};
 if(round.course!==snapshot.event.course)return {ok:false as const,reason:'The round course does not match the weekly game.'};
 if(!sameMembers(round.players.map(player=>player.id),pod.playerIds))return {ok:false as const,reason:'The round players do not match this playing group.'};
 const rosterById=new Map(snapshot.roster.map(player=>[player.id,player]));
 if(round.players.some(player=>!sameJson(player,rosterById.get(player.id))))return {ok:false as const,reason:'A player name or handicap changed after the weekly game was shared.'};
 if(round.results.length||round.started||round.ended)return {ok:false as const,reason:'A playing-group scorecard must start empty.'};
 return {ok:true as const,pod};
}
