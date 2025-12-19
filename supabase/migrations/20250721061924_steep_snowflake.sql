/*
  # Agregar columna branding_display a la tabla settings

  1. Cambios en la tabla
    - Agregar columna `branding_display` a la tabla `settings`
    - Tipo: TEXT con valores permitidos ('logo', 'text', 'both')
    - Valor por defecto: 'both'
    - Permite NULL: No

  2. Restricciones
    - Check constraint para validar valores permitidos
*/

-- Agregar la columna branding_display a la tabla settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'branding_display'
  ) THEN
    ALTER TABLE settings ADD COLUMN branding_display text DEFAULT 'both' NOT NULL;
  END IF;
END $$;

-- Agregar constraint para validar valores permitidos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'settings_branding_display_check'
  ) THEN
    ALTER TABLE settings ADD CONSTRAINT settings_branding_display_check 
    CHECK (branding_display = ANY (ARRAY['logo'::text, 'text'::text, 'both'::text]));
  END IF;
END $$;