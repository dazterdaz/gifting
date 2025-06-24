# 🚀 Guía de Despliegue para Producción

## 📋 Requisitos Previos

### 1. Configurar Firebase
1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar servicios:
   - ✅ Firestore Database
   - ✅ Authentication
   - ✅ Storage
   - ✅ Hosting (opcional)

### 2. Configurar Variables de Entorno
Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Completar con los datos de tu proyecto Firebase:
```env
VITE_FIREBASE_API_KEY=AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnopqrstuvwxyz
```

## 🔧 Configuración de Firebase

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Inicializar Proyecto
```bash
firebase login
firebase init
```

Seleccionar:
- ✅ Firestore
- ✅ Storage
- ✅ Hosting (opcional)

### 3. Desplegar Reglas de Seguridad
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### 4. Configurar Índices
```bash
firebase deploy --only firestore:indexes
```

## 🏗️ Build para Producción

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Ejecutar Build
```bash
npm run build
```

### 3. Verificar Build
```bash
npm run preview
```

## 🌐 Opciones de Despliegue

### Opción 1: Firebase Hosting
```bash
# Configurar hosting
firebase init hosting

# Desplegar
firebase deploy --only hosting
```

### Opción 2: Netlify
1. Conectar repositorio en [Netlify](https://netlify.com)
2. Configurar build:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Agregar variables de entorno en Netlify

### Opción 3: Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel --prod
```

### Opción 4: Servidor Propio
1. Subir carpeta `dist/` al servidor
2. Configurar servidor web (Apache/Nginx)
3. Configurar redirects para SPA

## 🔐 Configuración de Seguridad

### 1. Reglas de Firestore
Las reglas están configuradas en `firestore.rules`:
- Solo usuarios autenticados pueden acceder
- Superadmin tiene acceso completo
- Admin tiene acceso limitado

### 2. Reglas de Storage
Las reglas están configuradas en `storage.rules`:
- Logos: lectura pública, escritura autenticada
- Chat: solo propietario
- Temp: solo autenticados

### 3. Variables de Entorno
- ✅ Nunca commitear archivos `.env`
- ✅ Usar variables de entorno en producción
- ✅ Rotar claves regularmente

## 📊 Monitoreo y Mantenimiento

### 1. Firebase Console
- Monitorear uso de Firestore
- Revisar logs de errores
- Configurar alertas de uso

### 2. Performance
- Habilitar Analytics
- Configurar Performance Monitoring
- Revisar métricas regularmente

### 3. Backup
- Configurar backups automáticos de Firestore
- Exportar datos regularmente
- Documentar procedimientos de recuperación

## 🚨 Solución de Problemas

### Error de Variables de Entorno
```bash
# Verificar variables
echo $VITE_FIREBASE_API_KEY
```

### Error de Permisos Firebase
```bash
# Re-autenticar
firebase logout
firebase login
```

### Error de Build
```bash
# Limpiar cache
rm -rf node_modules
rm package-lock.json
npm install
```

## 📝 Checklist de Despliegue

- [ ] ✅ Proyecto Firebase creado
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Reglas de seguridad desplegadas
- [ ] ✅ Índices configurados
- [ ] ✅ Build exitoso
- [ ] ✅ Aplicación desplegada
- [ ] ✅ DNS configurado (si aplica)
- [ ] ✅ SSL habilitado
- [ ] ✅ Monitoreo configurado
- [ ] ✅ Backup configurado

## 🎯 Usuario por Defecto

**Usuario**: `demian`  
**Contraseña**: `@Llamasami1`  
**Rol**: Super Administrador

## 📞 Soporte

Para problemas técnicos:
1. Revisar logs de Firebase Console
2. Verificar configuración de variables
3. Consultar documentación de Firebase
4. Contactar soporte técnico si es necesario

---

**¡Listo para producción! 🚀**