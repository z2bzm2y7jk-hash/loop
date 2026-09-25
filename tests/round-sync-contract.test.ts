import {describe,expect,it} from 'vitest';
import {createSharedRoundSchema,roundChangesQuerySchema,saveHoleCommandSchema,sharedHoleCommandSchema} from '../lib/contracts/round-sync';
import {newRound} from '../lib/demo';

const validCommand={
 commandId:'11111111-1111-4111-8111-111111111111',
 roundId:'22222222-2222-4222-8222-222222222222',
 holeNumber:7,
 expectedRoundRevision:4,
 clientSavedAt:'2026-09-20T14:30:00-04:00',
 scores:[{seatIndex:0,strokes:4},{seatIndex:1,strokes:5},{seatIndex:2,strokes:4},{seatIndex:3,strokes:6}],
 decisions:{wolf:{mode:'partner',partnerSeat:2}},
};

describe('round synchronization contract',()=>{
 it('accepts a conflict-safe, idempotent hole save',()=>{
  expect(saveHoleCommandSchema.parse(validCommand)).toMatchObject({holeNumber:7,expectedRoundRevision:4});
 });

 it('rejects duplicate player seats and impossible scores',()=>{
  const duplicate={...validCommand,scores:[{seatIndex:0,strokes:4},{seatIndex:0,strokes:26}]};
  expect(saveHoleCommandSchema.safeParse(duplicate).success).toBe(false);
 });

 it('coerces an incremental-sync revision from the URL query',()=>{
  expect(roundChangesQuerySchema.parse({afterRevision:'12'}).afterRevision).toBe(12);
 });

 it('validates a shared round and its conflict-safe score update',()=>{
  const round={...newRound(),started:true,results:[{scores:[4,5,4,6],greenie:null,sandies:[],dots:[],snake:null}]};
  expect(createSharedRoundSchema.parse({round,scope:'view'}).scope).toBe('view');
  expect(sharedHoleCommandSchema.parse({...validCommand,holeNumber:1,round}).round.results).toHaveLength(1);
 });
});
