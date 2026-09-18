import {calculate} from '../games';
import {nassau} from '../games/nassau';
import {newRound} from '../demo';
import {simulate} from '../simulation';
import {Game,Round,players as demoPlayers} from '../types';
import {GolfGroup} from '../product-model';

let seeded:Round[]|null=null;
function seededGroupRounds(){
  if(seeded)return seeded;
  let seed=723;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const games:Game[][]=[['Nassau','Skins'],['Nassau','Greenies'],['Wolf','Skins'],['Nassau','Birdies'],['Sixes','Skins'],['Vegas','Greenies'],['Nassau','Snake'],['Hammer','Skins'],['Match Play','Birdies']];
  seeded=Array.from({length:15},(_,i)=>{
    const base=newRound();
    return simulate({...base,id:`saturday-demo-${i}`,started:true,date:`2026-${String(Math.floor(i/2)+1).padStart(2,'0')}-${i%2?'20':'06'}T12:00:00Z`,course:['Bay Hill Club & Lodge','Winter Park Golf Course','Dubsdread Golf Course'][i%3],players:demoPlayers.map(player=>({...player})),games:games[i%games.length]},18,random);
  }).reverse();
  return seeded;
}

export function groupRounds(group:GolfGroup,history:Round[]){
  const memberIds=new Set(group.memberIds);
  const actual=history.filter(round=>round.players.length===memberIds.size&&round.players.every(player=>memberIds.has(player.id)));
  const demo=group.demo?seededGroupRounds():[];
  return [...actual,...demo.filter(round=>!actual.some(saved=>saved.id===round.id))].sort((a,b)=>b.date.localeCompare(a.date));
}

export function groupInsights(group:GolfGroup,history:Round[]){
  const rounds=groupRounds(group,history);
  const counts=new Map<Game,number>();
  rounds.forEach(round=>round.games.forEach(game=>counts.set(game,(counts.get(game)??0)+1)));
  const favorite=[...counts].sort((a,b)=>b[1]-a[1])[0]?.[0]??null;
  const balances=new Map<string,number>();
  rounds.forEach(round=>calculate(round).balances.forEach((balance,index)=>balances.set(round.players[index].id,(balances.get(round.players[index].id)??0)+balance)));
  const topId=[...balances].sort((a,b)=>b[1]-a[1])[0]?.[0];
  const topName=rounds[0]?.players.find(player=>player.id===topId)?.name??'–';
  const pairs=new Map<string,number>();
  rounds.forEach(round=>{if(round.config.teams&&round.games.some(game=>game==='Nassau'||game==='Hammer')){const members=(round.config.rules?.teamA??[0,1]).map(index=>round.players[index]?.name).filter(Boolean).sort();for(let i=0;i<members.length;i++)for(let j=i+1;j<members.length;j++){const key=`${members[i]} + ${members[j]}`;pairs.set(key,(pairs.get(key)??0)+1)}}});
  const mostPlayedPairing=[...pairs].sort((a,b)=>b[1]-a[1])[0]?.[0]??'–';
  const lines:string[]=[];
  const recent=rounds.slice(0,10);
  if(favorite)lines.push(`${favorite} appeared in ${recent.filter(round=>round.games.includes(favorite)).length} of your last ${recent.length} rounds.`);
  const lastSixes=rounds.find(round=>round.games.includes('Sixes'));
  if(lastSixes&&rounds[0]){const gap=Math.max(0,Math.round((new Date(rounds[0].date).getTime()-new Date(lastSixes.date).getTime())/86400000));if(gap>60)lines.push(`It has been ${Math.round(gap/30)} months since this group played Sixes.`)}
  const skinsWins=new Map<string,number>();
  rounds.slice(0,3).forEach(round=>{if(!round.games.includes('Skins'))return;const scores=round.results;scores.forEach(hole=>{const low=Math.min(...hole.scores),winners=hole.scores.flatMap((score,index)=>score===low?[index]:[]);if(winners.length===1){const id=round.players[winners[0]].id;skinsWins.set(id,(skinsWins.get(id)??0)+1)}})});
  const skinLeader=[...skinsWins].sort((a,b)=>b[1]-a[1])[0];
  if(skinLeader){const name=rounds[0]?.players.find(player=>player.id===skinLeader[0])?.name??'A golfer';lines.push(`${name} won ${skinLeader[1]} skins across the last three rounds.`)}
  const teamWins=new Map<string,number>();
  rounds.forEach(round=>{if(!round.games.includes('Nassau')||!round.config.teams)return;nassau(round).matches.filter(match=>!match.press&&match.status!==0).forEach(match=>{const team=(match.status>0?match.a:match.b).map(index=>round.players[index].name).sort();if(team.length===2){const key=team.join(' + ');teamWins.set(key,(teamWins.get(key)??0)+1)}})});
  const bestTeam=[...teamWins].sort((a,b)=>b[1]-a[1])[0];
  if(bestTeam)lines.push(`${bestTeam[0]} have won ${bestTeam[1]} recorded Nassau segments together.`);
  return {rounds,favorite,mostProfitable:topName,mostPlayedPairing,lastCourse:rounds[0]?.course??'–',lines};
}

export function rivalry(rounds:Round[],firstId:string,secondId:string){
  const shared=rounds.filter(round=>round.players.some(player=>player.id===firstId)&&round.players.some(player=>player.id===secondId)&&round.results.length===round.holes);
  let firstWins=0,secondWins=0,firstMoney=0,secondMoney=0;
  shared.forEach(round=>{const a=round.players.findIndex(player=>player.id===firstId),b=round.players.findIndex(player=>player.id===secondId);const aScore=round.results.reduce((sum,hole)=>sum+hole.scores[a],0),bScore=round.results.reduce((sum,hole)=>sum+hole.scores[b],0);if(aScore<bScore)firstWins++;if(bScore<aScore)secondWins++;const money=calculate(round).balances;firstMoney+=money[a];secondMoney+=money[b]});
  return {rounds:shared.length,firstWins,secondWins,ties:shared.length-firstWins-secondWins,firstMoney:Math.round(firstMoney*100)/100,secondMoney:Math.round(secondMoney*100)/100};
}
