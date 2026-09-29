import {NextResponse} from 'next/server';
import {currentAccount} from '@/lib/server/auth';
import {issueEmailVerification} from '@/lib/server/account-tokens';
import {emailDeliveryReady} from '@/lib/server/email';
import {allowAttempt,problem,validRequestOrigin} from '@/lib/server/http';

export async function POST(request:Request){
 if(!validRequestOrigin(request))return problem('Request origin was rejected.',403);
 if(!allowAttempt(request,'email-verification-request',4,30*60*1000))return problem('Too many requests. Try again later.',429);
 const account=await currentAccount();
 if(!account)return problem('Sign in required.',401);
 if(account.emailVerified)return NextResponse.json({ok:true,delivery:'verified'});
 if(!emailDeliveryReady())return NextResponse.json({ok:true,delivery:'unavailable'});
 try{
  await issueEmailVerification({userId:account.id,email:account.email,displayName:account.displayName});
  return NextResponse.json({ok:true,delivery:'sent'});
 }catch{
  console.error(JSON.stringify({event:'email_verification_request_failed'}));
  return problem('Verification email could not be sent. Try again later.',503);
 }
}
