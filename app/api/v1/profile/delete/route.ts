import {NextResponse} from 'next/server';
import {eq,or} from 'drizzle-orm';
import {z} from 'zod';
import {currentAccount,database,expiredSessionCookie,verifyPassword} from '@/lib/server/auth';
import {emailVerificationTokens,groupEventRevisions,groupMembers,holeResults,holeRevisions,passwordResetTokens,players,roundPlayers,sessions,supportRequests,userAppData,userProfiles,users} from '@/lib/server/db/schema';
import {allowAttempt,jsonBody,problem,validRequestOrigin} from '@/lib/server/http';

const schema=z.object({password:z.string().min(1).max(128),confirmation:z.literal('DELETE')});

export async function POST(request:Request){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 if(!allowAttempt(request,'account-delete',4,60*60*1000))return problem('Too many attempts. Try again later.',429);
 const account=await currentAccount();
 if(!account)return problem('Sign in required.',401);
 try{
  const input=schema.parse(await jsonBody(request,20_000));
  const rows=await database().select({passwordHash:users.passwordHash}).from(users).where(eq(users.id,account.id)).limit(1);
  if(!await verifyPassword(input.password,rows[0]?.passwordHash??null))return problem('Password is incorrect.',401);
  const anonymousEmail=`deleted+${account.id}@deleted.loop.invalid`;
  await database().transaction(async tx=>{
   await tx.delete(sessions).where(eq(sessions.userId,account.id));
   await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId,account.id));
   await tx.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId,account.id));
   await tx.delete(userProfiles).where(eq(userProfiles.userId,account.id));
   await tx.delete(userAppData).where(eq(userAppData.userId,account.id));
   await tx.delete(groupMembers).where(eq(groupMembers.userId,account.id));
   await tx.delete(supportRequests).where(or(eq(supportRequests.userId,account.id),eq(supportRequests.email,account.email)));
   await tx.update(players).set({linkedUserId:null,displayName:'Former player',handicap:'0.0',color:'#d9e4d2'}).where(eq(players.linkedUserId,account.id));
   await tx.update(roundPlayers).set({linkedUserId:null,displayName:'Former player',handicap:'0.0',color:'#d9e4d2'}).where(eq(roundPlayers.linkedUserId,account.id));
   await tx.update(holeResults).set({savedByUserId:null}).where(eq(holeResults.savedByUserId,account.id));
   await tx.update(holeRevisions).set({savedByUserId:null}).where(eq(holeRevisions.savedByUserId,account.id));
   await tx.update(groupEventRevisions).set({savedByUserId:null}).where(eq(groupEventRevisions.savedByUserId,account.id));
   await tx.update(users).set({email:anonymousEmail,displayName:'Deleted golfer',passwordHash:null,emailVerifiedAt:null,status:'deleted'}).where(eq(users.id,account.id));
  });
  const response=NextResponse.json({ok:true});
  response.cookies.set(expiredSessionCookie());
  return response;
 }catch(error){
  if(error instanceof z.ZodError)return problem('Type DELETE and enter your current password.');
  console.error(JSON.stringify({event:'account_deletion_failed'}));
  return problem('Account could not be deleted. Try again later.',500);
 }
}
