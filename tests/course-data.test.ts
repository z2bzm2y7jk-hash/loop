import {describe,expect,it} from 'vitest';
import {newRound} from '../lib/demo';
import {birdies} from '../lib/games/birdies';
import {roundPars,roundStrokeIndexes} from '../lib/course';

describe('course and tee data',()=>{
 it('drives scoring from the selected tee values',()=>{
  const base=newRound();
  const round={...base,holes:9,tee:{...base.tee!,source:'manual' as const,pars:[5,...base.tee!.pars.slice(1)],strokeIndexes:[1,...base.tee!.strokeIndexes.slice(1)]},games:['Birdies' as const],results:[{scores:[4,5,5,5],greenie:null,sandies:[],dots:[],snake:null}]};
  expect(roundPars(round)[0]).toBe(5);
  expect(roundStrokeIndexes(round)[0]).toBe(1);
  expect(birdies(round)[0]).toBe(6);
 });

 it('keeps legacy rounds usable with the default tee layout',()=>{
  const legacy={...newRound(),tee:undefined};
  expect(roundPars(legacy)).toHaveLength(18);
  expect(roundStrokeIndexes(legacy)[0]).toBe(9);
 });
});
