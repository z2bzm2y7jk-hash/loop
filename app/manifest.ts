import type {MetadataRoute} from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
 return {
  name:'Loop Golf',
  short_name:'Loop',
  description:'Golf scoring, side games, and simple settlements.',
  start_url:'/',
  display:'standalone',
  background_color:'#f7f8f2',
  theme_color:'#203f33',
  orientation:'portrait',
  icons:[
   {src:'/icon-192.png',sizes:'192x192',type:'image/png'},
   {src:'/icon-512.png',sizes:'512x512',type:'image/png'},
  ],
 };
}
