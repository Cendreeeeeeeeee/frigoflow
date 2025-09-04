-- Ensure all policies are properly set up
-- This script verifies that all RLS policies are active

-- Grant necessary permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure pricebook is readable by all authenticated users
CREATE POLICY "Authenticated users can read pricebook" ON pricebook
  FOR SELECT TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_family_id ON members(family_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_family_id ON shopping_lists(family_id);
CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(code);
CREATE INDEX IF NOT EXISTS idx_pricebook_ean ON pricebook(ean);

-- Verify all tables have RLS enabled
DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'families') THEN
    ALTER TABLE families ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'members') THEN
    ALTER TABLE members ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'shopping_lists') THEN
    ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'list_items') THEN
    ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'invites') THEN
    ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;
