import {describe,expect,it} from 'vitest';
import {newRound} from '../lib/demo';
import {birdies} from '../lib/games/birdies';
import {currentCourseName,currentRoundCourse,roundPars,roundStrokeIndexes} from '../lib/course';
import {courseTeeFrom} from '../lib/course-api';

describe('course and tee data',()=>{
 it('uses the current Harbor City name for the former Mallards Landing listing',()=>{
  expect(currentCourseName('Mallards Landing Golf Course At Melbourne')).toBe('Harbor City Golf Course');
  expect(currentCourseName('Mallards Landing Golf Course')).toBe('Harbor City Golf Course');
  expect(currentRoundCourse({...newRound(),course:'Mallards Landing Golf Course At Melbourne'}).course).toBe('Harbor City Golf Course');
  expect(currentCourseName('Bay Hill Club & Lodge')).toBe('Bay Hill Club & Lodge');
 });

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

 it('maps a provider course and tee into the round scorecard model',()=>{
  const detail={id:'bay-hill',course_name:'Bay Hill Championship',city:'Orlando',state:'FL',holes:18,tees:[],holes_data:Array.from({length:18},(_,index)=>({number:index+1,par:index===1?3:4,handicap_index:index+1}))};
  const tee=courseTeeFrom(detail,{tee_key:'blue-male',tee_name:'Blue',tee_color:'blue',gender:'Male',course_rating:73.6,slope:133,par:72,yardage:6895});
  expect(tee).toMatchObject({name:'Blue',location:'Orlando, FL',courseRating:73.6,slopeRating:133,source:'opengolf',providerCourseId:'bay-hill',gender:'Male',yardage:6895});
  expect(tee.pars[1]).toBe(3);
  expect(tee.strokeIndexes[17]).toBe(18);
 });
});
