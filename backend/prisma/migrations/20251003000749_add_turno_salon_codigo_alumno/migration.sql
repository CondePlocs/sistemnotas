/*
  Warnings:

  - A unique constraint covering the columns `[codigoAlumno]` on the table `alumno` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[colegioId,colegioNivelId,grado,seccion,turno]` on the table `salon` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."Turno" AS ENUM ('MAÑANA', 'TARDE', 'NOCHE');

-- DropIndex
DROP INDEX "public"."salon_colegioid_colegionivelid_grado_seccion_key";

-- AlterTable
ALTER TABLE "public"."alumno" ADD COLUMN     "codigoAlumno" TEXT;

-- AlterTable
ALTER TABLE "public"."salon" ADD COLUMN     "turno" "public"."Turno" NOT NULL DEFAULT 'MAÑANA';

-- CreateIndex
CREATE UNIQUE INDEX "alumno_codigoAlumno_key" ON "public"."alumno"("codigoAlumno");

-- CreateIndex
CREATE INDEX "alumno_codigoAlumno_idx" ON "public"."alumno"("codigoAlumno");

-- CreateIndex
CREATE UNIQUE INDEX "salon_colegioid_colegionivelid_grado_seccion_turno_key" ON "public"."salon"("colegioId", "colegioNivelId", "grado", "seccion", "turno");
