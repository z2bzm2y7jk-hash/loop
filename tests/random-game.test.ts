import {describe,expect,it} from 'vitest';
import {eligibleGames,pickGame} from '../lib/random-game';

describe('random game suggestions',()=>{
  it('matches player count and round length',()=>{
    const two=eligibleGames({players:2,holes:9,style:'any'});
    expect(two).not.toContain('Wolf');
    expect(two).not.toContain('Vegas');
    expect(two).not.toContain('Nassau');
    expect(eligibleGames({players:4,holes:18,style:'any'})).toContain('Vegas');
    expect(eligibleGames({players:3,holes:18,style:'any'})).toContain('Wolf');
    expect(eligibleGames({players:5,holes:18,style:'any'})).not.toContain('Vegas');
  });
  it('filters by desired style and avoids an immediate repeat',()=>{
    const filters={players:4,holes:18,style:'strategy'} as const;
    expect(eligibleGames(filters)).toContain('Wolf');
    expect(eligibleGames(filters)).not.toContain('Birdies');
    expect(pickGame(filters,'Nassau',()=>0)).not.toBe('Nassau');
    expect(pickGame({players:2,holes:9,style:'easy'},null,()=>0)).not.toBeNull();
  });
});
