import {Round} from './types';

function textCell(value:string){
 const safe=/^[=+\-@]/.test(value)?`'${value}`:value;
 return `"${safe.replaceAll('"','""')}"`;
}

export function scorecardCsv(round:Round){
 const holes=Array.from({length:round.holes},(_,index)=>`Hole ${index+1}`);
 const header=['Course','Date','Holes','Player','Playing Handicap',...holes,'Total'];
 const playerRows=round.players.map((player,playerIndex)=>{
  const scores=Array.from({length:round.holes},(_,holeIndex)=>round.results[holeIndex]?.scores[playerIndex]);
  const completed=scores.filter((score):score is number=>Number.isFinite(score));
  return [round.course,round.date.slice(0,10),String(round.holes),player.name,String(player.handicap),...scores.map(score=>score===undefined?'':String(score)),String(completed.reduce((sum,score)=>sum+score,0))];
 });
 return [header,...playerRows].map(row=>row.map(value=>textCell(value)).join(',')).join('\r\n');
}

export function makeScorecardFile(round:Round){
 const slug=round.course.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'round';
 return new File([scorecardCsv(round)],`loop-scorecard-${slug}-${round.date.slice(0,10)}.csv`,{type:'text/csv;charset=utf-8'});
}
