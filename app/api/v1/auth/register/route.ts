import {randomUUID} from 'node:crypto';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {defaultAccountPreferences} from '@/lib/account';
import {accountFromRow,createSession,database,hashPassword,sessionCookie} from '@/lib/server/auth';
import {groupMembers,groups,players,userAppData,userProfiles,users} from '@/lib/server/db/schema';
import {allowAttempt,jsonBody,problem,validRequestOrigin} from '@/lib/server/http';

const schema=z.object({
 email:z.string().trim().toLowerCase().email().max(254),
 password:z.string().min(10,'Use at least 10 characters.').max(128),
 displayName:z.string().trim().min(2).max(80),
 handicap:z.coerce.number().min(-10).max(54),
});

export async function POST(request:Request){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 if(!allowAttempt(request,'register',5,30*60*1000))return problem('Too many attempts. Try again later.',429);
 try{
  const input=schema.parse(await jsonBody(request,20_000));
  const userId=randomUUID(),groupId=randomUUID(),now=new Date();
  const passwordHash=await hashPassword(input.password);
  const preferences={...defaultAccountPreferences};
  const productData={version:1 as const,houseRules:[],groups:[{id:groupId,name:`${input.displayName.split(/\s+/)[0]}'s group`,memberIds:[userId],createdAt:now.toISOString()}],trips:[]};
  await database().transaction(async tx=>{
   await tx.insert(users).values({id:userId,email:input.email,displayName:input.displayName,passwordHash,status:'active'});
   await tx.insert(userProfiles).values({userId,handicap:String(input.handicap),preferences});
   await tx.insert(groups).values({id:groupId,ownerUserId:userId,name:productData.groups[0].name});
   await tx.insert(groupMembers).values({groupId,userId,role:'owner'});
   await tx.insert(players).values({id:randomUUID(),groupId,linkedUserId:userId,displayName:input.displayName,handicap:String(input.handicap),color:preferences.color});
   await tx.insert(userAppData).values({userId,activeRound:null,history:[],productData});
  });
  const created=await createSession(userId);
  const response=NextResponse.json({account:accountFromRow({id:userId,email:input.email,displayName:input.displayName,handicap:String(input.handicap),preferences})},{status:201});
  response.cookies.set(sessionCookie(created.token,created.expiresAt));
  return response;
 }catch(error){
  const details=error as {code?:string};
  if(details.code==='ER_DUP_ENTRY')return problem('An account already exists for that email.',409);
  if(error instanceof z.ZodError)return problem(error.issues[0]?.message??'Check your account details.');
  if(error instanceof Error&&error.message==='REQUEST_TOO_LARGE')return problem('Request is too large.',413);
  console.error(JSON.stringify({event:'registration_failed',code:details.code??'UNKNOWN'}));
  return problem('Account creation is temporarily unavailable.',500);
 }
}
