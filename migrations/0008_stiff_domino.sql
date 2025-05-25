CREATE TYPE "public"."payment_method" AS ENUM('stripe', 'solana');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'cancelled', 'expired', 'pending');--> statement-breakpoint
CREATE TABLE "solana_subscription_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_subscription_id" integer NOT NULL,
	"solana_wallet_address" text NOT NULL,
	"solana_transaction_signature" text NOT NULL,
	"solana_token_amount" numeric(20, 9) NOT NULL,
	CONSTRAINT "solana_subscription_details_user_subscription_id_unique" UNIQUE("user_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "stripe_subscription_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_subscription_id" integer NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"stripe_subscription_id" text NOT NULL,
	"stripe_price_id" text NOT NULL,
	"stripe_current_period_end" timestamp NOT NULL,
	CONSTRAINT "stripe_subscription_details_user_subscription_id_unique" UNIQUE("user_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "user_subscription" DROP CONSTRAINT "user_subscription_user_id_unique";--> statement-breakpoint
ALTER TABLE "user_subscription" DROP CONSTRAINT "user_subscription_stripe_customer_id_unique";--> statement-breakpoint
ALTER TABLE "user_subscription" DROP CONSTRAINT "user_subscription_stripe_subscription_id_unique";--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "wallet_address" text;--> statement-breakpoint
ALTER TABLE "user_redeemed_nfts" ADD COLUMN "mint_address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user_redeemed_nfts" ADD COLUMN "transaction_signature" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user_subscription" ADD COLUMN "payment_method" "payment_method" NOT NULL;--> statement-breakpoint
ALTER TABLE "user_subscription" ADD COLUMN "subscription_status" "subscription_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_subscription" ADD COLUMN "subscription_start" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_subscription" ADD COLUMN "subscription_end" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "user_subscription" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_subscription" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "solana_subscription_details" ADD CONSTRAINT "solana_subscription_details_user_subscription_id_user_subscription_id_fk" FOREIGN KEY ("user_subscription_id") REFERENCES "public"."user_subscription"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stripe_subscription_details" ADD CONSTRAINT "stripe_subscription_details_user_subscription_id_user_subscription_id_fk" FOREIGN KEY ("user_subscription_id") REFERENCES "public"."user_subscription"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscription" ADD CONSTRAINT "user_subscription_user_id_user_progress_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_progress"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscription" DROP COLUMN "stripe_customer_id";--> statement-breakpoint
ALTER TABLE "user_subscription" DROP COLUMN "stripe_subscription_id";--> statement-breakpoint
ALTER TABLE "user_subscription" DROP COLUMN "stripe_price_id";--> statement-breakpoint
ALTER TABLE "user_subscription" DROP COLUMN "stripe_current_period_end";