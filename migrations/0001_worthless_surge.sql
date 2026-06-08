CREATE TABLE `newsletter_subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`normalized_email` text NOT NULL,
	`name` text,
	`status` text DEFAULT 'subscribed' NOT NULL,
	`source` text,
	`locale` text,
	`tags` text,
	`consent_text` text NOT NULL,
	`consent_version` text DEFAULT 'newsletter-consent-v1' NOT NULL,
	`consent_at` integer NOT NULL,
	`confirmed_at` integer,
	`unsubscribed_at` integer,
	`last_email_sent_at` integer,
	`last_opened_at` integer,
	`last_clicked_at` integer,
	`unsubscribe_token_hash` text,
	`ip_hash` text,
	`user_agent_hash` text,
	`turnstile_verified_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_subscribers_email_idx` ON `newsletter_subscribers` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_subscribers_normalized_email_idx` ON `newsletter_subscribers` (`normalized_email`);--> statement-breakpoint
CREATE INDEX `newsletter_subscribers_status_idx` ON `newsletter_subscribers` (`status`);--> statement-breakpoint
CREATE INDEX `newsletter_subscribers_created_at_idx` ON `newsletter_subscribers` (`created_at`);