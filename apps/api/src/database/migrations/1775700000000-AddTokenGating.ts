import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenGating1775700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" ADD COLUMN "is_token_gated" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD COLUMN "required_token_address" varchar(42)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "required_token_address"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "is_token_gated"`);
  }
}
