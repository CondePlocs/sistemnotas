/*
  Warnings:

  - You are about to drop the column `turno` on the `administrativo` table. All the data in the column will be lost.
  - You are about to drop the column `cargaHoraria` on the `profesor` table. All the data in the column will be lost.
  - You are about to drop the column `experienciaDocente` on the `profesor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."administrativo" DROP COLUMN "turno",
ADD COLUMN     "actualizadoPor" INTEGER;

-- AlterTable
ALTER TABLE "public"."apoderado" ADD COLUMN     "actualizadoPor" INTEGER;

-- AlterTable
ALTER TABLE "public"."profesor" DROP COLUMN "cargaHoraria",
DROP COLUMN "experienciaDocente",
ADD COLUMN     "actualizadoPor" INTEGER;
