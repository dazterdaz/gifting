// =====================================================
// CLIENTE DE BASE DE DATOS DIRECTO
// Soporte para MySQL y PostgreSQL sin API
// =====================================================

// Configuración de la base de datos
interface DatabaseConfig {
  type: 'mysql' | 'postgresql';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

// Configuración desde variables de entorno
const dbConfig: DatabaseConfig = {
  type: (import.meta.env.VITE_DB_TYPE as 'mysql' | 'postgresql') || 'mysql',
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_DB_PORT || '3306'),
  database: import.meta.env.VITE_DB_NAME || 'daz_giftcard_register',
  username: import.meta.env.VITE_DB_USER || 'root',
  password: import.meta.env.VITE_DB_PASSWORD || '',
  ssl: import.meta.env.VITE_DB_SSL === 'true'
};

// Cliente de base de datos
class DatabaseClient {
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  // Ejecutar consulta SQL
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      console.log('🔍 Ejecutando consulta:', sql.substring(0, 100) + '...');
      console.log('📊 Parámetros:', params);

      // En un entorno real, aquí usarías una librería como mysql2 o pg
      // Para este ejemplo, simularemos las consultas
      return await this.simulateQuery<T>(sql, params);
    } catch (error) {
      console.error('❌ Error en consulta SQL:', error);
      throw new Error(`Error de base de datos: ${error.message}`);
    }
  }

  // Simulación de consultas (reemplazar con implementación real)
  private async simulateQuery<T>(sql: string, params: any[]): Promise<T[]> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 100));

    // Aquí implementarías las consultas reales según el tipo de base de datos
    if (this.config.type === 'mysql') {
      return this.executeMySQLQuery<T>(sql, params);
    } else {
      return this.executePostgreSQLQuery<T>(sql, params);
    }
  }

  private async executeMySQLQuery<T>(sql: string, params: any[]): Promise<T[]> {
    // Implementación para MySQL
    // Ejemplo usando mysql2:
    /*
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
    */
    
    // Por ahora, datos simulados
    return this.getSimulatedData<T>(sql);
  }

  private async executePostgreSQLQuery<T>(sql: string, params: any[]): Promise<T[]> {
    // Implementación para PostgreSQL
    // Ejemplo usando pg:
    /*
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
    */
    
    // Por ahora, datos simulados
    return this.getSimulatedData<T>(sql);
  }

  private getSimulatedData<T>(sql: string): T[] {
    const sqlLower = sql.toLowerCase();
    
    // Simular datos según el tipo de consulta
    if (sqlLower.includes('select') && sqlLower.includes('users')) {
      return [{
        id: 'admin-demian',
        username: 'demian',
        email: 'demian.83@hotmail.es',
        role: 'superadmin',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        is_active: true
      }] as T[];
    }
    
    if (sqlLower.includes('select') && sqlLower.includes('giftcards')) {
      return [] as T[]; // Sin giftcards inicialmente
    }
    
    if (sqlLower.includes('select') && sqlLower.includes('site_settings')) {
      return [{
        id: 'site-config',
        site_name: 'Daz Giftcard Register',
        logo_url: '/logo.svg',
        logo_color: '#4F46E5',
        contact_phone: '+56 9 1234 5678',
        contact_whatsapp: '+56 9 1234 5678',
        contact_email: 'contacto@daztattoo.cl',
        contact_address: 'Santiago, Chile'
      }] as T[];
    }
    
    return [] as T[];
  }

  // Generar ID único
  generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Generar número de giftcard único
  async generateGiftcardNumber(): Promise<string> {
    let number: string;
    let exists = true;
    
    while (exists) {
      number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
      const result = await this.query('SELECT COUNT(*) as count FROM giftcards WHERE number = ?', [number]);
      exists = result[0].count > 0;
    }
    
    return number!;
  }

  // Hash de contraseña (simulado)
  async hashPassword(password: string): Promise<string> {
    // En producción, usar bcrypt
    return `$2b$10$${password}hashed`;
  }

  // Verificar contraseña (simulado)
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    // En producción, usar bcrypt.compare
    return hash.includes(password);
  }
}

// Instancia global del cliente
export const db = new DatabaseClient(dbConfig);

