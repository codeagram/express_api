/*
  Warnings:

  - A unique constraint covering the columns `[aadharNumber]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[districtName]` on the table `District` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[talukName]` on the table `Taluk` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `aadharNumber` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "aadharNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_aadharNumber_key" ON "Customer"("aadharNumber");

-- CreateIndex
CREATE UNIQUE INDEX "District_districtName_key" ON "District"("districtName");

-- CreateIndex
CREATE UNIQUE INDEX "Taluk_talukName_key" ON "Taluk"("talukName");
