-- CreateTable
CREATE TABLE "public"."salon_curso" (
    "id" SERIAL NOT NULL,
    "salonId" INTEGER NOT NULL,
    "cursoId" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "asignadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "asignadoPor" INTEGER,

    CONSTRAINT "salon_curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."alumno_curso" (
    "id" SERIAL NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "cursoId" INTEGER NOT NULL,
    "salonId" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "asignadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "asignadoPor" INTEGER,

    CONSTRAINT "alumno_curso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "salon_curso_salonId_idx" ON "public"."salon_curso"("salonId");

-- CreateIndex
CREATE INDEX "salon_curso_cursoId_idx" ON "public"."salon_curso"("cursoId");

-- CreateIndex
CREATE INDEX "salon_curso_salonId_activo_idx" ON "public"."salon_curso"("salonId", "activo");

-- CreateIndex
CREATE INDEX "salon_curso_cursoId_activo_idx" ON "public"."salon_curso"("cursoId", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "salon_curso_salonId_cursoId_key" ON "public"."salon_curso"("salonId", "cursoId");

-- CreateIndex
CREATE INDEX "alumno_curso_alumnoId_idx" ON "public"."alumno_curso"("alumnoId");

-- CreateIndex
CREATE INDEX "alumno_curso_cursoId_idx" ON "public"."alumno_curso"("cursoId");

-- CreateIndex
CREATE INDEX "alumno_curso_salonId_idx" ON "public"."alumno_curso"("salonId");

-- CreateIndex
CREATE INDEX "alumno_curso_alumnoId_activo_idx" ON "public"."alumno_curso"("alumnoId", "activo");

-- CreateIndex
CREATE INDEX "alumno_curso_cursoId_activo_idx" ON "public"."alumno_curso"("cursoId", "activo");

-- CreateIndex
CREATE INDEX "alumno_curso_salonId_activo_idx" ON "public"."alumno_curso"("salonId", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "alumno_curso_alumnoId_cursoId_key" ON "public"."alumno_curso"("alumnoId", "cursoId");

-- AddForeignKey
ALTER TABLE "public"."salon_curso" ADD CONSTRAINT "salon_curso_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "public"."salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon_curso" ADD CONSTRAINT "salon_curso_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "public"."curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon_curso" ADD CONSTRAINT "salon_curso_asignadoPor_fkey" FOREIGN KEY ("asignadoPor") REFERENCES "public"."usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alumno_curso" ADD CONSTRAINT "alumno_curso_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "public"."alumno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alumno_curso" ADD CONSTRAINT "alumno_curso_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "public"."curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alumno_curso" ADD CONSTRAINT "alumno_curso_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "public"."salon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alumno_curso" ADD CONSTRAINT "alumno_curso_asignadoPor_fkey" FOREIGN KEY ("asignadoPor") REFERENCES "public"."usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
