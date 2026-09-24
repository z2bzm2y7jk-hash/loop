CREATE TABLE `user_app_data` (
	`user_id` varchar(36) NOT NULL,
	`active_round` json,
	`history` json NOT NULL,
	`product_data` json NOT NULL,
	`revision` int unsigned NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_app_data_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`user_id` varchar(36) NOT NULL,
	`handicap` decimal(4,1) NOT NULL DEFAULT '0.0',
	`preferences` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `user_app_data` ADD CONSTRAINT `user_app_data_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;