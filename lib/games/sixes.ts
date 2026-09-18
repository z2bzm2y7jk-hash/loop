import {Round} from '../types';
import {gameStake,splitTransfer} from '../rules';

const rotations:[[number,number],[number,number]][]=[[[0,1],[2,3]],[[0,2],[1,3]],[[0,3],[1,2]]];

export function sixes(r:Round){
  if(r.players.length!==4||r.holes!==18)throw Error('Sixes needs four players and 18 holes');
  const balances=r.players.map(()=>0);
  const holes=r.results.map((hole,index)=>{
    const [a,b]=rotations[Math.floor(index/6)];
    const bestA=Math.min(...a.map(player=>hole.scores[player]));
    const bestB=Math.min(...b.map(player=>hole.scores[player]));
    const sign=Math.sign(bestB-bestA);
    const delta=r.players.map(()=>0);
    splitTransfer(delta,a,b,sign*gameStake(r.config,'Sixes'));
    delta.forEach((value,player)=>balances[player]=Math.round((balances[player]+value)*100)/100);
    return {hole:index+1,label:`${a.map(player=>r.players[player].name).join(' / ')} vs ${b.map(player=>r.players[player].name).join(' / ')} · ${sign===0?'Push':`${sign>0?'first':'second'} pair wins`}`,balances:delta};
  });
  return {balances,holes};
}
