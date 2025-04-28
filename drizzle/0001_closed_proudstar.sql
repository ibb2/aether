ALTER TABLE `account` ADD `created_at` integer;--> statement-breakpoint
ALTER TABLE `account` ADD `updatedAt` integer;--> statement-breakpoint
ALTER TABLE `session` ADD `createdAt` integer;--> statement-breakpoint
ALTER TABLE `session` ADD `updatedAt` integer;--> statement-breakpoint
ALTER TABLE `account` DROP COLUMN `type`;--> statement-breakpoint
ALTER TABLE `account` DROP COLUMN `token_type`;--> statement-breakpoint
ALTER TABLE `account` DROP COLUMN `session_state`;