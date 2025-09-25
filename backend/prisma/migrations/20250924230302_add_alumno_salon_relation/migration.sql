-- CreateTable
CREATE TABLE "public"."alumno_salon" (
    "id" SERIAL NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "salonId" INTEGER NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaRetiro" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "asignadoPor" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alumno_salon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alumno_salon_alumnoId_idx" ON "public"."alumno_salon"("alumnoId");

-- CreateIndex
CREATE INDEX "alumno_salon_salonId_idx" ON "public"."alumno_salon"("salonId");

-- CreateIndex
CREATE INDEX "alumno_salon_activo_idx" ON "public"."alumno_salon"("activo");

-- CreateIndex
CREATE INDEX "alumno_salon_fechaAsignacion_idx" ON "public"."alumno_salon"("fechaAsignacion");

-- CreateIndex
CREATE INDEX "alumno_salon_salonId_activo_idx" ON "public"."alumno_salon"("salonId", "activo");

-- CreateIndex
CREATE INDEX "alumno_salon_alumnoId_activo_idx" ON "public"."alumno_salon"("alumnoId", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "alumno_salon_alumnoId_salonId_activo_key" ON "public"."alumno_salon"("alumnoId", "salonId", "activo");

-- AddForeignKey
ALTER TABLE "public"."alumno_salon" ADD CONSTRAINT "alumno_salon_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "public"."alumno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alumno_salon" ADD CONSTRAINT "alumno_salon_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "public"."salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alumno_salon" ADD CONSTRAINT "alumno_salon_asignadoPor_fkey" FOREIGN KEY ("asignadoPor") REFERENCES "public"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
