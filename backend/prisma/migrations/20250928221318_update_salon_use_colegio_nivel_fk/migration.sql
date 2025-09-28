/*
  Warnings:

  - You are about to drop the column `nivel` on the `salon` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[colegioId,colegioNivelId,grado,seccion]` on the table `salon` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `colegioNivelId` to the `salon` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."salon_colegioId_nivel_grado_seccion_key";

-- AlterTable
ALTER TABLE "public"."salon" DROP COLUMN "nivel",
ADD COLUMN     "colegioNivelId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "salon_colegioNivelId_idx" ON "public"."salon"("colegioNivelId");

-- CreateIndex
CREATE UNIQUE INDEX "salon_colegioId_colegioNivelId_grado_seccion_key" ON "public"."salon"("colegioId", "colegioNivelId", "grado", "seccion");

-- AddForeignKey
ALTER TABLE "public"."salon" ADD CONSTRAINT "salon_colegioNivelId_fkey" FOREIGN KEY ("colegioNivelId") REFERENCES "public"."colegio_nivel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
