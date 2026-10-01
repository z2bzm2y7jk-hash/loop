'use client';
import {useState,type FormEvent} from 'react';
import Link from 'next/link';
import {ArrowRight,Eye,Flag,ShieldCheck,Users} from 'lucide-react';
import type {Account} from '@/lib/account';
import type {GuestInvite} from '@/lib/guest-invite';
import {BrandLockup} from './brand-lockup';

export function GuestAccess({invite,onGuest,onSignIn}:{invite:GuestInvite;onGuest:(account:Account)=>void;onSignIn:()=>void}){
 const [displayName,setDisplayName]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submit(event:FormEvent){
  event.preventDefault();setBusy(true);setError('');
  try{
   const response=await fetch('/api/v1/guest/session',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({displayName,invite})});
   const result=await response.json() as {account?:Account;error?:string};
   if(!response.ok||!result.account)throw new Error(result.error||'This invitation could not be opened.');
   onGuest(result.account);
  }catch(cause){setError(cause instanceof Error?cause.message:'This invitation could not be opened.')}finally{setBusy(false)}
 }
 const weekly=invite.kind==='event';
 return <main id="main-content" className="guest-access-page"><section className="guest-access-card"><Link className="auth-brand" href="/"><BrandLockup/></Link><span className="eyebrow"><Flag size={14}/> YOU’RE INVITED</span><h1>{weekly?'Join the weekly game.':'Follow the round live.'}</h1><p className="guest-access-intro">Enter your name and go straight to the shared {weekly?'groups and scorecards':'scorecard'}. No email, password, or account is required.</p><div className="guest-access-facts"><span><Eye/><strong>See the same live scores</strong></span><span><ShieldCheck/><strong>The captain controls access</strong></span><span><Users/><strong>Changes show who made them</strong></span></div><form onSubmit={submit}><label>Your name<input autoFocus autoComplete="name" required minLength={2} maxLength={80} value={displayName} onChange={event=>setDisplayName(event.target.value)} placeholder="Chab"/></label>{error&&<p className="auth-error" role="alert">{error}</p>}<button className="auth-submit" disabled={busy}>{busy?'Opening the game…':'Continue as guest'} {!busy&&<ArrowRight/>}</button></form><button type="button" className="guest-sign-in" onClick={onSignIn}>Already have an account? Sign in</button><p className="guest-access-fine">Your guest name is saved with shared activity so the group can see who made a change. By continuing, you agree to the <Link href="/privacy">privacy policy</Link> and <Link href="/responsible-play">responsible-play guide</Link>.</p></section></main>;
}
