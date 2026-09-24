import {NextResponse} from 'next/server';
import {eq} from 'drizzle-orm';
import {z} from 'zod';
import {createSession,currentAccount,database,hashPassword,sessionCookie,verifyPassword} from '@/lib/server/auth';
import {sessions,users} from '@/lib/server/db/schema';
import {allowAttempt,jsonBody,problem,validRequestOrigin} from '@/lib/server/http';

const schema=z.object({currentPassword:z.string().min(1).max(128),newPassword:z.string().min(10,'Use at least 10 characters.').max(128)});

export async function POST(request:Request){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 if(!allowAttempt(request,'password',5,30*60*1000))return problem('Too many attempts. Try again later.',429);
 const account=await currentAccount();
 if(!account)return problem('Sign in required.',401);
 try{
  const input=schema.parse(await jsonBody(request,20_000));
  const rows=await database().select({passwordHash:users.passwordHash}).from(users).where(eq(users.id,account.id)).limit(1);
  if(!await verifyPassword(input.currentPassword,rows[0]?.passwordHash??null))return problem('Current password is incorrect.',401);
  const passwordHash=await hashPassword(input.newPassword);
  await database().transaction(async tx=>{
   await tx.update(users).set({passwordHash}).where(eq(users.id,account.id));
   await tx.delete(sessions).where(eq(sessions.userId,account.id));
  });
  const created=await createSession(account.id);
  const response=NextResponse.json({ok:true});
  response.cookies.set(sessionCookie(created.token,created.expiresAt));
  return response;
 }catch(error){
  if(error instanceof z.ZodError)return problem(error.issues[0]?.message??'Check your password.');
  console.error(JSON.stringify({event:'password_change_failed'}));
  return problem('Password could not be changed.',500);
 }
}
