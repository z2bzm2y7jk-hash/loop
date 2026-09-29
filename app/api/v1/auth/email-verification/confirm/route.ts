import {NextResponse} from 'next/server';
import {and,eq,gt,isNull} from 'drizzle-orm';
import {z} from 'zod';
import {database,hashEmailVerificationToken} from '@/lib/server/auth';
import {emailVerificationTokens,users} from '@/lib/server/db/schema';
import {allowAttempt,jsonBody,problem,validRequestOrigin} from '@/lib/server/http';

const schema=z.object({token:z.string().min(30).max(200)});

export async function POST(request:Request){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 if(!allowAttempt(request,'email-verification-confirm',8,30*60*1000))return problem('Too many attempts. Try again later.',429);
 try{
  const input=schema.parse(await jsonBody(request,10_000)),now=new Date();
  const rows=await database().select({id:emailVerificationTokens.id,userId:emailVerificationTokens.userId}).from(emailVerificationTokens)
   .innerJoin(users,eq(emailVerificationTokens.userId,users.id))
   .where(and(eq(emailVerificationTokens.tokenHash,hashEmailVerificationToken(input.token)),gt(emailVerificationTokens.expiresAt,now),isNull(emailVerificationTokens.usedAt),eq(users.status,'active'))).limit(1);
  const match=rows[0];
  if(!match)return problem('This verification link is invalid or has expired.',400);
  await database().transaction(async tx=>{
   await tx.update(users).set({emailVerifiedAt:now}).where(eq(users.id,match.userId));
   await tx.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId,match.userId));
  });
  return NextResponse.json({ok:true});
 }catch(error){
  if(error instanceof z.ZodError)return problem('This verification link is invalid.');
  console.error(JSON.stringify({event:'email_verification_confirm_failed'}));
  return problem('Email could not be verified.',500);
 }
}
