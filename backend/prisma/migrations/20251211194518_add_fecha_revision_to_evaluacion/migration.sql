-- AlterTable
ALTER TABLE "public"."evaluacion" ADD COLUMN     "fechaRevision" DATE;

-- CreateIndex
CREATE INDEX "evaluacion_fechaRevision_idx" ON "public"."evaluacion"("fechaRevision");
