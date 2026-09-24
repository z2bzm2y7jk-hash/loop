import {NextResponse} from 'next/server';
import {currentAccount} from '@/lib/server/auth';

export async function GET(){
 const account=await currentAccount();
 return account?NextResponse.json({account}):NextResponse.json({account:null},{status:401});
}
