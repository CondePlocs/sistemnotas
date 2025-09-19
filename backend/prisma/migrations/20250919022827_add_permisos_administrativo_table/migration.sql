-- CreateTable
CREATE TABLE "public"."permisos_administrativo" (
    "id" SERIAL NOT NULL,
    "administrativoId" INTEGER NOT NULL,
    "puedeRegistrarProfesores" BOOLEAN NOT NULL DEFAULT false,
    "puedeRegistrarApoderados" BOOLEAN NOT NULL DEFAULT false,
    "puedeRegistrarAdministrativos" BOOLEAN NOT NULL DEFAULT false,
    "otorgadoPor" INTEGER,
    "otorgadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoPor" INTEGER,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permisos_administrativo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permisos_administrativo_administrativoId_key" ON "public"."permisos_administrativo"("administrativoId");

-- AddForeignKey
ALTER TABLE "public"."permisos_administrativo" ADD CONSTRAINT "permisos_administrativo_administrativoId_fkey" FOREIGN KEY ("administrativoId") REFERENCES "public"."administrativo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."permisos_administrativo" ADD CONSTRAINT "permisos_administrativo_otorgadoPor_fkey" FOREIGN KEY ("otorgadoPor") REFERENCES "public"."usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."permisos_administrativo" ADD CONSTRAINT "permisos_administrativo_actualizadoPor_fkey" FOREIGN KEY ("actualizadoPor") REFERENCES "public"."usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
