import {NextResponse} from 'next/server';
import {ZodError,z} from 'zod';
import {sharedRoundSchema} from '@/lib/contracts/round-sync';
import {currentAccount} from '@/lib/server/auth';
import {jsonBody,problem,validRequestOrigin} from '@/lib/server/http';
import {startSharedWeeklyPod} from '@/lib/server/shared-group-events';

const schema=z.object({round:sharedRoundSchema,scope:z.enum(['view','score']).default('score')});

export async function POST(request:Request,{params}:{params:Promise<{id:string;podId:string}>}){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 const account=await currentAccount();if(!account)return problem('Sign in required.',401);
 try{
  const [{id,podId},input]=await Promise.all([params,jsonBody(request).then(body=>schema.parse(body))]);
  const result=await startSharedWeeklyPod(account,request.headers.get('x-loop-event-token'),id,podId,input.round,input.scope);
  if(result.kind==='forbidden')return problem('Only a weekly-game organizer can start a playing group.',403);
  if(result.kind==='missing')return problem('That playing group no longer exists.',404);
  if(result.kind==='invalid')return problem(result.reason,400);
  if(result.kind==='taken')return NextResponse.json({error:'Another player already started this group.',sharedEvent:result.current},{status:409});
  if(result.kind==='conflict')return NextResponse.json({error:'The weekly game changed on another phone.',sharedEvent:result.current},{status:409});
  return NextResponse.json({sharedRound:result.sharedRound,sharedEvent:result.current},{status:201});
 }catch(error){if(error instanceof ZodError)return problem('The playing-group round is not valid.');if(error instanceof Error&&error.message==='ROUND_ID_IN_USE')return problem('That round is already active.',409);console.error(JSON.stringify({event:'shared_weekly_pod_start_failed'}));return problem('The playing group could not be started.',500)}
}
