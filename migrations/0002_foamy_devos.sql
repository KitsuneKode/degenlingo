ALTER TABLE "lesson" RENAME TO "lessons";--> statement-breakpoint
ALTER TABLE "challenges" DROP CONSTRAINT "challenges_lesson_id_lesson_id_fk";
--> statement-breakpoint
ALTER TABLE "lessons" DROP CONSTRAINT "lesson_unit_id_units_id_fk";
--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;