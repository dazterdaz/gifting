/*
  # Create settings table

  1. New Tables
    - `settings`
      - `id` (uuid, primary key)
      - `site_name` (text)
      - `logo_url` (text)
      - `logo_color` (text)
      - `terms_content` (text)
      - `branding_display` (text)
      - `contact_info` (json)
      - `testimonials` (json)
      - `social_links` (json)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `settings` table
    - Add policies for public read and authenticated update
*/

CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL,
  logo_url text NOT NULL,
  logo_color text DEFAULT '#000000',
  terms_content text,
  branding_display text DEFAULT 'both',
  contact_info jsonb,
  testimonials jsonb,
  social_links jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are readable by anyone"
  ON settings
  FOR SELECT
  USING (true);

CREATE POLICY "Settings are updatable by authenticated users"
  ON settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO settings (site_name, logo_url, logo_color) 
VALUES ('Daz Giftcard Register', '', '#000000')
ON CONFLICT DO NOTHING;
