CREATE TABLE `admin_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`url` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`read_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inbox_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`status` text DEFAULT 'NEW' NOT NULL,
	`kind` text DEFAULT 'OTHER' NOT NULL,
	`priority` text DEFAULT 'NORMAL' NOT NULL,
	`sender_name` text NOT NULL,
	`sender_email` text NOT NULL,
	`sender_company` text,
	`sender_website` text,
	`subject` text NOT NULL,
	`body_text` text NOT NULL,
	`body_html` text,
	`raw_message_id` text,
	`in_reply_to` text,
	`thread_key` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`last_activity_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inbox_replies` (
	`id` text PRIMARY KEY NOT NULL,
	`inbox_message_id` text NOT NULL,
	`from_email` text NOT NULL,
	`to_email` text NOT NULL,
	`subject` text NOT NULL,
	`body_text` text NOT NULL,
	`provider_message_id` text,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`error` text,
	`created_at` integer NOT NULL,
	`sent_at` integer,
	FOREIGN KEY (`inbox_message_id`) REFERENCES `inbox_messages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`user_agent` text,
	`device_label` text,
	`created_at` integer NOT NULL,
	`last_used_at` integer,
	`disabled_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `push_subscriptions_endpoint_idx` ON `push_subscriptions` (`endpoint`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`role` text DEFAULT 'MEMBER' NOT NULL,
	`display_name` text,
	`bio` text,
	`website` text,
	`avatar_url` text,
	`password_hash` text NOT NULL,
	`password_salt` text NOT NULL,
	`password_iterations` integer DEFAULT 210000 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);