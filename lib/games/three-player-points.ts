import type {Game,Round} from '../types';
import {gameStake,scoresFor} from '../rules';

export type ThreePlayerPointsGame=Extract<Game,'Nine Point'|'Split Sixes'>;

const schedules:Record<ThreePlayerPointsGame,[number,number,number]>={
  'Nine Point':[5,3,1],
  'Split Sixes':[4,2,0],
};

export function rankedPoints(scores:number[],game:ThreePlayerPointsGame){
  if(scores.length!==3)throw Error(`${game} needs exactly three players`);
  const schedule=schedules[game];
  const points=scores.map(()=>0);
  const groups=[...new Set(scores)].sort((a,b)=>a-b).map(score=>scores.flatMap((value,index)=>value===score?[index]:[]));
  let place=0;
  for(const group of groups){
    const available=schedule.slice(place,place+group.length);
    const share=available.reduce((sum,value)=>sum+value,0)/group.length;
    group.forEach(player=>points[player]=share);
    place+=group.length;
  }
  return points;
}

export function threePlayerPoints(round:Round,game:ThreePlayerPointsGame){
  if(round.players.length!==3)throw Error(`${game} needs exactly three players`);
  const net=game==='Nine Point'?(round.config.rules?.ninePointNet??true):(round.config.rules?.splitSixesNet??true);
  const stake=gameStake(round.config,game);
  const balances=round.players.map(()=>0);
  const totals=round.players.map(()=>0);
  const holes=round.results.map((hole,index)=>{
    const points=rankedPoints(scoresFor(round,hole,index,net),game);
    const delta=round.players.map(()=>0);
    points.forEach((value,player)=>totals[player]+=value);
    for(let first=0;first<points.length;first++)for(let second=first+1;second<points.length;second++){
      const amount=Math.round((points[first]-points[second])*stake*100)/100;
      delta[first]=Math.round((delta[first]+amount)*100)/100;
      delta[second]=Math.round((delta[second]-amount)*100)/100;
    }
    delta.forEach((value,player)=>balances[player]=Math.round((balances[player]+value)*100)/100);
    return {hole:index+1,points,balances:delta,label:round.players.map((player,playerIndex)=>`${player.name} ${points[playerIndex]}`).join(' · ')};
  });
  return {balances,totals,holes};
}
