import {describe,expect,it} from 'vitest';
import {newRound} from '../lib/demo';
import {cancelRound,isActiveRound,roundCountsInStats,roundStatusLine} from '../lib/round-lifecycle';

describe('round lifecycle',()=>{
 it('recognizes only started, unfinished rounds as active',()=>{
  const draft=newRound(),active={...draft,started:true};
  expect(isActiveRound(draft)).toBe(false);
  expect(isActiveRound(active)).toBe(true);
  expect(isActiveRound({...active,results:Array.from({length:18},()=>({scores:[4,4,4,4],greenie:null,sandies:[],dots:[],snake:null}))})).toBe(false);
 });

 it('keeps a partial cancelled round in stats only when the group agrees',()=>{
  const partial={...newRound(),started:true,results:[{scores:[4,5,4,6],greenie:null,sandies:[],dots:[],snake:null}]};
  const kept=cancelRound(partial,'Weather',true,'2026-09-25T12:00:00Z');
  const discarded=cancelRound(partial,'Weather',false,'2026-09-25T12:00:00Z');
  expect(kept.ended).toMatchObject({reason:'Weather',keepBets:true,holesPlayed:1});
  expect(roundCountsInStats(kept)).toBe(true);
  expect(roundCountsInStats(discarded)).toBe(false);
  expect(roundStatusLine(kept)).toBe('Cancelled after 1 hole · results kept');
 });

 it('cannot keep bets when no holes were recorded',()=>{
  expect(cancelRound({...newRound(),started:true},'Darkness',true).ended?.keepBets).toBe(false);
 });
});
