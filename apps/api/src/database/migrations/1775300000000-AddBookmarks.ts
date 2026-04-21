import { MigrationInterface, QueryRunner } from 'typeorm';
export class AddBookmarks1775300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "bookmarks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "post_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_bookmark" UNIQUE ("user_id", "post_id"),
        PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_bookmarks_user" ON "bookmarks" ("user_id", "created_at" DESC)`);
    await queryRunner.query(`ALTER TABLE "bookmarks" ADD CONSTRAINT "FK_bm_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "bookmarks" ADD CONSTRAINT "FK_bm_post" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE`);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "bookmarks"`);
  }
}
