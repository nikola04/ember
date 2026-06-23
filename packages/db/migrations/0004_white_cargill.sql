CREATE TABLE IF NOT EXISTS "server_invites" (
	"code" text PRIMARY KEY NOT NULL,
	"serverId" uuid NOT NULL,
	"memberId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "server_invites" ADD CONSTRAINT "server_invites_serverId_servers_id_fk" FOREIGN KEY ("serverId") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "server_invites" ADD CONSTRAINT "server_invites_memberId_server_members_id_fk" FOREIGN KEY ("memberId") REFERENCES "public"."server_members"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "server_invites_server_idx" ON "server_invites" USING btree ("serverId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "server_invites_member_idx" ON "server_invites" USING btree ("memberId");