import type {Metadata} from 'next';
import {SupportForm} from '@/components/support-form';
export const metadata:Metadata={title:'Support — Loop',description:'Get help with your Loop account, golf group, or scorecard.'};
export default function SupportPage(){return <SupportForm/>}
