import type {Metadata} from 'next';
import {VerifyEmailCard} from '@/components/account-recovery';
export const metadata:Metadata={title:'Verify Email — Round Settled',description:'Verify the email on your Round Settled account.'};
export default async function VerifyEmailPage({searchParams}:{searchParams:Promise<{token?:string}>}){const {token=''}=await searchParams;return <VerifyEmailCard token={token}/>}
