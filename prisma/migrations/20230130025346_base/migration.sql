/*
  Warnings:

  - You are about to drop the column `branchId` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `districtId` on the `Customer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_districtId_fkey";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "branchId",
DROP COLUMN "districtId";
