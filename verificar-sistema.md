# 🔍 GUÍA DE VERIFICACIÓN DEL SISTEMA DE SALONES

## ✅ **PASOS PARA VERIFICAR QUE TODO FUNCIONA**

### **1. VERIFICAR BACKEND** 🔧

#### **A. Iniciar el servidor backend:**
```bash
cd backend
npm run start:dev
```

#### **B. Verificar endpoints con curl o Postman:**

**Obtener salones:**
```bash
curl -X GET http://localhost:3001/api/salones \
  -H "Cookie: token=TU_TOKEN_AQUI"
```

**Obtener alumnos disponibles:**
```bash
curl -X GET http://localhost:3001/api/salones/alumnos-disponibles \
  -H "Cookie: token=TU_TOKEN_AQUI"
```

### **2. VERIFICAR FRONTEND** 🎨

#### **A. Iniciar el servidor frontend:**
```bash
cd frontend
npm run dev
```

#### **B. Probar funcionalidades:**

1. **Login como Director**
   - Ve a: http://localhost:3000/login
   - Inicia sesión con credenciales de director

2. **Acceder al Dashboard**
   - Ve a: http://localhost:3000/director/dashboard
   - Verifica que aparezca la card "Alumnos por Salón"

3. **Gestión de Salones**
   - Haz clic en "Gestionar Asignaciones"
   - Ve a: http://localhost:3000/director/salones/gestion
   - Verifica que aparezcan los salones agrupados por nivel

4. **Asignar Alumnos**
   - Haz clic en "Asignar" en cualquier salón
   - Verifica que se abra el modal
   - Verifica que aparezcan alumnos disponibles
   - Selecciona algunos alumnos y asígnalos

5. **Ver Detalles del Salón**
   - Haz clic en "Ver" en un salón con alumnos
   - Verifica que aparezca la lista de alumnos asignados

### **3. VERIFICAR BASE DE DATOS** 📊

#### **A. Usar Prisma Studio:**
```bash
cd backend
npx prisma studio
```

#### **B. Verificar tablas importantes:**

1. **Tabla `Salon`**
   - Verifica que existan salones creados
   - Campos: id, colegioId, nivel, grado, seccion, activo

2. **Tabla `SalonAlumno`**
   - Verifica las asignaciones de alumnos a salones
   - Campos: id, salonId, alumnoId, activo, creadoEn

3. **Tabla `Alumno`**
   - Verifica que existan alumnos registrados
   - Campos: id, nombres, apellidos, dni, fechaNacimiento

### **4. VERIFICAR LOGS** 📝

#### **A. Logs del Backend:**
Revisa la consola del backend para:
- ✅ Conexión exitosa a la base de datos
- ✅ Endpoints registrados correctamente
- ✅ Requests procesados sin errores

#### **B. Logs del Frontend:**
Revisa la consola del navegador (F12) para:
- ✅ Sin errores de JavaScript
- ✅ Requests exitosos a la API
- ✅ Estados actualizados correctamente

### **5. PRUEBAS FUNCIONALES** 🧪

#### **Flujo Completo de Prueba:**

1. **Crear Salón** (si no existe)
   - Ve a gestión de salones
   - Crea un salón nuevo

2. **Registrar Alumno** (si no existe)
   - Ve a: http://localhost:3000/director/alumnos/nuevo
   - Registra un alumno nuevo

3. **Asignar Alumno al Salón**
   - Ve a gestión de salones
   - Asigna el alumno al salón

4. **Verificar Asignación**
   - Ve a detalles del salón
   - Confirma que el alumno aparece en la lista

5. **Remover Alumno** (opcional)
   - Desde detalles del salón
   - Remueve el alumno y verifica

### **6. VERIFICAR SEGURIDAD** 🔐

#### **A. Autenticación:**
- ✅ Solo usuarios autenticados pueden acceder
- ✅ Redirección al login si no hay token

#### **B. Autorización:**
- ✅ Solo directores/administrativos pueden gestionar salones
- ✅ Scope por colegio (solo ven datos de su institución)

#### **C. Validaciones:**
- ✅ No se pueden asignar alumnos ya asignados
- ✅ Validaciones de datos en formularios

## 🚨 **PROBLEMAS COMUNES Y SOLUCIONES**

### **Error: "Cannot connect to database"**
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### **Error: "Module not found"**
```bash
cd frontend
npm install
```

### **Error: "Unauthorized"**
- Verifica que estés logueado
- Revisa que el token no haya expirado

### **Error: "No alumnos disponibles"**
- Registra algunos alumnos primero
- Verifica que no estén todos asignados

## ✅ **CHECKLIST DE VERIFICACIÓN**

- [ ] Backend iniciado sin errores
- [ ] Frontend iniciado sin errores
- [ ] Login funciona correctamente
- [ ] Dashboard muestra opciones correctas
- [ ] Gestión de salones carga datos
- [ ] Modal de asignación se abre
- [ ] Alumnos disponibles aparecen
- [ ] Asignación se ejecuta exitosamente
- [ ] Base de datos se actualiza
- [ ] Vista detallada muestra alumnos
- [ ] Remover alumno funciona
- [ ] Logs sin errores críticos

## 🎯 **RESULTADO ESPERADO**

Si todos los puntos están ✅, entonces:
- **Backend**: Completamente funcional
- **Frontend**: Sin errores y UX fluida
- **Base de datos**: Datos persistiendo correctamente
- **Seguridad**: Protección adecuada implementada

**¡Tu sistema está listo para producción!** 🚀
