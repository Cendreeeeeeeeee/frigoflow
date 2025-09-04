-- Function to create a new family and add the creator as a member
CREATE OR REPLACE FUNCTION create_family_with_member(
  family_name TEXT,
  member_name TEXT
) RETURNS UUID AS $$
DECLARE
  new_family_id UUID;
BEGIN
  -- Create the family
  INSERT INTO families (name) VALUES (family_name) RETURNING id INTO new_family_id;
  
  -- Add the user as a member
  INSERT INTO members (id, family_id, display_name) 
  VALUES (auth.uid(), new_family_id, member_name);
  
  RETURN new_family_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join a family using an invite code
CREATE OR REPLACE FUNCTION join_family_with_invite(
  invite_code TEXT,
  member_name TEXT
) RETURNS UUID AS $$
DECLARE
  invite_record RECORD;
  family_id UUID;
BEGIN
  -- Get the invite
  SELECT * INTO invite_record FROM invites 
  WHERE code = invite_code AND used_by IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Code d''invitation invalide ou déjà utilisé';
  END IF;
  
  family_id := invite_record.family_id;
  
  -- Add the user as a member
  INSERT INTO members (id, family_id, display_name) 
  VALUES (auth.uid(), family_id, member_name);
  
  -- Mark the invite as used
  UPDATE invites 
  SET used_by = auth.uid(), used_at = NOW() 
  WHERE code = invite_code;
  
  RETURN family_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create an invite code
CREATE OR REPLACE FUNCTION create_invite_code() RETURNS TEXT AS $$
DECLARE
  user_family_id UUID;
  new_code TEXT;
BEGIN
  -- Get user's family
  SELECT family_id INTO user_family_id FROM members WHERE id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilisateur non membre d''une famille';
  END IF;
  
  -- Generate a random 6-character code
  new_code := upper(substring(md5(random()::text) from 1 for 6));
  
  -- Insert the invite
  INSERT INTO invites (code, family_id, created_by) 
  VALUES (new_code, user_family_id, auth.uid());
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's family info
CREATE OR REPLACE FUNCTION get_user_family() RETURNS TABLE(
  family_id UUID,
  family_name TEXT,
  member_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT f.id, f.name, m.display_name
  FROM families f
  JOIN members m ON f.id = m.family_id
  WHERE m.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
