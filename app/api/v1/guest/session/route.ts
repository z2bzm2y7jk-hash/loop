import {NextResponse} from 'next/server';
import {z} from 'zod';
import {authorizeSharedWeeklyEvent} from '@/lib/server/shared-group-events';
import {authorizeSharedRound} from '@/lib/server/shared-rounds';
import {createGuestSession,currentGuest,deleteCurrentGuest,expiredGuestCookie,guestAsAccount,guestCookie,type SharedActor} from '@/lib/server/guest-auth';
import {allowAttempt,jsonBody,problem,validRequestOrigin} from '@/lib/server/http';

const schema=z.object({
 displayName:z.string().trim().min(2,'Enter your name so the group knows who joined.').max(80),
 invite:z.discriminatedUnion('kind',[
  z.object({kind:z.literal('round'),id:z.string().uuid(),token:z.string().min(20).max(200)}),
  z.object({kind:z.literal('event'),id:z.string().uuid(),token:z.string().min(20).max(200)}),
 ]),
});

export async function GET(){
 const guest=await currentGuest();
 if(!guest)return problem('Guest session not found.',404);
 return NextResponse.json({account:guestAsAccount(guest)},{headers:{'Cache-Control':'private, no-store'}});
}

export async function POST(request:Request){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 if(!allowAttempt(request,'guest-session',12,30*60*1000))return problem('Too many guest attempts. Try again later.',429);
 try{
  const input=schema.parse(await jsonBody(request,10_000));
  const pending:SharedActor={kind:'guest',id:'00000000-0000-0000-0000-000000000000',displayName:input.displayName,color:'#d9e4d2'};
  const access=input.invite.kind==='round'
   ?await authorizeSharedRound(input.invite.id,pending,input.invite.token)
   :await authorizeSharedWeeklyEvent(input.invite.id,pending,input.invite.token);
  if(!access)return problem('This invitation is invalid or has expired.',404);
  const created=await createGuestSession(input.displayName);
  const response=NextResponse.json({account:guestAsAccount(created.guest)},{status:201,headers:{'Cache-Control':'private, no-store'}});
  response.cookies.set(guestCookie(created.token,created.expiresAt));
  return response;
 }catch(error){
  if(error instanceof z.ZodError)return problem(error.issues[0]?.message??'Check your guest name and invitation.');
  console.error(JSON.stringify({event:'guest_session_failed'}));
  return problem('Guest access is temporarily unavailable.',500);
 }
}

export async function DELETE(request:Request){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 await deleteCurrentGuest();
 const response=NextResponse.json({ok:true});
 response.cookies.set(expiredGuestCookie());
 return response;
}
