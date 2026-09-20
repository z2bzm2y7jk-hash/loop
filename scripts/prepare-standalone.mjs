import {cpSync,existsSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';

const root=process.cwd();
const standalone=join(root,'.next','standalone');

if(!existsSync(standalone)){
 throw new Error('Standalone build directory is missing. Run this script after next build.');
}

const copies=[
 [join(root,'.next','static'),join(standalone,'.next','static')],
 [join(root,'public'),join(standalone,'public')],
];

for(const [source,destination] of copies){
 if(!existsSync(source)) continue;
 mkdirSync(destination,{recursive:true});
 cpSync(source,destination,{recursive:true,force:true});
}
