/*
  Warnings:

  - You are about to drop the column `nivel` on the `curso` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nombre,nivelId]` on the table `curso` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nivelId` to the `curso` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."salon" DROP CONSTRAINT "salon_colegioNivelId_fkey";

-- DropIndex
DROP INDEX "public"."curso_nivel_activo_idx";

-- DropIndex
DROP INDEX "public"."curso_nivel_idx";

-- DropIndex
DROP INDEX "public"."curso_nombre_nivel_key";

-- DropIndex
DROP INDEX "public"."salon_colegioNivelId_idx";

-- AlterTable
ALTER TABLE "public"."curso" DROP COLUMN "nivel",
ADD COLUMN     "nivelId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "curso_nivelId_idx" ON "public"."curso"("nivelId");

-- CreateIndex
CREATE INDEX "curso_nivelId_activo_idx" ON "public"."curso"("nivelId", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "curso_nombre_nivelId_key" ON "public"."curso"("nombre", "nivelId");

-- AddForeignKey
ALTER TABLE "public"."salon" ADD CONSTRAINT "fk_salon_colegio_nivel" FOREIGN KEY ("colegioNivelId") REFERENCES "public"."colegio_nivel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."curso" ADD CONSTRAINT "curso_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "public"."nivel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "public"."salon_colegioId_colegioNivelId_grado_seccion_key" RENAME TO "salon_colegioid_colegionivelid_grado_seccion_key";
