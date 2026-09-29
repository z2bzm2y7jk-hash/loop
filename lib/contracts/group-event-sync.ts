import {z} from 'zod';
import type {GolfGroup,GroupEvent,HouseRule} from '@/lib/product-model';
import type {Player} from '@/lib/types';

const game=z.enum(['Nassau','Skins','Wolf','Match Play','Sixes','Nine Point','Split Sixes','Vegas','Hammer','Greenies','Birdies','Sandies','Snake','Dots']);
const player=z.object({id:z.string().min(1).max(80),name:z.string().trim().min(1).max(80),handicap:z.number().min(-10).max(54),color:z.string().max(16)});
const pod=z.object({id:z.string().uuid(),playerIds:z.array(z.string().min(1).max(80)).min(2).max(4),linkedRoundId:z.string().uuid().optional(),withdrawnAt:z.string().datetime({offset:true}).optional()});
const event=z.object({id:z.string().uuid(),date:z.string().date(),course:z.string().trim().min(1).max(180),attendeeIds:z.array(z.string().min(1).max(80)).min(4).max(12),pods:z.array(pod).min(1).max(4),houseRuleId:z.string().max(80).optional(),status:z.enum(['planned','active','complete']),createdAt:z.string().datetime({offset:true})});
const group=z.object({id:z.string().uuid(),name:z.string().trim().min(1).max(100),memberIds:z.array(z.string().min(1).max(80)).min(2).max(24),createdAt:z.string().datetime({offset:true}),homeCourse:z.string().max(180).optional(),defaultHouseRuleId:z.string().max(80).optional()});
const houseRule=z.object({id:z.string().max(80),name:z.string().trim().min(1).max(100),games:z.array(game).min(1).max(14),holes:z.union([z.literal(9),z.literal(18)]),playerCount:z.number().int().min(2).max(8).optional(),config:z.record(z.string(),z.unknown()),groupId:z.string().max(80).optional(),createdAt:z.string().datetime({offset:true}),source:z.enum(['saved','creator']).optional()});

export const sharedWeeklySnapshotSchema=z.object({group,event,roster:z.array(player).min(4).max(24),houseRule:houseRule.optional()}).superRefine((snapshot,context)=>{
 const rosterIds=new Set(snapshot.roster.map(item=>item.id));
 snapshot.event.attendeeIds.forEach((id,index)=>{if(!rosterIds.has(id))context.addIssue({code:'custom',path:['event','attendeeIds',index],message:'Every attendee must be in the shared roster.'})});
 const assigned=snapshot.event.pods.flatMap(item=>item.playerIds);
 if(assigned.length!==snapshot.event.attendeeIds.length||new Set(assigned).size!==assigned.length||assigned.some(id=>!snapshot.event.attendeeIds.includes(id)))context.addIssue({code:'custom',path:['event','pods'],message:'Playing groups must contain every attendee exactly once.'});
});

export const createSharedWeeklyEventSchema=z.object({snapshot:sharedWeeklySnapshotSchema,scope:z.enum(['view','organize']).default('view')});
export const updateSharedWeeklyEventSchema=z.object({event,expectedRevision:z.number().int().nonnegative()});

export type SharedWeeklySnapshot={group:Pick<GolfGroup,'id'|'name'|'memberIds'|'createdAt'|'homeCourse'|'defaultHouseRuleId'>;event:GroupEvent;roster:Player[];houseRule?:HouseRule};
export type WeeklyEventActivity={revision:number;action:'created'|'lineup'|'status'|'round-linked'|'details';editorName:string;editorColor:string;savedAt:string};
export type WeeklyPodState={podId:string;roundId?:string;status:'waiting'|'draft'|'active'|'completed'|'archived';holesPlayed:number;revision:number};
export type SharedWeeklyEventResponse={snapshot:SharedWeeklySnapshot;revision:number;role:'captain'|'viewer'|'editor';scope:'view'|'organize';canEdit:boolean;claimedPlayerId?:string;claimedPlayerIds:string[];activity:WeeklyEventActivity[];podStates:WeeklyPodState[]};
export type SharedWeeklyEventSession=SharedWeeklyEventResponse&{eventId:string;token:string};
