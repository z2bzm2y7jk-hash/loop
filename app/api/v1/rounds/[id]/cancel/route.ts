import {NextResponse} from 'next/server';
import {ZodError} from 'zod';
import {cancelSharedRoundSchema} from '@/lib/contracts/round-sync';
import {currentAccount} from '@/lib/server/auth';
import {jsonBody,problem,validRequestOrigin} from '@/lib/server/http';
import {cancelSharedRound} from '@/lib/server/shared-rounds';

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 const account=await currentAccount();if(!account)return problem('Sign in required.',401);
 try{
  const {id}=await params,input=cancelSharedRoundSchema.parse(await jsonBody(request));
  const result=await cancelSharedRound(account,request.headers.get('x-loop-round-token'),id,input.expectedRoundRevision,input.reason,input.keepBets);
  if(result.kind==='forbidden')return problem('Only the round captain can cancel a shared round.',403);
  if(result.kind==='conflict')return NextResponse.json({error:'The round changed before it could be cancelled.',shared:result.current},{status:409});
  return NextResponse.json({ok:true,revision:result.revision,ended:result.ended});
 }catch(error){if(error instanceof ZodError)return problem('Choose a reason before ending the round.');console.error(JSON.stringify({event:'shared_round_cancel_failed'}));return problem('The round could not be cancelled.',500)}
}
