'use client';
import {useState} from 'react';
import {CloudRain,Trash2,X} from 'lucide-react';
import {cancellationReasons} from '@/lib/round-lifecycle';
import type {Round} from '@/lib/types';

export function RoundCancelDialog({round,onClose,onCancel}:{round:Round;onClose:()=>void;onCancel:(keepBets:boolean,reason:string)=>Promise<void>|void}){
 const [reason,setReason]=useState<(typeof cancellationReasons)[number]>('Weather'),[otherReason,setOtherReason]=useState(''),[busy,setBusy]=useState(false);
 async function decide(keepBets:boolean){setBusy(true);try{await onCancel(keepBets,reason==='Other'?(otherReason.trim()||'Other'):reason)}finally{setBusy(false)}}
 const hasResults=round.results.length>0;
 return <div className="modal-backdrop" onClick={onClose}><section className="modal cancel-round-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-round-title" onClick={event=>event.stopPropagation()}><button className="modal-close icon-button" aria-label="Close" onClick={onClose}><X/></button><span className="cancel-weather"><CloudRain/></span><h2 id="cancel-round-title">End this round?</h2><p className="muted">You have {round.results.length} {round.results.length===1?'hole':'holes'} recorded. Choose what the group agreed should happen.</p><label>Why did the round end?<select value={reason} onChange={event=>setReason(event.target.value as typeof reason)}>{cancellationReasons.map(item=><option key={item}>{item}</option>)}</select></label>{reason==='Other'&&<label>Reason<input autoFocus maxLength={80} value={otherReason} placeholder="Add a short reason" onChange={event=>setOtherReason(event.target.value)}/></label>}{hasResults&&<button className="cancel-choice keep" disabled={busy} onClick={()=>decide(true)}><span><strong>Keep scores and bets as they stand</strong><small>The current balances become the final result and count in player and season stats.</small></span></button>}<button className="cancel-choice discard" disabled={busy} onClick={()=>decide(false)}><Trash2 size={19}/><span><strong>{hasResults?'Discard this round':'Cancel this round'}</strong><small>Remove its scores, bets, and statistics for everyone.</small></span></button><button className="text-button cancel-nevermind" disabled={busy} onClick={onClose}>Keep playing</button></section></div>;
}
