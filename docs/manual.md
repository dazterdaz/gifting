# Manual de Usuario - Daz Giftcard Register

## Índice
1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Panel de Control](#panel-de-control)
4. [Gestión de Tarjetas de Regalo](#gestión-de-tarjetas-de-regalo)
5. [Administración de Usuarios](#administración-de-usuarios)
6. [Configuración del Sistema](#configuración-del-sistema)
7. [Consulta Pública](#consulta-pública)

## Introducción

Daz Giftcard Register es un sistema integral para la gestión de tarjetas de regalo. Este manual proporciona una guía detallada sobre todas las funcionalidades disponibles en el sistema.

## Acceso al Sistema

### Inicio de Sesión
1. Ingrese a la página principal del sistema
2. Introduzca su nombre de usuario o correo electrónico
3. Ingrese su contraseña
4. Haga clic en "Iniciar Sesión"

### Cambio de Idioma
- En la pantalla de inicio de sesión, puede cambiar entre español e inglés
- El idioma seleccionado se mantendrá durante toda la sesión

### Modo Oscuro/Claro
- Utilice el botón de tema en la barra superior para cambiar entre modo oscuro y claro
- La preferencia se guardará automáticamente

## Panel de Control

### Resumen General
- Tarjetas activas
- Tarjetas por vencer
- Total de tarjetas
- Tarjetas pendientes de entrega

### Actividad Reciente
- Visualización de últimas acciones realizadas en el sistema
- Filtrado por fecha y usuario

### Acciones Rápidas
- Crear nueva tarjeta
- Gestionar usuarios (solo superadmin)
- Acceso a configuración

## Gestión de Tarjetas de Regalo

### Crear Nueva Tarjeta
1. Haga clic en "Crear Nueva Tarjeta"
2. Complete la información del comprador:
   - Nombre
   - Correo electrónico
   - WhatsApp
3. Complete la información del destinatario:
   - Nombre
   - Correo electrónico
   - WhatsApp
4. Ingrese el monto de la tarjeta
5. Haga clic en "Crear"

### Buscar Tarjetas
- Filtrar por número
- Filtrar por correo electrónico
- Filtrar por WhatsApp
- Filtrar por estado
- Exportar resultados a PDF o CSV

### Estados de Tarjetas
1. Creada pero no Entregada
   - Estado inicial al crear una tarjeta
   - Pendiente de entrega al cliente

2. Entregada
   - La tarjeta ha sido entregada al cliente
   - Se establece fecha de vencimiento (90 días)

3. Cobrada
   - La tarjeta ha sido utilizada
   - Se registra el artista que realizó el trabajo

4. Anulada
   - La tarjeta ha sido cancelada
   - Se requiere nota explicativa

### Gestión de Vencimientos
- Extensión de fecha de vencimiento
- Notificaciones automáticas
- Historial de cambios

## Administración de Usuarios

### Roles de Usuario
1. Superadmin
   - Acceso total al sistema
   - Gestión de usuarios
   - Configuración del sistema

2. Administrador
   - Gestión de tarjetas
   - Visualización de reportes

### Gestión de Usuarios
- Crear nuevos usuarios
- Modificar usuarios existentes
- Eliminar usuarios
- Asignar roles

## Configuración del Sistema

### Configuración General
- Nombre del sitio
- Logo
- Color del tema

### Configuración SMTP
- Servidor SMTP
- Puerto
- Usuario
- Contraseña
- Encriptación
- Email remitente

### Plantillas de Notificación
1. Editor WYSIWYG
   - Formato de texto
   - Inserción de imágenes
   - Enlaces
   - Listas

2. Variables Disponibles
   - {{nombre}} - Nombre del cliente
   - {{monto}} - Monto de la tarjeta
   - {{fecha_vencimiento}} - Fecha de vencimiento
   - {{numero_tarjeta}} - Número de la tarjeta

3. Vista Previa
   - Previsualización en popup
   - Datos de ejemplo
   - Verificación de diseño

### Historial de Notificaciones
- Registro de emails enviados
- Estado de envío
- Errores de envío

## Consulta Pública

### Verificación de Tarjetas
1. Acceder a la página pública
2. Ingresar número de tarjeta
3. Visualizar:
   - Estado actual
   - Monto
   - Fecha de entrega
   - Fecha de vencimiento

### Seguridad
- Información limitada
- Sin datos sensibles
- Acceso público sin registro

## Soporte y Ayuda

### Chat Interno
- Comunicación entre usuarios
- Estado en línea/desconectado
- Historial de conversaciones
- Envío de imágenes

### Actividad Global
- Registro de todas las acciones
- Filtrado por fecha
- Filtrado por usuario
- Exportación de registros