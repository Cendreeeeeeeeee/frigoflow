-- Enable Row Level Security on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Families policies
CREATE POLICY "Users can view their own family" ON families
  FOR SELECT USING (
    id IN (
      SELECT family_id FROM members WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own family" ON families
  FOR UPDATE USING (
    id IN (
      SELECT family_id FROM members WHERE id = auth.uid()
    )
  );

-- Members policies
CREATE POLICY "Users can view members of their family" ON members
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM members WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert themselves as members" ON members
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own member record" ON members
  FOR UPDATE USING (id = auth.uid());

-- Shopping lists policies
CREATE POLICY "Users can view lists from their family" ON shopping_lists
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM members WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create lists for their family" ON shopping_lists
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM members WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update lists from their family" ON shopping_lists
  FOR UPDATE USING (
    family_id IN (
      SELECT family_id FROM members WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete lists they created" ON shopping_lists
  FOR DELETE USING (created_by = auth.uid());

-- List items policies
CREATE POLICY "Users can view items from their family lists" ON list_items
  FOR SELECT USING (
    list_id IN (
      SELECT id FROM shopping_lists WHERE family_id IN (
        SELECT family_id FROM members WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can add items to their family lists" ON list_items
  FOR INSERT WITH CHECK (
    list_id IN (
      SELECT id FROM shopping_lists WHERE family_id IN (
        SELECT family_id FROM members WHERE id = auth.uid()
      )
    )
    AND added_by = auth.uid()
  );

CREATE POLICY "Users can update items in their family lists" ON list_items
  FOR UPDATE USING (
    list_id IN (
      SELECT id FROM shopping_lists WHERE family_id IN (
        SELECT family_id FROM members WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete items they added" ON list_items
  FOR DELETE USING (added_by = auth.uid());

-- Invites policies
CREATE POLICY "Users can view invites for their family" ON invites
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM members WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create invites for their family" ON invites
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM members WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Anyone can view unused invites by code" ON invites
  FOR SELECT USING (used_by IS NULL);

CREATE POLICY "Users can update invites they created" ON invites
  FOR UPDATE USING (created_by = auth.uid());
