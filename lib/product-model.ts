import type {Config,Game,Round} from './types';

export type HouseRule={id:string;name:string;games:Game[];holes:9|18;playerCount?:number;config:Config;groupId?:string;createdAt:string;source?:'saved'|'creator'};
export type GolfGroup={id:string;name:string;memberIds:string[];createdAt:string;demo?:boolean};
export type TripRound={id:string;day:number;course:string;games:Game[];linkedRoundId?:string};
export type GolfTrip={id:string;name:string;startDate:string;playerIds:string[];rounds:TripRound[];demo?:boolean};
export type ProductData={version:1;houseRules:HouseRule[];groups:GolfGroup[];trips:GolfTrip[]};

export const defaultProductData=():ProductData=>({version:1,houseRules:[],groups:[{id:'saturday-guys',name:'Saturday Guys',memberIds:['chad','mike','john','steve'],createdAt:'2026-03-01T12:00:00Z',demo:true}],trips:[{id:'myrtle-2027',name:'Myrtle Beach 2027',startDate:'2027-04-16',playerIds:['chad','mike','john','steve',...Array.from({length:8},(_,i)=>`trip-${i+5}`)],rounds:[{id:'trip-day-1',day:1,course:'Myrtle Beach National',games:['Sixes','Skins']},{id:'trip-day-2',day:2,course:'Grande Dunes',games:['Match Play','Greenies']},{id:'trip-day-3',day:3,course:'Caledonia Golf & Fish Club',games:['Nassau','Snake']}],demo:true}]});

export function cloneConfig(config:Config):Config{return JSON.parse(JSON.stringify(config)) as Config}
export function houseRuleFromRound(round:Round,name:string,groupId?:string):HouseRule{return {id:crypto.randomUUID(),name:name.trim(),games:[...round.games],holes:round.holes===9?9:18,playerCount:round.players.length,config:cloneConfig(round.config),groupId,createdAt:new Date().toISOString(),source:'saved'}}
export function applyHouseRule(rule:HouseRule,round:Round):Round{const count=rule.playerCount??round.players.length;const roster=Array.from({length:count},(_,index)=>round.players[index]??{id:`rule-player-${index}`,name:`Player ${index+1}`,handicap:18,color:'#e2e6d5'});return {...round,players:roster,games:[...rule.games],holes:rule.holes,config:cloneConfig(rule.config),results:[],presses:[],paid:[],started:false}}

export function loadProductData(raw:string|null):ProductData{
  if(!raw)return defaultProductData();
  try{
    const parsed=JSON.parse(raw) as Partial<ProductData>;
    if(parsed.version!==1||!Array.isArray(parsed.houseRules)||!Array.isArray(parsed.groups)||!Array.isArray(parsed.trips))return defaultProductData();
    return parsed as ProductData;
  }catch{return defaultProductData()}
}
