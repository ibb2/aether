ALTER TABLE `session` ADD `token` text;--> statement-breakpoint
ALTER TABLE `session` ADD `ip_address` text;--> statement-breakpoint
ALTER TABLE `session` ADD `user_agent` text;--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);