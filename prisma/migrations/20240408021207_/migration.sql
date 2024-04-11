/*
  Warnings:

  - You are about to alter the column `address` on the `Pharmacy` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(240)`.

*/
-- AlterTable
ALTER TABLE "Pharmacy" ALTER COLUMN "address" SET DATA TYPE VARCHAR(240);
