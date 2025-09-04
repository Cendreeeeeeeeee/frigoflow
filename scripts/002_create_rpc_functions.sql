-- Function to create a family and add the user as a member
CREATE OR REPLACE FUNCTION create_family_and_self(family_name TEXT, display_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_family_id UUID;
BEGIN
  -- Create the family
  INSERT INTO families (name) VALUES (family_name) RETURNING id INTO new_family_id;
  
  -- Add the user as a member
  INSERT INTO members (id, family_id, display_name) VALUES (auth.uid(), new_family_id, display_name);
  
  RETURN new_family_id;
END;
$$;

-- Function to create an invite
CREATE OR REPLACE FUNCTION create_invite(family_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_code TEXT;
BEGIN
  -- Generate a random 8-character code
  invite_code := upper(substring(gen_random_uuid()::text from 1 for 8));
  
  -- Insert the invite
  INSERT INTO invites (family_id, code, created_by) VALUES (family_id, invite_code, auth.uid());
  
  RETURN invite_code;
END;
$$;

-- Function to accept an invite
CREATE OR REPLACE FUNCTION accept_invite(inv_code TEXT, display_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_family_id UUID;
BEGIN
  -- Get the family_id from the invite and mark it as used
  UPDATE invites 
  SET used_by = auth.uid(), used_at = NOW() 
  WHERE code = inv_code AND used_by IS NULL
  RETURNING family_id INTO invite_family_id;
  
  IF invite_family_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or already used invite code';
  END IF;
  
  -- Add the user as a member
  INSERT INTO members (id, family_id, display_name) VALUES (auth.uid(), invite_family_id, display_name);
  
  RETURN invite_family_id;
END;
$$;
