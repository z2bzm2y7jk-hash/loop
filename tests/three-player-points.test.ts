import {describe,expect,it} from 'vitest';
import {calculate} from '../lib/games';
import {rankedPoints,threePlayerPoints} from '../lib/games/three-player-points';
import {defaultRules} from '../lib/rules';
import {defaults,players,Round} from '../lib/types';

function round(game:'Nine Point'|'Split Sixes',scores:number[][],net=true):Round{
  const rules=defaultRules();
  rules.stakes[game]=1;
  rules.ninePointNet=net;
  rules.splitSixesNet=net;
  return {id:'three-player',course:'Test',date:'2026-09-29T12:00:00Z',holes:18,players:players.slice(0,3).map(player=>({...player,handicap:0})),games:[game],config:{...defaults,rules},results:scores.map(scores=>({scores,greenie:null,sandies:[],dots:[],snake:null})),presses:[],paid:[]};
}

describe('three-player point games',()=>{
  it('allocates Nine Point positions and every tie pattern',()=>{
    expect(rankedPoints([3,4,5],'Nine Point')).toEqual([5,3,1]);
    expect(rankedPoints([3,3,5],'Nine Point')).toEqual([4,4,1]);
    expect(rankedPoints([3,5,5],'Nine Point')).toEqual([5,2,2]);
    expect(rankedPoints([4,4,4],'Nine Point')).toEqual([3,3,3]);
  });

  it('allocates Split Sixes positions and every tie pattern',()=>{
    expect(rankedPoints([3,4,5],'Split Sixes')).toEqual([4,2,0]);
    expect(rankedPoints([3,3,5],'Split Sixes')).toEqual([3,3,0]);
    expect(rankedPoints([3,5,5],'Split Sixes')).toEqual([4,1,1]);
    expect(rankedPoints([4,4,4],'Split Sixes')).toEqual([2,2,2]);
  });

  it('settles every pair from the running point totals',()=>{
    const result=threePlayerPoints(round('Nine Point',[[3,4,5],[5,4,3]],false),'Nine Point');
    expect(result.totals).toEqual([6,6,6]);
    expect(result.balances).toEqual([0,0,0]);
    const oneHole=threePlayerPoints(round('Nine Point',[[3,4,5]],false),'Nine Point');
    expect(oneHole.balances).toEqual([6,0,-6]);
    expect(calculate(round('Nine Point',[[3,4,5]],false)).balances).toEqual([6,0,-6]);
  });

  it('uses handicap strokes when net scoring is on',()=>{
    const netRound=round('Nine Point',[[4,4,4]],true);
    netRound.players[2].handicap=18;
    expect(threePlayerPoints(netRound,'Nine Point').holes[0].points).toEqual([2,2,5]);
    netRound.config.rules!.ninePointNet=false;
    expect(threePlayerPoints(netRound,'Nine Point').holes[0].points).toEqual([3,3,3]);
  });

  it('rejects the wrong number of players and remains zero-sum',()=>{
    const valid=round('Split Sixes',[[3,4,5],[4,4,5],[5,4,3]],false);
    expect(threePlayerPoints(valid,'Split Sixes').balances.reduce((sum,value)=>sum+value,0)).toBe(0);
    expect(()=>threePlayerPoints({...valid,players:players},'Split Sixes')).toThrow('exactly three players');
  });
});
