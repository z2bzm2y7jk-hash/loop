import {NextResponse} from 'next/server';
import {eq,sql} from 'drizzle-orm';
import {z} from 'zod';
import {currentAccount,database} from '@/lib/server/auth';
import {userAppData} from '@/lib/server/db/schema';
import {jsonBody,problem,validRequestOrigin} from '@/lib/server/http';

const blankProductData={version:1 as const,houseRules:[],groups:[],trips:[]};
const schema=z.object({activeRound:z.unknown().nullable(),history:z.array(z.unknown()).max(250),productData:z.object({version:z.literal(1),houseRules:z.array(z.unknown()).max(100),groups:z.array(z.unknown()).max(100),trips:z.array(z.unknown()).max(100)})});

export async function GET(){
 const account=await currentAccount();
 if(!account)return problem('Sign in required.',401);
 const rows=await database().select().from(userAppData).where(eq(userAppData.userId,account.id)).limit(1);
 if(rows[0])return NextResponse.json({data:rows[0]});
 await database().insert(userAppData).values({userId:account.id,activeRound:null,history:[],productData:blankProductData});
 return NextResponse.json({data:{activeRound:null,history:[],productData:blankProductData,revision:0}});
}

export async function PUT(request:Request){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 const account=await currentAccount();
 if(!account)return problem('Sign in required.',401);
 try{
  const input=schema.parse(await jsonBody(request));
  await database().insert(userAppData).values({userId:account.id,activeRound:input.activeRound as never,history:input.history as never,productData:input.productData as never})
   .onDuplicateKeyUpdate({set:{activeRound:input.activeRound as never,history:input.history as never,productData:input.productData as never,revision:sql`${userAppData.revision}+1`}});
  const rows=await database().select({revision:userAppData.revision,updatedAt:userAppData.updatedAt}).from(userAppData).where(eq(userAppData.userId,account.id)).limit(1);
  return NextResponse.json({ok:true,...rows[0]});
 }catch(error){
  if(error instanceof z.ZodError)return problem('Saved data is not valid.');
  if(error instanceof Error&&error.message==='REQUEST_TOO_LARGE')return problem('Saved data is too large.',413);
  console.error(JSON.stringify({event:'app_data_save_failed'}));
  return problem('Your changes could not be saved.',500);
 }
}
