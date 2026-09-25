import 'server-only';
import {createHash,randomBytes,randomUUID,scrypt as nodeScrypt,timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';
import {and,eq,gt} from 'drizzle-orm';
import {databaseState} from '@/lib/server/db/client';
import {sessions,userProfiles,users} from '@/lib/server/db/schema';
import {defaultAccountPreferences,type Account,type AccountPreferences} from '@/lib/account';
import {serverEnvironment} from '@/lib/server/env';

export const SESSION_COOKIE='loop_session';
const SESSION_DAYS=30;

function scrypt(input:string,salt:Buffer,length:number,options:{N:number;r:number;p:number;maxmem:number}){
 return new Promise<Buffer>((resolve,reject)=>nodeScrypt(input,salt,length,options,(error,derived)=>error?reject(error):resolve(derived)));
}

export function database(){
 const state=databaseState();
 if(!state)throw new Error('Database is not configured');
 return state.database;
}

function passwordInput(password:string){
 return `${password}\0${serverEnvironment().AUTH_SECRET??''}`;
}

export async function hashPassword(password:string){
 const salt=randomBytes(16);
 const derived=await scrypt(passwordInput(password),salt,64,{N:16384,r:8,p:1,maxmem:64*1024*1024});
 return `v1$scrypt$16384$8$1$${salt.toString('base64url')}$${derived.toString('base64url')}`;
}

export async function verifyPassword(password:string,encoded:string|null){
 if(!encoded)return false;
 const [version,algorithm,n,r,p,saltText,hashText]=encoded.split('$');
 if(version!=='v1'||algorithm!=='scrypt'||!saltText||!hashText)return false;
 const expected=Buffer.from(hashText,'base64url');
 const actual=await scrypt(passwordInput(password),Buffer.from(saltText,'base64url'),expected.length,{N:Number(n),r:Number(r),p:Number(p),maxmem:64*1024*1024});
 return actual.length===expected.length&&timingSafeEqual(actual,expected);
}

export function hashSessionToken(token:string){
 return createHash('sha256').update(`${token}.${serverEnvironment().AUTH_SECRET??''}`).digest('hex');
}

export function hashRoundInviteToken(token:string){
 return createHash('sha256').update(`${token}.round-invite.${serverEnvironment().AUTH_SECRET??''}`).digest('hex');
}

export async function createSession(userId:string){
 const token=randomBytes(32).toString('base64url');
 const expiresAt=new Date(Date.now()+SESSION_DAYS*24*60*60*1000);
 await database().insert(sessions).values({id:randomUUID(),userId,tokenHash:hashSessionToken(token),expiresAt,lastSeenAt:new Date()});
 return {token,expiresAt};
}

export function accountFromRow(row:{id:string;email:string;displayName:string;handicap:string|null;preferences:AccountPreferences|null}):Account{
 return {id:row.id,email:row.email,displayName:row.displayName,handicap:Number(row.handicap??0),preferences:{...defaultAccountPreferences,...(row.preferences??{})}};
}

export async function currentAccount():Promise<Account|null>{
 const token=(await cookies()).get(SESSION_COOKIE)?.value;
 if(!token)return null;
 const now=new Date();
 const rows=await database().select({id:users.id,email:users.email,displayName:users.displayName,handicap:userProfiles.handicap,preferences:userProfiles.preferences})
  .from(sessions)
  .innerJoin(users,eq(sessions.userId,users.id))
  .leftJoin(userProfiles,eq(userProfiles.userId,users.id))
  .where(and(eq(sessions.tokenHash,hashSessionToken(token)),gt(sessions.expiresAt,now),eq(users.status,'active')))
  .limit(1);
 return rows[0]?accountFromRow(rows[0]):null;
}

export async function deleteCurrentSession(){
 const token=(await cookies()).get(SESSION_COOKIE)?.value;
 if(token)await database().delete(sessions).where(eq(sessions.tokenHash,hashSessionToken(token)));
}

export function sessionCookie(token:string,expiresAt:Date){
 return {name:SESSION_COOKIE,value:token,httpOnly:true,secure:serverEnvironment().NODE_ENV==='production',sameSite:'lax' as const,path:'/',expires:expiresAt};
}

export function expiredSessionCookie(){
 return {name:SESSION_COOKIE,value:'',httpOnly:true,secure:serverEnvironment().NODE_ENV==='production',sameSite:'lax' as const,path:'/',expires:new Date(0)};
}
