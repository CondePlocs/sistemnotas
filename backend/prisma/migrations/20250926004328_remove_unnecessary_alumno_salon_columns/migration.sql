/*
  Warnings:

  - You are about to drop the column `fechaRetiroAnterior` on the `alumno_salon` table. All the data in the column will be lost.
  - You are about to drop the column `salonAnteriorId` on the `alumno_salon` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."alumno_salon" DROP CONSTRAINT "alumno_salon_salonAnteriorId_fkey";

-- AlterTable
ALTER TABLE "public"."alumno_salon" DROP COLUMN "fechaRetiroAnterior",
DROP COLUMN "salonAnteriorId";
