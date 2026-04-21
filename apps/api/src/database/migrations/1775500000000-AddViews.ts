import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddViews1775500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" ADD COLUMN "view_count" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(`
      CREATE TABLE "post_views" (
        "post_id" uuid NOT NULL,
        "viewer_id" uuid NOT NULL,
        "viewed_at" TIMESTAMP NOT NULL DEFAULT now(),
        PRIMARY KEY ("post_id", "viewer_id")
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "post_views" ADD CONSTRAINT "FK_pv_post" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_views" ADD CONSTRAINT "FK_pv_viewer" FOREIGN KEY ("viewer_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "post_views"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "view_count"`);
  }
}
