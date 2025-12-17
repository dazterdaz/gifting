/*
  # Fix RLS policies to allow unauthenticated access

  1. Modified Policies
    - Allow unauthenticated users to insert giftcards
    - Allow unauthenticated users to update giftcards
*/

DROP POLICY IF EXISTS "Giftcards are insertable by authenticated users" ON giftcards;
DROP POLICY IF EXISTS "Giftcards are updatable by authenticated users" ON giftcards;
DROP POLICY IF EXISTS "Giftcards are deletable by authenticated users" ON giftcards;

CREATE POLICY "Giftcards are insertable by anyone"
  ON giftcards
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Giftcards are updatable by anyone"
  ON giftcards
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Giftcards are deletable by authenticated users"
  ON giftcards
  FOR DELETE
  TO authenticated
  USING (true);
