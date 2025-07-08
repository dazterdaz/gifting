# 🚀 Guía Completa de Migración de Firebase a MySQL/PostgreSQL

## 📋 **Paso a Paso para la Migración**

### **1. Preparar la Base de Datos**

#### **Para MySQL:**
```bash
# 1. Acceder a tu panel de hosting (cPanel, Plesk, etc.)
# 2. Crear nueva base de datos llamada: daz_giftcard_register
# 3. Crear usuario con permisos completos sobre la base de datos
# 4. Ejecutar el archivo: database/mysql_schema.sql
```

#### **Para PostgreSQL:**
```bash
# 1. Acceder a tu panel de hosting
# 2. Crear nueva base de datos llamada: daz_giftcard_register
# 3. Crear usuario con permisos completos
# 4. Ejecutar el archivo: database/postgresql_schema.sql
```

### **2. Configurar Variables de Entorno**

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus datos reales
VITE_DB_TYPE=mysql  # o 'postgresql'
VITE_DB_HOST=tu-servidor-db.com
VITE_DB_PORT=3306   # o 5432 para PostgreSQL
VITE_DB_NAME=daz_giftcard_register
VITE_DB_USER=tu_usuario_db
VITE_DB_PASSWORD=tu_password_db
```

### **3. Instalar Dependencias de Base de Datos**

```bash
# Para MySQL
npm install mysql2

# Para PostgreSQL
npm install pg @types/pg

# Dependencias adicionales
npm install bcryptjs jsonwebtoken uuid
```

### **4. Actualizar el Cliente de Base de Datos**

Editar `src/lib/database.ts` y reemplazar las funciones simuladas con implementaciones reales:

#### **Para MySQL:**
```typescript
private async executeMySQLQuery<T>(sql: string, params: any[]): Promise<T[]> {
  const mysql = require('mysql2/promise');
  const connection = await mysql.createConnection({
    host: this.config.host,
    port: this.config.port,
    user: this.config.username,
    password: this.config.password,
    database: this.config.database,
    ssl: this.config.ssl
  });
  
  const [rows] = await connection.execute(sql, params);
  await connection.end();
  return rows as T[];
}
```

#### **Para PostgreSQL:**
```typescript
private async executePostgreSQLQuery<T>(sql: string, params: any[]): Promise<T[]> {
  const { Client } = require('pg');
  const client = new Client({
    host: this.config.host,
    port: this.config.port,
    user: this.config.username,
    password: this.config.password,
    database: this.config.database,
    ssl: this.config.ssl
  });
  
  await client.connect();
  const result = await client.query(sql, params);
  await client.end();
  return result.rows as T[];
}
```

### **5. Implementar Hash de Contraseñas**

```typescript
// En src/lib/database.ts
import bcrypt from 'bcryptjs';

// Hash de contraseña
async hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Verificar contraseña
async verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
```

### **6. Migrar Datos Existentes de Firebase**

Si tienes datos en Firebase, crear script de migración:

```typescript
// scripts/migrate-from-firebase.ts
import { db as firebaseDb } from '../src/lib/firebase';
import { dbService } from '../src/lib/database';

async function migrateData() {
  console.log('🔄 Iniciando migración de Firebase a MySQL/PostgreSQL...');
  
  // Migrar usuarios
  const users = await firebaseDb.collection('users').get();
  for (const doc of users.docs) {
    const userData = doc.data();
    await dbService.users.create({
      username: userData.username,
      email: userData.email,
      password: 'password_temporal', // Cambiar después
      role: userData.role
    });
  }
  
  // Migrar giftcards
  const giftcards = await firebaseDb.collection('giftcards').get();
  for (const doc of giftcards.docs) {
    const giftcardData = doc.data();
    await dbService.giftcards.create({
      buyer: {
        name: giftcardData.buyer.name,
        email: giftcardData.buyer.email,
        phone: giftcardData.buyer.phone
      },
      recipient: {
        name: giftcardData.recipient.name,
        email: giftcardData.recipient.email,
        phone: giftcardData.recipient.phone
      },
      amount: giftcardData.amount,
      duration: giftcardData.duration || 90
    });
  }
  
  console.log('✅ Migración completada');
}

migrateData().catch(console.error);
```

### **7. Probar la Aplicación**

```bash
# Desarrollo
npm run dev

