PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_account` (
	`id` text,
	`userId` text NOT NULL,
	`provider_id` text,
	`providerAccountId` text NOT NULL,
	`evolu_owner_id` text,
	`refresh_token` text,
	`refresh_token_expires_at` integer,
	`access_token` text,
	`expires_at` integer,
	`scope` text,
	`password` text,
	`id_token` text,
	`created_at` integer,
	`updatedAt` integer,
	PRIMARY KEY(`provider_id`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_account`("id", "userId", "provider_id", "providerAccountId", "evolu_owner_id", "refresh_token", "refresh_token_expires_at", "access_token", "expires_at", "scope", "password", "id_token", "created_at", "updatedAt") SELECT "id", "userId", "provider_id", "providerAccountId", "evolu_owner_id", "refresh_token", "refresh_token_expires_at", "access_token", "expires_at", "scope", "password", "id_token", "created_at", "updatedAt" FROM `account`;--> statement-breakpoint
DROP TABLE `account`;--> statement-breakpoint
ALTER TABLE `__new_account` RENAME TO `account`;--> statement-breakpoint
PRAGMA foreign_keys=ON;