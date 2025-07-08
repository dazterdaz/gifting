-- =====================================================
-- ESQUEMA COMPLETO PARA MYSQL
-- Daz Giftcard Register - Sistema de Gestión de Tarjetas de Regalo
-- =====================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS daz_giftcard_register 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE daz_giftcard_register;

-- =====================================================
-- 1. TABLA DE USUARIOS
-- =====================================================
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('superadmin', 'admin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    duration INT DEFAULT 90 COMMENT 'Duración en días',
    status ENUM('created_not_delivered', 'delivered', 'redeemed', 'cancelled') DEFAULT 'created_not_delivered',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    redeemed_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    notes TEXT NULL,
    artist VARCHAR(255) NULL,
    terms_accepted_at TIMESTAMP NULL,
    
    INDEX idx_number (number),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_expires_at (expires_at),
    INDEX idx_buyer_email (buyer_email),
    INDEX idx_recipient_email (recipient_email),
    INDEX idx_buyer_phone (buyer_phone),
    INDEX idx_recipient_phone (recipient_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. TABLA DE ACTIVIDADES
-- =====================================================
CREATE TABLE activities (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    username VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type ENUM('giftcard', 'user', 'system', 'terms') NOT NULL,
    target_id VARCHAR(50) NULL,
    details TEXT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_timestamp (timestamp DESC),
    INDEX idx_target (target_type, target_id),
    INDEX idx_user (user_id),
    INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. TABLA DE MENSAJES DE CONTACTO
-- =====================================================
CREATE TABLE contact_messages (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('nuevo', 'leido', 'contactado', 'pagado') DEFAULT 'nuevo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived BOOLEAN DEFAULT FALSE,
    
    INDEX idx_status (status),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_archived (archived),
    INDEX idx_email (email),
    INDEX idx_whatsapp (whatsapp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. TABLA DE TÉRMINOS Y CONDICIONES
-- =====================================================
CREATE TABLE terms_conditions (
    id VARCHAR(50) PRIMARY KEY,
    content LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    version INT DEFAULT 1,
    
    INDEX idx_active (is_active),
    INDEX idx_version (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. TABLA DE TESTIMONIOS
-- =====================================================
CREATE TABLE testimonials (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    avatar VARCHAR(500) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_active (is_active),
    INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. TABLA DE ENLACES SOCIALES
-- =====================================================
CREATE TABLE social_links (
    id VARCHAR(50) PRIMARY KEY,
    platform VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    icon VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    
    INDEX idx_active (is_active),
    INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- TRIGGERS PARA AUTOMATIZAR FECHAS DE VENCIMIENTO
-- =====================================================

DELIMITER //

-- Trigger para establecer fecha de vencimiento cuando se marca como entregada
CREATE TRIGGER set_expiry_on_delivery
    BEFORE UPDATE ON giftcards
    FOR EACH ROW
BEGIN
    -- Si el estado cambia a 'delivered' y no tenía fecha de entrega
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND OLD.delivered_at IS NULL THEN
        SET NEW.delivered_at = NOW();
        SET NEW.expires_at = DATE_ADD(NOW(), INTERVAL COALESCE(NEW.duration, 90) DAY);
    END IF;
    
    -- Si el estado cambia a 'redeemed'
    IF NEW.status = 'redeemed' AND OLD.status != 'redeemed' THEN
        SET NEW.redeemed_at = NOW();
    END IF;
    
    -- Si el estado cambia a 'cancelled'
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        SET NEW.cancelled_at = NOW();
    END IF;
END//

DELIMITER ;

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
        ELSE DATEDIFF(g.expires_at, NOW())
    END as days_until_expiry,
    CASE 
        WHEN g.expires_at IS NULL THEN 'no_expiry'
        WHEN g.expires_at < NOW() THEN 'expired'
        WHEN DATEDIFF(g.expires_at, NOW()) <= 15 THEN 'expiring_soon'
        ELSE 'valid'
    END as expiry_status
FROM giftcards g;

-- Vista para estadísticas del dashboard
CREATE VIEW dashboard_stats AS
SELECT 
    COUNT(*) as total_giftcards,
    COUNT(CASE WHEN status IN ('created_not_delivered', 'delivered') THEN 1 END) as active_giftcards,
    COUNT(CASE WHEN status = 'created_not_delivered' THEN 1 END) as pending_delivery,
    COUNT(CASE WHEN expires_at IS NOT NULL AND expires_at < NOW() + INTERVAL 30 DAY AND expires_at > NOW() THEN 1 END) as expiring_soon,
    COUNT(CASE WHEN status = 'redeemed' THEN 1 END) as redeemed_giftcards,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_giftcards,
    SUM(CASE WHEN status IN ('created_not_delivered', 'delivered') THEN amount ELSE 0 END) as active_amount
FROM giftcards;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- =====================================================

DELIMITER //

-- Procedimiento para generar número único de giftcard
CREATE PROCEDURE GenerateGiftcardNumber(OUT new_number VARCHAR(8))
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE temp_number VARCHAR(8);
    
    REPEAT
        SET temp_number = LPAD(FLOOR(RAND() * 100000000), 8, '0');
        
        SELECT COUNT(*) INTO done FROM giftcards WHERE number = temp_number;
        
    UNTIL done = 0 END REPEAT;
    
    SET new_number = temp_number;
END//

-- Procedimiento para extender vencimiento
CREATE PROCEDURE ExtendGiftcardExpiry(
    IN giftcard_id VARCHAR(50),
    IN extend_days INT
)
BEGIN
    UPDATE giftcards 
    SET expires_at = DATE_ADD(expires_at, INTERVAL extend_days DAY)
    WHERE id = giftcard_id AND expires_at IS NOT NULL;
END//

DELIMITER ;