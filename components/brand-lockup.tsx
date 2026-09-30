import type {CSSProperties} from 'react';

export function BrandMark({size=34,className=''}:{size?:number;className?:string}){
 return <svg className={`brand-symbol ${className}`} width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Round Settled"><rect width="48" height="48" rx="12" fill="currentColor"/><path d="M13 12.5h20a3 3 0 0 1 3 3v15.25L30.75 36H13a3 3 0 0 1-3-3V15.5a3 3 0 0 1 3-3Z" fill="none" stroke="var(--brand-mark-paper,#F7F1E7)" strokeWidth="3.2" strokeLinejoin="round"/><path d="M16 20h11M16 25h8M16 30h10" stroke="var(--brand-mark-paper,#F7F1E7)" strokeWidth="3"/><path d="m27.5 35.75 4.2.05L39 28.5" fill="none" stroke="var(--brand-mark-accent,#D9633A)" strokeWidth="4" strokeLinejoin="miter"/></svg>;
}

export function BrandLockup({compact=false,className='',style}:{compact?:boolean;className?:string;style?:CSSProperties}){
 return <span className={`brand-lockup${compact?' compact':''} ${className}`} style={style}><BrandMark size={compact?30:38}/><span className="brand-wordmark"><strong>Round</strong><strong>Settled</strong></span></span>;
}
