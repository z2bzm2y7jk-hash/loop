import {z} from 'zod';
import type {Round} from '../types';

const playerScoreSchema=z.object({
 seatIndex:z.number().int().min(0).max(7),
 strokes:z.number().int().min(1).max(25),
});

export const saveHoleCommandSchema=z.object({
 commandId:z.string().uuid(),
 roundId:z.string().uuid(),
 holeNumber:z.number().int().min(1).max(18),
 expectedRoundRevision:z.number().int().nonnegative(),
 clientSavedAt:z.string().datetime({offset:true}),
 scores:z.array(playerScoreSchema).min(2).max(8),
 decisions:z.record(z.string(),z.unknown()).default({}),
}).superRefine((command,context)=>{
 const seats=new Set(command.scores.map(score=>score.seatIndex));
 if(seats.size!==command.scores.length)context.addIssue({code:'custom',path:['scores'],message:'Each player seat can appear only once.'});
});

export const roundChangesQuerySchema=z.object({
 afterRevision:z.coerce.number().int().nonnegative().default(0),
});

export const completeRoundCommandSchema=z.object({
 commandId:z.string().uuid(),
 roundId:z.string().uuid(),
 expectedRoundRevision:z.number().int().nonnegative(),
});

const sharedPlayerSchema=z.object({id:z.string().min(1).max(80),name:z.string().trim().min(1).max(80),handicap:z.number().min(-10).max(54),color:z.string().max(16)});
const sharedHoleSchema=z.object({scores:z.array(z.number().int().min(1).max(25)).min(2).max(8),greenie:z.number().int().nullable(),sandies:z.array(z.number().int().min(0).max(7)),dots:z.array(z.number().int().min(0).max(7)),snake:z.number().int().min(0).max(7).nullable()}).passthrough();

export const sharedRoundSchema=z.object({
 id:z.string().uuid(),course:z.string().trim().min(1).max(180),holes:z.union([z.literal(9),z.literal(18)]),players:z.array(sharedPlayerSchema).min(2).max(8),
 games:z.array(z.enum(['Nassau','Skins','Wolf','Match Play','Sixes','Vegas','Hammer','Greenies','Birdies','Sandies','Snake','Dots'])).min(1).max(12),
 config:z.object({front:z.number().nonnegative(),back:z.number().nonnegative(),overall:z.number().nonnegative(),auto:z.boolean(),teams:z.boolean(),skin:z.number().nonnegative(),carry:z.boolean(),net:z.boolean(),greenie:z.number().nonnegative(),greenHoles:z.array(z.number().int().min(1).max(18)),birdie:z.number().nonnegative()}).passthrough(),
 results:z.array(sharedHoleSchema).max(18),presses:z.array(z.object({start:z.number().int().min(0).max(17),end:z.number().int().min(0).max(17),pair:z.number().int().nonnegative()})).max(100),paid:z.array(z.string().max(120)).max(100),date:z.string().datetime({offset:true}),started:z.boolean().optional(),
 tee:z.object({name:z.string().max(80),location:z.string().max(180),courseRating:z.number(),slopeRating:z.number(),pars:z.array(z.number()),strokeIndexes:z.array(z.number()),source:z.enum(['demo','manual','opengolf'])}).passthrough().optional(),
 ended:z.object({kind:z.literal('cancelled'),reason:z.string().max(80),keepBets:z.boolean(),endedAt:z.string().datetime({offset:true}),holesPlayed:z.number().int().min(0).max(18)}).optional(),
}).superRefine((round,context)=>{if(round.results.length>round.holes)context.addIssue({code:'custom',path:['results'],message:'A round cannot contain more results than holes.'});round.results.forEach((hole,index)=>{if(hole.scores.length!==round.players.length)context.addIssue({code:'custom',path:['results',index,'scores'],message:'Every player needs a score.'})})});

export const createSharedRoundSchema=z.object({round:sharedRoundSchema,scope:z.enum(['view','score']).default('view')});
export const cancelSharedRoundSchema=z.object({expectedRoundRevision:z.number().int().nonnegative(),reason:z.string().trim().min(1).max(80),keepBets:z.boolean()});
export const sharedHoleCommandSchema=saveHoleCommandSchema.extend({round:sharedRoundSchema});

export type SaveHoleCommand=z.infer<typeof saveHoleCommandSchema>;
export type CompleteRoundCommand=z.infer<typeof completeRoundCommandSchema>;
export type RoundActivity={revision:number;holeNumber:number;editorName:string;editorColor:string;savedAt:string};
export type SharedRoundResponse={round:Round;revision:number;status:'draft'|'active'|'completed'|'archived';role:'captain'|'viewer'|'editor';scope:'view'|'score';canEdit:boolean;activity:RoundActivity[]};

export type CourseSnapshot={
 courseName:string;
 location:string;
 teeName:string;
 courseRating:number;
 slopeRating:number;
 yardage?:number;
 gender?:string;
 pars:number[];
 strokeIndexes:number[];
 provider?:string;
 providerCourseId?:string;
 attribution?:string;
 ended?:Round['ended'];
};

export type HolePayload={
 scores:Array<{seatIndex:number;strokes:number}>;
 decisions:Record<string,unknown>;
};

export type RoundOutcomeSnapshot={
 rulesVersion:number;
 ledger:Array<{game:string;balancesCents:number[];explanation?:string[]}>;
 balancesCents:number[];
 completedAt:string;
};
