import {z} from 'zod';

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

export type SaveHoleCommand=z.infer<typeof saveHoleCommandSchema>;
export type CompleteRoundCommand=z.infer<typeof completeRoundCommandSchema>;

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
