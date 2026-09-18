import {calculate} from './games';
import {skins} from './games/skins';import {sixes} from './games/sixes';import {scoresFor} from './rules';
import {settle} from './settlement';
import {dollars,Round} from './types';
export function roundRecap(round:Round){
 const result=calculate(round),ranked=round.players.map((player,index)=>({player,balance:result.balances[index]})).sort((a,b)=>b.balance-a.balance);
 const biggestSkin=round.games.includes('Skins')?[...skins(round).wins].sort((a,b)=>b.value-a.value)[0]:undefined;
 const lastSixes=round.games.includes('Sixes')?sixes(round).holes.filter(hole=>hole.balances.some(value=>value>0)).at(-1):undefined;
 const winningSixes=lastSixes?round.players.filter((_,index)=>lastSixes.balances[index]>0).map(player=>player.name).join(' / '):'';
 const biggestMoment=biggestSkin?`${round.players[biggestSkin.winner].name} won a $${biggestSkin.value.toFixed(biggestSkin.value%1?2:0)} skin on hole ${biggestSkin.hole}.`:lastSixes?`${winningSixes} took hole ${lastSixes.hole} in Sixes.`:`${ranked[0].player.name} finished on top at ${round.course}.`;
 let backNineSwing:string|null=null;
 if(round.holes===18&&round.results.length===18){const relative=round.players.map((player,index)=>{const diff=(from:number,to:number)=>round.results.slice(from,to).reduce((sum,hole)=>sum+hole.scores[index]-hole.scores.reduce((a,b)=>a+b,0)/round.players.length,0);return {name:player.name,improvement:diff(0,9)-diff(9,18)}}).sort((a,b)=>b.improvement-a.improvement)[0];if(relative.improvement>1)backNineSwing=`${relative.name} improved ${relative.improvement.toFixed(1)} strokes against the group on the back nine.`}
 let toughestBeat:string|null=null;
 if(biggestSkin){const hole=round.results[biggestSkin.hole-1],netScores=scoresFor(round,hole,biggestSkin.hole-1,round.config.net),winnerScore=netScores[biggestSkin.winner],runner=netScores.map((score,index)=>({score,index})).filter(item=>item.index!==biggestSkin.winner).sort((a,b)=>a.score-b.score)[0];if(runner&&runner.score-winnerScore===1)toughestBeat=`${round.players[runner.index].name} missed the $${biggestSkin.value.toFixed(biggestSkin.value%1?2:0)} skin on hole ${biggestSkin.hole} by one ${round.config.net?'net stroke':'stroke'}.`}
 const payments=settle(result.balances).map(item=>`${round.players[item.from].name} pays ${round.players[item.to].name} $${item.amount.toFixed(2)}`);
 const date=new Date(round.date).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
 const text=[`${round.course.toUpperCase()} · ${date}`,round.games.join(' + '),'',...ranked.map(item=>`${item.player.name}: ${dollars(item.balance)}`),'',`Biggest moment: ${biggestMoment}`,backNineSwing?`Back-nine swing: ${backNineSwing}`:'',toughestBeat?`Toughest beat: ${toughestBeat}`:'',...payments,'','Run it back next Saturday?'].join('\n');
 return {ranked,winner:ranked[0],biggestMoment,backNineSwing,toughestBeat,payments,date,text,balanced:Math.abs(result.balances.reduce((sum,item)=>sum+item,0))<.001};
}