# Verificar que:
# ✅ Login funciona con usuario: demian / @Llamasami1
# ✅ Se pueden crear giftcards
# ✅ La consulta pública funciona
# ✅ Los datos se guardan en la base de datos
```

### **8. Desplegar a Producción**

```bash
# Build para producción
npm run build

# Subir archivos dist/ a tu hosting
# Configurar variables de entorno en el hosting
# Verificar conexión a base de datos
```

## 🔧 **Configuración Específica por Hosting**

### **cPanel (Hosting Compartido):**
1. **Crear Base de Datos:** Panel → MySQL Databases
2. **Importar Schema:** phpMyAdmin → Import → Seleccionar archivo SQL
3. **Variables de Entorno:** Crear archivo `.env` en la raíz

### **Plesk:**
1. **Crear Base de Datos:** Databases → Add Database
2. **Importar Schema:** Database Webadmin → Import
3. **Variables de Entorno:** Files → .env

### **VPS/Servidor Dedicado:**
```bash
# MySQL
sudo mysql -u root -p
CREATE DATABASE daz_giftcard_register;
mysql -u root -p daz_giftcard_register < database/mysql_schema.sql

# PostgreSQL
sudo -u postgres psql
CREATE DATABASE daz_giftcard_register;
psql -U postgres -d daz_giftcard_register -f database/postgresql_schema.sql
```

## 🛡️ **Seguridad y Mejores Prácticas**

### **1. Conexión Segura:**
```env
# Usar SSL en producción
VITE_DB_SSL=true

# IP específica en lugar de localhost
VITE_DB_HOST=192.168.1.100
```

### **2. Usuario de Base de Datos:**
```sql
-- Crear usuario específico con permisos limitados
CREATE USER 'daz_app'@'%' IDENTIFIED BY 'password_seguro';
GRANT SELECT, INSERT, UPDATE, DELETE ON daz_giftcard_register.* TO 'daz_app'@'%';
FLUSH PRIVILEGES;
```

### **3. Backup Automático:**
```bash
# Script de backup diario
#!/bin/bash
mysqldump -u usuario -p password daz_giftcard_register > backup_$(date +%Y%m%d).sql
```

## 📊 **Monitoreo y Mantenimiento**

### **1. Logs de Base de Datos:**
- Activar logs de consultas lentas
- Monitorear conexiones activas
- Revisar errores regularmente

### **2. Optimización:**
```sql
-- Analizar rendimiento de consultas
EXPLAIN SELECT * FROM giftcards WHERE status = 'delivered';

-- Optimizar tablas periódicamente
OPTIMIZE TABLE giftcards;
```

### **3. Backup y Recuperación:**
```bash
# Backup completo
mysqldump -u usuario -p --all-databases > backup_completo.sql

# Restaurar
mysql -u usuario -p < backup_completo.sql
```

## 🚨 **Solución de Problemas Comunes**

### **Error de Conexión:**
```bash
# Verificar conectividad
telnet tu-servidor-db.com 3306

# Verificar permisos
mysql -u usuario -p -h servidor
```

### **Error de Permisos:**
```sql
-- Verificar permisos del usuario
SHOW GRANTS FOR 'usuario'@'host';

-- Otorgar permisos faltantes
GRANT ALL PRIVILEGES ON database.* TO 'usuario'@'host';
```

### **Consultas Lentas:**
```sql
-- Activar log de consultas lentas
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

## ✅ **Checklist Final**

- [ ] ✅ Base de datos creada y configurada
- [ ] ✅ Schema importado correctamente
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Dependencias instaladas
- [ ] ✅ Cliente de base de datos implementado
- [ ] ✅ Hash de contraseñas funcionando
- [ ] ✅ Login funciona correctamente
- [ ] ✅ CRUD de giftcards operativo
- [ ] ✅ Consulta pública funciona
- [ ] ✅ Datos se persisten correctamente
- [ ] ✅ Aplicación desplegada en producción
- [ ] ✅ Backup configurado
- [ ] ✅ Monitoreo activo

## 🎯 **Ventajas de la Migración**

✅ **Control Total:** Tus datos en tu servidor  
✅ **Sin Límites:** No hay restricciones de Firebase  
✅ **Mejor Rendimiento:** Consultas SQL optimizadas  
✅ **Costos Predecibles:** Solo pagas tu hosting  
✅ **Backup Fácil:** Herramientas SQL estándar  
✅ **Escalabilidad:** Crece según tus necesidades  
✅ **Compatibilidad:** Funciona con cualquier hosting  

¡Tu sistema estará completamente independiente y bajo tu control! 🚀