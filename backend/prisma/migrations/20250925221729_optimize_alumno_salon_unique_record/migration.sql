/*
  Warnings:

  - You are about to drop the column `activo` on the `alumno_salon` table. All the data in the column will be lost.
  - You are about to drop the column `fechaRetiro` on the `alumno_salon` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[alumnoId]` on the table `alumno_salon` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."alumno_salon_activo_idx";

-- DropIndex
DROP INDEX "public"."alumno_salon_alumnoId_activo_idx";

-- DropIndex
DROP INDEX "public"."alumno_salon_alumnoId_salonId_activo_key";

-- DropIndex
DROP INDEX "public"."alumno_salon_salonId_activo_idx";

-- AlterTable
ALTER TABLE "public"."alumno_salon" DROP COLUMN "activo",
DROP COLUMN "fechaRetiro",
ADD COLUMN     "fechaRetiroAnterior" TIMESTAMP(3),
ADD COLUMN     "salonAnteriorId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "alumno_salon_alumnoId_key" ON "public"."alumno_salon"("alumnoId");

-- AddForeignKey
ALTER TABLE "public"."alumno_salon" ADD CONSTRAINT "alumno_salon_salonAnteriorId_fkey" FOREIGN KEY ("salonAnteriorId") REFERENCES "public"."salon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
