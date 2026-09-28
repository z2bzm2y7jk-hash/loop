import {describe,expect,it} from 'vitest';
import {newRound} from '../lib/demo';
import {validateWeeklyEventUpdate,validateWeeklyPodRound,weeklyInviteAccess} from '../lib/group-event-policy';
import type {SharedWeeklySnapshot} from '../lib/contracts/group-event-sync';

const ids=['p1','p2','p3','p4'];
const firstPod='22222222-2222-4222-8222-222222222222';
const secondPod='44444444-4444-4444-8444-444444444444';
const eventId='11111111-1111-4111-8111-111111111111';
const groupId='33333333-3333-4333-8333-333333333333';
const base=newRound();
const snapshot:SharedWeeklySnapshot={
 group:{id:groupId,name:'Sunday Crew',memberIds:ids,createdAt:'2026-09-01T12:00:00.000Z'},
 event:{id:eventId,date:'2026-09-28',course:'Harbor City Golf Course',attendeeIds:ids,pods:[{id:firstPod,playerIds:['p1','p2']},{id:secondPod,playerIds:['p3','p4']}],status:'planned',createdAt:'2026-09-28T12:00:00.000Z'},
 roster:base.players.map((player,index)=>({...player,id:ids[index]})),
};

function podRound(){return {...newRound(),id:'55555555-5555-4555-8555-555555555555',course:snapshot.event.course,players:snapshot.roster.slice(0,2),results:[],started:false,ended:undefined,groupId,groupEventId:eventId,groupPodId:firstPod}}

describe('weekly event server policy',()=>{
 it('maps view and organize invitations to the correct access',()=>{
  expect(weeklyInviteAccess(false,'view')).toEqual({role:'viewer',canEdit:false});
  expect(weeklyInviteAccess(false,'organize')).toEqual({role:'editor',canEdit:true});
  expect(weeklyInviteAccess(true,'view')).toEqual({role:'captain',canEdit:true});
 });

 it('accepts a complete lineup swap and derives its audit action',()=>{
  const pods=[{...snapshot.event.pods[0],playerIds:['p1','p3']},{...snapshot.event.pods[1],playerIds:['p2','p4']}];
  const result=validateWeeklyEventUpdate(snapshot,eventId,{...snapshot.event,pods});
  expect(result.ok).toBe(true);
  if(result.ok)expect(result.action).toBe('lineup');
 });

 it('rejects identity, detail, status, and linked-round tampering',()=>{
  expect(validateWeeklyEventUpdate(snapshot,eventId,{...snapshot.event,id:'66666666-6666-4666-8666-666666666666'}).ok).toBe(false);
  expect(validateWeeklyEventUpdate(snapshot,eventId,{...snapshot.event,course:'Another course'}).ok).toBe(false);
  expect(validateWeeklyEventUpdate(snapshot,eventId,{...snapshot.event,status:'active'}).ok).toBe(false);
  const pods=snapshot.event.pods.map((pod,index)=>index?pod:{...pod,linkedRoundId:'77777777-7777-4777-8777-777777777777'});
  expect(validateWeeklyEventUpdate(snapshot,eventId,{...snapshot.event,pods}).ok).toBe(false);
 });

 it('rejects duplicate or missing golfers in the playing groups',()=>{
  const pods=[{...snapshot.event.pods[0],playerIds:['p1','p1']},{...snapshot.event.pods[1],playerIds:['p3','p4']}];
  expect(validateWeeklyEventUpdate(snapshot,eventId,{...snapshot.event,pods}).ok).toBe(false);
 });

 it('accepts only an empty round tied to the exact group, event, pod, course, and players',()=>{
  const round=podRound();
  expect(validateWeeklyPodRound(snapshot,firstPod,round).ok).toBe(true);
  expect(validateWeeklyPodRound(snapshot,firstPod,{...round,groupId:'88888888-8888-4888-8888-888888888888'}).ok).toBe(false);
  expect(validateWeeklyPodRound(snapshot,firstPod,{...round,groupEventId:'88888888-8888-4888-8888-888888888888'}).ok).toBe(false);
  expect(validateWeeklyPodRound(snapshot,firstPod,{...round,groupPodId:secondPod}).ok).toBe(false);
  expect(validateWeeklyPodRound(snapshot,firstPod,{...round,course:'Another course'}).ok).toBe(false);
  expect(validateWeeklyPodRound(snapshot,firstPod,{...round,players:[round.players[0],round.players[0]]}).ok).toBe(false);
  expect(validateWeeklyPodRound(snapshot,firstPod,{...round,players:[{...round.players[0],handicap:54},round.players[1]]}).ok).toBe(false);
  expect(validateWeeklyPodRound(snapshot,firstPod,{...round,results:[{scores:[4,5],greenie:null,sandies:[],dots:[],snake:null}]}).ok).toBe(false);
 });
});
