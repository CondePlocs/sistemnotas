-- CreateTable
CREATE TABLE "public"."registro_nota" (
    "id" SERIAL NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "evaluacionId" INTEGER NOT NULL,
    "nota" TEXT NOT NULL,
    "registradoPor" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registro_nota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "registro_nota_alumnoId_idx" ON "public"."registro_nota"("alumnoId");

-- CreateIndex
CREATE INDEX "registro_nota_evaluacionId_idx" ON "public"."registro_nota"("evaluacionId");

-- CreateIndex
CREATE INDEX "registro_nota_registradoPor_idx" ON "public"."registro_nota"("registradoPor");

-- CreateIndex
CREATE INDEX "registro_nota_alumnoId_evaluacionId_idx" ON "public"."registro_nota"("alumnoId", "evaluacionId");

-- CreateIndex
CREATE UNIQUE INDEX "registro_nota_alumnoId_evaluacionId_key" ON "public"."registro_nota"("alumnoId", "evaluacionId");

-- AddForeignKey
ALTER TABLE "public"."registro_nota" ADD CONSTRAINT "registro_nota_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "public"."alumno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registro_nota" ADD CONSTRAINT "registro_nota_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "public"."evaluacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registro_nota" ADD CONSTRAINT "registro_nota_registradoPor_fkey" FOREIGN KEY ("registradoPor") REFERENCES "public"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
