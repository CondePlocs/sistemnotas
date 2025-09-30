/*
  Warnings:

  - A unique constraint covering the columns `[salonId,cursoId,activo]` on the table `profesor_asignacion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "profesor_asignacion_salonId_cursoId_activo_key" ON "public"."profesor_asignacion"("salonId", "cursoId", "activo");
