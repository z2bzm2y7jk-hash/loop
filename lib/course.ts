import {CourseTee,handicaps,pars,Round} from './types';

const courseNameAliases:Record<string,string>={
 'mallards landing golf course at melbourne':'Harbor City Golf Course',
 'mallards landing golf course':'Harbor City Golf Course',
};

export function currentCourseName(name:string){
 const key=name.trim().toLowerCase().replace(/\s+/g,' ');
 return courseNameAliases[key]??name;
}

export function currentRoundCourse(round:Round):Round{
 const course=currentCourseName(round.course);
 return course===round.course?round:{...round,course};
}

export function defaultCourseTee():CourseTee{
 return {name:'Championship',location:'Orlando, Florida',courseRating:72.5,slopeRating:138,pars:[...pars],strokeIndexes:[...handicaps],source:'demo'};
}

export function teeFor(round:Round):CourseTee{
 const fallback=defaultCourseTee(),tee=round.tee;
 return {
  name:tee?.name||fallback.name,
  location:tee?.location||fallback.location,
  courseRating:Number.isFinite(tee?.courseRating)?tee!.courseRating:fallback.courseRating,
  slopeRating:Number.isFinite(tee?.slopeRating)?tee!.slopeRating:fallback.slopeRating,
  pars:Array.from({length:18},(_,index)=>tee?.pars[index]??fallback.pars[index]),
  strokeIndexes:Array.from({length:18},(_,index)=>tee?.strokeIndexes[index]??fallback.strokeIndexes[index]),
  source:tee?.source??'demo',
 };
}

export function roundPars(round:Round){return teeFor(round).pars.slice(0,round.holes)}
export function roundStrokeIndexes(round:Round){return teeFor(round).strokeIndexes.slice(0,round.holes)}
