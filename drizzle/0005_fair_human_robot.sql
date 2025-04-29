DROP INDEX "authenticator_credentialID_unique";--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
ALTER TABLE `verification` ALTER COLUMN "created_at" TO "created_at" integer;--> statement-breakpoint
CREATE UNIQUE INDEX `authenticator_credentialID_unique` ON `authenticator` (`credentialID`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
ALTER TABLE `verification` ALTER COLUMN "updated_at" TO "updated_at" integer;--> statement-breakpoint
ALTER TABLE `account` ADD `evolu_owner_id` text;--> statement-breakpoint
ALTER TABLE `user` ADD `evolu_user_id` text;--> statement-breakpoint
ALTER TABLE `user` ADD `stripeCustomerId` text;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_authenticator` (
	`credentialID` text NOT NULL,
	`userId` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`credentialPublicKey` text NOT NULL,
	`counter` integer NOT NULL,
	`credentialDeviceType` text NOT NULL,
	`credentialBackedUp` integer NOT NULL,
	`transports` text,
	PRIMARY KEY(`userId`, `credentialID`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_authenticator`("credentialID", "userId", "providerAccountId", "credentialPublicKey", "counter", "credentialDeviceType", "credentialBackedUp", "transports") SELECT "credentialID", "userId", "providerAccountId", "credentialPublicKey", "counter", "credentialDeviceType", "credentialBackedUp", "transports" FROM `authenticator`;--> statement-breakpoint
DROP TABLE `authenticator`;--> statement-breakpoint
ALTER TABLE `__new_authenticator` RENAME TO `authenticator`;--> statement-breakpoint
PRAGMA foreign_keys=ON;