import {Round,pars,award} from '../types';
export function birdies(r:Round){const b=r.players.map(()=>0);r.results.forEach((h,i)=>h.scores.forEach((s,p)=>{if(s<pars[i])award(b,p,r.config.birdie*(s<=pars[i]-2?(r.config.rules?.eagleMultiplier??1):1))}));return b;}
