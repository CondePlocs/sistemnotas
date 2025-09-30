-- CreateTable
CREATE TABLE "public"."profesor_asignacion" (
    "id" SERIAL NOT NULL,
    "profesorId" INTEGER NOT NULL,
    "salonId" INTEGER NOT NULL,
    "cursoId" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "asignadoPor" INTEGER NOT NULL,
    "asignadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profesor_asignacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "profesor_asignacion_profesorId_idx" ON "public"."profesor_asignacion"("profesorId");

-- CreateIndex
CREATE INDEX "profesor_asignacion_salonId_idx" ON "public"."profesor_asignacion"("salonId");

-- CreateIndex
CREATE INDEX "profesor_asignacion_cursoId_idx" ON "public"."profesor_asignacion"("cursoId");

-- CreateIndex
CREATE INDEX "profesor_asignacion_activo_idx" ON "public"."profesor_asignacion"("activo");

-- CreateIndex
CREATE INDEX "profesor_asignacion_profesorId_activo_idx" ON "public"."profesor_asignacion"("profesorId", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "profesor_asignacion_profesorId_salonId_cursoId_key" ON "public"."profesor_asignacion"("profesorId", "salonId", "cursoId");

-- AddForeignKey
ALTER TABLE "public"."profesor_asignacion" ADD CONSTRAINT "profesor_asignacion_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "public"."profesor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profesor_asignacion" ADD CONSTRAINT "profesor_asignacion_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "public"."salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profesor_asignacion" ADD CONSTRAINT "profesor_asignacion_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "public"."curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profesor_asignacion" ADD CONSTRAINT "profesor_asignacion_asignadoPor_fkey" FOREIGN KEY ("asignadoPor") REFERENCES "public"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
