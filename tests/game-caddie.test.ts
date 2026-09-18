import {describe,expect,it} from 'vitest';
import {players,defaults,Round} from '../lib/types';
import {defaultRules} from '../lib/rules';
import {calculate} from '../lib/games';
import {sixes} from '../lib/games/sixes';
import {estimateExposure} from '../lib/games/exposure';
import {recommendGames,CaddieInput} from '../lib/recommendations/gameCaddie';
import {gameFits} from '../lib/game-catalog';

function input(overrides:Partial<CaddieInput>={}):CaddieInput{return {players,holes:18,vibe:'competitive',maxExposure:20,complexity:'medium',teams:'any',history:[],...overrides}}
function round():Round{return {id:'sixes',course:'Test',date:'2026-09-17',players,holes:18,games:['Sixes'],config:{...defaults,rules:defaultRules()},presses:[],paid:[],results:[]}}

describe('Game Caddie',()=>{
  it('returns three compatible recommendations within modeled exposure',()=>{
    const results=recommendGames(input());
    expect(results.length).toBeGreaterThanOrEqual(3);
    expect(results.slice(0,3).every(result=>gameFits(result.game,4,18)&&result.exposure.possibleMax<=20)).toBe(true);
    expect(new Set(results.slice(0,3).map(result=>result.game)).size).toBe(3);
    expect(results[0].why).toContain('not a hard cap');
  });
  it('never offers foursome games to a threesome or Sixes for nine holes',()=>{
    const results=recommendGames(input({players:players.slice(0,3),holes:9}));
    expect(results.map(result=>result.game)).not.toContain('Sixes');
    expect(results.map(result=>result.game)).not.toContain('Vegas');
    expect(results.map(result=>result.game)).not.toContain('Nassau');
  });
  it('penalizes a frequent game when trying something new',()=>{
    const repeated=Array.from({length:7},(_,index)=>({...round(),id:`played-${index}`,games:['Skins' as const]}));
    const novel=recommendGames(input({vibe:'new',history:repeated}));
    expect(novel[0].game).not.toBe('Skins');
    expect(novel.find(result=>result.game==='Skins')!.score).toBeLessThan(novel[0].score);
  });
  it('keeps a low exposure request meaningful without claiming a hard cap',()=>{
    const results=recommendGames(input({maxExposure:5}));
    expect(results.length).toBeGreaterThanOrEqual(3);
    expect(results.slice(0,3).every(result=>result.exposure.possibleMax<=5)).toBe(true);
    expect(results[0].exposure.assumptions).toContain('An estimate, not an enforced loss cap.');
  });
});

describe('Sixes and exposure',()=>{
  it('rotates pairings after holes six and twelve and settles to zero',()=>{
    const r=round();r.results=Array.from({length:13},()=>({scores:[3,4,5,6],greenie:null,sandies:[],dots:[],snake:null}));
    const result=sixes(r);
    expect(result.holes[0].label).toContain('Chad / Mike');
    expect(result.holes[6].label).toContain('Chad / John');
    expect(result.holes[12].label).toContain('Chad / Steve');
    expect(Math.round(calculate(r).balances.reduce((sum,value)=>sum+value,0)*100)).toBe(0);
  });
  it('warns about variable values rather than promising a hard cap',()=>{
    const r=round();r.games=['Wolf'];
    expect(estimateExposure(r,'Wolf').assumptions.join(' ')).toContain('per-hole Wolf value');
    r.games=['Hammer'];
    expect(estimateExposure(r,'Hammer').possibleMax).toBeGreaterThan(20);
  });
});
