import type {Rules} from './rules';
export type Player={id:string;name:string;handicap:number;color:string};
export type Game='Nassau'|'Skins'|'Wolf'|'Match Play'|'Sixes'|'Vegas'|'Hammer'|'Greenies'|'Birdies'|'Sandies'|'Snake'|'Dots';
export type Config={rules?:Rules;front:number;back:number;overall:number;auto:boolean;teams:boolean;skin:number;carry:boolean;net:boolean;greenie:number;greenHoles:number[];birdie:number};
export type WolfChoice={wolf:number;mode:'partner'|'lone'|'blind';partner?:number;stake?:number};
export type HammerEvent={by:'A'|'B';response:'pending'|'accepted'|'declined'};
export type Hole={wolf?:WolfChoice;hammer?:HammerEvent[];vegasPartner?:number;scores:number[];greenie:number|null;sandies:number[];dots:number[];snake:number|null;snakeEvents?:number[]};
export type Press={start:number;end:number;pair:number};
export type CourseTee={name:string;location:string;courseRating:number;slopeRating:number;pars:number[];strokeIndexes:number[];source:'demo'|'manual'|'opengolf';providerCourseId?:string;gender?:string;yardage?:number;attribution?:string};
export type RoundEnd={kind:'cancelled';reason:string;keepBets:boolean;endedAt:string;holesPlayed:number};
export type Round={started?:boolean;id:string;course:string;tee?:CourseTee;holes:number;players:Player[];games:Game[];config:Config;results:Hole[];presses:Press[];paid:string[];date:string;ended?:RoundEnd};
export type Ledger={game:string;balances:number[]};
export const pars=[4,3,4,5,4,5,3,4,4,4,4,5,4,3,4,5,3,4];
export const handicaps=[9,17,3,11,5,1,15,7,13,8,4,2,12,18,6,10,16,14];
export const players:Player[]=[{id:'chad',name:'Chad',handicap:8,color:'#d9e4d2'},{id:'mike',name:'Mike',handicap:14,color:'#e9dbc9'},{id:'john',name:'John',handicap:11,color:'#d9e4e7'},{id:'steve',name:'Steve',handicap:19,color:'#e5ddeb'}];
export const defaults:Config={front:5,back:5,overall:5,auto:true,teams:true,skin:2,carry:true,net:false,greenie:5,greenHoles:[2,7,14,17],birdie:2};
export const brand={name:'loop',tagline:'A good round, all squared.'};
export const dollars=(n:number)=>`${n<0?'−':n>0?'+':''}$${Math.abs(n).toFixed(n%1?2:0)}`;
export function award(b:number[],winner:number,value:number){const cents=Math.round(value*100);b.forEach((_,i)=>{if(i!==winner){b[i]=(Math.round(b[i]*100)-cents)/100;b[winner]=(Math.round(b[winner]*100)+cents)/100;}})}
