CREATE TABLE IF NOT EXISTS `verification`  (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `user` ADD `created_at` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `updated_at` integer;
