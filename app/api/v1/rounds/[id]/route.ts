import {NextResponse} from 'next/server';
import {currentAccount} from '@/lib/server/auth';
import {problem} from '@/lib/server/http';
import {readSharedRound} from '@/lib/server/shared-rounds';

export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 const account=await currentAccount();if(!account)return problem('Sign in required.',401);
 const {id}=await params,token=request.headers.get('x-loop-round-token');
 const shared=await readSharedRound(id,account.id,token);
 if(!shared)return problem('This live-round link is invalid or has expired.',404);
 const after=Number(new URL(request.url).searchParams.get('afterRevision')??-1);
 if(Number.isInteger(after)&&after>=shared.revision)return new NextResponse(null,{status:204,headers:{ETag:`"${shared.revision}"`,'Cache-Control':'private, no-store'}});
 return NextResponse.json({shared},{headers:{ETag:`"${shared.revision}"`,'Cache-Control':'private, no-store'}});
}
