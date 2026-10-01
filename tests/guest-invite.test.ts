import {describe,expect,it} from 'vitest';
import {inviteFromHash} from '../lib/guest-invite';

describe('guest invitation links',()=>{
 it('reads a shared round invitation',()=>{
  expect(inviteFromHash('#round=11111111-1111-4111-8111-111111111111&token=round-token')).toEqual({kind:'round',id:'11111111-1111-4111-8111-111111111111',token:'round-token'});
 });

 it('reads a weekly group invitation',()=>{
  expect(inviteFromHash('#event=22222222-2222-4222-8222-222222222222&eventToken=event-token')).toEqual({kind:'event',id:'22222222-2222-4222-8222-222222222222',token:'event-token'});
 });

 it('ignores ordinary and incomplete addresses',()=>{
  expect(inviteFromHash('')).toBeNull();
  expect(inviteFromHash('#round=11111111-1111-4111-8111-111111111111')).toBeNull();
 });
});
