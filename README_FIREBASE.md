# Configuración de Firebase para Daz Giftcard Register

## 📋 Colecciones Creadas

### 1. **giftcards** - Tarjetas de Regalo
```javascript
{
  id: string,
  number: string, // Número único de 8 dígitos
  buyer: {
    name: string,
    email: string,
    phone: string
  },
  recipient: {
    name: string,
    email: string,
    phone: string
  },
  amount: number,
  status: 'created_not_delivered' | 'delivered' | 'redeemed' | 'cancelled',
  createdAt: Timestamp,
  deliveredAt?: Timestamp,
  expiresAt?: Timestamp, // 90 días después de deliveredAt
  redeemedAt?: Timestamp,
  cancelledAt?: Timestamp,
  notes?: string,
  artist?: string, // Para tarjetas cobradas
  termsAcceptedAt?: Timestamp
}
```

### 2. **users** - Usuarios del Sistema
```javascript
{
  id: string,
  username: string,
  email: string,
  role: 'superadmin' | 'admin',
  createdAt: Timestamp,
  lastLogin?: Timestamp,
  isActive: boolean
}
```

### 3. **activities** - Registro de Actividades
```javascript
{
  id: string,
  userId: string,
  username: string,
  action: string, // 'login', 'logout', 'created', 'updated', 'deleted', etc.
  targetType: 'giftcard' | 'user' | 'system' | 'terms',
  targetId?: string,
  details?: string,
  timestamp: Timestamp
}
```

### 4. **messages** - Chat Interno
```javascript
{
  id: string,
  senderId: string,
  senderName: string,
  recipientId?: string,
  content: string,
  timestamp: Timestamp,
  read: boolean,
  attachments?: Array<{
    type: 'image',
    url: string,
    name: string
  }>
}
```

### 5. **userStatuses** - Estados de Usuarios
```javascript
{
  id: string, // userId
  isOnline: boolean,
  lastSeen: Timestamp
}
```

### 6. **settings** - Configuración del Sitio
```javascript
{
  id: 'site-config',
  siteName: string,
  logoUrl: string,
  logoColor: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 7. **terms** - Términos y Condiciones
```javascript
{
  id: string,
  content: string, // HTML content
  createdAt: Timestamp,
  createdBy: string,
  isActive: boolean,
  version: number
}
```

### 8. **notifications** - Notificaciones
```javascript
{
  id: string,
  userId: string,
  type: 'email' | 'system',
  title: string,
  content: string,
  read: boolean,
  createdAt: Timestamp
}
```

## 🔐 Reglas de Seguridad

### Firestore Rules
- **Usuarios**: Solo superadmin puede modificar
- **Giftcards**: Admin y superadmin pueden leer/escribir
- **Actividades**: Admin y superadmin pueden leer/escribir
- **Configuración**: Solo superadmin puede modificar
- **Términos**: Lectura pública, escritura solo superadmin

### Storage Rules
- **Logos**: Lectura pública, escritura autenticada
- **Chat**: Solo el propietario puede leer/escribir
- **Temp**: Solo usuarios autenticados

## 📊 Índices Configurados

### Giftcards
- `status + createdAt (desc)`
- `number (asc)`
- `expiresAt + status`

### Activities
- `timestamp (desc)`
- `targetType + targetId + timestamp (desc)`
- `userId + timestamp (desc)`

### Messages
- `timestamp (desc)`
- `senderId + timestamp (desc)`
- `recipientId + timestamp (desc)`

## 🚀 Inicialización Automática

El sistema incluye inicialización automática que:

1. ✅ Verifica la conexión con Firebase
2. ✅ Crea todas las colecciones necesarias
3. ✅ Inserta datos iniciales:
   - Usuario administrador por defecto
   - Configuración del sitio
   - Términos y condiciones básicos
4. ✅ Configura índices para optimizar consultas

## 🛠️ Configuración Requerida

### 1. Crear Proyecto en Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita Firestore Database
4. Habilita Authentication
5. Habilita Storage

### 2. Configurar Credenciales
Reemplaza la configuración en `src/lib/firebase.ts`:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
```

### 3. Desplegar Reglas
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Inicializar proyecto
firebase init

# Desplegar reglas
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## 👤 Usuario por Defecto

**Usuario**: `demian`  
**Email**: `demian.83@hotmail.es`  
**Rol**: `superadmin`  
**Contraseña**: `@Llamasami1`

## 🔄 Emuladores (Desarrollo)

Para desarrollo local, puedes usar los emuladores de Firebase:

```bash
firebase emulators:start
```

Esto iniciará:
- Firestore Emulator: `localhost:8080`
- Auth Emulator: `localhost:9099`
- Storage Emulator: `localhost:9199`
- UI Emulator: `localhost:4000`

## 📝 Notas Importantes

1. **Seguridad**: Las reglas están configuradas para proteger los datos sensibles
2. **Escalabilidad**: Los índices están optimizados para las consultas más comunes
3. **Backup**: Configura backups automáticos en Firebase Console
4. **Monitoreo**: Habilita alertas para uso excesivo de recursos
5. **Costos**: Revisa regularmente el uso para evitar costos inesperados

## 🆘 Solución de Problemas

### Error de Permisos
- Verifica que las reglas de Firestore estén desplegadas
- Confirma que el usuario tenga el rol correcto

### Error de Conexión
- Verifica la configuración de Firebase
- Confirma que el proyecto esté activo
- Revisa la consola de Firebase para errores

### Datos No Se Cargan
- Verifica los índices en Firebase Console
- Confirma que las colecciones existan
- Revisa los logs de la aplicación