import {calculate} from './games';
import type {GolfGroup,GroupEvent,GroupEventPod,ProductData} from './product-model';
import type {Player,Round} from './types';

export const WEEKLY_GROUP_MIN=4;
export const WEEKLY_GROUP_MAX=12;

export function weeklyAttendeeIds(attendance:string[],memberIds:string[]){
  return attendance.length?attendance:memberIds.slice(0,WEEKLY_GROUP_MAX);
}

export function podSizes(playerCount:number){
  if(playerCount<WEEKLY_GROUP_MIN||playerCount>WEEKLY_GROUP_MAX)return [];
  const podCount=Math.ceil(playerCount/4),small=Math.floor(playerCount/podCount),larger=playerCount%podCount;
  return Array.from({length:podCount},(_,index)=>small+(index<larger?1:0));
}

export function makePods(playerIds:string[],random:()=>number=Math.random):GroupEventPod[]{
  if(playerIds.length<WEEKLY_GROUP_MIN||playerIds.length>WEEKLY_GROUP_MAX)return [];
  const shuffled=[...playerIds];
  for(let index=shuffled.length-1;index>0;index--){const swap=Math.floor(random()*(index+1));[shuffled[index],shuffled[swap]]=[shuffled[swap],shuffled[index]]}
  let cursor=0;
  return podSizes(shuffled.length).map(size=>({id:crypto.randomUUID(),playerIds:shuffled.slice(cursor,cursor+=size)}));
}

export function groupRoster(group:GolfGroup,available:Player[]){
  const lookup=new Map([...available,...(group.players??[])].map(player=>[player.id,player]));
  return group.memberIds.map(id=>lookup.get(id)??{id,name:'Golfer',handicap:18,color:'#e2e6d5'});
}

export function linkedEventRounds(event:GroupEvent,history:Round[]){
  const ids=new Set(event.pods.flatMap(pod=>pod.linkedRoundId?[pod.linkedRoundId]:[]));
  return history.filter(round=>ids.has(round.id));
}

export function eventStandings(event:GroupEvent,history:Round[],roster:Player[]){
  const rounds=linkedEventRounds(event,history),balances=new Map<string,number>();
  rounds.forEach(round=>calculate(round).balances.forEach((amount,index)=>{const id=round.players[index]?.id;if(id)balances.set(id,(balances.get(id)??0)+amount)}));
  return roster.filter(player=>event.attendeeIds.includes(player.id)).map(player=>({player,balance:Math.round((balances.get(player.id)??0)*100)/100})).sort((a,b)=>b.balance-a.balance||a.player.name.localeCompare(b.player.name));
}

export function movePodPlayer(pods:GroupEventPod[],playerId:string,targetPodId:string){
  const target=pods.find(pod=>pod.id===targetPodId);
  if(!target||target.playerIds.length>=4)return pods;
  const current=pods.find(pod=>pod.playerIds.includes(playerId));
  if(!current||current.id===targetPodId||current.playerIds.length<=2)return pods;
  return pods.map(pod=>pod.id===current.id?{...pod,playerIds:pod.playerIds.filter(id=>id!==playerId)}:pod.id===targetPodId?{...pod,playerIds:[...pod.playerIds,playerId]}:pod);
}

export function linkGroupEventRound(data:ProductData,round:Round){
  if(!round.groupId||!round.groupEventId||!round.groupPodId)return data;
  return {...data,groups:data.groups.map(group=>{
    if(group.id!==round.groupId)return group;
    const events=(group.events??[]).map(event=>{
      if(event.id!==round.groupEventId)return event;
      const pods=event.pods.map(pod=>pod.id===round.groupPodId?{...pod,linkedRoundId:round.id}:pod);
      const complete=pods.every(pod=>pod.linkedRoundId||pod.withdrawnAt);
      return {...event,pods,status:complete?'complete':'active'} as GroupEvent;
    });
    return {...group,events};
  })};
}

export function releaseGroupEventPod(data:ProductData,round:Round){
  if(!round.groupId||!round.groupEventId||!round.groupPodId)return data;
  return {...data,groups:data.groups.map(group=>{
    if(group.id!==round.groupId)return group;
    return {...group,events:(group.events??[]).map(event=>{
      if(event.id!==round.groupEventId)return event;
      const pods=event.pods.map(pod=>pod.id===round.groupPodId?{...pod,linkedRoundId:undefined}:pod),hasSaved=pods.some(pod=>pod.linkedRoundId);
      return {...event,pods,status:hasSaved?'active':'planned'} as GroupEvent;
    })};
  })};
}
