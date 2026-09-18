import {Round,award,pars} from '../types';
export function greenies(r:Round){const b=r.players.map(()=>0);r.results.forEach((h,i)=>{if(h.greenie!==null&&r.config.greenHoles.includes(i+1)&&(!r.config.rules?.greenPar||h.scores[h.greenie]<=pars[i]))award(b,h.greenie,r.config.greenie)});return b;}
