import {currentAccount} from '@/lib/server/auth';
import {problem,validRequestOrigin} from '@/lib/server/http';
import {revokeSharedWeeklyInvite} from '@/lib/server/shared-group-events';

export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 const account=await currentAccount();if(!account)return problem('Sign in required.',401);
 const {id}=await params,result=await revokeSharedWeeklyInvite(account,request.headers.get('x-loop-event-token'),id);
 if(result.kind==='forbidden')return problem('Only the weekly-game captain can stop sharing.',403);
 if(result.kind==='missing')return problem('This weekly-game link is already inactive.',404);
 return new Response(null,{status:204});
}
