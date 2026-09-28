import {NextResponse} from 'next/server';
import {ZodError} from 'zod';
import {updateSharedWeeklyEventSchema} from '@/lib/contracts/group-event-sync';
import {currentAccount} from '@/lib/server/auth';
import {jsonBody,problem,validRequestOrigin} from '@/lib/server/http';
import {readSharedWeeklyEvent,updateSharedWeeklyEvent} from '@/lib/server/shared-group-events';

export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 const account=await currentAccount();if(!account)return problem('Sign in required.',401);
 const {id}=await params,token=request.headers.get('x-loop-event-token'),shared=await readSharedWeeklyEvent(id,account.id,token);
 if(!shared)return problem('This weekly-game link is invalid or has expired.',404);
 return NextResponse.json({shared},{headers:{ETag:`"${shared.revision}"`,'Cache-Control':'private, no-store'}});
}

export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 const account=await currentAccount();if(!account)return problem('Sign in required.',401);
 try{
  const {id}=await params,input=updateSharedWeeklyEventSchema.parse(await jsonBody(request));
  const result=await updateSharedWeeklyEvent(account,request.headers.get('x-loop-event-token'),id,input.expectedRevision,input.event);
  if(result.kind==='forbidden')return problem('This link does not allow lineup changes.',403);
  if(result.kind==='invalid')return problem(result.reason,400);
  if(result.kind==='conflict')return NextResponse.json({error:'The weekly game changed on another phone.',shared:result.current},{status:409});
  return NextResponse.json({shared:result.current});
 }catch(error){if(error instanceof ZodError)return problem('The weekly-game update is not valid.');console.error(JSON.stringify({event:'shared_weekly_event_update_failed'}));return problem('The weekly game could not be updated.',500)}
}
