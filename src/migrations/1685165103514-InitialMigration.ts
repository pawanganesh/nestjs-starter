import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1685165103514 implements MigrationInterface {
    name = 'InitialMigration1685165103514'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."otp_otp_type_enum" AS ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "otp" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(6) NOT NULL, "otp_type" "public"."otp_otp_type_enum" NOT NULL DEFAULT 'OTHER', "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying(100) NOT NULL, "email" character varying(100) NOT NULL, "password" text NOT NULL, "verified" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "otp" ADD CONSTRAINT "FK_258d028d322ea3b856bf9f12f25" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp" DROP CONSTRAINT "FK_258d028d322ea3b856bf9f12f25"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "otp"`);
        await queryRunner.query(`DROP TYPE "public"."otp_otp_type_enum"`);
    }

}
