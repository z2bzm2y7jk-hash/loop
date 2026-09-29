import 'server-only';
import {randomBytes,randomUUID} from 'node:crypto';
import {eq} from 'drizzle-orm';
import {database,hashEmailVerificationToken,hashPasswordResetToken} from '@/lib/server/auth';
import {emailVerificationTokens,passwordResetTokens} from '@/lib/server/db/schema';
import {emailDeliveryReady,sendPasswordResetEmail,sendVerificationEmail} from '@/lib/server/email';

function token(){return randomBytes(32).toString('base64url')}

export async function issuePasswordReset(input:{userId:string;email:string;displayName:string}){
 if(!emailDeliveryReady())return false;
 const raw=token(),tokenHash=hashPasswordResetToken(raw);
 await database().transaction(async tx=>{
  await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId,input.userId));
  await tx.insert(passwordResetTokens).values({id:randomUUID(),userId:input.userId,tokenHash,expiresAt:new Date(Date.now()+30*60*1000)});
 });
 try{return await sendPasswordResetEmail({...input,token:raw})}catch(error){
  await database().delete(passwordResetTokens).where(eq(passwordResetTokens.tokenHash,tokenHash));
  throw error;
 }
}

export async function issueEmailVerification(input:{userId:string;email:string;displayName:string}){
 if(!emailDeliveryReady())return false;
 const raw=token(),tokenHash=hashEmailVerificationToken(raw);
 await database().transaction(async tx=>{
  await tx.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId,input.userId));
  await tx.insert(emailVerificationTokens).values({id:randomUUID(),userId:input.userId,tokenHash,expiresAt:new Date(Date.now()+24*60*60*1000)});
 });
 try{return await sendVerificationEmail({...input,token:raw})}catch(error){
  await database().delete(emailVerificationTokens).where(eq(emailVerificationTokens.tokenHash,tokenHash));
  throw error;
 }
}
