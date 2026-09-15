/*
  Warnings:

  - You are about to drop the column `verfifyEmail` on the `accounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "verfifyEmail",
ADD COLUMN     "verify_email" BOOLEAN NOT NULL DEFAULT false;
