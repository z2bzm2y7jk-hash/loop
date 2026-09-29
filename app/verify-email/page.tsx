import type {Metadata} from 'next';
import {VerifyEmailCard} from '@/components/account-recovery';
export const metadata:Metadata={title:'Verify Email — Loop',description:'Verify the email on your Loop account.'};
export default async function VerifyEmailPage({searchParams}:{searchParams:Promise<{token?:string}>}){const {token=''}=await searchParams;return <VerifyEmailCard token={token}/>}
