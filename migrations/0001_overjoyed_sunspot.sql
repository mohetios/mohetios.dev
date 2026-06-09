CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`target_type` text NOT NULL,
	`target_path` text NOT NULL,
	`target_title` text NOT NULL,
	`parent_id` text,
	`depth` integer DEFAULT 0 NOT NULL,
	`author_name` text NOT NULL,
	`author_email` text NOT NULL,
	`author_email_hash` text NOT NULL,
	`author_user_id` text,
	`body_original` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`status_reason` text,
	`ip_hash` text,
	`user_agent_hash` text,
	`approved_at` integer,
	`approved_by` text,
	`spammed_at` integer,
	`spammed_by` text,
	`deleted_at` integer,
	`deleted_by` text,
	`edited_at` integer,
	`edited_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `comments_target_public_idx` ON `comments` (`target_type`,`target_path`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `comments_admin_status_idx` ON `comments` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `comments_parent_idx` ON `comments` (`parent_id`);--> statement-breakpoint
CREATE INDEX `comments_email_hash_idx` ON `comments` (`author_email_hash`);