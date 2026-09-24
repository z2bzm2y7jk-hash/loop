import {gameCatalog,gameFits,GameMetadata} from '../game-catalog';
import {configurationForExposure,estimateExposure,Exposure} from '../games/exposure';
import {defaultRules,gameStake} from '../rules';
import {defaults,Game,Player,Round} from '../types';

export type RoundVibe='friendly'|'competitive'|'chaos'|'team'|'new'|'quick';
export type TeamPreference='individual'|'teams'|'any';
export type ComplexityPreference='simple'|'medium'|'any';
export type CaddieInput={players:Player[];holes:9|18;vibe:RoundVibe;maxExposure:number;complexity:ComplexityPreference;teams:TeamPreference;history:Round[]};
export type Recommendation={game:Game;score:number;why:string;exposure:Exposure;configuration:Round;metadata:GameMetadata};

const countWord=(count:number)=>count===2?'Two':count===3?'Three':count===4?'Four':`${count}`;
function matchingHistory(input:CaddieInput){const ids=new Set(input.players.map(player=>player.id));return input.history.filter(round=>round.players.length===ids.size&&round.players.every(player=>ids.has(player.id))).slice(0,12)}

export function recommendGames(input:CaddieInput,excluded:Game[]=[]):Recommendation[]{
  if(!Number.isFinite(input.maxExposure)||input.maxExposure<=0)return [];
  const groupHistory=matchingHistory(input);
  const handicapValues=input.players.map(player=>player.handicap);
  const spread=Math.max(...handicapValues)-Math.min(...handicapValues);
  return gameCatalog.filter(item=>gameFits(item.name,input.players.length,input.holes)&&!excluded.includes(item.name)).flatMap(item=>{
    const base:Round={id:'recommendation',date:'',course:'Your course',holes:input.holes,players:input.players,games:[item.name],config:{...defaults,rules:defaultRules()},results:[],presses:[],paid:[]};
    const configuration=configurationForExposure(base,item.name,input.maxExposure,input.vibe);
    if(spread>=10&&item.supportsHandicaps){const q=configuration.config.rules!;if(item.name==='Skins')configuration.config.net=true;if(item.name==='Nassau')q.nassauNet=true;if(item.name==='Wolf')q.wolfNet=true;if(item.name==='Vegas')q.vegasNet=true;if(item.name==='Match Play')q.matchNet=true;if(item.name==='Hammer')q.hammerNet=true;}
    const exposure=estimateExposure(configuration,item.name);
    if(exposure.possibleMax>input.maxExposure+.01)return [];
    const played=groupHistory.filter(round=>round.games.includes(item.name)).length;
    const recent=groupHistory.slice(0,3).filter(round=>round.games.includes(item.name)).length;
    let score=20;
    if(input.vibe==='friendly')score+=item.complexity==='simple'?10:item.complexity==='medium'?2:-8;
    if(input.vibe==='competitive')score+=(item.tags.includes('Every hole matters')?8:3)+(item.complexity==='medium'?5:0);
    if(input.vibe==='chaos')score+=item.tags.includes('Chaos')||item.supportsPresses?12:item.complexity==='advanced'?5:-4;
    if(input.vibe==='team')score+=item.teamType==='teams'||item.teamType==='rotating'?12:item.teamType==='flexible'?5:-9;
    if(input.vibe==='new')score+=played===0?16:-played*5-recent*7;
    if(input.vibe==='quick')score+=item.durationImpact==='none'?9:item.durationImpact==='brief'?3:-7;
    if(input.complexity==='simple')score+=item.complexity==='simple'?8:-9;
    if(input.complexity==='medium')score+=item.complexity==='medium'?8:item.complexity==='simple'?2:-5;
    if(input.teams==='teams')score+=item.teamType==='teams'||item.teamType==='rotating'?8:item.teamType==='flexible'?3:-8;
    if(input.teams==='individual')score+=item.teamType==='individual'?8:item.teamType==='flexible'?3:-8;
    if(spread>=10)score+=item.supportsHandicaps?5:-2;
    score-=recent*3;
    const configuredStake=gameStake(configuration.config,item.name);if(configuredStake<.25)score-=22;else if(configuredStake<.5)score-=8;
    if(input.vibe==='competitive'&&input.players.length===4&&input.holes===18&&item.name==='Sixes')score+=4;
    if(exposure.projectedHigh<=input.maxExposure*.6)score+=2;
    const reasons=[`${countWord(input.players.length)} players and ${input.holes} holes fit ${item.name}.`];
    if(spread>=10&&item.supportsHandicaps)reasons.push('Net scoring can balance this group’s handicaps.');
    if(input.vibe==='new')reasons.push(played===0?'Your group has not played it in saved rounds.':'A different option from your usual games.');
    else if(item.teamType==='rotating')reasons.push('Partners change during the round.');
    else if(item.complexity==='simple')reasons.push('The rules stay easy to follow on the course.');
    reasons.push(`Suggested settings model up to $${Math.ceil(exposure.possibleMax)} per player; this is not a hard cap.`);
    return [{game:item.name,score,why:reasons.join(' '),exposure,configuration,metadata:item}];
  }).sort((a,b)=>b.score-a.score||a.game.localeCompare(b.game));
}
