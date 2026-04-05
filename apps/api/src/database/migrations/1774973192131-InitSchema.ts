import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1774973192131 implements MigrationInterface {
    name = 'InitSchema1774973192131'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "likes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "post_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_723da61de46f65bb3e3096750d2" UNIQUE ("user_id", "post_id"), CONSTRAINT "PK_a9323de3f8bced7539a794b4a37" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_741df9b9b72f328a6d6f63e79f" ON "likes" ("post_id") `);
        await queryRunner.query(`CREATE TABLE "posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "author_id" uuid NOT NULL, "content" text NOT NULL, "image_url" character varying(500), "image_public_id" character varying(255), "like_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_312c63be865c81b922e39c2475" ON "posts" ("author_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_60818528127866f5002e7f826d" ON "posts" ("created_at") `);
        await queryRunner.query(`CREATE TABLE "follows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "follower_id" uuid NOT NULL, "following_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8109e59f691f0444b43420f6987" UNIQUE ("follower_id", "following_id"), CONSTRAINT "PK_8988f607744e16ff79da3b8a627" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_54b5dc2739f2dea57900933db6" ON "follows" ("follower_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c518e3988b9c057920afaf2d8c" ON "follows" ("following_id") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "supabase_id" character varying NOT NULL, "wallet_address" character varying(42), "email" character varying, "username" character varying(30), "display_name" character varying(100), "bio" text, "avatar_url" character varying(500), "creator_token_address" character varying(42), "follower_count" integer NOT NULL DEFAULT '0', "following_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_5042d5c1a5d8194ed38b6bae116" UNIQUE ("supabase_id"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5042d5c1a5d8194ed38b6bae11" ON "users" ("supabase_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username") `);
        await queryRunner.query(`CREATE TABLE "creator_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "creator_id" uuid NOT NULL, "contract_address" character varying(42) NOT NULL, "name" character varying(50) NOT NULL, "symbol" character varying(10) NOT NULL, "tx_hash" character varying(66) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_df861a5ce015562db6e3da70b81" UNIQUE ("creator_id"), CONSTRAINT "PK_e012a6b774fee7cd5d7cd637ba3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_df861a5ce015562db6e3da70b8" ON "creator_tokens" ("creator_id") `);
        await queryRunner.query(`ALTER TABLE "likes" ADD CONSTRAINT "FK_3f519ed95f775c781a254089171" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "likes" ADD CONSTRAINT "FK_741df9b9b72f328a6d6f63e79ff" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_312c63be865c81b922e39c2475e" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "follows" ADD CONSTRAINT "FK_54b5dc2739f2dea57900933db66" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "follows" ADD CONSTRAINT "FK_c518e3988b9c057920afaf2d8c0" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "creator_tokens" ADD CONSTRAINT "FK_df861a5ce015562db6e3da70b81" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "creator_tokens" DROP CONSTRAINT "FK_df861a5ce015562db6e3da70b81"`);
        await queryRunner.query(`ALTER TABLE "follows" DROP CONSTRAINT "FK_c518e3988b9c057920afaf2d8c0"`);
        await queryRunner.query(`ALTER TABLE "follows" DROP CONSTRAINT "FK_54b5dc2739f2dea57900933db66"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_312c63be865c81b922e39c2475e"`);
        await queryRunner.query(`ALTER TABLE "likes" DROP CONSTRAINT "FK_741df9b9b72f328a6d6f63e79ff"`);
        await queryRunner.query(`ALTER TABLE "likes" DROP CONSTRAINT "FK_3f519ed95f775c781a254089171"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_df861a5ce015562db6e3da70b8"`);
        await queryRunner.query(`DROP TABLE "creator_tokens"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fe0bb3f6520ee0469504521e71"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5042d5c1a5d8194ed38b6bae11"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c518e3988b9c057920afaf2d8c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_54b5dc2739f2dea57900933db6"`);
        await queryRunner.query(`DROP TABLE "follows"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_60818528127866f5002e7f826d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_312c63be865c81b922e39c2475"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_741df9b9b72f328a6d6f63e79f"`);
        await queryRunner.query(`DROP TABLE "likes"`);
    }

}
