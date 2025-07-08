-- =====================================================
-- ESQUEMA COMPLETO PARA POSTGRESQL
-- Daz Giftcard Register - Sistema de Gestión de Tarjetas de Regalo
-- =====================================================

-- Crear base de datos (ejecutar como superusuario)
-- CREATE DATABASE daz_giftcard_register WITH ENCODING 'UTF8' LC_COLLATE='es_ES.UTF-8' LC_CTYPE='es_ES.UTF-8';

-- Conectar a la base de datos
-- \c daz_giftcard_register;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TIPOS ENUM PERSONALIZADOS
-- =====================================================
CREATE TYPE user_role AS ENUM ('superadmin', 'admin');
CREATE TYPE giftcard_status AS ENUM ('created_not_delivered', 'delivered', 'redeemed', 'cancelled');
CREATE TYPE activity_target_type AS ENUM ('giftcard', 'user', 'system', 'terms');
CREATE TYPE message_status AS ENUM ('nuevo', 'leido', 'contactado', 'pagado');

-- =====================================================
-- 1. TABLA DE USUARIOS
-- =====================================================
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Índices para usuarios
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- 2. TABLA DE GIFTCARDS
-- =====================================================
CREATE TABLE giftcards (
    id VARCHAR(50) PRIMARY KEY,
    number VARCHAR(8) NOT NULL UNIQUE,
    buyer_name VARCHAR(255) NOT NULL,
    buyer_email VARCHAR(255) NOT NULL,
    buyer_phone VARCHAR(50) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    duration INTEGER DEFAULT 90, -- Duración en días
    status giftcard_status DEFAULT 'created_not_delivered',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE NULL,
    expires_at TIMESTAMP WITH TIME ZONE NULL,
    redeemed_at TIMESTAMP WITH TIME ZONE NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE NULL,
    notes TEXT NULL,
    artist VARCHAR(255) NULL,
    terms_accepted_at TIMESTAMP WITH TIME ZONE NULL,
    
    CONSTRAINT chk_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_duration_positive CHECK (duration > 0)
);

-- Índices para giftcards
CREATE UNIQUE INDEX idx_giftcards_number ON giftcards(number);
CREATE INDEX idx_giftcards_status ON giftcards(status);
CREATE INDEX idx_giftcards_created_at ON giftcards(created_at DESC);
CREATE INDEX idx_giftcards_expires_at ON giftcards(expires_at);
CREATE INDEX idx_giftcards_buyer_email ON giftcards(buyer_email);
CREATE INDEX idx_giftcards_recipient_email ON giftcards(recipient_email);
CREATE INDEX idx_giftcards_buyer_phone ON giftcards(buyer_phone);
CREATE INDEX idx_giftcards_recipient_phone ON giftcards(recipient_phone);

