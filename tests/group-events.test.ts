import {describe,expect,it} from 'vitest';
import {eventStandings,linkGroupEventRound,makePods,movePodPlayer,podSizes,releaseGroupEventPod,weeklyAttendeeIds} from '../lib/group-events';
import {newRound} from '../lib/demo';
import {simulate} from '../lib/simulation';
import type {GroupEvent} from '../lib/product-model';

describe('weekly group events',()=>{
  it('defaults a large roster to the first 12 weekly attendees',()=>{
    const roster=Array.from({length:18},(_,index)=>`p${index+1}`);
    expect(weeklyAttendeeIds([],roster)).toEqual(roster.slice(0,12));
    expect(weeklyAttendeeIds(['p4','p9','p14'],roster)).toEqual(['p4','p9','p14']);
  });

  it('builds balanced playing groups without a one-player group',()=>{
    expect(podSizes(4)).toEqual([4]);
    expect(podSizes(5)).toEqual([3,2]);
    expect(podSizes(7)).toEqual([4,3]);
    expect(podSizes(9)).toEqual([3,3,3]);
    expect(podSizes(10)).toEqual([4,3,3]);
    expect(podSizes(11)).toEqual([4,4,3]);
    expect(podSizes(12)).toEqual([4,4,4]);
    expect(podSizes(3)).toEqual([]);
    expect(podSizes(13)).toEqual([]);
    for(let count=4;count<=12;count++)expect(podSizes(count).every(size=>size>=2&&size<=4)).toBe(true);
  });

  it('assigns every attendee exactly once',()=>{const ids=Array.from({length:12},(_,index)=>`p-${index}`),pods=makePods(ids,()=>.5);expect(pods.flatMap(pod=>pod.playerIds).sort()).toEqual(ids.sort());expect(pods.map(pod=>pod.playerIds.length)).toEqual([4,4,4])});

  it('allows a manual move while preserving two-to-four golfers in a pod',()=>{const pods=[{id:'a',playerIds:['1','2','3','4']},{id:'b',playerIds:['5','6','7']}];const moved=movePodPlayer(pods,'1','b');expect(moved.map(pod=>pod.playerIds.length)).toEqual([3,4]);expect(movePodPlayer(moved,'2','b')).toEqual(moved);const balanced=[{id:'a',playerIds:['1','2','3','4']},{id:'b',playerIds:['5','6']}];const once=movePodPlayer(balanced,'1','b'),twice=movePodPlayer(once,'2','b');expect(twice.map(pod=>pod.playerIds.length)).toEqual([2,4]);expect(movePodPlayer(twice,'3','b')).toEqual(twice)});

  it('combines linked pod balances into one event leaderboard',()=>{let seed=7;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};const first=simulate({...newRound(),id:'r1',players:newRound().players.slice(0,2)},18,random),second=simulate({...newRound(),id:'r2',players:newRound().players.slice(2,4)},18,random);const event:GroupEvent={id:'event',date:'2026-09-27',course:'Harbor City Golf Course',attendeeIds:[...first.players,...second.players].map(player=>player.id),pods:[{id:'a',playerIds:first.players.map(player=>player.id),linkedRoundId:'r1'},{id:'b',playerIds:second.players.map(player=>player.id),linkedRoundId:'r2'}],status:'complete',createdAt:'2026-09-27T12:00:00Z'};const standings=eventStandings(event,[first,second],[...first.players,...second.players]);expect(standings).toHaveLength(4);expect(Math.round(standings.reduce((sum,item)=>sum+item.balance,0)*100)).toBe(0)});
  it('links a finished pod and releases a discarded pod',()=>{const round={...newRound(),id:'round',groupId:'group',groupEventId:'event',groupPodId:'pod'},event:GroupEvent={id:'event',date:'2026-09-27',course:'Harbor City Golf Course',attendeeIds:round.players.map(player=>player.id),pods:[{id:'pod',playerIds:round.players.map(player=>player.id)}],status:'active',createdAt:'2026-09-27T12:00:00Z'},data={version:1 as const,houseRules:[],groups:[{id:'group',name:'Group',memberIds:event.attendeeIds,createdAt:event.createdAt,events:[event]}],trips:[]};const linked=linkGroupEventRound(data,round);expect(linked.groups[0].events?.[0].status).toBe('complete');expect(linked.groups[0].events?.[0].pods[0].linkedRoundId).toBe('round');const released=releaseGroupEventPod(linked,round);expect(released.groups[0].events?.[0].status).toBe('planned');expect(released.groups[0].events?.[0].pods[0].linkedRoundId).toBeUndefined()});
});
