/*
  # Esquema inicial para Daz Giftcard Register

  1. Nuevas Tablas
    - `users` - Usuarios del sistema
    - `giftcards` - Tarjetas de regalo
    - `activities` - Registro de actividades
    - `contact_messages` - Mensajes de contacto
    - `settings` - Configuración del sitio

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para acceso autenticado
*/

-- Crear extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Tabla de giftcards
CREATE TABLE IF NOT EXISTS giftcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number TEXT UNIQUE NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'created_not_delivered' CHECK (status IN ('created_not_delivered', 'delivered', 'redeemed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  notes TEXT,
  artist TEXT,
  terms_accepted_at TIMESTAMPTZ
);

-- Tabla de actividades
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('giftcard', 'user', 'system', 'terms')),
  target_id TEXT,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de mensajes de contacto
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'leido', 'contactado', 'pagado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT false
);

-- Tabla de configuración
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'site-config',
  site_name TEXT NOT NULL DEFAULT 'Daz Giftcard Register',
  logo_url TEXT NOT NULL DEFAULT '/logo.svg',
  logo_color TEXT NOT NULL DEFAULT '#4F46E5',
  terms_content TEXT,
  contact_info JSONB,
  testimonials JSONB,
  social_links JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE giftcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (acceso público para desarrollo)
CREATE POLICY "Permitir todo en users" ON users FOR ALL USING (true);
CREATE POLICY "Permitir todo en giftcards" ON giftcards FOR ALL USING (true);
CREATE POLICY "Permitir todo en activities" ON activities FOR ALL USING (true);
CREATE POLICY "Permitir todo en contact_messages" ON contact_messages FOR ALL USING (true);
CREATE POLICY "Permitir todo en settings" ON settings FOR ALL USING (true);

-- Insertar usuario por defecto
INSERT INTO users (id, username, email, role, created_at, is_active)
VALUES ('admin-demian', 'demian', 'demian.83@hotmail.es', 'superadmin', NOW(), true)
ON CONFLICT (username) DO NOTHING;

-- Insertar configuración por defecto
INSERT INTO settings (
  id, 
  site_name, 
  logo_url, 
  logo_color, 
  terms_content,
  contact_info,
  testimonials,
  social_links,
  created_at,
  updated_at
) VALUES (
  'site-config',
  'Daz Giftcard Register',
  '/logo.svg',
  '#4F46E5',
  '<h3>Términos y Condiciones - Daz Giftcard Register</h3><h4>1. Aceptación de los Términos</h4><p>Al utilizar este sistema de consulta de tarjetas de regalo, usted acepta estar sujeto a estos términos y condiciones.</p><h4>2. Uso del Sistema</h4><p>Este sistema está diseñado para consultar el estado y validez de las tarjetas de regalo emitidas por Daz Tattoo.</p><h4>3. Privacidad</h4><p>La información consultada es confidencial y solo se muestra información básica del estado de la tarjeta.</p><h4>4. Validez de las Tarjetas</h4><p>Las tarjetas de regalo tienen una validez de 90 días desde su fecha de entrega.</p><h4>5. Contacto</h4><p>Para cualquier consulta adicional, contacte directamente con Daz Tattoo.</p>',
  '{"phone": "+56 9 1234 5678", "whatsapp": "+56 9 1234 5678", "email": "contacto@daztattoo.cl", "address": "Santiago, Chile"}',
  '[{"id": "1", "name": "María González", "text": "¡Increíble experiencia! El regalo perfecto para mi hermana. El proceso fue súper fácil.", "rating": 5, "avatar": "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150"}, {"id": "2", "name": "Carlos Ruiz", "text": "Regalé una giftcard para un tatuaje y quedó espectacular. Muy profesionales.", "rating": 5, "avatar": "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"}, {"id": "3", "name": "Ana López", "text": "El mejor regalo que he recibido. Mi piercing quedó perfecto y el trato fue excelente.", "rating": 5, "avatar": "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150"}]',
  '[{"id": "1", "platform": "Instagram", "url": "https://instagram.com/daztattoo", "icon": "instagram"}, {"id": "2", "platform": "Facebook", "url": "https://facebook.com/daztattoo", "icon": "facebook"}, {"id": "3", "platform": "WhatsApp", "url": "https://wa.me/56912345678", "icon": "whatsapp"}]',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_giftcards_number ON giftcards(number);
CREATE INDEX IF NOT EXISTS idx_giftcards_status ON giftcards(status);
CREATE INDEX IF NOT EXISTS idx_giftcards_created_at ON giftcards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activities_target ON activities(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);