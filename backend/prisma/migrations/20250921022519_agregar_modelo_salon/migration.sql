/*
  Warnings:

  - You are about to drop the column `creadoPor` on the `colegio_nivel` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."colegio_nivel" DROP CONSTRAINT "colegio_nivel_creadoPor_fkey";

-- AlterTable
ALTER TABLE "public"."colegio_nivel" DROP COLUMN "creadoPor";

-- CreateTable
CREATE TABLE "public"."salon" (
    "id" SERIAL NOT NULL,
    "colegioId" INTEGER NOT NULL,
    "nivel" "public"."NivelEducativo" NOT NULL,
    "grado" TEXT NOT NULL,
    "seccion" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoPor" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "salon_colegioId_idx" ON "public"."salon"("colegioId");

-- CreateIndex
CREATE INDEX "salon_creadoPor_idx" ON "public"."salon"("creadoPor");

-- CreateIndex
CREATE UNIQUE INDEX "salon_colegioId_nivel_grado_seccion_key" ON "public"."salon"("colegioId", "nivel", "grado", "seccion");

-- AddForeignKey
ALTER TABLE "public"."salon" ADD CONSTRAINT "salon_colegioId_fkey" FOREIGN KEY ("colegioId") REFERENCES "public"."colegio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon" ADD CONSTRAINT "salon_creadoPor_fkey" FOREIGN KEY ("creadoPor") REFERENCES "public"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
