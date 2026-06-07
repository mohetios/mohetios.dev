ALTER TABLE `inbox_messages` ADD `lead_status` text;--> statement-breakpoint
ALTER TABLE `inbox_messages` ADD `lead_priority` text;--> statement-breakpoint
ALTER TABLE `inbox_messages` ADD `lead_next_follow_up_at` integer;--> statement-breakpoint
ALTER TABLE `inbox_messages` ADD `lead_notes` text;--> statement-breakpoint
ALTER TABLE `inbox_messages` ADD `lead_estimated_value` integer;