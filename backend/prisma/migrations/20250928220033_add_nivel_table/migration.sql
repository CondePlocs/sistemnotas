-- AlterTable
ALTER TABLE "public"."colegio_nivel" ADD COLUMN     "nivelId" INTEGER;

-- CreateTable
CREATE TABLE "public"."nivel" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nivel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nivel_nombre_key" ON "public"."nivel"("nombre");

-- AddForeignKey
ALTER TABLE "public"."colegio_nivel" ADD CONSTRAINT "colegio_nivel_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "public"."nivel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
