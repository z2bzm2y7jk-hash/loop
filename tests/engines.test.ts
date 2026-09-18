import {describe,it,expect} from 'vitest';
import {Round,defaults,players,pars} from '../lib/types';
import {nassau} from '../lib/games/nassau';import {skins} from '../lib/games/skins';import {birdies} from '../lib/games/birdies';import {greenies} from '../lib/games/greenies';import {calculate} from '../lib/games';import {settle} from '../lib/settlement';import {simulate} from '../lib/simulation';
function round(scores:number[][]=[]):Round{return {id:'test',course:'Test',date:'2026-09-13',players,holes:18,games:['Nassau','Skins','Greenies','Birdies'],config:{...defaults},results:scores.map(scores=>({scores,greenie:null,sandies:[],dots:[],snake:null})),paid:[],presses:[]}}
describe('Nassau',()=>{
 it('counts best ball, front, overall and pending auto press',()=>{const r=round([[3,5,4,6],[2,4,3,4]]);const n=nassau(r);expect(n.matches.find(m=>m.label==='Front')?.status).toBe(2);expect(n.matches.find(m=>m.label==='Overall')?.status).toBe(2);expect(n.matches.filter(m=>m.press)).toHaveLength(1);expect(n.matches.find(m=>m.press)?.start).toBe(2);expect(n.balances).toEqual([5,5,-5,-5])});
 it('creates multiple simultaneous presses without paying unplayed bets',()=>{const n=nassau(round(Array.from({length:6},()=>[3,4,5,6])));expect(n.matches.filter(m=>m.press)).toHaveLength(3);expect(n.matches.filter(m=>m.press).map(m=>m.played)).toEqual([4,2,0]);expect(n.balances.reduce((a,b)=>a+b,0)).toBe(0)});
 it('keeps automatic and manual presses as separate matches',()=>{const r=round([[3,4,5,6],[3,4,5,6]]);r.presses=[{start:2,end:8,pair:0}];expect(nassau(r).matches.filter(m=>m.press)).toHaveLength(2)});
 it('starts manual press on the specified next hole',()=>{const r=round([[4,4,5,5],[4,4,5,5],[5,5,4,4]]);r.config.auto=false;r.presses=[{start:2,end:8,pair:0}];const m=nassau(r).matches.find(m=>m.press)!;expect(m.status).toBe(-1);expect(m.played).toBe(1)});
 it('separates front and back results and ties overall',()=>{const r=round(Array.from({length:18},(_,i)=>i<9?[3,5,4,5]:[5,5,4,4]));r.config.auto=false;const n=nassau(r);expect(n.matches.map(m=>m.status)).toEqual([9,-9,0]);expect(n.balances).toEqual([0,0,0,0])});
 it('only offers front and overall for nine holes',()=>{const r=round();r.holes=9;expect(nassau(r).matches.map(m=>m.label)).toEqual(['Front','Overall'])});
 it('all-pairs individual mode makes six matches per segment',()=>{const r=round([[3,4,5,6]]);r.config.teams=false;r.config.auto=false;expect(nassau(r).matches).toHaveLength(18);expect(nassau(r).balances).toEqual([30,10,-10,-30])});
 it('splits team cents without losing zero sum',()=>{const r=round([[3,4,5,6,7,8]]);r.players=[...players,{...players[0],id:'5'},{...players[1],id:'6'}];const b=nassau(r).balances;expect(Math.round(b.reduce((a,b)=>a+b,0)*100)).toBe(0);expect(()=>settle(b)).not.toThrow()});
});
describe('Skins',()=>{
 it('carries a tied low score then awards and resets',()=>{const r=round([[4,4,5,6],[3,4,5,6]]);const s=skins(r);expect(s.wins).toEqual([{hole:2,winner:0,value:4}]);expect(s.balances).toEqual([12,-4,-4,-4]);expect(s.carry).toBe(0);expect(s.current).toBe(2)});
 it('does not treat a unique higher score as a winning low',()=>{expect(skins(round([[3,3,4,5]])).wins).toHaveLength(0)});
 it('discards ties when carryovers are off',()=>{const r=round([[4,4,5,6],[3,4,5,6]]);r.config.carry=false;expect(skins(r).wins[0].value).toBe(2)});
 it('applies net strokes using hole difficulty',()=>{const r=round([[4,4,4,4]]);r.players=players.map((p,i)=>({...p,handicap:i===3?36:0}));r.config.net=true;expect(skins(r).wins[0].winner).toBe(3)});
});
describe('Side games and settlement',()=>{
 it('birdies include better-than-birdie and balance',()=>{expect(birdies(round([[3,4,2,5]]))).toEqual([4,-4,4,-4])});
 it('greenies only award selected holes',()=>{const r=round([[4,4,4,4],[3,3,3,3]]);r.results[0].greenie=0;r.results[1].greenie=1;expect(greenies(r)).toEqual([-5,15,-5,-5])});
 it('settles the requested example in three payments',()=>{const b=[24,8,-12,-20];const payments=settle(b);expect(payments).toHaveLength(3);payments.forEach(p=>{b[p.from]+=p.amount;b[p.to]-=p.amount});expect(b).toEqual([0,0,0,0])});
 it('normalizes fractional-cent stakes without creating money',()=>{const r=round([[3,4,4,4]]);r.config.birdie=.005;const b=birdies(r);expect(b).toEqual([.03,-.01,-.01,-.01]);expect(()=>settle(b)).not.toThrow()});
 it('handles cents, empty and invalid ledgers',()=>{expect(settle([0,0])).toEqual([]);expect(settle([.01,-.01])[0].amount).toBe(.01);expect(()=>settle([1,-2])).toThrow()});
 it('all games remain zero-sum over 100 reproducible rounds',()=>{let seed=12;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};for(let i=0;i<100;i++){const r=round();r.games=['Nassau','Skins','Wolf','Match Play','Vegas','Hammer','Greenies','Birdies','Sandies','Snake','Dots'];const full=simulate(r,18,rand);const b=calculate(full).balances;expect(Math.round(b.reduce((a,b)=>a+b,0)*100)).toBe(0);const after=[...b];settle(b).forEach(p=>{after[p.from]+=p.amount;after[p.to]-=p.amount});after.forEach(v=>expect(v).toBeCloseTo(0));expect(full.results).toHaveLength(18);expect(full.results.every(h=>h.scores.every(s=>s>=1&&s<=9))).toBe(true)}});
 it('simulation caps at round length and retains played holes',()=>{const r=round([[4,5,6,7]]);r.holes=9;const s=simulate(r,30,()=>.5);expect(s.results).toHaveLength(9);expect(s.results[0]).toEqual(r.results[0]);expect(pars.slice(0,9).reduce((a,b)=>a+b,0)).toBe(36)});
});
