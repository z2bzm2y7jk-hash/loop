import type { Metadata, Viewport } from 'next';
import './globals.css';
import {brand} from '@/lib/types';
export const metadata: Metadata = {
 title:`${brand.name} — ${brand.tagline}`,
 description:'Golf scoring, side games, and simple settlements.',
 applicationName:brand.name,
 appleWebApp:{capable:true,statusBarStyle:'default',title:brand.name},
 formatDetection:{telephone:false},
 icons:{icon:[{url:'/icon-192.png',sizes:'192x192',type:'image/png'},{url:'/icon-512.png',sizes:'512x512',type:'image/png'}],apple:[{url:'/apple-touch-icon.png',sizes:'180x180',type:'image/png'}]},
};
export const viewport: Viewport = {themeColor:'#203f33',colorScheme:'light'};
export default function Layout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html> }
