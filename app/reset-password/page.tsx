import type {Metadata} from 'next';
import {ResetPasswordForm} from '@/components/account-recovery';
export const metadata:Metadata={title:'Choose a New Password — Round Settled',description:'Choose a new password for your Round Settled account.'};
export default async function ResetPasswordPage({searchParams}:{searchParams:Promise<{token?:string}>}){const {token=''}=await searchParams;return <ResetPasswordForm token={token}/>}
