ALTER TABLE "user_progress" RENAME COLUMN "coins" TO "tokens";--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "nft_mint" text NOT NULL;