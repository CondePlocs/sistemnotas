/*
  Warnings:

  - You are about to drop the column `parentesco` on the `apoderado` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."apoderado" DROP COLUMN "parentesco";

-- CreateTable
CREATE TABLE "public"."apoderado_alumno" (
    "id" SERIAL NOT NULL,
    "apoderadoId" INTEGER NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "parentesco" TEXT NOT NULL,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoPor" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "actualizadoPor" INTEGER,

    CONSTRAINT "apoderado_alumno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "apoderado_alumno_apoderadoId_idx" ON "public"."apoderado_alumno"("apoderadoId");

-- CreateIndex
CREATE INDEX "apoderado_alumno_alumnoId_idx" ON "public"."apoderado_alumno"("alumnoId");

-- CreateIndex
CREATE INDEX "apoderado_alumno_activo_idx" ON "public"."apoderado_alumno"("activo");

-- CreateIndex
CREATE INDEX "apoderado_alumno_esPrincipal_idx" ON "public"."apoderado_alumno"("esPrincipal");

-- CreateIndex
CREATE UNIQUE INDEX "apoderado_alumno_apoderadoId_alumnoId_key" ON "public"."apoderado_alumno"("apoderadoId", "alumnoId");

-- AddForeignKey
ALTER TABLE "public"."apoderado_alumno" ADD CONSTRAINT "apoderado_alumno_apoderadoId_fkey" FOREIGN KEY ("apoderadoId") REFERENCES "public"."apoderado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."apoderado_alumno" ADD CONSTRAINT "apoderado_alumno_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "public"."alumno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."apoderado_alumno" ADD CONSTRAINT "apoderado_alumno_creadoPor_fkey" FOREIGN KEY ("creadoPor") REFERENCES "public"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
