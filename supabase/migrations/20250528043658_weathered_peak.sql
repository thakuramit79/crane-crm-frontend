/*
  # Create initial users
  
  Creates the initial set of users with their roles:
  - Admin user
  - Sales agent
  - Operations manager
  - Operator
  
  Each user is created with their email, password, and role metadata.
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users with roles using auth.create_user()
DO $$
BEGIN
  -- Admin user
  PERFORM auth.create_user(
    json_build_object(
      'id', uuid_generate_v4(),
      'instance_id', '00000000-0000-0000-0000-000000000000',
      'email', 'admin@aspcranes.com',
      'password', 'admin123',
      'email_confirmed_at', now(),
      'raw_user_meta_data', json_build_object(
        'role', 'admin',
        'name', 'Admin User'
      )
    )
  );

  -- Sales user
  PERFORM auth.create_user(
    json_build_object(
      'id', uuid_generate_v4(),
      'instance_id', '00000000-0000-0000-0000-000000000000',
      'email', 'john@aspcranes.com',
      'password', 'sales123',
      'email_confirmed_at', now(),
      'raw_user_meta_data', json_build_object(
        'role', 'sales_agent',
        'name', 'John Sales'
      )
    )
  );

  -- Operations user
  PERFORM auth.create_user(
    json_build_object(
      'id', uuid_generate_v4(),
      'instance_id', '00000000-0000-0000-0000-000000000000',
      'email', 'sara@aspcranes.com',
      'password', 'manager123',
      'email_confirmed_at', now(),
      'raw_user_meta_data', json_build_object(
        'role', 'operations_manager',
        'name', 'Sara Manager'
      )
    )
  );

  -- Operator user
  PERFORM auth.create_user(
    json_build_object(
      'id', uuid_generate_v4(),
      'instance_id', '00000000-0000-0000-0000-000000000000',
      'email', 'mike@aspcranes.com',
      'password', 'operator123',
      'email_confirmed_at', now(),
      'raw_user_meta_data', json_build_object(
        'role', 'operator',
        'name', 'Mike Operator'
      )
    )
  );
END $$;