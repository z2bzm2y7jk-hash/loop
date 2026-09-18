import {sides,scoresFor} from '../rules';
import {Round} from '../types';
export type Match={label:string;start:number;end:number;pair:number;a:number[];b:number[];status:number;played:number;amount:number;press:boolean};
export function nassau(r:Round){
 const pairs:{a:number[];b:number[]}[]=[];
 if(r.config.teams){if(r.config.rules)pairs.push(sides(r));else{const half=r.players.length/2;pairs.push({a:r.players.slice(0,half).map((_,i)=>i),b:r.players.slice(half).map((_,i)=>i+half)});}}else r.players.forEach((_,a)=>r.players.forEach((_,b)=>{if(a<b)pairs.push({a:[a],b:[b]})}));
 const matches:Match[]=[];const balances=r.players.map(()=>0);
 pairs.forEach(({a,b},pair)=>{
 const add=(label:string,start:number,end:number,amount:number,press=false)=>matches.push({label,start,end,pair,a,b,status:0,played:0,amount,press});
 add('Front',0,Math.min(8,r.holes-1),r.config.front);if(r.holes>9)add('Back',9,17,r.config.back);add('Overall',0,r.holes-1,r.config.overall);
 r.presses.filter(p=>p.pair===pair).forEach((p,i)=>add(`Manual press ${i+1}`,p.start,p.end,r.config.rules?.pressStake??(p.end<9?r.config.front:r.config.back),true));
 for(let h=0;h<r.results.length;h++){
 const score=scoresFor(r,r.results[h],h,r.config.rules?.nassauNet??false);const threshold=r.config.rules?.pressAt??2;const diff=Math.sign(Math.min(...b.map(i=>score[i]))-Math.min(...a.map(i=>score[i])));
 const active=matches.filter(m=>m.pair===pair&&h>=m.start&&h<=m.end);
 active.forEach(m=>{const before=m.status;m.status+=diff;m.played++;
 if(r.config.auto&&m.label!=='Overall'&&Math.abs(before)<threshold&&Math.abs(m.status)===threshold&&matches.filter(x=>x.pair===pair&&x.press).length<(r.config.rules?.pressLimit??Infinity)&&h<m.end&&!matches.some(x=>x.pair===pair&&x.label.startsWith('Auto press')&&x.start===h+1&&x.end===m.end))add(`Auto press ${matches.filter(x=>x.pair===pair&&x.press).length+1}`,h+1,m.end,r.config.rules?.pressStake??m.amount,true);
 });
 }
 });
 matches.forEach(m=>{if(!m.played)return;const sign=Math.sign(m.status);const cents=Math.round(m.amount*100);const split=(team:number[],direction:number)=>team.forEach((player,index)=>balances[player]+=direction*(Math.floor(cents/team.length)+(index<cents%team.length?1:0))/100);split(m.a,sign);split(m.b,-sign)});
 return {matches,balances};
}
