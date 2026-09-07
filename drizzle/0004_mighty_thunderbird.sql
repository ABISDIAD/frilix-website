CREATE TABLE `bag_discounts` (
	`bag_id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `size_inventory` (
	`product_id` text NOT NULL,
	`size` text NOT NULL,
	`quantity` integer NOT NULL,
	PRIMARY KEY(`product_id`, `size`)
);
--> statement-breakpoint
CREATE TABLE `welcome_emails` (
	`email` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`status` text DEFAULT 'awaiting_connection' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `welcome_emails_code_unique` ON `welcome_emails` (`code`);