// Servicios de base de datos
export const dbService = {
  // =====================================================
  // USUARIOS
  // =====================================================
  users: {
    async getAll() {
      return await db.query(`
        SELECT id, username, email, role, created_at, last_login, is_active 
        FROM users 
        WHERE is_active = true 
        ORDER BY username
      `);
    },

    async getById(id: string) {
      const result = await db.query(`
        SELECT id, username, email, role, created_at, last_login, is_active 
        FROM users 
        WHERE id = ? AND is_active = true
      `, [id]);
      return result[0] || null;
    },

    async getByUsername(username: string) {
      const result = await db.query(`
        SELECT id, username, email, password_hash, role, created_at, last_login, is_active 
        FROM users 
        WHERE username = ? AND is_active = true
      `, [username]);
      return result[0] || null;
    },

    async create(userData: any) {
      const id = db.generateId();
      const passwordHash = await db.hashPassword(userData.password);
      
      await db.query(`
        INSERT INTO users (id, username, email, password_hash, role, created_at, is_active)
        VALUES (?, ?, ?, ?, ?, NOW(), true)
      `, [id, userData.username, userData.email, passwordHash, userData.role || 'admin']);
      
      return await this.getById(id);
    },

    async update(id: string, userData: any) {
      const updates = [];
      const params = [];
      
      if (userData.username) {
        updates.push('username = ?');
        params.push(userData.username);
      }
      if (userData.email) {
        updates.push('email = ?');
        params.push(userData.email);
      }
      if (userData.role) {
        updates.push('role = ?');
        params.push(userData.role);
      }
      if (userData.last_login) {
        updates.push('last_login = ?');
        params.push(userData.last_login);
      }
      
      params.push(id);
      
      await db.query(`
        UPDATE users 
        SET ${updates.join(', ')} 
        WHERE id = ?
      `, params);
      
      return await this.getById(id);
    },

    async delete(id: string) {
      await db.query('UPDATE users SET is_active = false WHERE id = ?', [id]);
    }
  },

  // =====================================================
  // GIFTCARDS
  // =====================================================
  giftcards: {
    async getAll() {
      return await db.query(`
        SELECT * FROM giftcards 
        ORDER BY created_at DESC
      `);
    },

    async getById(id: string) {
      const result = await db.query('SELECT * FROM giftcards WHERE id = ?', [id]);
      return result[0] || null;
    },

    async getByNumber(number: string) {
      const result = await db.query('SELECT * FROM giftcards WHERE number = ?', [number]);
      return result[0] || null;
    },

    async create(giftcardData: any) {
      const id = db.generateId();
      const number = await db.generateGiftcardNumber();
      
      await db.query(`
        INSERT INTO giftcards (
          id, number, buyer_name, buyer_email, buyer_phone,
          recipient_name, recipient_email, recipient_phone,
          amount, duration, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'created_not_delivered', NOW())
      `, [
        id, number,
        giftcardData.buyer.name, giftcardData.buyer.email, giftcardData.buyer.phone,
        giftcardData.recipient.name, giftcardData.recipient.email, giftcardData.recipient.phone,
        giftcardData.amount, giftcardData.duration || 90
      ]);
      
      return await this.getById(id);
    },

    async updateStatus(id: string, status: string, notes?: string, artist?: string) {
      const updates = ['status = ?'];
      const params = [status];
      
      if (status === 'delivered') {
        updates.push('delivered_at = NOW()');
        updates.push('expires_at = DATE_ADD(NOW(), INTERVAL COALESCE(duration, 90) DAY)');
      } else if (status === 'redeemed') {
        updates.push('redeemed_at = NOW()');
        if (notes) {
          updates.push('notes = ?');
          params.push(notes);
        }
        if (artist) {
          updates.push('artist = ?');
          params.push(artist);
        }
      } else if (status === 'cancelled') {
        updates.push('cancelled_at = NOW()');
        if (notes) {
          updates.push('notes = ?');
          params.push(notes);
        }
      }
      
      params.push(id);
      
      await db.query(`
        UPDATE giftcards 
        SET ${updates.join(', ')} 
        WHERE id = ?
      `, params);
      
      return await this.getById(id);
    },

    async extendExpiry(id: string, days: number) {
      await db.query(`
        UPDATE giftcards 
        SET expires_at = DATE_ADD(expires_at, INTERVAL ? DAY)
        WHERE id = ? AND expires_at IS NOT NULL
      `, [days, id]);
      
      return await this.getById(id);
    },

    async acceptTerms(number: string) {
      await db.query(`
        UPDATE giftcards 
        SET terms_accepted_at = NOW() 
        WHERE number = ?
      `, [number]);
    },

    async delete(id: string) {
      await db.query('DELETE FROM giftcards WHERE id = ?', [id]);
    },

    async getPublicInfo(number: string) {
      const result = await db.query(`
        SELECT number, amount, status, delivered_at, expires_at, terms_accepted_at
        FROM giftcards 
        WHERE number = ?
      `, [number]);
      return result[0] || null;
    }
  },

  // =====================================================
  // ACTIVIDADES
  // =====================================================
  activities: {
    async getAll() {
      return await db.query(`
        SELECT * FROM activities 
        ORDER BY timestamp DESC
      `);
    },

    async getRecent(limit: number = 10) {
      return await db.query(`
        SELECT * FROM activities 
        ORDER BY timestamp DESC 
        LIMIT ?
      `, [limit]);
    },

    async create(activityData: any) {
      const id = db.generateId();
      
      await db.query(`
        INSERT INTO activities (id, user_id, username, action, target_type, target_id, details, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        id, activityData.userId, activityData.username, activityData.action,
        activityData.targetType, activityData.targetId, activityData.details
      ]);
    },

    async getByTarget(targetType: string, targetId: string) {
      return await db.query(`
        SELECT * FROM activities 
        WHERE target_type = ? AND target_id = ?
        ORDER BY timestamp DESC
      `, [targetType, targetId]);
    }
  },

  // =====================================================
  // MENSAJES DE CONTACTO
  // =====================================================
  contactMessages: {
    async getAll() {
      return await db.query(`
        SELECT * FROM contact_messages 
        ORDER BY created_at DESC
      `);
    },

    async create(messageData: any) {
      const id = db.generateId();
      
      await db.query(`
        INSERT INTO contact_messages (id, name, whatsapp, email, message, status, created_at, archived)
        VALUES (?, ?, ?, ?, ?, 'nuevo', NOW(), false)
      `, [id, messageData.name, messageData.whatsapp, messageData.email, messageData.message]);
    },

    async updateStatus(id: string, status: string) {
      await db.query('UPDATE contact_messages SET status = ? WHERE id = ?', [status, id]);
    },

    async archive(id: string) {
      await db.query('UPDATE contact_messages SET archived = true WHERE id = ?', [id]);
    }
  },

  // =====================================================
  // CONFIGURACIÓN
  // =====================================================
  settings: {
    async get() {
      const result = await db.query('SELECT * FROM site_settings WHERE id = ?', ['site-config']);
      return result[0] || null;
    },

    async update(settingsData: any) {
      const updates = [];
      const params = [];
      
      Object.keys(settingsData).forEach(key => {
        if (key !== 'id') {
          updates.push(`${key} = ?`);
          params.push(settingsData[key]);
        }
      });
      
      updates.push('updated_at = NOW()');
      params.push('site-config');
      
      await db.query(`
        UPDATE site_settings 
        SET ${updates.join(', ')} 
        WHERE id = ?
      `, params);
      
      return await this.get();
    }
  },

  // =====================================================
  // TÉRMINOS Y CONDICIONES
  // =====================================================
  terms: {
    async getActive() {
      const result = await db.query(`
        SELECT * FROM terms_conditions 
        WHERE is_active = true 
        ORDER BY version DESC 
        LIMIT 1
      `);
      return result[0] || null;
    },

    async create(termsData: any) {
      const id = db.generateId();
      
      // Desactivar términos anteriores
      await db.query('UPDATE terms_conditions SET is_active = false');
      
      // Crear nuevos términos
      await db.query(`
        INSERT INTO terms_conditions (id, content, created_by, is_active, version, created_at)
        VALUES (?, ?, ?, true, 1, NOW())
      `, [id, termsData.content, termsData.createdBy]);
      
      return await this.getActive();
    }
  }
};