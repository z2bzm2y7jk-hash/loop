import {NextResponse} from 'next/server';
import {eq} from 'drizzle-orm';
import {z} from 'zod';
import {defaultAccountPreferences} from '@/lib/account';
import {accountFromRow,currentAccount,database} from '@/lib/server/auth';
import {players,userProfiles,users} from '@/lib/server/db/schema';
import {jsonBody,problem,validRequestOrigin} from '@/lib/server/http';

const preferences=z.object({defaultHoles:z.union([z.literal(9),z.literal(18)]),defaultWager:z.number().min(0).max(10000),homeCourse:z.string().trim().max(180),distanceUnit:z.enum(['yards','meters']),color:z.string().regex(/^#[0-9a-f]{6}$/i)});
const schema=z.object({displayName:z.string().trim().min(2).max(80),handicap:z.coerce.number().min(-10).max(54),preferences});

export async function PATCH(request:Request){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 const account=await currentAccount();
 if(!account)return problem('Sign in required.',401);
 try{
  const input=schema.parse(await jsonBody(request,30_000));
  const prefs={...defaultAccountPreferences,...input.preferences};
  await database().transaction(async tx=>{
   await tx.update(users).set({displayName:input.displayName}).where(eq(users.id,account.id));
   await tx.insert(userProfiles).values({userId:account.id,handicap:String(input.handicap),preferences:prefs}).onDuplicateKeyUpdate({set:{handicap:String(input.handicap),preferences:prefs}});
   await tx.update(players).set({displayName:input.displayName,handicap:String(input.handicap),color:prefs.color}).where(eq(players.linkedUserId,account.id));
  });
  return NextResponse.json({account:accountFromRow({id:account.id,email:account.email,displayName:input.displayName,handicap:String(input.handicap),preferences:prefs})});
 }catch(error){
  if(error instanceof z.ZodError)return problem(error.issues[0]?.message??'Check your profile details.');
  console.error(JSON.stringify({event:'profile_update_failed'}));
  return problem('Profile could not be saved.',500);
 }
}
