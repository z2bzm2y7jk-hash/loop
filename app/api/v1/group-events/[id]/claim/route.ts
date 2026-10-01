import {NextResponse} from 'next/server';
import {ZodError,z} from 'zod';
import {currentSharedActor} from '@/lib/server/guest-auth';
import {jsonBody,problem,validRequestOrigin} from '@/lib/server/http';
import {claimSharedWeeklyPlayer} from '@/lib/server/shared-group-events';

const schema=z.object({playerId:z.string().min(1).max(80)});

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 const actor=await currentSharedActor();if(!actor)return problem('Open the invitation and continue as a guest.',401);
 try{
  const {id}=await params,{playerId}=schema.parse(await jsonBody(request)),result=await claimSharedWeeklyPlayer(actor,request.headers.get('x-loop-event-token'),id,playerId);
  if(result.kind==='forbidden')return problem('This weekly-game link is invalid or has expired.',403);
  if(result.kind==='missing')return problem('That golfer is not in this weekly game.',404);
  if(result.kind==='taken')return problem('Another member already joined as that golfer.',409);
  return NextResponse.json({shared:result.current});
 }catch(error){if(error instanceof ZodError)return problem('Choose a golfer from this weekly game.');console.error(JSON.stringify({event:'shared_weekly_player_claim_failed'}));return problem('Your group identity could not be saved.',500)}
}
