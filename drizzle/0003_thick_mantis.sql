ALTER TABLE `group_members` ADD `player_id` varchar(80);--> statement-breakpoint
ALTER TABLE `group_members` ADD CONSTRAINT `group_members_player_unique` UNIQUE(`group_id`,`player_id`);