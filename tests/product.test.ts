import {describe,expect,it} from 'vitest';
import {defaultProductData,houseRuleFromRound,applyHouseRule,loadProductData} from '../lib/product-model';
import {newRound,demoHistory} from '../lib/demo';
import {groupInsights,groupRounds} from '../lib/insights/groupInsights';
import {tripInsights} from '../lib/trip-insights';
import {roundRecap} from '../lib/recap';
import {forceSkinCarryover,forceBirdie,triggerPress} from '../lib/demo-tools';
import {skins} from '../lib/games/skins';
import {calculate} from '../lib/games';
import {pars} from '../lib/types';

describe('saved product data',()=>{
 it('preserves a House Rule setup while resetting active results',()=>{const r=newRound();r.games=['Nassau','Skins'];r.results=[{scores:[4,4,4,4],greenie:null,sandies:[],dots:[],snake:null}];const rule=houseRuleFromRound(r,'Saturday Nassau');const applied=applyHouseRule(rule,newRound());expect(applied.games).toEqual(['Nassau','Skins']);expect(applied.players).toHaveLength(4);expect(applied.results).toEqual([]);expect(applied.config).toEqual(r.config);expect(applied.config).not.toBe(r.config);const three=houseRuleFromRound({...r,players:r.players.slice(0,3),games:['Wolf']},'Threesome Wolf');expect(applyHouseRule(three,newRound()).players).toHaveLength(3)});
 it('recovers cleanly from invalid browser storage',()=>{expect(loadProductData('{bad').groups[0].name).toBe('Saturday Guys');expect(loadProductData(JSON.stringify(defaultProductData())).trips[0].rounds).toHaveLength(3)});
});
describe('history and trips',()=>{
 it('starts Saturday Guys with 18 derived rounds and a favorite game',()=>{const group=defaultProductData().groups[0],history=demoHistory(),insights=groupInsights(group,history);expect(groupRounds(group,history)).toHaveLength(18);expect(insights.favorite).toBe('Nassau');expect(insights.lines.length).toBeGreaterThan(0)});
 it('has real balanced results for the Myrtle Beach demo',()=>{const trip=defaultProductData().trips[0],insights=tripInsights(trip,[]);expect(insights.rounds).toHaveLength(9);expect(insights.roster).toHaveLength(12);expect(insights.rounds.every(round=>round.results.length===18)).toBe(true);expect(Math.round(insights.ranked.reduce((sum,item)=>sum+item.balance,0)*100)).toBe(0)});
 it('creates a recap and settlement from actual balances',()=>{const r=demoHistory()[0],recap=roundRecap(r);expect(recap.balanced).toBe(true);expect(recap.ranked).toHaveLength(r.players.length);expect(recap.text).toContain(r.course.toUpperCase());expect(recap.payments.length).toBeGreaterThan(0)});
});
describe('demo controls',()=>{
 it('forces a true tied skin and a gross birdie',()=>{const r={...newRound(),games:['Skins' as const],config:{...newRound().config,net:true}};const tied=forceSkinCarryover(r);expect(tied.results).toHaveLength(1);expect(skins(tied).carry).toBe(1);const birdie=forceBirdie(tied);expect(birdie.results[1].scores[0]).toBe(pars[1]-1);expect(Math.round(calculate(birdie).balances.reduce((sum,value)=>sum+value,0)*100)).toBe(0)});
 it('adds a single manual press when Nassau is active',()=>{const r={...newRound(),games:['Nassau' as const]};const first=triggerPress(r);expect(first.presses).toHaveLength(1);expect(triggerPress(first).presses).toHaveLength(1)});
});
