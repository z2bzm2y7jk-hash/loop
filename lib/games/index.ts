import {wolf} from './wolf';import {hammer} from './hammer';import {vegas} from './vegas';import {sixes} from './sixes';import {gameStake,scoresFor} from '../rules';
import {Round,Ledger,award,pars} from '../types';
import {nassau} from './nassau';import {skins} from './skins';import {greenies} from './greenies';import {birdies} from './birdies';
export function calculate(r:Round){const ledger:Ledger[]=r.games.map(game=>{let b=r.players.map(()=>0);
 if(game==='Nassau')b=nassau(r).balances;else if(game==='Skins')b=skins(r).balances;else if(game==='Greenies')b=greenies(r);else if(game==='Birdies')b=birdies(r);
 else if(r.config.rules&&game==='Wolf')b=wolf(r).balances;else if(r.config.rules&&game==='Hammer')b=hammer(r).balances;else if(r.config.rules&&game==='Vegas')b=vegas(r).balances;else if(r.config.rules&&game==='Sixes')b=sixes(r).balances;
 else if(game==='Snake'){const events=r.results.flatMap(h=>h.snakeEvents??(h.snake===null?[]:[h.snake]));if(r.config.rules?.snakeMode==='each')events.forEach(p=>award(b,p,-gameStake(r.config,game)));else{const last=events.at(-1);if(last!==undefined)award(b,last,-gameStake(r.config,game));}}
 else r.results.forEach((h,index)=>{
 if(game==='Sandies'||game==='Dots'){(game==='Sandies'?h.sandies:h.dots).forEach(p=>{if(game!=='Sandies'||!r.config.rules?.sandyPar||h.scores[p]<=pars[index])award(b,p,gameStake(r.config,game))});return;}
 if(game==='Match Play'){const scores=scoresFor(r,h,index,r.config.rules?.matchNet??false);scores.forEach((s,a)=>scores.forEach((t,c)=>{if(a<c){let sign=Math.sign(t-s);if(r.config.rules?.matchMode==='round'){if(index!==r.results.length-1)return;sign=Math.sign(r.results.reduce((sum,h,i)=>{const v=scoresFor(r,h,i,r.config.rules!.matchNet);return sum+Math.sign(v[c]-v[a])},0));}const v=Math.round(sign*gameStake(r.config,game)*100);b[a]=(Math.round(b[a]*100)+v)/100;b[c]=(Math.round(b[c]*100)-v)/100;}}));return;}
 if(game==='Vegas'){const a=[h.scores[0],h.scores[1]].sort((a,b)=>a-b),c=[h.scores[2],h.scores[3]].sort((a,b)=>a-b);const diff=(c[0]*10+c[1])-(a[0]*10+a[1]);b[0]+=diff/2;b[1]+=diff/2;b[2]-=diff/2;b[3]-=diff/2;return;}
 if(game==='Wolf'){const wolf=index%r.players.length;const best=Math.min(...h.scores.filter((_,p)=>p!==wolf));if(h.scores[wolf]!==best)award(b,wolf,h.scores[wolf]<best?2:-2);return;}
 if(game==='Hammer'){const low=Math.min(...h.scores);const winners=h.scores.flatMap((s,p)=>s===low?[p]:[]);if(winners.length===1)award(b,winners[0],low<pars[index]?4:2);}
 });return {game,balances:b}});
 return {ledger,balances:r.players.map((_,i)=>Math.round(ledger.reduce((sum,l)=>sum+l.balances[i],0)*100)/100)};
}
