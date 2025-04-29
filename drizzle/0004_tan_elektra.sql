DROP INDEX IF EXISTS `account_evoluOwnerId_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `user_evoluOwnerId_unique`;--> statement-breakpoint
ALTER TABLE `account` DROP COLUMN `evoluOwnerId`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `evoluOwnerId`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `stripeCustomerId`;