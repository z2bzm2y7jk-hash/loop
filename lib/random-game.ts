import {library} from './library';
import {gameFits} from './game-catalog';
import type {Game} from './types';

export type GameStyle = 'any' | 'easy' | 'strategy';
export type GamePick = {players:number;holes:9|18;style:GameStyle};

const easy = new Set<Game>(['Skins','Match Play','Greenies','Birdies','Sandies','Snake','Dots']);
const strategy = new Set<Game>(['Nassau','Wolf','Match Play','Sixes','Vegas','Hammer']);

export function eligibleGames({players,holes,style}:GamePick):Game[]{
  if (!Number.isInteger(players) || players<2 || players>8) return [];
  return library.map(item=>item.name).filter(game=>
    gameFits(game,players,holes)&&
    (style==='any'||(style==='easy'?easy:strategy).has(game))
  );
}

export function pickGame(filters:GamePick,previous:Game|null=null,random=Math.random):Game|null{
  const eligible=eligibleGames(filters);
  const pool=eligible.length>1?eligible.filter(game=>game!==previous):eligible;
  if(!pool.length)return null;
  return pool[Math.min(pool.length-1,Math.max(0,Math.floor(random()*pool.length)))];
}
