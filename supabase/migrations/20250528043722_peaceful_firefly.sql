/*
  # Create initial users
  
  Creates the initial set of users with different roles:
  - Admin user
  - Sales agent
  - Operations manager
  - Operator
  
  Each user has:
  - UUID primary key
  - Email and encrypted password
  - Role and name in metadata
  - Confirmed email status
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users with roles
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  last_sign_in_at,
  confirmation_token,
  email_change_token_current,
  email_change_token_new,
  recovery_token,
  aud,
  role
)
VALUES
  -- Admin user
  (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000000',
    'admin@aspcranes.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"role": "admin", "name": "Admin User"}'::jsonb,
    now(),
    now(),
    now(),
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated'
  ),
  -- Sales user
  (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000000',
    'john@aspcranes.com',
    crypt('sales123', gen_salt('bf')),
    now(),
    '{"role": "sales_agent", "name": "John Sales"}'::jsonb,
    now(),
    now(),
    now(),
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated'
  ),
  -- Operations user
  (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000000',
    'sara@aspcranes.com',
    crypt('manager123', gen_salt('bf')),
    now(),
    '{"role": "operations_manager", "name": "Sara Manager"}'::jsonb,
    now(),
    now(),
    now(),
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated'
  ),
  -- Operator user
  (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000000',
    'mike@aspcranes.com',
    crypt('operator123', gen_salt('bf')),
    now(),
    '{"role": "operator", "name": "Mike Operator"}'::jsonb,
    now(),
    now(),
    now(),
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated'
  );