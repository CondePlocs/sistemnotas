/*
  Warnings:

  - You are about to drop the column `nivel` on the `colegio_nivel` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[colegioId,nivelId]` on the table `colegio_nivel` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nivelId` on table `colegio_nivel` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."colegio_nivel" DROP CONSTRAINT "colegio_nivel_nivelId_fkey";

-- DropIndex
DROP INDEX "public"."colegio_nivel_colegioId_nivel_key";

-- AlterTable
ALTER TABLE "public"."colegio_nivel" DROP COLUMN "nivel",
ALTER COLUMN "nivelId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "colegio_nivel_colegioId_nivelId_key" ON "public"."colegio_nivel"("colegioId", "nivelId");

-- AddForeignKey
ALTER TABLE "public"."colegio_nivel" ADD CONSTRAINT "colegio_nivel_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "public"."nivel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
