CREATE TABLE `holdings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`crypto_symbol` text NOT NULL,
	`crypto_name` text NOT NULL,
	`amount` real NOT NULL,
	`average_purchase_price` real NOT NULL,
	`total_invested` real NOT NULL,
	`current_price` real NOT NULL,
	`last_updated` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`crypto_symbol` text NOT NULL,
	`crypto_name` text NOT NULL,
	`transaction_type` text NOT NULL,
	`amount` real NOT NULL,
	`price_per_unit` real NOT NULL,
	`total_value` real NOT NULL,
	`transaction_date` integer NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL
);
