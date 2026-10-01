CREATE TABLE `group_event_guest_claims` (
	`event_id` varchar(36) NOT NULL,
	`guest_session_id` varchar(36) NOT NULL,
	`player_id` varchar(80) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `group_event_guest_claims_event_id_guest_session_id_pk` PRIMARY KEY(`event_id`,`guest_session_id`),
	CONSTRAINT `group_event_guest_claims_player_unique` UNIQUE(`event_id`,`player_id`)
);
--> statement-breakpoint
CREATE TABLE `guest_sessions` (
	`id` varchar(36) NOT NULL,
	`display_name` varchar(80) NOT NULL,
	`color` varchar(16) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`expires_at` datetime NOT NULL,
	`last_seen_at` datetime NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `guest_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `guest_sessions_token_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
ALTER TABLE `group_event_revisions` ADD `saved_by_guest_id` varchar(36);--> statement-breakpoint
ALTER TABLE `hole_results` ADD `saved_by_guest_id` varchar(36);--> statement-breakpoint
ALTER TABLE `hole_revisions` ADD `saved_by_guest_id` varchar(36);--> statement-breakpoint
ALTER TABLE `group_event_guest_claims` ADD CONSTRAINT `group_event_guest_claims_event_id_group_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `group_events`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_event_guest_claims` ADD CONSTRAINT `group_event_guest_claims_guest_session_id_guest_sessions_id_fk` FOREIGN KEY (`guest_session_id`) REFERENCES `guest_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `group_event_guest_claims_guest_idx` ON `group_event_guest_claims` (`guest_session_id`);--> statement-breakpoint
CREATE INDEX `guest_sessions_expires_idx` ON `guest_sessions` (`expires_at`);--> statement-breakpoint
ALTER TABLE `group_event_revisions` ADD CONSTRAINT `group_event_revisions_saved_by_guest_id_guest_sessions_id_fk` FOREIGN KEY (`saved_by_guest_id`) REFERENCES `guest_sessions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hole_results` ADD CONSTRAINT `hole_results_saved_by_guest_id_guest_sessions_id_fk` FOREIGN KEY (`saved_by_guest_id`) REFERENCES `guest_sessions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hole_revisions` ADD CONSTRAINT `hole_revisions_saved_by_guest_id_guest_sessions_id_fk` FOREIGN KEY (`saved_by_guest_id`) REFERENCES `guest_sessions`(`id`) ON DELETE set null ON UPDATE no action;