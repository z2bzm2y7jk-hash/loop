'use client';

import {ArrowLeft,ArrowRight,BookOpen,Check,ChevronDown,CircleHelp,CloudRain,DollarSign,Download,Flag,House,PencilLine,ShieldCheck,Smartphone,Users} from 'lucide-react';
import type {ReactNode} from 'react';

type HelpCenterProps={onBack:()=>void;onStartRound:()=>void;onGroups:()=>void;onGames:()=>void};

function HelpTopic({id,icon,title,summary,children,open=false}:{id:string;icon:ReactNode;title:string;summary:string;children:ReactNode;open?:boolean}){
 return <details className="help-topic" id={id} open={open}><summary><span className="help-topic-icon" aria-hidden="true">{icon}</span><span><strong>{title}</strong><small>{summary}</small></span><ChevronDown className="help-chevron" size={20} aria-hidden="true"/></summary><div className="help-topic-body">{children}</div></details>;
}

function StepList({children}:{children:ReactNode}){return <ol className="help-steps">{children}</ol>}

export function HelpCenter({onBack,onStartRound,onGroups,onGames}:HelpCenterProps){
 return <div className="help-page">
  <button className="text-button help-back" onClick={onBack}><ArrowLeft size={17}/> Back to Loop</button>
  <section className="help-hero"><span className="help-hero-icon" aria-hidden="true"><CircleHelp size={27}/></span><div><p className="help-kicker">Help &amp; how-to</p><h1>New to Loop? Start here.</h1><p>Loop keeps score, tracks friendly side games, and does the math. It never moves money.</p></div></section>
  <div className="help-reassurance" role="note"><ShieldCheck size={22} aria-hidden="true"/><p><strong>It is safe to look around.</strong> A score is saved only after someone taps <b>Save hole</b>. Shared changes show who made them.</p></div>

  <section className="help-start" aria-labelledby="help-start-title"><div className="section-heading"><h2 id="help-start-title">The three things to know</h2></div><div className="help-start-grid">
   <article><span>1</span><div><strong>Set up your golfer</strong><p>Add your name and handicap once. You can change them later in Profile.</p></div></article>
   <article><span>2</span><div><strong>Start or join</strong><p>Start your own round, or open the link your group captain sends.</p></div></article>
   <article><span>3</span><div><strong>Score together</strong><p>One person can keep score, or the captain can allow trusted players to help.</p></div></article>
  </div></section>

  <div className="help-quick-actions" aria-label="Quick actions"><button className="primary" onClick={onStartRound}><Flag size={17}/> Start a round</button><button className="secondary" onClick={onGroups}><Users size={17}/> Open my groups</button><button className="secondary" onClick={onGames}><BookOpen size={17}/> Browse games</button></div>

  <section className="help-topics" aria-labelledby="help-topics-title"><div className="section-heading help-section-heading"><div><h2 id="help-topics-title">Step-by-step help</h2><p>Tap a topic to open it.</p></div></div>
   <HelpTopic id="help-start-round" icon={<Flag/>} title="Start a round" summary="Course, players, games, and bet amounts" open><StepList>
    <li><span>1</span><p>Tap <strong>Start a round</strong>.</p></li><li><span>2</span><p>Choose the course and tees. Check the rating, slope, and hole information before continuing.</p></li><li><span>3</span><p>Check every player’s name and handicap. Add or remove players as needed.</p></li><li><span>4</span><p>Choose the games. Enter the whole-dollar bet amounts your group agreed to.</p></li><li><span>5</span><p>Read the review screen to the group, then tap <strong>Start round</strong>.</p></li>
   </StepList><p className="help-tip"><strong>Good habit:</strong> Agree on every game, rule, and dollar amount before the first tee shot.</p></HelpTopic>

   <HelpTopic id="help-score" icon={<PencilLine/>} title="Enter scores during play" summary="Save each hole and handle in-game choices"><StepList>
    <li><span>1</span><p>Open the <strong>Scorecard</strong> tab. The current hole appears at the top.</p></li><li><span>2</span><p>Use the plus and minus buttons, or tap the score box and type a number.</p></li><li><span>3</span><p>If Wolf, Hammer, or Vegas asks for a choice, make that choice before saving the hole.</p></li><li><span>4</span><p>Read the scores back to the group, then tap <strong>Save hole</strong>.</p></li><li><span>5</span><p>Open <strong>Money</strong> at any time to see the current standings.</p></li>
   </StepList></HelpTopic>

   <HelpTopic id="help-shared" icon={<Users/>} title="Join a shared weekly game" summary="Open the captain’s link and choose your name"><StepList>
    <li><span>1</span><p>Tap the Loop link sent by your captain. Sign in or create an account if asked.</p></li><li><span>2</span><p>Choose your name from the golfer list. Loop remembers which golfer is you.</p></li><li><span>3</span><p>Find your playing group. Tap its scorecard after an organizer starts it.</p></li><li><span>4</span><p><strong>Following live</strong> means you can watch. <strong>Organizer access</strong> means you can help with groups and scores.</p></li><li><span>5</span><p>Leave the page open during the round. Scores and changes appear on every phone automatically.</p></li>
   </StepList><p className="help-tip"><strong>Can’t find the link?</strong> Ask the captain to send it again. A captain can stop an old link and make a new one.</p></HelpTopic>

   <HelpTopic id="help-bets" icon={<DollarSign/>} title="Understand games, bets, and money" summary="What the dollar amounts mean and how settlement works"><ul className="help-bullets">
    <li><Check size={17}/><p>A “$5” setting is the value used by that game’s rules. Loop uses whole dollars to keep setup simple.</p></li><li><Check size={17}/><p>The <strong>Money</strong> tab shows who is up or down while the round is being played.</p></li><li><Check size={17}/><p><strong>Settle up</strong> shows the simplest payments between players after the round.</p></li><li><Check size={17}/><p>Loop records whether someone marked a payment as paid. Loop does not send or hold money.</p></li><li><Check size={17}/><p><strong>Maximum exposure</strong> is an estimate that helps choose a comfortable game. It is not a guaranteed limit.</p></li>
   </ul></HelpTopic>

   <HelpTopic id="help-fix" icon={<CloudRain/>} title="Fix a mistake or end early" summary="Correct a score, change a game, or handle rain"><ul className="help-bullets">
    <li><Check size={17}/><p>Use <strong>Edit last hole</strong> to correct the most recently saved score.</p></li><li><Check size={17}/><p>Use <strong>Edit games &amp; bets</strong> during an active round to change a game or dollar amount. Loop recalculates the results.</p></li><li><Check size={17}/><p>Use <strong>End round</strong> if rain or another problem stops play.</p></li><li><Check size={17}/><p>Choose <strong>Keep partial results</strong> if the group agrees the scores and bets should count. Choose discard if they should be removed from history and stats.</p></li>
   </ul></HelpTopic>

   <HelpTopic id="help-export" icon={<Download/>} title="Export a scorecard" summary="Share or save a copy after scores are entered"><StepList>
    <li><span>1</span><p>Open the round and choose <strong>Scorecard</strong>.</p></li><li><span>2</span><p>After at least one hole is saved, tap <strong>Export</strong>.</p></li><li><span>3</span><p>Choose an app from your phone’s share menu, or save the file to open later.</p></li>
   </StepList><p className="help-tip">The exported file can be opened in spreadsheet apps and used as a record of the round.</p></HelpTopic>

   <HelpTopic id="help-phone" icon={<Smartphone/>} title="Put Loop on your phone’s Home Screen" summary="Open it like an app with one tap"><div className="help-phone-grid">
    <div><h3>iPhone or iPad</h3><StepList><li><span>1</span><p>Open Loop in <strong>Safari</strong>.</p></li><li><span>2</span><p>Tap the <strong>Share</strong> button.</p></li><li><span>3</span><p>Scroll down and tap <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.</p></li></StepList></div>
    <div><h3>Android phone</h3><StepList><li><span>1</span><p>Open Loop in <strong>Chrome</strong>.</p></li><li><span>2</span><p>Tap the three-dot menu.</p></li><li><span>3</span><p>Tap <strong>Add to Home screen</strong> or <strong>Install app</strong>, then confirm.</p></li></StepList></div>
   </div></HelpTopic>
  </section>

  <section className="help-words" aria-labelledby="help-words-title"><div className="help-words-heading"><House size={21}/><h2 id="help-words-title">Words you may see</h2></div><dl>
   <div><dt>Captain</dt><dd>The person who starts sharing and controls the group link.</dd></div><div><dt>Scoring access</dt><dd>Permission to enter or correct scores. Loop records who made shared changes.</dd></div><div><dt>House Rule</dt><dd>A saved set of games, rules, and dollar amounts your group can reuse.</dd></div><div><dt>Net score</dt><dd>A golf score adjusted by handicap strokes.</dd></div><div><dt>Press</dt><dd>A new Nassau bet that begins during the round.</dd></div><div><dt>Carryover</dt><dd>A tied prize that moves to the next hole.</dd></div>
  </dl></section>
  <button className="help-finish primary" onClick={onBack}>I’m ready to use Loop <ArrowRight size={17}/></button>
 </div>;
}
