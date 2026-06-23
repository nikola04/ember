CREATE TABLE IF NOT EXISTS "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"mimeType" text NOT NULL,
	"size" integer NOT NULL,
	"uploadedBy" uuid,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serverId" uuid NOT NULL,
	"name" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serverId" uuid NOT NULL,
	"groupId" uuid,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"topic" text,
	"retentionDays" integer,
	"bitrate" integer,
	"userLimit" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "servers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"ownerId" uuid NOT NULL,
	"iconId" uuid,
	"bannerId" uuid,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "server_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serverId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"nickname" text,
	"joinedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "server_members_server_user_uq" UNIQUE("serverId","userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "server_member_roles" (
	"memberId" uuid NOT NULL,
	"roleId" uuid NOT NULL,
	CONSTRAINT "server_member_roles_memberId_roleId_pk" PRIMARY KEY("memberId","roleId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "server_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serverId" uuid NOT NULL,
	"name" text NOT NULL,
	"permissions" bigint DEFAULT 0 NOT NULL,
	"color" integer,
	"position" integer DEFAULT 0 NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "server_roles_default_uq" UNIQUE("serverId","isDefault")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assets" ADD CONSTRAINT "assets_uploadedBy_users_id_fk" FOREIGN KEY ("uploadedBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel_groups" ADD CONSTRAINT "channel_groups_serverId_servers_id_fk" FOREIGN KEY ("serverId") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channels" ADD CONSTRAINT "channels_serverId_servers_id_fk" FOREIGN KEY ("serverId") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channels" ADD CONSTRAINT "channels_groupId_channel_groups_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."channel_groups"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "servers" ADD CONSTRAINT "servers_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "servers" ADD CONSTRAINT "servers_iconId_assets_id_fk" FOREIGN KEY ("iconId") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "servers" ADD CONSTRAINT "servers_bannerId_assets_id_fk" FOREIGN KEY ("bannerId") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "server_members" ADD CONSTRAINT "server_members_serverId_servers_id_fk" FOREIGN KEY ("serverId") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "server_members" ADD CONSTRAINT "server_members_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "server_member_roles" ADD CONSTRAINT "server_member_roles_memberId_server_members_id_fk" FOREIGN KEY ("memberId") REFERENCES "public"."server_members"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "server_member_roles" ADD CONSTRAINT "server_member_roles_roleId_server_roles_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."server_roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "server_roles" ADD CONSTRAINT "server_roles_serverId_servers_id_fk" FOREIGN KEY ("serverId") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_groups_server_idx" ON "channel_groups" USING btree ("serverId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channels_server_idx" ON "channels" USING btree ("serverId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channels_group_idx" ON "channels" USING btree ("groupId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "servers_owner_idx" ON "servers" USING btree ("ownerId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "server_members_user_idx" ON "server_members" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "server_members_server_idx" ON "server_members" USING btree ("serverId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "server_roles_server_idx" ON "server_roles" USING btree ("serverId");