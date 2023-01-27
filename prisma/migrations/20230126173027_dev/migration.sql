-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Taluk" DROP CONSTRAINT "Taluk_branchId_fkey";

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "branchId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Lead" ALTER COLUMN "branchId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Taluk" ALTER COLUMN "branchId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taluk" ADD CONSTRAINT "Taluk_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
