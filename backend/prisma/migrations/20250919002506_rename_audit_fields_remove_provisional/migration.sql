/*
  Warnings:

  - You are about to drop the column `provisional` on the `colegio` table. All the data in the column will be lost.
  - You are about to drop the column `aprobado_en` on the `usuario_rol` table. All the data in the column will be lost.
  - You are about to drop the column `aprobado_por` on the `usuario_rol` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."usuario_rol" DROP CONSTRAINT "usuario_rol_aprobado_por_fkey";

-- AlterTable
ALTER TABLE "public"."colegio" DROP COLUMN "provisional";

-- AlterTable
ALTER TABLE "public"."usuario_rol" DROP COLUMN "aprobado_en",
DROP COLUMN "aprobado_por",
ADD COLUMN     "hecho_en" TIMESTAMP(3),
ADD COLUMN     "hecho_por" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."usuario_rol" ADD CONSTRAINT "usuario_rol_hecho_por_fkey" FOREIGN KEY ("hecho_por") REFERENCES "public"."usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
