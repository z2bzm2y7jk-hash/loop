import {randomUUID} from 'node:crypto';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {currentAccount,database} from '@/lib/server/auth';
import {supportRequests} from '@/lib/server/db/schema';
import {sendSupportNotification} from '@/lib/server/email';
import {allowAttempt,jsonBody,problem,validRequestOrigin} from '@/lib/server/http';

const schema=z.object({email:z.string().trim().toLowerCase().email().max(254),category:z.enum(['account','privacy','bug','other']),message:z.string().trim().min(12,'Add a little more detail so we can help.').max(2000)});

export async function POST(request:Request){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 if(!allowAttempt(request,'support',5,60*60*1000))return problem('Too many requests. Try again later.',429);
 try{
  const input=schema.parse(await jsonBody(request,20_000)),account=await currentAccount(),id=randomUUID(),reference=id.slice(0,8).toUpperCase();
  await database().insert(supportRequests).values({id,userId:account?.id,email:input.email,category:input.category,message:input.message});
  try{await sendSupportNotification({reference,...input})}catch{console.error(JSON.stringify({event:'support_notification_failed',reference}))}
  return NextResponse.json({ok:true,reference},{status:201});
 }catch(error){
  if(error instanceof z.ZodError)return problem(error.issues[0]?.message??'Check the support request.');
  console.error(JSON.stringify({event:'support_request_failed'}));
  return problem('Your request could not be saved. Try again later.',500);
 }
}
