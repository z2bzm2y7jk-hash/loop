import {NextResponse} from 'next/server';
import {ZodError} from 'zod';
import {createSharedWeeklyEventSchema} from '@/lib/contracts/group-event-sync';
import type {SharedWeeklySnapshot} from '@/lib/contracts/group-event-sync';
import {currentAccount} from '@/lib/server/auth';
import {allowAttempt,jsonBody,problem,validRequestOrigin} from '@/lib/server/http';
import {createSharedWeeklyEvent} from '@/lib/server/shared-group-events';

export async function POST(request:Request){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 if(!allowAttempt(request,'weekly-event-share',20,10*60*1000))return problem('Too many sharing attempts. Try again shortly.',429);
 const account=await currentAccount();if(!account)return problem('Sign in required.',401);
 try{
  const input=createSharedWeeklyEventSchema.parse(await jsonBody(request));
  const result=await createSharedWeeklyEvent(account,input.snapshot as SharedWeeklySnapshot,input.scope);
  return NextResponse.json(result,{status:201});
 }catch(error){
  if(error instanceof ZodError)return problem('The weekly game could not be shared because some details are invalid.');
  if(error instanceof Error&&['EVENT_ID_IN_USE','GROUP_ID_IN_USE','EVENT_CONFLICT'].includes(error.message))return problem('That weekly game changed before it could be shared.',409);
  console.error(JSON.stringify({event:'shared_weekly_event_create_failed'}));return problem('The weekly game could not be shared.',500);
 }
}
