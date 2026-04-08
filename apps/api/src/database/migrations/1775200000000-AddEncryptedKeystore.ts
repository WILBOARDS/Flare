import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEncryptedKeystore1775200000000 implements MigrationInterface {
    name = 'AddEncryptedKeystore1775200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "encrypted_keystore" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "encrypted_keystore"`);
    }
}
