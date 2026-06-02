CREATE TABLE `inbox_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`channel` text NOT NULL,
	`status` text DEFAULT 'UNREAD' NOT NULL,
	`category` text DEFAULT 'GENERAL' NOT NULL,
	`from_name` text NOT NULL,
	`from_email` text NOT NULL,
	`subject` text NOT NULL,
	`preview` text NOT NULL,
	`body` text NOT NULL,
	`topic` text,
	`company` text,
	`website` text,
	`source` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
