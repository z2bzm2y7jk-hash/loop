import {bigint,boolean,datetime,decimal,index,int,json,mysqlEnum,mysqlTable,primaryKey,timestamp,tinyint,uniqueIndex,varchar} from 'drizzle-orm/mysql-core';
import type {CourseSnapshot,HolePayload,RoundOutcomeSnapshot} from '@/lib/contracts/round-sync';

const id=(name:string)=>varchar(name,{length:36});
const createdAt=()=>timestamp('created_at',{mode:'date'}).defaultNow().notNull();
const updatedAt=()=>timestamp('updated_at',{mode:'date'}).defaultNow().onUpdateNow().notNull();

export const users=mysqlTable('users',{
 id:id('id').primaryKey(),
 email:varchar('email',{length:254}).notNull(),
 displayName:varchar('display_name',{length:80}).notNull(),
 passwordHash:varchar('password_hash',{length:255}),
 emailVerifiedAt:datetime('email_verified_at',{mode:'date'}),
 status:mysqlEnum('status',['active','disabled','deleted']).default('active').notNull(),
 createdAt:createdAt(),updatedAt:updatedAt(),
},table=>[uniqueIndex('users_email_unique').on(table.email)]);

export const sessions=mysqlTable('sessions',{
 id:id('id').primaryKey(),
 userId:id('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}),
 tokenHash:varchar('token_hash',{length:64}).notNull(),
 expiresAt:datetime('expires_at',{mode:'date'}).notNull(),
 lastSeenAt:datetime('last_seen_at',{mode:'date'}).notNull(),
 createdAt:createdAt(),
},table=>[uniqueIndex('sessions_token_hash_unique').on(table.tokenHash),index('sessions_user_expires_idx').on(table.userId,table.expiresAt)]);

export const groups=mysqlTable('groups',{
 id:id('id').primaryKey(),
 ownerUserId:id('owner_user_id').notNull().references(()=>users.id),
 name:varchar('name',{length:100}).notNull(),
 createdAt:createdAt(),updatedAt:updatedAt(),
 deletedAt:datetime('deleted_at',{mode:'date'}),
},table=>[index('groups_owner_idx').on(table.ownerUserId)]);

export const groupMembers=mysqlTable('group_members',{
 groupId:id('group_id').notNull().references(()=>groups.id,{onDelete:'cascade'}),
 userId:id('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}),
 role:mysqlEnum('role',['owner','admin','member']).default('member').notNull(),
 joinedAt:createdAt(),
},table=>[primaryKey({columns:[table.groupId,table.userId]}),index('group_members_user_idx').on(table.userId)]);

export const players=mysqlTable('players',{
 id:id('id').primaryKey(),
 groupId:id('group_id').references(()=>groups.id,{onDelete:'cascade'}),
 linkedUserId:id('linked_user_id').references(()=>users.id,{onDelete:'set null'}),
 displayName:varchar('display_name',{length:80}).notNull(),
 handicap:decimal('handicap',{precision:4,scale:1}).notNull(),
 color:varchar('color',{length:16}).notNull(),
 createdAt:createdAt(),updatedAt:updatedAt(),
},table=>[index('players_group_idx').on(table.groupId),index('players_linked_user_idx').on(table.linkedUserId)]);

export const courses=mysqlTable('courses',{
 id:id('id').primaryKey(),
 provider:varchar('provider',{length:32}).notNull(),
 providerCourseId:varchar('provider_course_id',{length:128}).notNull(),
 name:varchar('name',{length:180}).notNull(),
 city:varchar('city',{length:100}).notNull(),
 region:varchar('region',{length:100}).notNull(),
 countryCode:varchar('country_code',{length:2}).default('US').notNull(),
 sourceUpdatedAt:datetime('source_updated_at',{mode:'date'}),
 createdAt:createdAt(),updatedAt:updatedAt(),
},table=>[uniqueIndex('courses_provider_unique').on(table.provider,table.providerCourseId),index('courses_name_idx').on(table.name)]);

export const courseTees=mysqlTable('course_tees',{
 id:id('id').primaryKey(),
 courseId:id('course_id').notNull().references(()=>courses.id,{onDelete:'cascade'}),
 providerTeeKey:varchar('provider_tee_key',{length:128}),
 name:varchar('name',{length:80}).notNull(),
 gender:varchar('gender',{length:24}),
 courseRating:decimal('course_rating',{precision:4,scale:1}).notNull(),
 slopeRating:int('slope_rating').notNull(),
 yardage:int('yardage'),
 pars:json('pars').$type<number[]>().notNull(),
 strokeIndexes:json('stroke_indexes').$type<number[]>().notNull(),
 createdAt:createdAt(),updatedAt:updatedAt(),
},table=>[index('course_tees_course_idx').on(table.courseId),uniqueIndex('course_tees_provider_unique').on(table.courseId,table.providerTeeKey)]);

export const rounds=mysqlTable('rounds',{
 id:id('id').primaryKey(),
 groupId:id('group_id').references(()=>groups.id,{onDelete:'set null'}),
 createdByUserId:id('created_by_user_id').notNull().references(()=>users.id),
 status:mysqlEnum('status',['draft','active','completed','archived']).default('draft').notNull(),
 playedOn:datetime('played_on',{mode:'date'}).notNull(),
 holes:tinyint('holes',{unsigned:true}).notNull(),
 courseSnapshot:json('course_snapshot').$type<CourseSnapshot>().notNull(),
 revision:int('revision',{unsigned:true}).default(0).notNull(),
 startedAt:datetime('started_at',{mode:'date'}),
 completedAt:datetime('completed_at',{mode:'date'}),
 createdAt:createdAt(),updatedAt:updatedAt(),
 deletedAt:datetime('deleted_at',{mode:'date'}),
},table=>[index('rounds_group_played_idx').on(table.groupId,table.playedOn),index('rounds_creator_idx').on(table.createdByUserId)]);

export const roundPlayers=mysqlTable('round_players',{
 roundId:id('round_id').notNull().references(()=>rounds.id,{onDelete:'cascade'}),
 seatIndex:tinyint('seat_index',{unsigned:true}).notNull(),
 playerId:id('player_id').references(()=>players.id,{onDelete:'set null'}),
 linkedUserId:id('linked_user_id').references(()=>users.id,{onDelete:'set null'}),
 displayName:varchar('display_name',{length:80}).notNull(),
 handicap:decimal('handicap',{precision:4,scale:1}).notNull(),
 color:varchar('color',{length:16}).notNull(),
},table=>[primaryKey({columns:[table.roundId,table.seatIndex]}),index('round_players_user_idx').on(table.linkedUserId)]);

export const roundGames=mysqlTable('round_games',{
 id:id('id').primaryKey(),
 roundId:id('round_id').notNull().references(()=>rounds.id,{onDelete:'cascade'}),
 position:tinyint('position',{unsigned:true}).notNull(),
 gameKey:varchar('game_key',{length:48}).notNull(),
 rulesVersion:int('rules_version',{unsigned:true}).notNull(),
 config:json('config').$type<Record<string,unknown>>().notNull(),
},table=>[uniqueIndex('round_games_position_unique').on(table.roundId,table.position),index('round_games_key_idx').on(table.gameKey)]);

export const roundInvites=mysqlTable('round_invites',{
 id:id('id').primaryKey(),
 roundId:id('round_id').notNull().references(()=>rounds.id,{onDelete:'cascade'}),
 tokenHash:varchar('token_hash',{length:64}).notNull(),
 scope:mysqlEnum('scope',['view','score','captain']).default('view').notNull(),
 expiresAt:datetime('expires_at',{mode:'date'}).notNull(),
 maxUses:int('max_uses',{unsigned:true}),
 useCount:int('use_count',{unsigned:true}).default(0).notNull(),
 revokedAt:datetime('revoked_at',{mode:'date'}),
 createdByUserId:id('created_by_user_id').notNull().references(()=>users.id),
 createdAt:createdAt(),
},table=>[uniqueIndex('round_invites_token_unique').on(table.tokenHash),index('round_invites_round_idx').on(table.roundId)]);

export const holeResults=mysqlTable('hole_results',{
 roundId:id('round_id').notNull().references(()=>rounds.id,{onDelete:'cascade'}),
 holeNumber:tinyint('hole_number',{unsigned:true}).notNull(),
 revision:int('revision',{unsigned:true}).notNull(),
 payload:json('payload').$type<HolePayload>().notNull(),
 savedByUserId:id('saved_by_user_id').references(()=>users.id,{onDelete:'set null'}),
 savedAt:datetime('saved_at',{mode:'date'}).notNull(),
},table=>[primaryKey({columns:[table.roundId,table.holeNumber]}),index('hole_results_round_revision_idx').on(table.roundId,table.revision)]);

export const holeRevisions=mysqlTable('hole_revisions',{
 id:bigint('id',{mode:'number',unsigned:true}).autoincrement().primaryKey(),
 roundId:id('round_id').notNull().references(()=>rounds.id,{onDelete:'cascade'}),
 holeNumber:tinyint('hole_number',{unsigned:true}).notNull(),
 revision:int('revision',{unsigned:true}).notNull(),
 commandId:varchar('command_id',{length:36}).notNull(),
 payload:json('payload').$type<HolePayload>().notNull(),
 savedByUserId:id('saved_by_user_id').references(()=>users.id,{onDelete:'set null'}),
 savedAt:datetime('saved_at',{mode:'date'}).notNull(),
},table=>[uniqueIndex('hole_revisions_command_unique').on(table.commandId),uniqueIndex('hole_revisions_round_revision_unique').on(table.roundId,table.revision),index('hole_revisions_round_hole_idx').on(table.roundId,table.holeNumber)]);

export const roundOutcomes=mysqlTable('round_outcomes',{
 roundId:id('round_id').primaryKey().references(()=>rounds.id,{onDelete:'cascade'}),
 outcome:json('outcome').$type<RoundOutcomeSnapshot>().notNull(),
 checksum:varchar('checksum',{length:64}).notNull(),
 createdAt:createdAt(),
},table=>[index('round_outcomes_checksum_idx').on(table.checksum)]);

export const settlementItems=mysqlTable('settlement_items',{
 id:id('id').primaryKey(),
 roundId:id('round_id').notNull().references(()=>rounds.id,{onDelete:'cascade'}),
 fromSeat:tinyint('from_seat',{unsigned:true}).notNull(),
 toSeat:tinyint('to_seat',{unsigned:true}).notNull(),
 amountCents:int('amount_cents',{unsigned:true}).notNull(),
 paid:boolean('paid').default(false).notNull(),
 paidAt:datetime('paid_at',{mode:'date'}),
},table=>[index('settlement_items_round_idx').on(table.roundId)]);

export const houseRules=mysqlTable('house_rules',{
 id:id('id').primaryKey(),
 groupId:id('group_id').references(()=>groups.id,{onDelete:'cascade'}),
 ownerUserId:id('owner_user_id').notNull().references(()=>users.id),
 name:varchar('name',{length:100}).notNull(),
 version:int('version',{unsigned:true}).default(1).notNull(),
 config:json('config').$type<Record<string,unknown>>().notNull(),
 createdAt:createdAt(),updatedAt:updatedAt(),
 deletedAt:datetime('deleted_at',{mode:'date'}),
},table=>[index('house_rules_group_idx').on(table.groupId),index('house_rules_owner_idx').on(table.ownerUserId)]);

export const trips=mysqlTable('trips',{
 id:id('id').primaryKey(),
 groupId:id('group_id').references(()=>groups.id,{onDelete:'set null'}),
 ownerUserId:id('owner_user_id').notNull().references(()=>users.id),
 name:varchar('name',{length:120}).notNull(),
 startsOn:datetime('starts_on',{mode:'date'}).notNull(),
 endsOn:datetime('ends_on',{mode:'date'}),
 createdAt:createdAt(),updatedAt:updatedAt(),
 deletedAt:datetime('deleted_at',{mode:'date'}),
},table=>[index('trips_owner_idx').on(table.ownerUserId),index('trips_group_idx').on(table.groupId)]);

export const tripMembers=mysqlTable('trip_members',{
 tripId:id('trip_id').notNull().references(()=>trips.id,{onDelete:'cascade'}),
 playerId:id('player_id').notNull().references(()=>players.id,{onDelete:'cascade'}),
},table=>[primaryKey({columns:[table.tripId,table.playerId]})]);

export const tripRounds=mysqlTable('trip_rounds',{
 id:id('id').primaryKey(),
 tripId:id('trip_id').notNull().references(()=>trips.id,{onDelete:'cascade'}),
 dayNumber:tinyint('day_number',{unsigned:true}).notNull(),
 plannedCourse:varchar('planned_course',{length:180}).notNull(),
 plannedConfig:json('planned_config').$type<Record<string,unknown>>().notNull(),
 linkedRoundId:id('linked_round_id').references(()=>rounds.id,{onDelete:'set null'}),
 createdAt:createdAt(),updatedAt:updatedAt(),
},table=>[index('trip_rounds_trip_day_idx').on(table.tripId,table.dayNumber)]);
