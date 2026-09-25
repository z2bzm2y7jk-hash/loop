import {NextResponse} from 'next/server';
import {ZodError} from 'zod';
import {sharedHoleCommandSchema} from '@/lib/contracts/round-sync';
import {currentAccount} from '@/lib/server/auth';
import {jsonBody,problem,validRequestOrigin} from '@/lib/server/http';
import {saveSharedHole} from '@/lib/server/shared-rounds';

export async function PUT(request:Request,{params}:{params:Promise<{id:string;hole:string}>}){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 const account=await currentAccount();if(!account)return problem('Sign in required.',401);
 try{
  const {id,hole}=await params,input=sharedHoleCommandSchema.parse(await jsonBody(request));
  if(input.roundId!==id||input.holeNumber!==Number(hole))return problem('The hole command does not match this round.');
  if(input.round.id!==id||!input.round.results[input.holeNumber-1])return problem('The round snapshot does not include this hole.');
  const result=await saveSharedHole(account,request.headers.get('x-loop-round-token'),id,input.holeNumber,input.expectedRoundRevision,input.commandId,input.round);
  if(result.kind==='forbidden')return problem('You do not have permission to change this round.',403);
  if(result.kind==='closed')return problem('This round is already closed.',409);
  if(result.kind==='conflict')return NextResponse.json({error:'Another player updated the round first.',shared:result.current},{status:409});
  return NextResponse.json({ok:true,revision:result.revision});
 }catch(error){if(error instanceof ZodError)return problem('The saved hole is not valid.');console.error(JSON.stringify({event:'shared_hole_save_failed'}));return problem('The hole could not be synced.',500)}
}
