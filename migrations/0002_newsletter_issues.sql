CREATE TABLE `newsletter_deliveries` (
	`issue_id` text NOT NULL,
	`subscriber_id` text NOT NULL,
	`status` text DEFAULT 'QUEUED' NOT NULL,
	`error` text,
	`sent_at` integer,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`issue_id`, `subscriber_id`),
	FOREIGN KEY (`issue_id`) REFERENCES `newsletter_issues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subscriber_id`) REFERENCES `newsletter_subscribers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `newsletter_deliveries_status_idx` ON `newsletter_deliveries` (`status`);--> statement-breakpoint
CREATE INDEX `newsletter_deliveries_issue_status_idx` ON `newsletter_deliveries` (`issue_id`,`status`);--> statement-breakpoint
CREATE TABLE `newsletter_issues` (
	`id` text PRIMARY KEY NOT NULL,
	`template` text NOT NULL,
	`locale` text NOT NULL,
	`subject` text NOT NULL,
	`preheader` text,
	`heading` text NOT NULL,
	`intro` text NOT NULL,
	`items` text NOT NULL,
	`cta_label` text,
	`cta_url` text,
	`outro` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`scheduled_at` integer,
	`sent_at` integer,
	`recipient_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `newsletter_issues_status_scheduled_idx` ON `newsletter_issues` (`status`,`scheduled_at`);--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `unsubscribe_token` text;--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_subscribers_unsubscribe_token_idx` ON `newsletter_subscribers` (`unsubscribe_token`);--> statement-breakpoint
UPDATE `newsletter_subscribers` SET `unsubscribe_token` = lower(hex(randomblob(16))) WHERE `unsubscribe_token` IS NULL;