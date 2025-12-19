-- Migración inicial para Daz Giftcard Register
-- Crea todas las tablas necesarias con datos iniciales

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

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE giftcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad permisivas para desarrollo
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on giftcards" ON giftcards FOR ALL USING (true);
CREATE POLICY "Allow all operations on activities" ON activities FOR ALL USING (true);
CREATE POLICY "Allow all operations on contact_messages" ON contact_messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on settings" ON settings FOR ALL USING (true);

-- Insertar usuario administrador por defecto
INSERT INTO users (username, email, role, created_at, is_active)
VALUES ('demian', 'demian.83@hotmail.es', 'superadmin', NOW(), true)
ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Insertar configuración inicial del sitio
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
  '<h3>Términos y Condiciones - Daz Giftcard Register</h3>
   <h4>1. Aceptación de los Términos</h4>
   <p>Al utilizar este sistema de consulta de tarjetas de regalo, usted acepta estar sujeto a estos términos y condiciones.</p>
   <h4>2. Uso del Sistema</h4>
   <p>Este sistema está diseñado para consultar el estado y validez de las tarjetas de regalo emitidas por Daz Tattoo.</p>
   <h4>3. Privacidad</h4>
   <p>La información consultada es confidencial y solo se muestra información básica del estado de la tarjeta.</p>
   <h4>4. Validez de las Tarjetas</h4>
   <p>Las tarjetas de regalo tienen una validez de 90 días desde su fecha de entrega.</p>
   <h4>5. Contacto</h4>
   <p>Para cualquier consulta adicional, contacte directamente con Daz Tattoo.</p>',
  '{"phone": "+56 9 1234 5678", "whatsapp": "+56 9 1234 5678", "email": "contacto@daztattoo.cl", "address": "Santiago, Chile"}'::jsonb,
  '[
    {
      "id": "1", 
      "name": "María González", 
      "text": "¡Increíble experiencia! El regalo perfecto para mi hermana. El proceso fue súper fácil.", 
      "rating": 5, 
      "avatar": "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      "id": "2", 
      "name": "Carlos Ruiz", 
      "text": "Regalé una giftcard para un tatuaje y quedó espectacular. Muy profesionales.", 
      "rating": 5, 
      "avatar": "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      "id": "3", 
      "name": "Ana López", 
      "text": "El mejor regalo que he recibido. Mi piercing quedó perfecto y el trato fue excelente.", 
      "rating": 5, 
      "avatar": "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150"
    }
  ]'::jsonb,
  '[
    {"id": "1", "platform": "Instagram", "url": "https://instagram.com/daztattoo", "icon": "instagram"},
    {"id": "2", "platform": "Facebook", "url": "https://facebook.com/daztattoo", "icon": "facebook"},
    {"id": "3", "platform": "WhatsApp", "url": "https://wa.me/56912345678", "icon": "whatsapp"}
  ]'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  site_name = EXCLUDED.site_name,
  logo_url = EXCLUDED.logo_url,
  logo_color = EXCLUDED.logo_color,
  terms_content = EXCLUDED.terms_content,
  contact_info = EXCLUDED.contact_info,
  testimonials = EXCLUDED.testimonials,
  social_links = EXCLUDED.social_links,
  updated_at = NOW();

-- Crear índices para optimizar el rendimiento
CREATE INDEX IF NOT EXISTS idx_giftcards_number ON giftcards(number);
CREATE INDEX IF NOT EXISTS idx_giftcards_status ON giftcards(status);
CREATE INDEX IF NOT EXISTS idx_giftcards_created_at ON giftcards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_giftcards_expires_at ON giftcards(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activities_target ON activities(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_archived ON contact_messages(archived);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);