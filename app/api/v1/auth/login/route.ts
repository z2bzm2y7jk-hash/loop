import {NextResponse} from 'next/server';
import {eq} from 'drizzle-orm';
import {z} from 'zod';
import {accountFromRow,createSession,database,sessionCookie,verifyPassword} from '@/lib/server/auth';
import {userProfiles,users} from '@/lib/server/db/schema';
import {allowAttempt,jsonBody,problem,validRequestOrigin} from '@/lib/server/http';

const schema=z.object({email:z.string().trim().toLowerCase().email().max(254),password:z.string().min(1).max(128)});

export async function POST(request:Request){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 if(!allowAttempt(request,'login',10,15*60*1000))return problem('Too many attempts. Try again in a few minutes.',429);
 try{
  const input=schema.parse(await jsonBody(request,20_000));
  const rows=await database().select({id:users.id,email:users.email,displayName:users.displayName,passwordHash:users.passwordHash,status:users.status,handicap:userProfiles.handicap,preferences:userProfiles.preferences})
   .from(users).leftJoin(userProfiles,eq(userProfiles.userId,users.id)).where(eq(users.email,input.email)).limit(1);
  const user=rows[0];
  if(!user||user.status!=='active'||!await verifyPassword(input.password,user.passwordHash))return problem('Email or password is incorrect.',401);
  const created=await createSession(user.id);
  const response=NextResponse.json({account:accountFromRow(user)});
  response.cookies.set(sessionCookie(created.token,created.expiresAt));
  return response;
 }catch(error){
  if(error instanceof z.ZodError)return problem('Enter a valid email and password.');
  console.error(JSON.stringify({event:'login_failed'}));
  return problem('Sign in is temporarily unavailable.',500);
 }
}
