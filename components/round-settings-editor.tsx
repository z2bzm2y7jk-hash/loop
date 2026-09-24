'use client';
import {Check,X} from 'lucide-react';
import type {Round} from '@/lib/types';
import {setupError} from '@/components/game-settings';
import {GamePicker} from '@/components/game-picker';

export function RoundSettingsEditor({round,onChange,onCancel,onSave}:{round:Round;onChange:(round:Round)=>void;onCancel:()=>void;onSave:()=>void}){
 const problem=!round.games.length?'Choose at least one game.':setupError(round);
 return <div className="modal-backdrop" onClick={onCancel}><section className="modal round-settings-modal" role="dialog" aria-modal="true" aria-labelledby="round-settings-title" onClick={event=>event.stopPropagation()}><button className="modal-close icon-button" aria-label="Close round settings" onClick={onCancel}><X/></button><div className="round-settings-intro"><span className="eyebrow">ACTIVE ROUND</span><h2 id="round-settings-title">Edit games and bet amounts</h2><p>Bet changes recalculate every saved hole. A newly added decision game, such as Wolf, begins on the next hole when earlier choices were not recorded.</p></div><GamePicker round={round} onChange={onChange}/>{problem&&<p className="error">{problem}</p>}<div className="round-settings-actions"><button className="secondary" onClick={onCancel}>Cancel</button><button className="primary" disabled={!!problem} onClick={onSave}><Check size={17}/> Save changes</button></div></section></div>
}
