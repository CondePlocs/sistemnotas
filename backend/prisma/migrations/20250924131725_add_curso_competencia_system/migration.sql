/*
  Warnings:

  - You are about to drop the column `codigo` on the `competencia` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `competencia` table. All the data in the column will be lost.
  - You are about to drop the column `peso` on the `competencia` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `competencia` table. All the data in the column will be lost.
  - You are about to drop the column `codigo` on the `curso` table. All the data in the column will be lost.
  - You are about to drop the column `horasSemanales` on the `curso` table. All the data in the column will be lost.
  - You are about to drop the column `icono` on the `curso` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."competencia" DROP COLUMN "codigo",
DROP COLUMN "descripcion",
DROP COLUMN "peso",
DROP COLUMN "tipo";

-- AlterTable
ALTER TABLE "public"."curso" DROP COLUMN "codigo",
DROP COLUMN "horasSemanales",
DROP COLUMN "icono";
