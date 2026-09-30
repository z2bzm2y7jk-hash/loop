import type {Metadata} from 'next';
import {ForgotPasswordForm} from '@/components/account-recovery';
export const metadata:Metadata={title:'Reset Password — Round Settled',description:'Request a secure Round Settled password reset link.'};
export default function ForgotPasswordPage(){return <ForgotPasswordForm/>}
