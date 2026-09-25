import type {Round} from './types';

export const cancellationReasons=['Weather','Darkness','Course closure','Time constraints','Other'] as const;
export type CancellationReason=(typeof cancellationReasons)[number];

export function isActiveRound(round:Round|null|undefined):round is Round{
 return !!round?.started&&!round.ended&&round.results.length<round.holes;
}

export function cancelRound(round:Round,reason:string,keepBets:boolean,endedAt=new Date().toISOString()):Round{
 return {...round,ended:{kind:'cancelled',reason:reason.trim()||'Other',keepBets:keepBets&&round.results.length>0,endedAt,holesPlayed:round.results.length}};
}

export function roundCountsInStats(round:Round){return !round.ended||round.ended.keepBets}

export function roundStatusLine(round:Round){
 if(round.ended)return `Cancelled after ${round.ended.holesPlayed} ${round.ended.holesPlayed===1?'hole':'holes'}${round.ended.keepBets?' · results kept':''}`;
 return `${round.results.length} of ${round.holes} holes`;
}
