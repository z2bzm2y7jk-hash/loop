export type AccountPreferences={
 defaultHoles:9|18;
 defaultWager:number;
 homeCourse:string;
 distanceUnit:'yards'|'meters';
 color:string;
};

export type Account={
 id:string;
 email:string;
 displayName:string;
 handicap:number;
 preferences:AccountPreferences;
};

export const defaultAccountPreferences:AccountPreferences={
 defaultHoles:18,
 defaultWager:5,
 homeCourse:'',
 distanceUnit:'yards',
 color:'#d9e4d2',
};
