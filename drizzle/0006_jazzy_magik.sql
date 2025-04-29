ALTER TABLE `account` ADD `provider_id` text;--> statement-breakpoint
ALTER TABLE `account` ADD `refresh_token_expires_at` integer;--> statement-breakpoint
ALTER TABLE `account` ADD `password` text;