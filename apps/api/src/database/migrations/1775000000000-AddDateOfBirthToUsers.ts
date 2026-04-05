import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDateOfBirthToUsers1775000000000 implements MigrationInterface {
  name = 'AddDateOfBirthToUsers1775000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "date_of_birth" varchar(10) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "date_of_birth"`);
  }
}
