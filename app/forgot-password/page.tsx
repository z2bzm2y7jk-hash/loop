import type {Metadata} from 'next';
import {ForgotPasswordForm} from '@/components/account-recovery';
export const metadata:Metadata={title:'Reset Password — Loop',description:'Request a secure Loop password reset link.'};
export default function ForgotPasswordPage(){return <ForgotPasswordForm/>}
