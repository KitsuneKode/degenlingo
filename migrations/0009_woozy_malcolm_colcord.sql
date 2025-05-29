ALTER TABLE "solana_subscription_details" ADD COLUMN "reference" text NOT NULL;--> statement-breakpoint
ALTER TABLE "solana_subscription_details" ADD COLUMN "solana_transaction_status" text NOT NULL;--> statement-breakpoint
ALTER TABLE "solana_subscription_details" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "solana_subscription_details" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;