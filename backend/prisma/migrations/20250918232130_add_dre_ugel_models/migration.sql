/*
  Warnings:

  - You are about to drop the column `celular` on the `administrativo` table. All the data in the column will be lost.
  - You are about to drop the column `correo` on the `administrativo` table. All the data in the column will be lost.
  - You are about to drop the column `celular` on the `apoderado` table. All the data in the column will be lost.
  - You are about to drop the column `correo` on the `apoderado` table. All the data in the column will be lost.
  - You are about to drop the column `celular` on the `director` table. All the data in the column will be lost.
  - You are about to drop the column `correoInstitucional` on the `director` table. All the data in the column will be lost.
  - You are about to drop the column `telefono` on the `director` table. All the data in the column will be lost.
  - You are about to drop the column `celular` on the `profesor` table. All the data in the column will be lost.
  - You are about to drop the column `correoInstitucional` on the `profesor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."administrativo" DROP COLUMN "celular",
DROP COLUMN "correo";

-- AlterTable
ALTER TABLE "public"."apoderado" DROP COLUMN "celular",
DROP COLUMN "correo";

-- AlterTable
ALTER TABLE "public"."director" DROP COLUMN "celular",
DROP COLUMN "correoInstitucional",
DROP COLUMN "telefono";

-- AlterTable
ALTER TABLE "public"."profesor" DROP COLUMN "celular",
DROP COLUMN "correoInstitucional";

-- CreateTable
CREATE TABLE "public"."dre" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT,

    CONSTRAINT "dre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ugel" (
    "id" SERIAL NOT NULL,
    "dreId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT,

    CONSTRAINT "ugel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dre_nombre_key" ON "public"."dre"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "dre_codigo_key" ON "public"."dre"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "ugel_codigo_key" ON "public"."ugel"("codigo");

-- AddForeignKey
ALTER TABLE "public"."ugel" ADD CONSTRAINT "ugel_dreId_fkey" FOREIGN KEY ("dreId") REFERENCES "public"."dre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."colegio" ADD CONSTRAINT "colegio_ugelId_fkey" FOREIGN KEY ("ugelId") REFERENCES "public"."ugel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
