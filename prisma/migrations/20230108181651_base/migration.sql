/*
  Warnings:

  - You are about to drop the column `branchId` on the `District` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "District" DROP CONSTRAINT "District_branchId_fkey";

-- AlterTable
ALTER TABLE "District" DROP COLUMN "branchId";
