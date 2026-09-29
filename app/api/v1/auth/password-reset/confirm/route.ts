import {NextResponse} from 'next/server';
import {and,eq,gt,isNull} from 'drizzle-orm';
import {z} from 'zod';
import {accountFromRow,createSession,database,hashPassword,hashPasswordResetToken,sessionCookie} from '@/lib/server/auth';
import {passwordResetTokens,sessions,userProfiles,users} from '@/lib/server/db/schema';
import {allowAttempt,jsonBody,problem,validRequestOrigin} from '@/lib/server/http';

const schema=z.object({token:z.string().min(30).max(200),password:z.string().min(10,'Use at least 10 characters.').max(128)});

export async function POST(request:Request){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 if(!allowAttempt(request,'password-reset-confirm',8,30*60*1000))return problem('Too many attempts. Try again later.',429);
 try{
  const input=schema.parse(await jsonBody(request,20_000)),now=new Date();
  const rows=await database().select({tokenId:passwordResetTokens.id,id:users.id,email:users.email,displayName:users.displayName,emailVerifiedAt:users.emailVerifiedAt,status:users.status,handicap:userProfiles.handicap,preferences:userProfiles.preferences})
   .from(passwordResetTokens).innerJoin(users,eq(passwordResetTokens.userId,users.id)).leftJoin(userProfiles,eq(userProfiles.userId,users.id))
   .where(and(eq(passwordResetTokens.tokenHash,hashPasswordResetToken(input.token)),gt(passwordResetTokens.expiresAt,now),isNull(passwordResetTokens.usedAt),eq(users.status,'active'))).limit(1);
  const user=rows[0];
  if(!user)return problem('This reset link is invalid or has expired.',400);
  const passwordHash=await hashPassword(input.password);
  await database().transaction(async tx=>{
   await tx.update(users).set({passwordHash}).where(eq(users.id,user.id));
   await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId,user.id));
   await tx.delete(sessions).where(eq(sessions.userId,user.id));
  });
  const created=await createSession(user.id);
  const response=NextResponse.json({ok:true,account:accountFromRow(user)});
  response.cookies.set(sessionCookie(created.token,created.expiresAt));
  return response;
 }catch(error){
  if(error instanceof z.ZodError)return problem(error.issues[0]?.message??'Check the new password.');
  console.error(JSON.stringify({event:'password_reset_confirm_failed'}));
  return problem('Password could not be reset.',500);
 }
}
