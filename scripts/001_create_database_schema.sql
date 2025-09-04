-- Create families table
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create members table (references auth.users)
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invites table
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- Create shopping_lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create list_items table
CREATE TABLE IF NOT EXISTS list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  qty INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'pcs',
  checked BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2),
  added_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pricebook table for price estimates
CREATE TABLE IF NOT EXISTS pricebook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ean TEXT,
  label TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  store TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricebook ENABLE ROW LEVEL SECURITY;

-- RLS Policies for families
CREATE POLICY "Users can view their family" ON families
  FOR SELECT USING (id IN (SELECT family_id FROM members WHERE id = auth.uid()));

-- RLS Policies for members
CREATE POLICY "Users can view family members" ON members
  FOR SELECT USING (family_id IN (SELECT family_id FROM members WHERE id = auth.uid()));

CREATE POLICY "Users can insert themselves as members" ON members
  FOR INSERT WITH CHECK (id = auth.uid());

-- RLS Policies for invites
CREATE POLICY "Users can view family invites" ON invites
  FOR SELECT USING (family_id IN (SELECT family_id FROM members WHERE id = auth.uid()));

CREATE POLICY "Users can create family invites" ON invites
  FOR INSERT WITH CHECK (family_id IN (SELECT family_id FROM members WHERE id = auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Users can update invites they created" ON invites
  FOR UPDATE USING (created_by = auth.uid());

-- RLS Policies for shopping_lists
CREATE POLICY "Users can view family shopping lists" ON shopping_lists
  FOR SELECT USING (family_id IN (SELECT family_id FROM members WHERE id = auth.uid()));

CREATE POLICY "Users can create family shopping lists" ON shopping_lists
  FOR INSERT WITH CHECK (family_id IN (SELECT family_id FROM members WHERE id = auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Users can update family shopping lists" ON shopping_lists
  FOR UPDATE USING (family_id IN (SELECT family_id FROM members WHERE id = auth.uid()));

CREATE POLICY "Users can delete family shopping lists" ON shopping_lists
  FOR DELETE USING (family_id IN (SELECT family_id FROM members WHERE id = auth.uid()));

-- RLS Policies for list_items
CREATE POLICY "Users can view family list items" ON list_items
  FOR SELECT USING (list_id IN (SELECT id FROM shopping_lists WHERE family_id IN (SELECT family_id FROM members WHERE id = auth.uid())));

CREATE POLICY "Users can create family list items" ON list_items
  FOR INSERT WITH CHECK (list_id IN (SELECT id FROM shopping_lists WHERE family_id IN (SELECT family_id FROM members WHERE id = auth.uid())) AND added_by = auth.uid());

CREATE POLICY "Users can update family list items" ON list_items
  FOR UPDATE USING (list_id IN (SELECT id FROM shopping_lists WHERE family_id IN (SELECT family_id FROM members WHERE id = auth.uid())));

CREATE POLICY "Users can delete family list items" ON list_items
  FOR DELETE USING (list_id IN (SELECT id FROM shopping_lists WHERE family_id IN (SELECT family_id FROM members WHERE id = auth.uid())));

-- RLS Policies for pricebook (read-only for users)
CREATE POLICY "Users can view pricebook" ON pricebook
  FOR SELECT USING (true);
