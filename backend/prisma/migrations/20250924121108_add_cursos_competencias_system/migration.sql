-- CreateTable
CREATE TABLE "public"."curso" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "nivel" "public"."NivelEducativo" NOT NULL,
    "codigo" TEXT,
    "color" TEXT,
    "icono" TEXT,
    "horasSemanales" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoPor" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."competencia" (
    "id" SERIAL NOT NULL,
    "cursoId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "codigo" TEXT,
    "orden" INTEGER NOT NULL,
    "peso" DECIMAL(5,2),
    "tipo" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoPor" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "curso_nivel_idx" ON "public"."curso"("nivel");

-- CreateIndex
CREATE INDEX "curso_activo_idx" ON "public"."curso"("activo");

-- CreateIndex
CREATE INDEX "curso_creadoPor_idx" ON "public"."curso"("creadoPor");

-- CreateIndex
CREATE INDEX "curso_nivel_activo_idx" ON "public"."curso"("nivel", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "curso_nombre_nivel_key" ON "public"."curso"("nombre", "nivel");

-- CreateIndex
CREATE INDEX "competencia_cursoId_idx" ON "public"."competencia"("cursoId");

-- CreateIndex
CREATE INDEX "competencia_activo_idx" ON "public"."competencia"("activo");

-- CreateIndex
CREATE INDEX "competencia_creadoPor_idx" ON "public"."competencia"("creadoPor");

-- CreateIndex
CREATE INDEX "competencia_cursoId_orden_activo_idx" ON "public"."competencia"("cursoId", "orden", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "competencia_cursoId_orden_key" ON "public"."competencia"("cursoId", "orden");

-- AddForeignKey
ALTER TABLE "public"."curso" ADD CONSTRAINT "curso_creadoPor_fkey" FOREIGN KEY ("creadoPor") REFERENCES "public"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."competencia" ADD CONSTRAINT "competencia_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "public"."curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."competencia" ADD CONSTRAINT "competencia_creadoPor_fkey" FOREIGN KEY ("creadoPor") REFERENCES "public"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
