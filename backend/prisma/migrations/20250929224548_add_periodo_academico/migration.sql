-- CreateEnum
CREATE TYPE "public"."TipoPeriodo" AS ENUM ('BIMESTRE', 'TRIMESTRE', 'SEMESTRE');

-- CreateTable
CREATE TABLE "public"."periodo_academico" (
    "id" SERIAL NOT NULL,
    "colegioId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "public"."TipoPeriodo" NOT NULL,
    "anioAcademico" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,
    "fechaInicio" DATE NOT NULL,
    "fechaFin" DATE NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "creadoPor" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periodo_academico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "periodo_academico_colegioId_idx" ON "public"."periodo_academico"("colegioId");

-- CreateIndex
CREATE INDEX "periodo_academico_anioAcademico_idx" ON "public"."periodo_academico"("anioAcademico");

-- CreateIndex
CREATE INDEX "periodo_academico_activo_idx" ON "public"."periodo_academico"("activo");

-- CreateIndex
CREATE INDEX "periodo_academico_colegioId_activo_idx" ON "public"."periodo_academico"("colegioId", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "periodo_academico_colegioId_anioAcademico_orden_key" ON "public"."periodo_academico"("colegioId", "anioAcademico", "orden");

-- AddForeignKey
ALTER TABLE "public"."periodo_academico" ADD CONSTRAINT "periodo_academico_colegioId_fkey" FOREIGN KEY ("colegioId") REFERENCES "public"."colegio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."periodo_academico" ADD CONSTRAINT "periodo_academico_creadoPor_fkey" FOREIGN KEY ("creadoPor") REFERENCES "public"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
