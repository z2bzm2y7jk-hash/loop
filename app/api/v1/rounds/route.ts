import {NextResponse} from 'next/server';
import {ZodError} from 'zod';
import {createSharedRoundSchema} from '@/lib/contracts/round-sync';
import {currentAccount} from '@/lib/server/auth';
import {allowAttempt,jsonBody,problem,validRequestOrigin} from '@/lib/server/http';
import {createSharedRound} from '@/lib/server/shared-rounds';

export async function POST(request:Request){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 if(!allowAttempt(request,'round-share',20,10*60*1000))return problem('Too many sharing attempts. Try again shortly.',429);
 const account=await currentAccount();if(!account)return problem('Sign in required.',401);
 try{
  const input=createSharedRoundSchema.parse(await jsonBody(request));
  const shared=await createSharedRound(account,input.round,input.scope);
  return NextResponse.json({shared},{status:201});
 }catch(error){
  if(error instanceof ZodError)return problem('The round could not be shared because some data is invalid.');
  if(error instanceof Error&&error.message==='ROUND_ID_IN_USE')return problem('That round ID is already in use.',409);
  console.error(JSON.stringify({event:'shared_round_create_failed'}));return problem('The live round could not be started.',500);
 }
}
