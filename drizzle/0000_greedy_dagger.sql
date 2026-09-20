CREATE TABLE `course_tees` (
	`id` varchar(36) NOT NULL,
	`course_id` varchar(36) NOT NULL,
	`provider_tee_key` varchar(128),
	`name` varchar(80) NOT NULL,
	`gender` varchar(24),
	`course_rating` decimal(4,1) NOT NULL,
	`slope_rating` int NOT NULL,
	`yardage` int,
	`pars` json NOT NULL,
	`stroke_indexes` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_tees_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_tees_provider_unique` UNIQUE(`course_id`,`provider_tee_key`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` varchar(36) NOT NULL,
	`provider` varchar(32) NOT NULL,
	`provider_course_id` varchar(128) NOT NULL,
	`name` varchar(180) NOT NULL,
	`city` varchar(100) NOT NULL,
	`region` varchar(100) NOT NULL,
	`country_code` varchar(2) NOT NULL DEFAULT 'US',
	`source_updated_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `courses_provider_unique` UNIQUE(`provider`,`provider_course_id`)
);
--> statement-breakpoint
CREATE TABLE `group_members` (
	`group_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` enum('owner','admin','member') NOT NULL DEFAULT 'member',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `group_members_group_id_user_id_pk` PRIMARY KEY(`group_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` varchar(36) NOT NULL,
	`owner_user_id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hole_results` (
	`round_id` varchar(36) NOT NULL,
	`hole_number` tinyint unsigned NOT NULL,
	`revision` int unsigned NOT NULL,
	`payload` json NOT NULL,
	`saved_by_user_id` varchar(36),
	`saved_at` datetime NOT NULL,
	CONSTRAINT `hole_results_round_id_hole_number_pk` PRIMARY KEY(`round_id`,`hole_number`)
);
--> statement-breakpoint
CREATE TABLE `hole_revisions` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`round_id` varchar(36) NOT NULL,
	`hole_number` tinyint unsigned NOT NULL,
	`revision` int unsigned NOT NULL,
	`command_id` varchar(36) NOT NULL,
	`payload` json NOT NULL,
	`saved_by_user_id` varchar(36),
	`saved_at` datetime NOT NULL,
	CONSTRAINT `hole_revisions_id` PRIMARY KEY(`id`),
	CONSTRAINT `hole_revisions_command_unique` UNIQUE(`command_id`),
	CONSTRAINT `hole_revisions_round_revision_unique` UNIQUE(`round_id`,`revision`)
);
--> statement-breakpoint
CREATE TABLE `house_rules` (
	`id` varchar(36) NOT NULL,
	`group_id` varchar(36),
	`owner_user_id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`version` int unsigned NOT NULL DEFAULT 1,
	`config` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `house_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` varchar(36) NOT NULL,
	`group_id` varchar(36),
	`linked_user_id` varchar(36),
	`display_name` varchar(80) NOT NULL,
	`handicap` decimal(4,1) NOT NULL,
	`color` varchar(16) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `players_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `round_games` (
	`id` varchar(36) NOT NULL,
	`round_id` varchar(36) NOT NULL,
	`position` tinyint unsigned NOT NULL,
	`game_key` varchar(48) NOT NULL,
	`rules_version` int unsigned NOT NULL,
	`config` json NOT NULL,
	CONSTRAINT `round_games_id` PRIMARY KEY(`id`),
	CONSTRAINT `round_games_position_unique` UNIQUE(`round_id`,`position`)
);
--> statement-breakpoint
CREATE TABLE `round_invites` (
	`id` varchar(36) NOT NULL,
	`round_id` varchar(36) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`scope` enum('view','score','captain') NOT NULL DEFAULT 'view',
	`expires_at` datetime NOT NULL,
	`max_uses` int unsigned,
	`use_count` int unsigned NOT NULL DEFAULT 0,
	`revoked_at` datetime,
	`created_by_user_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `round_invites_id` PRIMARY KEY(`id`),
	CONSTRAINT `round_invites_token_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `round_outcomes` (
	`round_id` varchar(36) NOT NULL,
	`outcome` json NOT NULL,
	`checksum` varchar(64) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `round_outcomes_round_id` PRIMARY KEY(`round_id`)
);
--> statement-breakpoint
CREATE TABLE `round_players` (
	`round_id` varchar(36) NOT NULL,
	`seat_index` tinyint unsigned NOT NULL,
	`player_id` varchar(36),
	`linked_user_id` varchar(36),
	`display_name` varchar(80) NOT NULL,
	`handicap` decimal(4,1) NOT NULL,
	`color` varchar(16) NOT NULL,
	CONSTRAINT `round_players_round_id_seat_index_pk` PRIMARY KEY(`round_id`,`seat_index`)
);
--> statement-breakpoint
CREATE TABLE `rounds` (
	`id` varchar(36) NOT NULL,
	`group_id` varchar(36),
	`created_by_user_id` varchar(36) NOT NULL,
	`status` enum('draft','active','completed','archived') NOT NULL DEFAULT 'draft',
	`played_on` datetime NOT NULL,
	`holes` tinyint unsigned NOT NULL,
	`course_snapshot` json NOT NULL,
	`revision` int unsigned NOT NULL DEFAULT 0,
	`started_at` datetime,
	`completed_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `rounds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`expires_at` datetime NOT NULL,
	`last_seen_at` datetime NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_token_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `settlement_items` (
	`id` varchar(36) NOT NULL,
	`round_id` varchar(36) NOT NULL,
	`from_seat` tinyint unsigned NOT NULL,
	`to_seat` tinyint unsigned NOT NULL,
	`amount_cents` int unsigned NOT NULL,
	`paid` boolean NOT NULL DEFAULT false,
	`paid_at` datetime,
	CONSTRAINT `settlement_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trip_members` (
	`trip_id` varchar(36) NOT NULL,
	`player_id` varchar(36) NOT NULL,
	CONSTRAINT `trip_members_trip_id_player_id_pk` PRIMARY KEY(`trip_id`,`player_id`)
);
--> statement-breakpoint
CREATE TABLE `trip_rounds` (
	`id` varchar(36) NOT NULL,
	`trip_id` varchar(36) NOT NULL,
	`day_number` tinyint unsigned NOT NULL,
	`planned_course` varchar(180) NOT NULL,
	`planned_config` json NOT NULL,
	`linked_round_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trip_rounds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` varchar(36) NOT NULL,
	`group_id` varchar(36),
	`owner_user_id` varchar(36) NOT NULL,
	`name` varchar(120) NOT NULL,
	`starts_on` datetime NOT NULL,
	`ends_on` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `trips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(254) NOT NULL,
	`display_name` varchar(80) NOT NULL,
	`password_hash` varchar(255),
	`email_verified_at` datetime,
	`status` enum('active','disabled','deleted') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `course_tees` ADD CONSTRAINT `course_tees_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_members` ADD CONSTRAINT `group_members_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_members` ADD CONSTRAINT `group_members_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `groups` ADD CONSTRAINT `groups_owner_user_id_users_id_fk` FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hole_results` ADD CONSTRAINT `hole_results_round_id_rounds_id_fk` FOREIGN KEY (`round_id`) REFERENCES `rounds`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hole_results` ADD CONSTRAINT `hole_results_saved_by_user_id_users_id_fk` FOREIGN KEY (`saved_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hole_revisions` ADD CONSTRAINT `hole_revisions_round_id_rounds_id_fk` FOREIGN KEY (`round_id`) REFERENCES `rounds`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hole_revisions` ADD CONSTRAINT `hole_revisions_saved_by_user_id_users_id_fk` FOREIGN KEY (`saved_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `house_rules` ADD CONSTRAINT `house_rules_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `house_rules` ADD CONSTRAINT `house_rules_owner_user_id_users_id_fk` FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `players` ADD CONSTRAINT `players_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `players` ADD CONSTRAINT `players_linked_user_id_users_id_fk` FOREIGN KEY (`linked_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `round_games` ADD CONSTRAINT `round_games_round_id_rounds_id_fk` FOREIGN KEY (`round_id`) REFERENCES `rounds`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `round_invites` ADD CONSTRAINT `round_invites_round_id_rounds_id_fk` FOREIGN KEY (`round_id`) REFERENCES `rounds`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `round_invites` ADD CONSTRAINT `round_invites_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `round_outcomes` ADD CONSTRAINT `round_outcomes_round_id_rounds_id_fk` FOREIGN KEY (`round_id`) REFERENCES `rounds`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `round_outcomes_checksum_idx` ON `round_outcomes` (`checksum`);--> statement-breakpoint
ALTER TABLE `round_players` ADD CONSTRAINT `round_players_round_id_rounds_id_fk` FOREIGN KEY (`round_id`) REFERENCES `rounds`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `round_players` ADD CONSTRAINT `round_players_player_id_players_id_fk` FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `round_players` ADD CONSTRAINT `round_players_linked_user_id_users_id_fk` FOREIGN KEY (`linked_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rounds` ADD CONSTRAINT `rounds_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rounds` ADD CONSTRAINT `rounds_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `settlement_items` ADD CONSTRAINT `settlement_items_round_id_rounds_id_fk` FOREIGN KEY (`round_id`) REFERENCES `rounds`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_members` ADD CONSTRAINT `trip_members_trip_id_trips_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_members` ADD CONSTRAINT `trip_members_player_id_players_id_fk` FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_rounds` ADD CONSTRAINT `trip_rounds_trip_id_trips_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_rounds` ADD CONSTRAINT `trip_rounds_linked_round_id_rounds_id_fk` FOREIGN KEY (`linked_round_id`) REFERENCES `rounds`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trips` ADD CONSTRAINT `trips_group_id_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trips` ADD CONSTRAINT `trips_owner_user_id_users_id_fk` FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `course_tees_course_idx` ON `course_tees` (`course_id`);--> statement-breakpoint
CREATE INDEX `courses_name_idx` ON `courses` (`name`);--> statement-breakpoint
CREATE INDEX `group_members_user_idx` ON `group_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `groups_owner_idx` ON `groups` (`owner_user_id`);--> statement-breakpoint
CREATE INDEX `hole_results_round_revision_idx` ON `hole_results` (`round_id`,`revision`);--> statement-breakpoint
CREATE INDEX `hole_revisions_round_hole_idx` ON `hole_revisions` (`round_id`,`hole_number`);--> statement-breakpoint
CREATE INDEX `house_rules_group_idx` ON `house_rules` (`group_id`);--> statement-breakpoint
CREATE INDEX `house_rules_owner_idx` ON `house_rules` (`owner_user_id`);--> statement-breakpoint
CREATE INDEX `players_group_idx` ON `players` (`group_id`);--> statement-breakpoint
CREATE INDEX `players_linked_user_idx` ON `players` (`linked_user_id`);--> statement-breakpoint
CREATE INDEX `round_games_key_idx` ON `round_games` (`game_key`);--> statement-breakpoint
CREATE INDEX `round_invites_round_idx` ON `round_invites` (`round_id`);--> statement-breakpoint
CREATE INDEX `round_players_user_idx` ON `round_players` (`linked_user_id`);--> statement-breakpoint
CREATE INDEX `rounds_group_played_idx` ON `rounds` (`group_id`,`played_on`);--> statement-breakpoint
CREATE INDEX `rounds_creator_idx` ON `rounds` (`created_by_user_id`);--> statement-breakpoint
CREATE INDEX `sessions_user_expires_idx` ON `sessions` (`user_id`,`expires_at`);--> statement-breakpoint
CREATE INDEX `settlement_items_round_idx` ON `settlement_items` (`round_id`);--> statement-breakpoint
CREATE INDEX `trip_rounds_trip_day_idx` ON `trip_rounds` (`trip_id`,`day_number`);--> statement-breakpoint
CREATE INDEX `trips_owner_idx` ON `trips` (`owner_user_id`);--> statement-breakpoint
CREATE INDEX `trips_group_idx` ON `trips` (`group_id`);
