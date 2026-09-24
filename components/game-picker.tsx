'use client';
import {Check,LockKeyhole} from 'lucide-react';
import {gameMetadata,gameFits} from '@/lib/game-catalog';
import {library} from '@/lib/library';
import {defaultRules} from '@/lib/rules';
import type {Round} from '@/lib/types';
import {GameSettings} from '@/components/game-settings';

export function GamePicker({round,onChange}:{round:Round;onChange:(round:Round)=>void}){
 function toggle(name:(typeof library)[number]['name']){
  onChange({...round,games:round.games.includes(name)?round.games.filter(game=>game!==name):[...round.games,name],config:{...round.config,rules:round.config.rules??defaultRules()}})
 }
 return <>
  <section className="stakes-panel" aria-labelledby="stakes-heading">
   <div className="stakes-panel-heading"><div><span className="eyebrow">SET YOUR OWN VALUES</span><h2 id="stakes-heading">Bet amounts and rules</h2><p>Enter a whole-dollar amount. Changes update the payout math automatically.</p></div><span className="beta-access">ALL GAMES UNLOCKED</span></div>
   {round.games.length?<GameSettings round={round} onChange={onChange}/>:<div className="empty">Choose at least one game below, then set its wager here.</div>}
  </section>
  <section className="game-picker-section" aria-labelledby="game-picker-heading">
   <div className="section-heading"><div><h2 id="game-picker-heading">Add or remove games</h2><p className="muted">Availability is based on your player count and number of holes.</p></div></div>
   <div className="game-select">{library.map(game=>{const fits=gameFits(game.name,round.players.length,round.holes),meta=gameMetadata[game.name];return <button key={game.name} aria-pressed={round.games.includes(game.name)} className={`${round.games.includes(game.name)?'chosen ':''}${!fits?'unavailable':''}`} disabled={!fits} onClick={()=>toggle(game.name)}><div><strong>{game.name}</strong><span className="check-box">{round.games.includes(game.name)?<Check size={14}/>:!fits?<LockKeyhole size={12}/>:null}</span></div><p>{game.description}</p><small>{fits?`${game.players} · Typical ${game.stakes}`:`Needs ${meta.minPlayers}${meta.maxPlayers!==meta.minPlayers?`–${meta.maxPlayers}`:''} players${round.holes===9&&!meta.worksFor9?' · 18 holes':''}`}</small></button>})}</div>
  </section>
 </>
}
