CREATE TABLE `subscribers` (
	`email` text PRIMARY KEY NOT NULL,
	`consent_version` text NOT NULL,
	`subscribed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
