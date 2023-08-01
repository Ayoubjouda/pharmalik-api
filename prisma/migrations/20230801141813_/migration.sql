/*
  Warnings:

  - A unique constraint covering the columns `[tel]` on the table `Pharmacie` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Pharmacie" ALTER COLUMN "latitude" SET DATA TYPE TEXT,
ALTER COLUMN "longitude" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Pharmacie_tel_key" ON "Pharmacie"("tel");
