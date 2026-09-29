import {NextResponse} from 'next/server';
import {eq} from 'drizzle-orm';
import {z} from 'zod';
import {database} from '@/lib/server/auth';
import {users} from '@/lib/server/db/schema';
import {emailDeliveryReady} from '@/lib/server/email';
import {issuePasswordReset} from '@/lib/server/account-tokens';
import {allowAttempt,jsonBody,problem,validRequestOrigin} from '@/lib/server/http';

const schema=z.object({email:z.string().trim().toLowerCase().email().max(254)});

export async function POST(request:Request){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 if(!allowAttempt(request,'password-reset-request',5,30*60*1000))return problem('Too many requests. Try again later.',429);
 try{
  const input=schema.parse(await jsonBody(request,10_000));
  if(!emailDeliveryReady())return NextResponse.json({ok:true,delivery:'unavailable'});
  const rows=await database().select({id:users.id,email:users.email,displayName:users.displayName,status:users.status}).from(users).where(eq(users.email,input.email)).limit(1);
  const user=rows[0];
  if(user?.status==='active')await issuePasswordReset({userId:user.id,email:user.email,displayName:user.displayName});
  return NextResponse.json({ok:true,delivery:'sent'});
 }catch(error){
  if(error instanceof z.ZodError)return problem('Enter a valid email address.');
  console.error(JSON.stringify({event:'password_reset_request_failed'}));
  return problem('Recovery email could not be sent. Try again later.',503);
 }
}
