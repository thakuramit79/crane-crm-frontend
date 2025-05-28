import { signUp } from './authService';
import { UserRole } from '../../types/auth';

interface InitialUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

const INITIAL_USERS: InitialUser[] = [
  {
    email: 'admin@aspcranes.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
  },
  {
    email: 'john@aspcranes.com',
    password: 'sales123',
    name: 'John Sales',
    role: 'sales_agent',
  },
  {
    email: 'sara@aspcranes.com',
    password: 'manager123',
    name: 'Sara Manager',
    role: 'operations_manager',
  },
  {
    email: 'mike@aspcranes.com',
    password: 'operator123',
    name: 'Mike Operator',
    role: 'operator',
  },
];

export const setupInitialUsers = async () => {
  try {
    for (const user of INITIAL_USERS) {
      try {
        await signUp(user.email, user.password, user.name, user.role);
        console.log(`Created user: ${user.email}`);
      } catch (error: any) {
        // Skip if user already exists
        if (error.code === 'auth/email-already-in-use') {
          console.log(`User already exists: ${user.email}`);
          continue;
        }
        throw error;
      }
    }
    console.log('Initial users setup completed');
  } catch (error) {
    console.error('Error setting up initial users:', error);
    throw error;
  }
};