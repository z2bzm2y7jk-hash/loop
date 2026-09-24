'use client';
import {ArrowRight,BookOpen,CircleDot,Dices,Flag,Gavel,Grid3X3,RefreshCw,Sparkles,Target,Trophy,Users,Waves,Zap,type LucideIcon} from 'lucide-react';
import {gameCatalog,GameMetadata} from '@/lib/game-catalog';
import {recommendGames} from '@/lib/recommendations/gameCaddie';
import {Game,players,Round} from '@/lib/types';
import {RandomGamePicker} from './random-game-picker';
import {CaddieInput,Recommendation} from '@/lib/recommendations/gameCaddie';
export function GameDiscovery({history,onCaddie,onHouseRules,onLearn,onPlay,onRecommended,activeRound}:{history:Round[];onCaddie:()=>void;onHouseRules:()=>void;onLearn:(game:Game)=>void;onPlay:(game:Game)=>void;onRecommended:(item:Recommendation,input:CaddieInput)=>void;activeRound:boolean}){
 const input:CaddieInput={players,holes:18,vibe:'competitive',maxExposure:20,complexity:'medium',teams:'any',history};
 const recommended=recommendGames(input).slice(0,3).map(item=>item.game);
 const sections:{title:string;games:Game[]}[]=[
 {title:'Recommended for you',games:recommended},
 {title:'Popular',games:['Nassau','Skins','Wolf','Match Play']},
 {title:'Team games',games:gameCatalog.filter(item=>item.teamType==='teams'||item.teamType==='rotating').map(item=>item.name)},
 {title:'Individual games',games:gameCatalog.filter(item=>item.teamType==='individual').map(item=>item.name)},
 {title:'Low stakes',games:gameCatalog.filter(item=>item.tags.includes('Low stakes')).map(item=>item.name)},
 {title:'Chaos',games:gameCatalog.filter(item=>item.tags.includes('Chaos')).map(item=>item.name)},
 {title:'Quick nine',games:gameCatalog.filter(item=>item.worksFor9&&item.durationImpact!=='decisions').map(item=>item.name)},
 {title:'Try something new',games:recommendGames({...input,vibe:'new'}).slice(0,3).map(item=>item.game)}];
 return <div className="discover-page"><div className="feature-heading"><h1>Good games.<br/><em>Better company.</em></h1><p>Find a format your group will want to play again.</p></div><div className="library-access-note"><Sparkles size={18}/><span><strong>All 12 games are unlocked for beta testing.</strong> Wolf is available when your round has 3–8 golfers.</span></div><div className="feature-actions"><button className="primary" onClick={onCaddie}>Pick my game <ArrowRight size={17}/></button><button className="secondary" onClick={onHouseRules}>My House Rules</button></div><RandomGamePicker onUse={onRecommended} history={history} activeRound={activeRound}/>{sections.map(section=><section className="discover-section" key={section.title}><div className="section-heading"><h2>{section.title}</h2></div><div className="discover-grid">{section.games.map(game=>{const item=gameCatalog.find(record=>record.name===game)!;const GameIcon=gameIcons[game];return <article className="discover-card" key={game}><span className="game-art" aria-hidden="true"><GameIcon size={27}/></span><h3>{game}</h3><p>{item.description}</p><div className="discover-tags"><span>{item.minPlayers===item.maxPlayers?item.minPlayers:`${item.minPlayers}–${item.maxPlayers}`} players</span><span>{item.complexity}</span><span>{teamLabel(item)}</span><span>{riskLabel(item)}</span><span>{item.durationImpact==='none'?'No extra time':item.durationImpact==='brief'?'Brief moments':'Hole decisions'}</span></div><div className="discover-actions"><button className="secondary" onClick={()=>onLearn(game)}><BookOpen size={14}/> Learn</button><button className="primary" onClick={()=>onPlay(game)}>Play <ArrowRight size={15}/></button></div></article>})}</div></section>)}</div>
}
const gameIcons:Record<Game,LucideIcon>={Nassau:Flag,Skins:Grid3X3,Wolf:Users,'Match Play':Target,Sixes:RefreshCw,Vegas:Dices,Hammer:Gavel,Greenies:CircleDot,Birdies:Sparkles,Sandies:Trophy,Snake:Waves,Dots:Zap};
function teamLabel(item:GameMetadata){return item.teamType==='individual'?'Individual':item.teamType==='rotating'?'Rotating teams':item.teamType==='teams'?'Teams':'Teams or individual'}
function riskLabel(item:GameMetadata){return item.riskMultiplier>=5?'$$$':item.riskMultiplier>=2?'$$':'$'}
