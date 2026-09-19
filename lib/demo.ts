import {defaultRules} from './rules';
import {Round,players,defaults} from './types';import {simulate} from './simulation';
import {defaultCourseTee} from './course';
export function newRound():Round{return {started:false,id:crypto.randomUUID(),course:'Bay Hill Club & Lodge',tee:defaultCourseTee(),holes:18,players:players.map(p=>({...p})),games:['Nassau','Skins'],config:{...defaults,rules:defaultRules()},results:[],presses:[],paid:[],date:new Date().toISOString()}}
export function demoHistory(){let seed=42;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};return ['Winter Park Golf Course','Bay Hill Club & Lodge','Dubsdread Golf Course'].map((course,i)=>simulate({...newRound(),started:true,id:`demo-${i}`,course,date:`2026-09-${String(11-i*4).padStart(2,'0')}T12:00:00Z`,holes:i===0?9:18,games:['Nassau','Skins','Birdies']},18,random));}
