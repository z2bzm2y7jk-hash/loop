/** Shared product vocabulary. These reference the persisted engine types rather than duplicate their data. */
import type {Config,Game,Hole,Ledger,Player,Round} from './types';
import type {GolfGroup,GolfTrip,HouseRule,TripRound} from './product-model';
import type {GameMetadata} from './game-catalog';
import type {Exposure} from './games/exposure';
import type {groupInsights} from './insights/groupInsights';
import type {settle} from './settlement';
export type {Player,Round,Hole,GolfGroup,GolfTrip,HouseRule,TripRound};
export type Score=number;
export type Course={id:string;name:string;pars:number[];strokeIndexes:number[]};
export type GameDefinition={id:Game;metadata:GameMetadata};
export type GameConfiguration={game:Game;settings:Config};
export type ActiveGame={roundId:Round['id'];game:Game;configuration:Config};
export type GameResult=Ledger;
export type Settlement=ReturnType<typeof settle>;
export type PaymentStatus={paymentId:string;paid:boolean};
export type GroupInsight=ReturnType<typeof groupInsights>;
export type ExposureEstimate=Exposure;
