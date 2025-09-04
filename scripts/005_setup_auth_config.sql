-- Configure Supabase Auth settings
-- This script documents the required auth configuration

-- In your Supabase dashboard, go to Authentication > Settings and configure:

-- 1. Site URL: https://your-app-domain.com (or http://localhost:3000 for development)

-- 2. Redirect URLs: Add these URLs to allow redirects after authentication:
--    - http://localhost:3000/auth/callback (for development)
--    - https://your-app-domain.com/auth/callback (for production)

-- 3. Email Templates: Customize the magic link email template
--    Default subject: "Your magic link"
--    Default body should include: {{ .ConfirmationURL }}

-- 4. Enable Email provider in Authentication > Providers

-- 5. Disable "Confirm email" if you want users to login immediately
--    (Go to Authentication > Settings > "Confirm email" = disabled)

-- Create a function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be called when a new user signs up
  -- We don't automatically add them to a family here
  -- They will choose to create or join a family during onboarding
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