-- =====================================================
-- 3. TABLA DE ACTIVIDADES
-- =====================================================
CREATE TABLE activities (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    username VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type activity_target_type NOT NULL,
    target_id VARCHAR(50) NULL,
    details TEXT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para actividades
CREATE INDEX idx_activities_timestamp ON activities(timestamp DESC);
CREATE INDEX idx_activities_target ON activities(target_type, target_id);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_action ON activities(action);

-- =====================================================
-- 4. TABLA DE MENSAJES DE CONTACTO
-- =====================================================
CREATE TABLE contact_messages (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status message_status DEFAULT 'nuevo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    archived BOOLEAN DEFAULT FALSE
);

-- Índices para mensajes de contacto
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_archived ON contact_messages(archived);
CREATE INDEX idx_contact_messages_email ON contact_messages(email);
CREATE INDEX idx_contact_messages_whatsapp ON contact_messages(whatsapp);

-- =====================================================
-- 5. TABLA DE CONFIGURACIÓN DEL SITIO
-- =====================================================
CREATE TABLE site_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'site-config',
    site_name VARCHAR(255) DEFAULT 'Daz Giftcard Register',
    logo_url VARCHAR(500) DEFAULT '/logo.svg',
    logo_color VARCHAR(7) DEFAULT '#4F46E5',
    contact_phone VARCHAR(50) NULL,
    contact_whatsapp VARCHAR(50) NULL,
    contact_email VARCHAR(255) NULL,
    contact_address TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. TABLA DE TÉRMINOS Y CONDICIONES
-- =====================================================
CREATE TABLE terms_conditions (
    id VARCHAR(50) PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1
);

-- Índices para términos
CREATE INDEX idx_terms_active ON terms_conditions(is_active);
CREATE INDEX idx_terms_version ON terms_conditions(version);

-- =====================================================
-- 7. TABLA DE TESTIMONIOS
-- =====================================================
CREATE TABLE testimonials (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    avatar VARCHAR(500) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para testimonios
CREATE INDEX idx_testimonials_active ON testimonials(is_active);
CREATE INDEX idx_testimonials_sort ON testimonials(sort_order);

-- =====================================================
-- 8. TABLA DE ENLACES SOCIALES
-- =====================================================
CREATE TABLE social_links (
    id VARCHAR(50) PRIMARY KEY,
    platform VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    icon VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

-- Índices para enlaces sociales
CREATE INDEX idx_social_links_active ON social_links(is_active);
CREATE INDEX idx_social_links_sort ON social_links(sort_order);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Usuario administrador por defecto (contraseña: @Llamasami1)
INSERT INTO users (id, username, email, password_hash, role) VALUES 
('admin-demian', 'demian', 'demian.83@hotmail.es', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'superadmin');

-- Configuración inicial del sitio
INSERT INTO site_settings (id, site_name, contact_phone, contact_whatsapp, contact_email, contact_address) VALUES 
('site-config', 'Daz Giftcard Register', '+56 9 1234 5678', '+56 9 1234 5678', 'contacto@daztattoo.cl', 'Santiago, Chile');

-- Términos y condiciones por defecto
INSERT INTO terms_conditions (id, content, created_by) VALUES 
('default-terms', '<h3>Términos y Condiciones - Daz Giftcard Register</h3>
<h4>1. Aceptación de los Términos</h4>
<p>Al utilizar este sistema de consulta de tarjetas de regalo, usted acepta estar sujeto a estos términos y condiciones.</p>
<h4>2. Uso del Sistema</h4>
<p>Este sistema está diseñado para consultar el estado y validez de las tarjetas de regalo emitidas por Daz Tattoo.</p>
<h4>3. Privacidad</h4>
<p>La información consultada es confidencial y solo se muestra información básica del estado de la tarjeta.</p>
<h4>4. Validez de las Tarjetas</h4>
<p>Las tarjetas de regalo tienen una validez de 90 días desde su fecha de entrega.</p>
<h4>5. Contacto</h4>
<p>Para cualquier consulta adicional, contacte directamente con Daz Tattoo.</p>', 'Sistema');

-- Testimonios por defecto
INSERT INTO testimonials (id, name, text, rating, avatar, sort_order) VALUES 
('1', 'María González', '¡Increíble experiencia! El regalo perfecto para mi hermana. El proceso fue súper fácil.', 5, 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150', 1),
('2', 'Carlos Ruiz', 'Regalé una giftcard para un tatuaje y quedó espectacular. Muy profesionales.', 5, 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150', 2),
('3', 'Ana López', 'El mejor regalo que he recibido. Mi piercing quedó perfecto y el trato fue excelente.', 5, 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150', 3);

-- Enlaces sociales por defecto
INSERT INTO social_links (id, platform, url, icon, sort_order) VALUES 
('1', 'Instagram', 'https://instagram.com/daztattoo', 'instagram', 1),
('2', 'Facebook', 'https://facebook.com/daztattoo', 'facebook', 2),
('3', 'WhatsApp', 'https://wa.me/56912345678', 'whatsapp', 3);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para site_settings
CREATE TRIGGER update_site_settings_updated_at 
    BEFORE UPDATE ON site_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Función para establecer fechas de vencimiento automáticamente
CREATE OR REPLACE FUNCTION set_giftcard_dates()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el estado cambia a 'delivered' y no tenía fecha de entrega
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND OLD.delivered_at IS NULL THEN
        NEW.delivered_at = NOW();
        NEW.expires_at = NOW() + INTERVAL '1 day' * COALESCE(NEW.duration, 90);
    END IF;
    
    -- Si el estado cambia a 'redeemed'
    IF NEW.status = 'redeemed' AND OLD.status != 'redeemed' THEN
        NEW.redeemed_at = NOW();
    END IF;
    
    -- Si el estado cambia a 'cancelled'
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        NEW.cancelled_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para giftcards
CREATE TRIGGER set_giftcard_expiry_on_delivery
    BEFORE UPDATE ON giftcards
    FOR EACH ROW
    EXECUTE FUNCTION set_giftcard_dates();

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para giftcards con información de vencimiento
CREATE VIEW giftcards_with_expiry AS
SELECT 
    g.*,
    CASE 
        WHEN g.expires_at IS NULL THEN NULL
        WHEN g.expires_at < NOW() THEN 0
        ELSE EXTRACT(DAY FROM (g.expires_at - NOW()))::INTEGER
    END as days_until_expiry,
    CASE 
        WHEN g.expires_at IS NULL THEN 'no_expiry'
        WHEN g.expires_at < NOW() THEN 'expired'
        WHEN g.expires_at < NOW() + INTERVAL '15 days' THEN 'expiring_soon'
        ELSE 'valid'
    END as expiry_status
FROM giftcards g;

-- Vista para estadísticas del dashboard
CREATE VIEW dashboard_stats AS
SELECT 
    COUNT(*) as total_giftcards,
    COUNT(CASE WHEN status IN ('created_not_delivered', 'delivered') THEN 1 END) as active_giftcards,
    COUNT(CASE WHEN status = 'created_not_delivered' THEN 1 END) as pending_delivery,
    COUNT(CASE WHEN expires_at IS NOT NULL AND expires_at < NOW() + INTERVAL '30 days' AND expires_at > NOW() THEN 1 END) as expiring_soon,
    COUNT(CASE WHEN status = 'redeemed' THEN 1 END) as redeemed_giftcards,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_giftcards,
    SUM(CASE WHEN status IN ('created_not_delivered', 'delivered') THEN amount ELSE 0 END) as active_amount
FROM giftcards;

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Función para generar número único de giftcard
CREATE OR REPLACE FUNCTION generate_giftcard_number()
RETURNS VARCHAR(8) AS $$
DECLARE
    new_number VARCHAR(8);
    number_exists BOOLEAN;
BEGIN
    LOOP
        new_number := LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
        
        SELECT EXISTS(SELECT 1 FROM giftcards WHERE number = new_number) INTO number_exists;
        
        EXIT WHEN NOT number_exists;
    END LOOP;
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Función para extender vencimiento
CREATE OR REPLACE FUNCTION extend_giftcard_expiry(
    giftcard_id VARCHAR(50),
    extend_days INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE giftcards 
    SET expires_at = expires_at + INTERVAL '1 day' * extend_days
    WHERE id = giftcard_id AND expires_at IS NOT NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERMISOS Y SEGURIDAD
-- =====================================================

-- Crear usuario para la aplicación (opcional)
-- CREATE USER daz_app WITH PASSWORD 'tu_password_seguro';
-- GRANT CONNECT ON DATABASE daz_giftcard_register TO daz_app;
-- GRANT USAGE ON SCHEMA public TO daz_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO daz_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO daz_app;