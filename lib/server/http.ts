import 'server-only';
import {NextResponse} from 'next/server';
import {serverEnvironment} from '@/lib/server/env';

const attempts=new Map<string,{count:number;resetAt:number}>();

export function clientAddress(request:Request){
 return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||request.headers.get('x-real-ip')||'unknown';
}

export function allowAttempt(request:Request,bucket:string,limit=10,windowMs=10*60*1000){
 const key=`${bucket}:${clientAddress(request)}`;
 const now=Date.now();
 const current=attempts.get(key);
 if(!current||current.resetAt<=now){attempts.set(key,{count:1,resetAt:now+windowMs});return true}
 if(current.count>=limit)return false;
 current.count+=1;
 return true;
}

export function validRequestOrigin(request:Request){
 const origin=request.headers.get('origin');
 if(!origin)return true;
 return origin===new URL(serverEnvironment().APP_ORIGIN).origin;
}

export async function jsonBody(request:Request,maxBytes=1_000_000){
 const contentLength=Number(request.headers.get('content-length')??0);
 if(contentLength>maxBytes)throw new Error('REQUEST_TOO_LARGE');
 const text=await request.text();
 if(text.length>maxBytes)throw new Error('REQUEST_TOO_LARGE');
 return JSON.parse(text) as unknown;
}

export function problem(message:string,status=400){
 return NextResponse.json({error:message},{status});
}
