#!/bin/bash

# Script para corregir warnings comunes de ESLint
# Uso: bash fix-warnings.sh

echo "🔧 Iniciando corrección de warnings ESLint..."
echo ""

# Función para reemplazar caracteres sin escapar
fix_unescaped_quotes() {
  echo "📝 Corrigiendo caracteres sin escapar..."
  
  # Reemplazar comillas dobles en JSX
  find ./src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/Alumnos "en riesgo"/Alumnos \&quot;en riesgo\&quot;/g'
  find ./src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/"en riesgo"/\&quot;en riesgo\&quot;/g'
  
  echo "✅ Caracteres sin escapar corregidos"
}

# Función para agregar eslint-disable donde sea necesario
add_eslint_disable() {
  echo "📝 Agregando eslint-disable donde sea necesario..."
  
  # Ejemplo: agregar disable para 'any' en archivos específicos
  # Esto es más manual, pero aquí va un ejemplo
  
  echo "✅ ESLint disable agregado"
}

# Función para limpiar variables no utilizadas (manual)
clean_unused_vars() {
  echo "📝 Identificando variables no utilizadas..."
  echo "⚠️  Esto requiere revisión manual en:"
  echo "   - src/app/administrativo/dashboard/page.tsx (adminInfo)"
  echo "   - src/app/apoderado/alumno/[id]/page.tsx (user, logout)"
  echo "   - src/app/director/administrativos/page.tsx (executeUpdate)"
  echo ""
}

# Ejecutar correcciones
echo "═══════════════════════════════════════════════════════════"
fix_unescaped_quotes
clean_unused_vars
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ Correcciones completadas"
echo ""
echo "📌 Próximos pasos:"
echo "   1. Revisar cambios: git diff"
echo "   2. Hacer build: npm run build"
echo "   3. Si hay errores, revisar ESLINT_FIXES.md"
echo ""
