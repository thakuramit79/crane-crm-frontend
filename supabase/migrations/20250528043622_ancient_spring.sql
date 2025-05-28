/*
  # Create initial users

  1. Create users with roles and metadata
  2. Set up authentication
*/

-- Create users with roles
DO $$
DECLARE
  admin_id uuid;
  sales_id uuid;
  ops_id uuid;
  operator_id uuid;
BEGIN
  -- Admin user
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  VALUES (
    'admin@aspcranes.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"role": "admin", "name": "Admin User"}'::jsonb
  ) RETURNING id INTO admin_id;

  -- Sales user
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  VALUES (
    'john@aspcranes.com',
    crypt('sales123', gen_salt('bf')),
    now(),
    '{"role": "sales_agent", "name": "John Sales"}'::jsonb
  ) RETURNING id INTO sales_id;

  -- Operations user
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  VALUES (
    'sara@aspcranes.com',
    crypt('manager123', gen_salt('bf')),
    now(),
    '{"role": "operations_manager", "name": "Sara Manager"}'::jsonb
  ) RETURNING id INTO ops_id;

  -- Operator user
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  VALUES (
    'mike@aspcranes.com',
    crypt('operator123', gen_salt('bf')),
    now(),
    '{"role": "operator", "name": "Mike Operator"}'::jsonb
  ) RETURNING id INTO operator_id;
END $$;