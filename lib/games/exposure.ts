import {gameMetadata} from '../game-catalog';
import {defaultRules,gameStake} from '../rules';
import {Round,Game} from '../types';
import {roundPars} from '../course';

export type Exposure={projectedLow:number;projectedHigh:number;possibleMax:number;assumptions:string[];suggestions:string[]};
const cents=(value:number)=>Math.round(value*100)/100;

/** Conservative per-player bound for the configured game, assuming the saved base value is used on every hole. */
export function estimateExposure(round:Round,game:Game):Exposure{
  const pars=roundPars(round),q=round.config.rules??defaultRules();
  const count=round.players.length,holes=round.holes,stake=gameStake(round.config,game);
  let possibleMax=0;
  const assumptions:string[]=['An estimate, not an enforced loss cap.'];
  const suggestions:string[]=[];
  switch(game){
    case 'Nassau':{
      const matches=round.config.front+(holes===18?round.config.back:0)+round.config.overall;
      possibleMax=(matches+(round.config.auto?q.pressLimit*q.pressStake:0))*(round.config.teams?1:count-1);
      if(round.config.auto)suggestions.push('Turn off automatic presses or lower the press limit.');
      suggestions.push('Reduce front, back or overall values.');
      break;
    }
    case 'Skins':possibleMax=holes*stake;suggestions.push('Reduce the skin value.');break;
    case 'Wolf':{
      const multiplier=Math.max(q.wolfSoloWin,q.wolfSoloLoss,q.wolfBlindWin,q.wolfBlindLoss,1);
      possibleMax=holes*(count-1)*multiplier*stake;
      assumptions.push('A higher per-hole Wolf value can exceed this estimate.');
      suggestions.push('Reduce the base value or Lone/Blind multipliers.');break;
    }
    case 'Match Play':possibleMax=(count-1)*(q.matchMode==='hole'?holes:1)*stake;suggestions.push('Use one whole-round match or reduce the value per pair.');break;
    case 'Sixes':possibleMax=holes*stake/2;suggestions.push('Reduce the team value per hole.');break;
    case 'Vegas':possibleMax=holes*(q.vegasCap?88:2009)*stake/2;assumptions.push(q.vegasCap?'Each score is capped at 9 for Vegas.':'Scores up to 20 can create large team numbers.');suggestions.push('Cap scores at 9 or reduce the value per point.');break;
    case 'Hammer':possibleMax=holes*stake*2**q.hammerLimit*(q.hammerBirdie?2:1);suggestions.push('Limit accepted Hammers or reduce the base value.');break;
    case 'Greenies':possibleMax=pars.slice(0,holes).filter(par=>par===3).length*stake;suggestions.push('Reduce the closest-to-pin value.');break;
    case 'Birdies':possibleMax=holes*(count-1)*q.eagleMultiplier*stake;suggestions.push('Reduce the birdie value or eagle multiplier.');break;
    case 'Sandies':case 'Dots':possibleMax=holes*(count-1)*stake;suggestions.push('Reduce the per-opponent value.');break;
    case 'Snake':possibleMax=(q.snakeMode==='each'?holes:1)*stake;suggestions.push('Use last holder only or reduce the value.');break;
  }
  possibleMax=cents(possibleMax);
  const meta=gameMetadata[game],base=game==='Nassau'?5:game==='Vegas'?1:game==='Greenies'?5:2;
  const projectedLow=Math.min(possibleMax,cents(meta.typicalExposureLow*stake/base*holes/18));
  const projectedHigh=Math.min(possibleMax,cents(meta.typicalExposureHigh*stake/base*holes/18));
  return {projectedLow,projectedHigh:Math.max(projectedLow,projectedHigh),possibleMax,assumptions,suggestions};
}

/** Defaults chosen for a recommendation. The result still needs a visible exposure review. */
export function configurationForExposure(round:Round,game:Game,limit:number,vibe:string):Round{
  const q={...(round.config.rules??defaultRules()),stakes:{...(round.config.rules??defaultRules()).stakes}};
  const config={...round.config,rules:q,teams:round.players.length%2===0};
  const candidate:Round={...round,games:[game],config};
  q.teamA=Array.from({length:Math.floor(round.players.length/2)},(_,index)=>index);
  q.hammerLimit=vibe==='chaos'?2:1;
  q.hammerBirdie=false;
  q.wolfBlindWin=vibe==='chaos'?3:2;q.wolfBlindLoss=q.wolfBlindWin;
  q.vegasCap=true;
  q.matchMode=vibe==='chaos'?'hole':'round';
  q.pressLimit=vibe==='chaos'?2:1;
  config.auto=vibe==='chaos'||vibe==='competitive';
  const setStake=(value:number)=>{
    q.stakes[game]=value;
    if(game==='Skins')config.skin=value;
    if(game==='Greenies')config.greenie=value;
    if(game==='Birdies')config.birdie=value;
    if(game==='Nassau'){config.front=value;config.back=value;config.overall=value;q.pressStake=value;}
  };
  setStake(1);
  const upper=estimateExposure(candidate,game).possibleMax;
  const preferred=game==='Vegas'?1:game==='Greenies'?5:game==='Nassau'?5:game==='Match Play'&&q.matchMode==='round'?5:2;
  const raw=upper>0?Math.min(preferred,limit*.85/upper):preferred;const allowed=raw>=.25?Math.floor(raw*4)/4:Math.floor(raw*100)/100;
  setStake(Math.max(.01,allowed));
  return candidate;
}
