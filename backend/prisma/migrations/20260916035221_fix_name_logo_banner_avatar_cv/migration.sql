/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `candidate` table. All the data in the column will be lost.
  - You are about to drop the column `banner_url` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `logo_url` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `file_url` on the `cvs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "candidate"
RENAME COLUMN "avatar_url" TO "avatar_key";

ALTER TABLE "company"
RENAME COLUMN "logo_url" TO "logo_key";

ALTER TABLE "company"
RENAME COLUMN "banner_url" TO "banner_key";

ALTER TABLE "cvs"
RENAME COLUMN "file_url" TO "file_key";
