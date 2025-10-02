-- CreateTable
CREATE TABLE "public"."evaluacion" (
    "id" SERIAL NOT NULL,
    "competenciaId" INTEGER NOT NULL,
    "profesorAsignacionId" INTEGER NOT NULL,
    "periodoId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaEvaluacion" DATE,
    "esRecuperacion" BOOLEAN NOT NULL DEFAULT false,
    "creadoPor" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evaluacion_competenciaId_idx" ON "public"."evaluacion"("competenciaId");

-- CreateIndex
CREATE INDEX "evaluacion_profesorAsignacionId_idx" ON "public"."evaluacion"("profesorAsignacionId");

-- CreateIndex
CREATE INDEX "evaluacion_periodoId_idx" ON "public"."evaluacion"("periodoId");

-- CreateIndex
CREATE INDEX "evaluacion_creadoPor_idx" ON "public"."evaluacion"("creadoPor");

-- CreateIndex
CREATE INDEX "evaluacion_fechaEvaluacion_idx" ON "public"."evaluacion"("fechaEvaluacion");

-- CreateIndex
CREATE INDEX "evaluacion_profesorAsignacionId_periodoId_idx" ON "public"."evaluacion"("profesorAsignacionId", "periodoId");

-- CreateIndex
CREATE INDEX "evaluacion_competenciaId_profesorAsignacionId_idx" ON "public"."evaluacion"("competenciaId", "profesorAsignacionId");

-- AddForeignKey
ALTER TABLE "public"."evaluacion" ADD CONSTRAINT "evaluacion_competenciaId_fkey" FOREIGN KEY ("competenciaId") REFERENCES "public"."competencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evaluacion" ADD CONSTRAINT "evaluacion_profesorAsignacionId_fkey" FOREIGN KEY ("profesorAsignacionId") REFERENCES "public"."profesor_asignacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evaluacion" ADD CONSTRAINT "evaluacion_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "public"."periodo_academico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evaluacion" ADD CONSTRAINT "evaluacion_creadoPor_fkey" FOREIGN KEY ("creadoPor") REFERENCES "public"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
