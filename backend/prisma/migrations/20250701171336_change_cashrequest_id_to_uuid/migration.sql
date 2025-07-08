/*
  Warnings:

  - The primary key for the `CashRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "CashRequest" DROP CONSTRAINT "CashRequest_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CashRequest_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CashRequest_id_seq";
