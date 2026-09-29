import {describe,expect,it} from 'vitest';
import {createSharedWeeklyEventSchema,sharedWeeklySnapshotSchema,updateSharedWeeklyEventSchema} from '../lib/contracts/group-event-sync';
import {newRound} from '../lib/demo';

const ids=['p1','p2','p3','p4'];
const event={id:'11111111-1111-4111-8111-111111111111',date:'2026-09-28',course:'Harbor City Golf Course',attendeeIds:ids,pods:[{id:'22222222-2222-4222-8222-222222222222',playerIds:ids}],status:'planned' as const,createdAt:'2026-09-28T12:00:00.000Z'};
const group={id:'33333333-3333-4333-8333-333333333333',name:'Sunday Crew',memberIds:ids,createdAt:'2026-09-01T12:00:00.000Z'};
const roster=newRound().players.map((player,index)=>({...player,id:ids[index]}));
const snapshot={group,event,roster};

describe('shared weekly event contract',()=>{
 it('accepts a complete weekly lineup and its invite permission',()=>{
  expect(createSharedWeeklyEventSchema.parse({snapshot,scope:'organize'}).scope).toBe('organize');
  expect(updateSharedWeeklyEventSchema.parse({event,expectedRevision:3}).expectedRevision).toBe(3);
 });

 it('rejects a lineup that assigns a golfer twice or leaves one out',()=>{
  const invalid={...snapshot,event:{...event,pods:[{...event.pods[0],playerIds:['p1','p2','p3','p3']}]}};
  expect(sharedWeeklySnapshotSchema.safeParse(invalid).success).toBe(false);
 });

 it('rejects an attendee who is absent from the shared roster',()=>{
  const invalid={...snapshot,event:{...event,attendeeIds:['p1','p2','p3','guest'],pods:[{...event.pods[0],playerIds:['p1','p2','p3','guest']}]}};
  expect(sharedWeeklySnapshotSchema.safeParse(invalid).success).toBe(false);
 });

 it('accepts a saved threesome points game for a weekly group',()=>{
  const houseRule={id:'three-player-rule',name:'Threesome Points',games:['Nine Point','Split Sixes'],holes:18,playerCount:3,config:newRound().config,createdAt:'2026-09-28T12:00:00.000Z'};
  expect(sharedWeeklySnapshotSchema.parse({...snapshot,houseRule}).houseRule?.games).toEqual(['Nine Point','Split Sixes']);
 });
});
