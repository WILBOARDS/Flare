import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReposts17749800000003 implements MigrationInterface {
  name = 'AddReposts17749800000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "reposts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "post_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_reposts_user_post" UNIQUE ("user_id", "post_id"),
        CONSTRAINT "PK_reposts" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_reposts_post_id" ON "reposts" ("post_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "reposts"
        ADD CONSTRAINT "FK_reposts_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "FK_reposts_post" FOREIGN KEY ("post_id")
          REFERENCES "posts"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "posts" ADD COLUMN "repost_count" integer NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "repost_count"`);
    await queryRunner.query(`ALTER TABLE "reposts" DROP CONSTRAINT "FK_reposts_post"`);
    await queryRunner.query(`ALTER TABLE "reposts" DROP CONSTRAINT "FK_reposts_user"`);
    await queryRunner.query(`DROP INDEX "IDX_reposts_post_id"`);
    await queryRunner.query(`DROP TABLE "reposts"`);
  }
}
