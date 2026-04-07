import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddComments1775100000000 implements MigrationInterface {
  name = 'AddComments1775100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "post_id" uuid NOT NULL, "author_id" uuid NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_comments" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_comments_post_id" ON "comments" ("post_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_comments_created_at" ON "comments" ("created_at")`);
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_comments_post" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_comments_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "posts" ADD COLUMN "comment_count" integer NOT NULL DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "comment_count"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_author"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_post"`);
    await queryRunner.query(`DROP INDEX "IDX_comments_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_comments_post_id"`);
    await queryRunner.query(`DROP TABLE "comments"`);
  }
}
