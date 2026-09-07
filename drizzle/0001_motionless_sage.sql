CREATE TABLE `bag_items` (
	`bag_id` text NOT NULL,
	`product_id` text NOT NULL,
	`size` text NOT NULL,
	`quantity` integer NOT NULL,
	PRIMARY KEY(`bag_id`, `product_id`, `size`)
);
