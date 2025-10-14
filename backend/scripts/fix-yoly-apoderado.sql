-- Verificar datos del usuario yoly
SELECT 
    u.id as usuario_id,
    u.email,
    u.nombres,
    u.apellidos,
    r.nombre as rol
FROM usuario u
JOIN usuario_rol ur ON u.id = ur.usuario_id
JOIN rol r ON ur.rol_id = r.id
WHERE u.email = 'yoly@gmail.com';

-- Verificar si existe en tabla apoderado
SELECT * FROM apoderado WHERE usuario_id = 35;

-- Si no existe, crear el registro de apoderado para yoly
INSERT INTO apoderado (
    usuario_id,
    dni,
    nombres,
    apellidos,
    telefono,
    direccion,
    activo,
    creado_por,
    creado_en,
    actualizado_en
) VALUES (
    35,
    '87654321',
    'Yoly',
    'García',
    '999888777',
    'Av. Principal 123',
    true,
    35,
    NOW(),
    NOW()
);

-- Verificar que se creó correctamente
SELECT * FROM apoderado WHERE usuario_id = 35;
