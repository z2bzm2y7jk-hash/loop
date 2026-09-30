'use client';

import {ArrowLeft,ArrowRight,BookmarkCheck,BookOpen,Check,ChevronDown,CircleHelp,CloudRain,Crown,DollarSign,Download,Flag,House,PencilLine,ShieldCheck,Smartphone,Users} from 'lucide-react';
import type {ReactNode} from 'react';

type HelpCenterProps={onBack:()=>void;onStartRound:()=>void;onGroups:()=>void;onGames:()=>void;onHouseRules:()=>void};

function HelpTopic({id,icon,title,summary,children,open=false}:{id:string;icon:ReactNode;title:string;summary:string;children:ReactNode;open?:boolean}){
 return <details className="help-topic" id={id} open={open}><summary><span className="help-topic-icon" aria-hidden="true">{icon}</span><span><strong>{title}</strong><small>{summary}</small></span><ChevronDown className="help-chevron" size={20} aria-hidden="true"/></summary><div className="help-topic-body">{children}</div></details>;
}

function StepList({children}:{children:ReactNode}){return <ol className="help-steps">{children}</ol>}

export function HelpCenter({onBack,onStartRound,onGroups,onGames,onHouseRules}:HelpCenterProps){
 return <div className="help-page">
  <button className="text-button help-back" onClick={onBack}><ArrowLeft size={17}/> Back to Round Settled</button>
  <section className="help-hero"><span className="help-hero-icon" aria-hidden="true"><CircleHelp size={27}/></span><div><p className="help-kicker">Help &amp; how-to</p><h1>New to Round Settled? Start here.</h1><p>Round Settled keeps score, tracks friendly side games, and does the math. It never moves money.</p></div></section>
  <div className="help-reassurance" role="note"><ShieldCheck size={22} aria-hidden="true"/><p><strong>It is safe to look around.</strong> A score is saved only after someone taps <b>Save hole</b>. Shared changes show who made them.</p></div>

  <section className="help-start" aria-labelledby="help-start-title"><div className="section-heading"><h2 id="help-start-title">The three things to know</h2></div><div className="help-start-grid">
   <article><span>1</span><div><strong>Set up your golfer</strong><p>Add your name and handicap once. You can change them later in Profile.</p></div></article>
   <article><span>2</span><div><strong>Start or join</strong><p>Start your own round, or open the link your group captain sends.</p></div></article>
   <article><span>3</span><div><strong>Score together</strong><p>One person can keep score, or the captain can allow trusted players to help.</p></div></article>
  </div></section>

  <section className="help-captain-intro" aria-labelledby="captain-meaning"><span aria-hidden="true"><Crown size={24}/></span><div><h2 id="captain-meaning">What does “captain” mean?</h2><p>The captain is the group’s setup leader. You do not need special technology skills. You choose the regular golfers, prepare the home game, make the lineup, and send one link. You can keep scoring control or let trusted golfers help.</p><p><strong>The captain does not handle payments through Round Settled.</strong> Round Settled only keeps the score and explains what each player owes.</p></div></section>

  <div className="help-quick-actions" aria-label="Quick actions"><button className="primary" onClick={onStartRound}><Flag size={17}/> Start a round</button><button className="secondary" onClick={onGroups}><Users size={17}/> Open my groups</button><button className="secondary" onClick={onHouseRules}><BookmarkCheck size={17}/> Saved home games</button><button className="secondary" onClick={onGames}><BookOpen size={17}/> Browse games</button></div>

  <section className="help-topics" aria-labelledby="help-topics-title"><div className="section-heading help-section-heading"><div><h2 id="help-topics-title">Step-by-step help</h2><p>Tap a topic to open it.</p></div></div>

   <HelpTopic id="help-home-game" icon={<BookmarkCheck/>} title="Save your group’s home game" summary="Set it up once, then reuse it any day or week" open><p className="help-plain-definition"><strong>Round Settled calls this a House Rule.</strong> Think of it as a saved recipe for your usual golf game: which games you play, how many holes, the whole-dollar amounts, and options such as presses or carryovers.</p><StepList>
    <li><span>1</span><p>Open <strong>Saved home games</strong>, then tap <strong>Create saved home game</strong>.</p></li>
    <li><span>2</span><p>Give it a familiar name, such as <strong>Thursday Nine</strong>, <strong>Saturday Nassau</strong>, or <strong>Daily Skins</strong>.</p></li>
    <li><span>3</span><p>Choose the usual number of players and whether the group normally plays 9 or 18 holes.</p></li>
    <li><span>4</span><p>Choose one or more games. Set the rules and whole-dollar amounts the group normally uses.</p></li>
    <li><span>5</span><p>Read the preview, then tap <strong>Save home game</strong>. The setup is now saved to your account.</p></li>
    <li><span>6</span><p>Next time, open <strong>Saved home games</strong> and tap <strong>Play</strong>. Check that day’s course, players, handicaps, and amounts before starting.</p></li>
   </StepList><p className="help-tip"><strong>Daily, weekly, or occasional all work.</strong> Saving a home game does not create a schedule. It simply keeps the setup ready whenever the group wants to use it.</p></HelpTopic>

   <HelpTopic id="help-captain" icon={<Crown/>} title="Run a regular group as captain" summary="Save the roster, plan the day, and share one link"><p className="help-plain-definition">A <strong>group</strong> is your regular list of golfers. A <strong>weekly game</strong> is one day on the calendar. The same group can play every day, every week, once a month, or only when people are available.</p><StepList>
    <li><span>1</span><p>Open <strong>Groups</strong>. Under <strong>Start another group</strong>, enter a name such as Thursday Nine, choose at least two golfers, and tap <strong>Add group</strong>.</p></li>
    <li><span>2</span><p>Open the group’s <strong>Players</strong> tab. Add regulars and guests with their handicaps. The saved roster can hold up to 24 golfers.</p></li>
    <li><span>3</span><p>Create a <strong>saved home game</strong> for the group if you have not already. This prevents the captain from rebuilding the same games and amounts each time.</p></li>
    <li><span>4</span><p>Open <strong>This week</strong>, then <strong>Plan this week</strong>. Choose the date, course, saved home game, and the 4–12 golfers playing that day.</p></li>
    <li><span>5</span><p>Tap <strong>Build playing groups</strong>. Round Settled divides the golfers into groups of two to four. Use <strong>Shuffle groups</strong>, or tap one golfer and then another to swap them.</p></li>
    <li><span>6</span><p>Tap <strong>Invite group</strong>. Choose <strong>Follow the weekly game</strong> if only you should organize and score. Choose <strong>Help organize and score</strong> if trusted golfers may help.</p></li>
    <li><span>7</span><p>Send the link by text or another app. Each golfer opens the same link, signs in, and chooses their own name.</p></li>
    <li><span>8</span><p>When a playing group is ready, tap <strong>Set up this group</strong>. Confirm the course, players, home game, and dollar amounts before starting its scorecard.</p></li>
    <li><span>9</span><p>For the next outing, tap <strong>Plan another week</strong>. Round Settled remembers the group’s last course and home game; change either one whenever needed.</p></li>
   </StepList><div className="help-captain-checklist"><h3>Captain’s quick check before play</h3><ul><li>Are the correct golfers selected?</li><li>Do the course, tees, handicaps, games, and dollar amounts look right?</li><li>Does everyone know who is entering scores?</li><li>Should the link allow viewing only, or trusted organizers too?</li></ul></div></HelpTopic>

   <HelpTopic id="help-start-round" icon={<Flag/>} title="Start a one-time round" summary="Course, players, games, and bet amounts"><StepList>
    <li><span>1</span><p>Tap <strong>Start a round</strong>.</p></li><li><span>2</span><p>Choose the course and tees. Check the rating, slope, and hole information before continuing.</p></li><li><span>3</span><p>Check every player’s name and handicap. Add or remove players as needed.</p></li><li><span>4</span><p>Choose the games. Enter the whole-dollar bet amounts your group agreed to.</p></li><li><span>5</span><p>Read the review screen to the group, then tap <strong>Start round</strong>.</p></li>
   </StepList><p className="help-tip"><strong>Good habit:</strong> Agree on every game, rule, and dollar amount before the first tee shot.</p></HelpTopic>

   <HelpTopic id="help-three-players" icon={<Users/>} title="Choose a game for three golfers" summary="Nine Point and Split Sixes are made for a threesome"><p className="help-plain-definition">A foursome is not required. Round Settled has two points games designed for exactly three golfers, and it calculates every tie automatically.</p><StepList>
    <li><span>1</span><p>During round setup, choose <strong>3 golfers</strong>. Round Settled will show games that fit a threesome.</p></li>
    <li><span>2</span><p>Choose <strong>Nine Point</strong> for the friendlier option. Each hole awards 5 points for low score, 3 for middle, and 1 for high.</p></li>
    <li><span>3</span><p>Choose <strong>Split Sixes</strong> for more pressure. Each hole awards 4 points for low score, 2 for middle, and 0 for high.</p></li>
    <li><span>4</span><p>Leave <strong>Use net scores</strong> on when handicaps differ. Turn it off only when your group wants gross scores.</p></li>
    <li><span>5</span><p>Enter the whole-dollar value for one point. Read the review screen together before starting.</p></li>
    <li><span>6</span><p>During play, enter the three golf scores normally. Open <strong>Games</strong> to see the points from every hole and <strong>Money</strong> to see the current settlement.</p></li>
   </StepList><p className="help-tip"><strong>Ties are automatic.</strong> For example, two players tied for low in Nine Point receive 4 points each and the third player receives 1.</p></HelpTopic>

   <HelpTopic id="help-score" icon={<PencilLine/>} title="Enter scores during play" summary="Save each hole and handle in-game choices"><StepList>
    <li><span>1</span><p>Open the <strong>Scorecard</strong> tab. The current hole appears at the top.</p></li><li><span>2</span><p>Use the plus and minus buttons, or tap the score box and type a number.</p></li><li><span>3</span><p>If Wolf, Hammer, or Vegas asks for a choice, make that choice before saving the hole.</p></li><li><span>4</span><p>Read the scores back to the group, then tap <strong>Save hole</strong>.</p></li><li><span>5</span><p>Open <strong>Money</strong> at any time to see the current standings.</p></li>
   </StepList></HelpTopic>

   <HelpTopic id="help-shared" icon={<Users/>} title="Join a shared weekly game" summary="Open the captain’s link and choose your name"><StepList>
    <li><span>1</span><p>Tap the Round Settled link sent by your captain. Sign in or create an account if asked.</p></li><li><span>2</span><p>Choose your name from the golfer list. Round Settled remembers which golfer is you.</p></li><li><span>3</span><p>Find your playing group. Tap its scorecard after an organizer starts it.</p></li><li><span>4</span><p><strong>Following live</strong> means you can watch. <strong>Organizer access</strong> means you can help with groups and scores.</p></li><li><span>5</span><p>Leave the page open during the round. Scores and changes appear on every phone automatically.</p></li>
   </StepList><p className="help-tip"><strong>Can’t find the link?</strong> Ask the captain to send it again. A captain can stop an old link and make a new one.</p></HelpTopic>

   <HelpTopic id="help-bets" icon={<DollarSign/>} title="Understand games, bets, and money" summary="What the dollar amounts mean and how settlement works"><ul className="help-bullets">
    <li><Check size={17}/><p>A “$5” setting is the value used by that game’s rules. Round Settled uses whole dollars to keep setup simple.</p></li><li><Check size={17}/><p>The <strong>Money</strong> tab shows who is up or down while the round is being played.</p></li><li><Check size={17}/><p><strong>Settle up</strong> shows the simplest payments between players after the round.</p></li><li><Check size={17}/><p>Round Settled records whether someone marked a payment as paid. Round Settled does not send or hold money.</p></li><li><Check size={17}/><p><strong>Maximum exposure</strong> is an estimate that helps choose a comfortable game. It is not a guaranteed limit.</p></li>
   </ul></HelpTopic>

   <HelpTopic id="help-responsible-play" icon={<ShieldCheck/>} title="Keep side games friendly and safe" summary="Set limits, stop when needed, and know where to get help"><p className="help-plain-definition"><strong>Round Settled is a scorekeeper, not a sportsbook.</strong> It records informal balances but never accepts a bet, holds money, or sends a payment.</p><StepList>
    <li><span>1</span><p>Before the first tee, agree on the game, rules, and whole-dollar amount.</p></li>
    <li><span>2</span><p>Choose an amount every player can comfortably lose. Never use money needed for housing, food, healthcare, or family needs.</p></li>
    <li><span>3</span><p>Set a limit before play. Do not increase it to chase a loss.</p></li>
    <li><span>4</span><p>Anyone may ask to pause, lower the amount, or stop the side game. The group can end a Round Settled round and choose whether partial results count.</p></li>
    <li><span>5</span><p>If gambling causes stress, secrecy, debt, or conflict, call or text <a className="help-inline-link" href="tel:+18006973738">1-800-MY-RESET</a> for free, confidential help.</p></li>
   </StepList><div className="help-resource-links"><a href="/responsible-play">Read Round Settled’s responsible-play guide <ArrowRight size={16}/></a><a href="https://www.ncpgambling.org/chat/" target="_blank" rel="noreferrer">Open the confidential NCPG chat <ArrowRight size={16}/></a></div></HelpTopic>

   <HelpTopic id="help-privacy" icon={<ShieldCheck/>} title="Understand your privacy" summary="What Round Settled saves, shares, and keeps on your device"><ul className="help-bullets">
    <li><Check size={17}/><p>Round Settled saves your account, golfer preferences, rounds, groups, and game history so they are available across your devices.</p></li>
    <li><Check size={17}/><p>People with a valid group link can see the golf information that the captain shares. Editing access is set separately.</p></li>
    <li><Check size={17}/><p>Your location is requested only after you tap <strong>Use my location</strong>. It finds nearby courses and is not saved to your Round Settled account.</p></li>
    <li><Check size={17}/><p>Round Settled currently has no advertising, does not sell personal information, and does not process payments.</p></li>
   </ul><div className="help-resource-links"><a href="/privacy">Read the full privacy policy <ArrowRight size={16}/></a></div></HelpTopic>

   <HelpTopic id="help-fix" icon={<CloudRain/>} title="Fix a mistake or end early" summary="Correct a score, change a game, or handle rain"><ul className="help-bullets">
    <li><Check size={17}/><p>Use <strong>Edit last hole</strong> to correct the most recently saved score.</p></li><li><Check size={17}/><p>Use <strong>Edit games &amp; bets</strong> during an active round to change a game or dollar amount. Round Settled recalculates the results.</p></li><li><Check size={17}/><p>Use <strong>End round</strong> if rain or another problem stops play.</p></li><li><Check size={17}/><p>Choose <strong>Keep partial results</strong> if the group agrees the scores and bets should count. Choose discard if they should be removed from history and stats.</p></li>
   </ul></HelpTopic>

   <HelpTopic id="help-export" icon={<Download/>} title="Export a scorecard" summary="Share or save a copy after scores are entered"><StepList>
    <li><span>1</span><p>Open the round and choose <strong>Scorecard</strong>.</p></li><li><span>2</span><p>After at least one hole is saved, tap <strong>Export</strong>.</p></li><li><span>3</span><p>Choose an app from your phone’s share menu, or save the file to open later.</p></li>
   </StepList><p className="help-tip">The exported file can be opened in spreadsheet apps and used as a record of the round.</p></HelpTopic>

   <HelpTopic id="help-phone" icon={<Smartphone/>} title="Put Round Settled on your phone’s Home Screen" summary="Open it like an app with one tap"><div className="help-phone-grid">
    <div><h3>iPhone or iPad</h3><StepList><li><span>1</span><p>Open Round Settled in <strong>Safari</strong>.</p></li><li><span>2</span><p>Tap the <strong>Share</strong> button.</p></li><li><span>3</span><p>Scroll down and tap <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.</p></li></StepList></div>
    <div><h3>Android phone</h3><StepList><li><span>1</span><p>Open Round Settled in <strong>Chrome</strong>.</p></li><li><span>2</span><p>Tap the three-dot menu.</p></li><li><span>3</span><p>Tap <strong>Add to Home screen</strong> or <strong>Install app</strong>, then confirm.</p></li></StepList></div>
   </div></HelpTopic>
  </section>

  <section className="help-words" aria-labelledby="help-words-title"><div className="help-words-heading"><House size={21}/><h2 id="help-words-title">Words you may see</h2></div><dl>
   <div><dt>Captain</dt><dd>The group’s setup leader. The captain keeps the roster, plans the day, sends the link, and chooses who may enter scores.</dd></div><div><dt>Scoring access</dt><dd>Permission to enter or correct scores. Round Settled records who made shared changes.</dd></div><div><dt>House Rule</dt><dd>Round Settled’s name for a saved home-game recipe: the games, rules, length, and dollar amounts your group can reuse.</dd></div><div><dt>Net score</dt><dd>A golf score adjusted by handicap strokes.</dd></div><div><dt>Press</dt><dd>A new Nassau bet that begins during the round.</dd></div><div><dt>Carryover</dt><dd>A tied prize that moves to the next hole.</dd></div>
  </dl></section>
  <button className="help-finish primary" onClick={onBack}>I’m ready to use Round Settled <ArrowRight size={17}/></button>
 </div>;
}
