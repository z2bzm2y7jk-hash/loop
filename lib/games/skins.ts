import {Round,award} from '../types';
import {roundStrokeIndexes} from '../course';
export function skins(r:Round){const balances=r.players.map(()=>0);const wins:{hole:number;winner:number;value:number}[]=[];let carry=0;
 const strokeIndexes=roundStrokeIndexes(r);r.results.forEach((h,index)=>{carry++;const scores=h.scores.map((s,i)=>s-(r.config.net?Math.floor(r.players[i].handicap/18)+(strokeIndexes[index]<=r.players[i].handicap%18?1:0):0));const low=Math.min(...scores);const winners=scores.flatMap((s,i)=>s===low?[i]:[]);if(winners.length===1){const value=carry*r.config.skin;award(balances,winners[0],value);wins.push({hole:index+1,winner:winners[0],value});carry=0;}else if(!r.config.carry)carry=0;});
 return {balances,wins,carry,current:(carry+1)*r.config.skin};}
