-- ========================================
-- MIGRACIÓN: REFACTORIZACIÓN CURSO-NIVEL
-- Cambiar campo 'nivel' string por 'nivelId' FK
-- ========================================

-- PASO 1: Agregar nueva columna nivelId (nullable inicialmente)
ALTER TABLE "curso" ADD COLUMN "nivelId" INTEGER;

-- PASO 2: Migrar datos existentes de 'nivel' string a 'nivelId' FK
-- Mapear valores de enum NivelEducativo a IDs de tabla nivel

-- Actualizar cursos de INICIAL (nivel.id = 1)
UPDATE "curso" 
SET "nivelId" = 1 
WHERE "nivel" = 'INICIAL';

-- Actualizar cursos de PRIMARIA (nivel.id = 2)  
UPDATE "curso" 
SET "nivelId" = 2 
WHERE "nivel" = 'PRIMARIA';

-- Actualizar cursos de SECUNDARIA (nivel.id = 3)
UPDATE "curso" 
SET "nivelId" = 3 
WHERE "nivel" = 'SECUNDARIA';

-- PASO 3: Verificar que todos los registros fueron migrados
-- (Esta query debe retornar 0 registros)
SELECT id, nombre, nivel, "nivelId" 
FROM "curso" 
WHERE "nivelId" IS NULL;

-- PASO 4: Hacer nivelId NOT NULL y agregar FK constraint
ALTER TABLE "curso" ALTER COLUMN "nivelId" SET NOT NULL;

-- PASO 5: Crear FK constraint hacia tabla nivel
ALTER TABLE "curso" 
ADD CONSTRAINT "curso_nivelId_fkey" 
FOREIGN KEY ("nivelId") REFERENCES "nivel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- PASO 6: Crear índice en nivelId para performance
CREATE INDEX "curso_nivelId_idx" ON "curso"("nivelId");

-- PASO 7: Actualizar constraint único (nombre + nivelId en lugar de nombre + nivel)
-- Primero eliminar constraint anterior
ALTER TABLE "curso" DROP CONSTRAINT IF EXISTS "curso_nombre_nivel_key";

-- Crear nuevo constraint único
ALTER TABLE "curso" ADD CONSTRAINT "curso_nombre_nivelId_key" UNIQUE ("nombre", "nivelId");

-- PASO 8: Actualizar índices
-- Eliminar índices antiguos basados en 'nivel'
DROP INDEX IF EXISTS "curso_nivel_idx";
DROP INDEX IF EXISTS "curso_nivel_activo_idx";

-- Crear nuevos índices basados en 'nivelId'
CREATE INDEX "curso_nivelId_activo_idx" ON "curso"("nivelId", "activo");

-- PASO 9: Eliminar columna 'nivel' antigua (CUIDADO: Esto es irreversible)
ALTER TABLE "curso" DROP COLUMN "nivel";

-- ========================================
-- VERIFICACIONES FINALES
-- ========================================

-- Verificar estructura final de tabla curso
\d "curso";

-- Verificar que todos los cursos tienen nivelId válido
SELECT 
    c.id,
    c.nombre,
    c."nivelId",
    n.nombre as nivel_nombre
FROM "curso" c
JOIN "nivel" n ON c."nivelId" = n.id
ORDER BY c.id;

-- Verificar constraints
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'curso'
ORDER BY tc.constraint_type, tc.constraint_name;

-- ========================================
-- ROLLBACK (Solo en caso de emergencia)
-- ========================================

-- NOTA: Para hacer rollback de esta migración:
-- 1. Agregar columna 'nivel' de vuelta
-- 2. Migrar datos de nivelId a nivel usando JOINs
-- 3. Eliminar nivelId y constraints
-- 4. Restaurar constraints e índices originales

-- Ejemplo de rollback (NO EJECUTAR a menos que sea necesario):
/*
-- Agregar columna nivel de vuelta
ALTER TABLE "curso" ADD COLUMN "nivel" TEXT;

-- Migrar datos de vuelta
UPDATE "curso" SET "nivel" = 'INICIAL' WHERE "nivelId" = 1;
UPDATE "curso" SET "nivel" = 'PRIMARIA' WHERE "nivelId" = 2;
UPDATE "curso" SET "nivel" = 'SECUNDARIA' WHERE "nivelId" = 3;

-- Hacer nivel NOT NULL
ALTER TABLE "curso" ALTER COLUMN "nivel" SET NOT NULL;

-- Eliminar FK y columna nivelId
ALTER TABLE "curso" DROP CONSTRAINT "curso_nivelId_fkey";
ALTER TABLE "curso" DROP COLUMN "nivelId";

-- Restaurar constraints originales
ALTER TABLE "curso" ADD CONSTRAINT "curso_nombre_nivel_key" UNIQUE ("nombre", "nivel");
CREATE INDEX "curso_nivel_idx" ON "curso"("nivel");
CREATE INDEX "curso_nivel_activo_idx" ON "curso"("nivel", "activo");
*/
