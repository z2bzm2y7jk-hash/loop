import {Config,Game,Hole,Round} from './types';
import {roundStrokeIndexes} from './course';
export type Rules={
 version:2; stakes:Record<Game,number>; teamA:number[];
 wolfNet:boolean;wolfStart:number;wolfSoloWin:number;wolfSoloLoss:number;wolfBlindWin:number;wolfBlindLoss:number;wolfTie:'push'|'wolf-loses';
 hammerNet:boolean;hammerBirdie:boolean;hammerLimit:number;
 vegasNet:boolean;vegasFlip:boolean;vegasCap:boolean;
 matchNet:boolean;matchMode:'hole'|'round';
 nassauNet:boolean;pressAt:number;pressLimit:number;pressStake:number;
 greenPar:boolean;sandyPar:boolean;eagleMultiplier:number;snakeMode:'last'|'each';
};
export const defaultRules=():Rules=>({version:2,stakes:{Nassau:5,Skins:2,Wolf:2,'Match Play':2,Sixes:2,Vegas:1,Hammer:2,Greenies:5,Birdies:2,Sandies:2,Snake:2,Dots:2},teamA:[0,1],wolfNet:false,wolfStart:0,wolfSoloWin:2,wolfSoloLoss:2,wolfBlindWin:4,wolfBlindLoss:4,wolfTie:'push',hammerNet:false,hammerBirdie:false,hammerLimit:6,vegasNet:false,vegasFlip:false,vegasCap:true,matchNet:false,matchMode:'hole',nassauNet:false,pressAt:2,pressLimit:8,pressStake:5,greenPar:false,sandyPar:true,eagleMultiplier:2,snakeMode:'last'});
export function gameStake(c:Config,g:Game){return g==='Skins'?c.skin:g==='Greenies'?c.greenie:g==='Birdies'?c.birdie:c.rules?.stakes[g]??(g==='Vegas'?1:2)}
export function sides(r:Round,override?:number[]){const raw=override??r.config.rules?.teamA??[];const a=[...new Set(raw)].filter(i=>Number.isInteger(i)&&i>=0&&i<r.players.length);const team=a.length&&a.length<r.players.length?a:r.players.slice(0,Math.floor(r.players.length/2)).map((_,i)=>i);return {a:team,b:r.players.flatMap((_,i)=>team.includes(i)?[]:[i])}}
export function scoresFor(r:Round,h:Hole,index:number,net:boolean){const strokeIndexes=roundStrokeIndexes(r);return h.scores.map((s,i)=>s-(net?Math.floor(r.players[i].handicap/18)+(strokeIndexes[index]<=r.players[i].handicap%18?1:0):0))}
export function splitTransfer(b:number[],a:number[],c:number[],amount:number){const cents=Math.round(Math.abs(amount)*100),sign=Math.sign(amount);for(const [team,dir] of [[a,sign],[c,-sign]] as [number[],number][]){team.forEach((p,i)=>{b[p]=(Math.round(b[p]*100)+dir*(Math.floor(cents/team.length)+(i<cents%team.length?1:0)))/100})}}
export function rulesSummary(r:Round,g:Game){const q=r.config.rules;const base=`$${gameStake(r.config,g)} `;if(g==='Nassau')return `$${r.config.front} front · ${r.holes===18?`$${r.config.back} back · `:''}$${r.config.overall} overall · ${r.config.teams?'Team':'Individual'} · ${q?.nassauNet?'Net':'Gross'}${r.config.auto?` · Press at ${q?.pressAt??2} down`:''} · $${q?.pressStake??r.config.front} / press`;
if(g==='Skins')return `${base}/ opponent · ${r.config.net?'Net':'Gross'} · Carryovers ${r.config.carry?'on':'off'}`;
if(!q)return `${base}· Original prototype rules`;
if(g==='Wolf')return `${base}/ opponent · Partner 1× · Lone ${q.wolfSoloWin}× win / ${q.wolfSoloLoss}× loss · Blind ${q.wolfBlindWin}× / ${q.wolfBlindLoss}× · ${q.wolfNet?'Net':'Gross'}`;
if(g==='Hammer')return `${base}/ team / hole · Accept doubles · Decline concedes · ${q.hammerLimit} max · ${q.hammerBirdie?'Birdie doubles':'No birdie bonus'}`;
if(g==='Vegas')return `${base}/ team point · ${q.vegasNet?'Net':'Gross'} · Birdie flip ${q.vegasFlip?'on':'off'} · ${q.vegasCap?'Scores capped at 9':'Double digits placed first'}`;
if(g==='Sixes')return `${base}/ team / hole · Partners rotate every six holes · Best ball`;
if(g==='Match Play')return `${base}/ pair / ${q.matchMode==='hole'?'hole':'match'} · ${q.matchNet?'Net':'Gross'}`;
if(g==='Greenies')return `${base}/ opponent · Holes ${r.config.greenHoles.filter(h=>h<=r.holes).join(', ')} · ${q.greenPar?'Par required':'No score requirement'}`;
if(g==='Birdies')return `${base}/ opponent · Eagle or better ${q.eagleMultiplier}×`;
if(g==='Sandies')return `${base}/ opponent · ${q.sandyPar?'Par required':'Any marked sandy'}`;
if(g==='Snake')return `${base}/ opponent · ${q.snakeMode==='last'?'Last three-putter pays':'Each marked three-putter pays'}`;
return `${base}/ marked dot / opponent`;
}
