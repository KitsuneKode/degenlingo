CREATE TABLE "user_redeemed_nfts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"unit_id" integer NOT NULL,
	"redeemed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "nft" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "redeemed_nfts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "coins" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_redeemed_nfts" ADD CONSTRAINT "user_redeemed_nfts_user_id_user_progress_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_progress"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_redeemed_nfts" ADD CONSTRAINT "user_redeemed_nfts_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;