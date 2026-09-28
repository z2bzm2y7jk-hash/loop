CREATE TABLE `group_event_invites` (
	`id` varchar(36) NOT NULL,
	`event_id` varchar(36) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`scope` enum('view','organize') NOT NULL DEFAULT 'view',
	`expires_at` datetime NOT NULL,
	`revoked_at` datetime,
	`created_by_user_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `group_event_invites_id` PRIMARY KEY(`id`),
	CONSTRAINT `group_event_invites_token_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `group_event_revisions` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`event_id` varchar(36) NOT NULL,
	`revision` int unsigned NOT NULL,
	`action` enum('created','lineup','status','round-linked','details') NOT NULL,
	`snapshot` json NOT NULL,
	`saved_by_user_id` varchar(36),
	`saved_at` datetime NOT NULL,
	CONSTRAINT `group_event_revisions_id` PRIMARY KEY(`id`),
	CONSTRAINT `group_event_revisions_event_revision_unique` UNIQUE(`event_id`,`revision`)
);
--> statement-breakpoint
CREATE TABLE `group_events` (
	`id` varchar(36) NOT NULL,
	`local_group_id` varchar(36) NOT NULL,
	`created_by_user_id` varchar(36) NOT NULL,
	`snapshot` json NOT NULL,
	`status` enum('planned','active','complete') NOT NULL DEFAULT 'planned',
	`revision` int unsigned NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `group_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `group_event_invites` ADD CONSTRAINT `group_event_invites_event_id_group_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `group_events`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_event_invites` ADD CONSTRAINT `group_event_invites_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_event_revisions` ADD CONSTRAINT `group_event_revisions_event_id_group_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `group_events`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_event_revisions` ADD CONSTRAINT `group_event_revisions_saved_by_user_id_users_id_fk` FOREIGN KEY (`saved_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_events` ADD CONSTRAINT `group_events_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `group_event_invites_event_idx` ON `group_event_invites` (`event_id`);--> statement-breakpoint
CREATE INDEX `group_event_revisions_event_idx` ON `group_event_revisions` (`event_id`);--> statement-breakpoint
CREATE INDEX `group_events_creator_idx` ON `group_events` (`created_by_user_id`);--> statement-breakpoint
CREATE INDEX `group_events_group_date_idx` ON `group_events` (`local_group_id`,`created_at`);