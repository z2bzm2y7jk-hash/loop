import type {Metadata} from 'next';
import {SupportForm} from '@/components/support-form';
export const metadata:Metadata={title:'Support — Round Settled',description:'Get help with your Round Settled account, golf group, or scorecard.'};
export default function SupportPage(){return <SupportForm/>}
