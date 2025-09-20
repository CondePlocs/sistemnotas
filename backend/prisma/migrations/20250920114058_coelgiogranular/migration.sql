-- CreateEnum
CREATE TYPE "public"."NivelEducativo" AS ENUM ('INICIAL', 'PRIMARIA', 'SECUNDARIA');

-- CreateTable
CREATE TABLE "public"."colegio_nivel" (
    "id" SERIAL NOT NULL,
    "colegioId" INTEGER NOT NULL,
    "nivel" "public"."NivelEducativo" NOT NULL,
    "puedeCrearSalones" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "creadoPor" INTEGER,

    CONSTRAINT "colegio_nivel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "colegio_nivel_colegioId_nivel_key" ON "public"."colegio_nivel"("colegioId", "nivel");

-- AddForeignKey
ALTER TABLE "public"."colegio_nivel" ADD CONSTRAINT "colegio_nivel_colegioId_fkey" FOREIGN KEY ("colegioId") REFERENCES "public"."colegio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."colegio_nivel" ADD CONSTRAINT "colegio_nivel_creadoPor_fkey" FOREIGN KEY ("creadoPor") REFERENCES "public"."usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
