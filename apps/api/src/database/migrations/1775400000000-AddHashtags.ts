import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHashtags1775400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "hashtags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tag" varchar(100) NOT NULL, CONSTRAINT "UQ_hashtag_tag" UNIQUE ("tag"), PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "post_hashtags" ("post_id" uuid NOT NULL, "hashtag_id" uuid NOT NULL, PRIMARY KEY ("post_id", "hashtag_id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_ph_hashtag" ON "post_hashtags" ("hashtag_id")`);
    await queryRunner.query(`ALTER TABLE "post_hashtags" ADD CONSTRAINT "FK_ph_post" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "post_hashtags" ADD CONSTRAINT "FK_ph_hashtag" FOREIGN KEY ("hashtag_id") REFERENCES "hashtags"("id") ON DELETE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "post_hashtags"`);
    await queryRunner.query(`DROP TABLE "hashtags"`);
  }
}
