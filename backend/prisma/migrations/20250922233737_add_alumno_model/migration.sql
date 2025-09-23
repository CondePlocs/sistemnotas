-- CreateEnum
CREATE TYPE "public"."SexoAlumno" AS ENUM ('masculino', 'femenino');

-- AlterTable
ALTER TABLE "public"."permisos_administrativo" ADD COLUMN     "puedeRegistrarAlumnos" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."alumno" (
    "id" SERIAL NOT NULL,
    "colegioId" INTEGER NOT NULL,
    "dni" TEXT,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "sexo" "public"."SexoAlumno",
    "nacionalidad" TEXT DEFAULT 'Peruana',
    "direccion" TEXT,
    "distrito" TEXT,
    "numeroContacto" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoPor" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alumno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alumno_dni_key" ON "public"."alumno"("dni");

-- CreateIndex
CREATE INDEX "alumno_colegioId_idx" ON "public"."alumno"("colegioId");

-- CreateIndex
CREATE INDEX "alumno_dni_idx" ON "public"."alumno"("dni");

-- CreateIndex
CREATE INDEX "alumno_activo_idx" ON "public"."alumno"("activo");

-- AddForeignKey
ALTER TABLE "public"."alumno" ADD CONSTRAINT "alumno_colegioId_fkey" FOREIGN KEY ("colegioId") REFERENCES "public"."colegio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alumno" ADD CONSTRAINT "alumno_creadoPor_fkey" FOREIGN KEY ("creadoPor") REFERENCES "public"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
