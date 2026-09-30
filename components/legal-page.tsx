import type {ReactNode} from 'react';
import Link from 'next/link';
import {ArrowLeft} from 'lucide-react';
import {BrandLockup} from '@/components/brand-lockup';

export function LegalPage({eyebrow,title,intro,children}:{eyebrow:string;title:string;intro:string;children:ReactNode}){
 return <main id="main-content" className="legal-page">
  <header className="legal-header"><Link className="auth-brand" href="/"><BrandLockup/></Link><Link className="legal-back" href="/"><ArrowLeft size={17}/> Back to Round Settled</Link></header>
  <article className="legal-article"><p className="legal-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="legal-intro">{intro}</p>{children}</article>
  <footer className="legal-footer"><span>Round Settled private beta</span><nav aria-label="Legal and safety"><a href="/support">Support</a><a href="/privacy">Privacy</a><a href="/responsible-play">Responsible play</a></nav></footer>
 </main>;
}
