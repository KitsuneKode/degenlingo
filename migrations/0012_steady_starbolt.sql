ALTER TABLE "user_redeemed_nfts" ADD COLUMN "asset_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user_subscription" ADD COLUMN "subscription_nft_claimed_signature" text;