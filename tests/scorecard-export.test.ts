import {describe,expect,it} from 'vitest';
import {scorecardCsv} from '../lib/scorecard-export';
import {newRound} from '../lib/demo';

describe('scorecard export',()=>{
 it('exports hole-by-hole scores and totals for every player',()=>{
  const round={...newRound(),holes:9,date:'2026-09-19T12:00:00Z',results:Array.from({length:9},(_,hole)=>({scores:[hole+3,hole+4,hole+5,hole+6],greenie:null,sandies:[],dots:[],snake:null}))};
  const csv=scorecardCsv(round);
  expect(csv).toContain('"Hole 9"');
  expect(csv).toContain('"Chad","8","3","4","5","6","7","8","9","10","11","63"');
 });

 it('escapes spreadsheet formulas and quotes in names',()=>{
  const base=newRound(),round={...base,course:'=LINK("bad")',players:[{...base.players[0],name:'+Player'}],results:[]};
  const csv=scorecardCsv(round);
  expect(csv).toContain('"\'=LINK(""bad"")"');
  expect(csv).toContain('"\'+Player"');
 });
});
