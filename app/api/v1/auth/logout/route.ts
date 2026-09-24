import {NextResponse} from 'next/server';
import {deleteCurrentSession,expiredSessionCookie} from '@/lib/server/auth';
import {problem,validRequestOrigin} from '@/lib/server/http';

export async function POST(request:Request){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 await deleteCurrentSession();
 const response=NextResponse.json({ok:true});
 response.cookies.set(expiredSessionCookie());
 return response;
}
