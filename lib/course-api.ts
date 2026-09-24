import {CourseTee,handicaps,pars} from './types';
import {currentCourseName} from './course';

const API='https://api.opengolfapi.org/api/v1';

export type CourseSearchResult={id:string;course_name:string;city:string;state:string;lat:number;lng:number;type?:string;par?:number;holes?:number;distance_mi?:number};
export type CourseApiTee={tee_key:string;tee_name:string;tee_color:string|null;gender:string;course_rating:number;slope:number;par:number;yardage:number};
export type CourseApiHole={number:number;par:number;handicap_index:number};
export type CourseDetail={id:string;course_name:string;city:string;state:string;holes:number;tees:CourseApiTee[];holes_data:CourseApiHole[]};

async function read<T>(url:string):Promise<T>{
 const response=await fetch(url,{headers:{Accept:'application/json'}});
 if(!response.ok)throw new Error(`Course service returned ${response.status}`);
 return response.json() as Promise<T>;
}

export async function searchCourses(query:string){
 const data=await read<{courses:CourseSearchResult[]}>(`${API}/courses/search?q=${encodeURIComponent(query.trim())}&limit=8`);
 return (data.courses??[]).map(course=>({...course,course_name:currentCourseName(course.course_name)}));
}

export async function nearbyCourses(latitude:number,longitude:number){
 const data=await read<{courses:CourseSearchResult[]}>(`${API}/courses/search?lat=${latitude.toFixed(6)}&lng=${longitude.toFixed(6)}&radius_mi=25&limit=10`);
 return (data.courses??[]).map(course=>({...course,course_name:currentCourseName(course.course_name)}));
}

export async function getCourse(id:string){const detail=await read<CourseDetail>(`${API}/courses/${encodeURIComponent(id)}`);return {...detail,course_name:currentCourseName(detail.course_name)}}

export function courseTeeFrom(detail:CourseDetail,tee:CourseApiTee):CourseTee{
 const ordered=[...(detail.holes_data??[])].sort((a,b)=>a.number-b.number);
 return {
  name:tee.tee_name,
  location:[detail.city,detail.state].filter(Boolean).join(', '),
  courseRating:tee.course_rating,
  slopeRating:tee.slope,
  pars:Array.from({length:18},(_,index)=>ordered[index]?.par??pars[index]),
  strokeIndexes:Array.from({length:18},(_,index)=>ordered[index]?.handicap_index??handicaps[index]),
  source:'opengolf',providerCourseId:detail.id,gender:tee.gender,yardage:tee.yardage,
  attribution:'OpenGolfAPI · OpenStreetMap contributors (ODbL 1.0)',
 };
}
