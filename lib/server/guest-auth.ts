import 'server-only';
import {randomBytes,randomUUID} from 'node:crypto';
import {cookies} from 'next/headers';
import {and,eq,gt} from 'drizzle-orm';
import type {Account} from '@/lib/account';
import {defaultAccountPreferences} from '@/lib/account';
import {database,currentAccount,hashGuestSessionToken} from './auth';
import {guestSessions} from './db/schema';
import {serverEnvironment} from './env';

export const GUEST_COOKIE='round_settled_guest';
const GUEST_DAYS=30;
const GUEST_COLORS=['#c8d9e6','#d9e4d2','#ead8c8','#d9d0e7','#e7d9ad','#c9ded7'];

export type GuestIdentity={kind:'guest';id:string;displayName:string;color:string};
export type SharedActor={kind:'account'|'guest';id:string;displayName:string;color:string};

export async function createGuestSession(displayName:string){
 const token=randomBytes(32).toString('base64url'),id=randomUUID(),expiresAt=new Date(Date.now()+GUEST_DAYS*24*60*60*1000);
 const color=GUEST_COLORS[Number.parseInt(id.slice(0,2),16)%GUEST_COLORS.length];
 const guest:GuestIdentity={kind:'guest',id,displayName:displayName.trim(),color};
 await database().insert(guestSessions).values({id,displayName:guest.displayName,color,tokenHash:hashGuestSessionToken(token),expiresAt,lastSeenAt:new Date()});
 return {guest,token,expiresAt};
}

export async function currentGuest():Promise<GuestIdentity|null>{
 const token=(await cookies()).get(GUEST_COOKIE)?.value;
 if(!token)return null;
 const rows=await database().select({id:guestSessions.id,displayName:guestSessions.displayName,color:guestSessions.color})
  .from(guestSessions).where(and(eq(guestSessions.tokenHash,hashGuestSessionToken(token)),gt(guestSessions.expiresAt,new Date()))).limit(1);
 return rows[0]?{kind:'guest',...rows[0]}:null;
}

export async function deleteCurrentGuest(){
 const token=(await cookies()).get(GUEST_COOKIE)?.value;
 if(token)await database().update(guestSessions).set({expiresAt:new Date()}).where(eq(guestSessions.tokenHash,hashGuestSessionToken(token)));
}

export async function currentSharedActor():Promise<SharedActor|null>{
 const account=await currentAccount();
 if(account)return {kind:'account',id:account.id,displayName:account.displayName,color:account.preferences.color};
 return currentGuest();
}

export function guestAsAccount(guest:GuestIdentity):Account{
 return {kind:'guest',id:guest.id,email:'',displayName:guest.displayName,emailVerified:false,emailVerificationAvailable:false,handicap:0,preferences:{...defaultAccountPreferences,color:guest.color}};
}

export function guestCookie(token:string,expiresAt:Date){
 return {name:GUEST_COOKIE,value:token,httpOnly:true,secure:serverEnvironment().NODE_ENV==='production',sameSite:'lax' as const,path:'/',expires:expiresAt};
}

export function expiredGuestCookie(){
 return {name:GUEST_COOKIE,value:'',httpOnly:true,secure:serverEnvironment().NODE_ENV==='production',sameSite:'lax' as const,path:'/',expires:new Date(0)};
}
