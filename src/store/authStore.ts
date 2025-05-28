import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '../types/auth';
import { supabase } from '../lib/supabase';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      error: null,
      
      login: async (email: string, password: string) => {
        try {
          set({ error: null });
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          
          if (data.user && data.session) {
            const userMetadata = data.user.user_metadata;
            
            const user: User = {
              id: data.user.id,
              name: userMetadata.name || data.user.email?.split('@')[0] || '',
              email: data.user.email!,
              role: userMetadata.role || 'operator',
              avatar: userMetadata.avatar,
            };
            
            set({ 
              token: data.session.access_token,
              user,
              isAuthenticated: true,
            });
          }
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },
      
      logout: async () => {
        try {
          await supabase.auth.signOut();
          set({ token: null, user: null, isAuthenticated: false, error: null });
        } catch (error) {
          console.error('Error during logout:', error);
        }
      },
      
      checkAuth: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            set({ token: null, user: null, isAuthenticated: false });
            return false;
          }
          
          const userMetadata = session.user.user_metadata;
          
          const user: User = {
            id: session.user.id,
            name: userMetadata.name || session.user.email?.split('@')[0] || '',
            email: session.user.email!,
            role: userMetadata.role || 'operator',
            avatar: userMetadata.avatar,
          };
          
          set({
            token: session.access_token,
            user,
            isAuthenticated: true,
          });
          
          return true;
        } catch (error) {
          console.error('Error checking auth:', error);
          set({ token: null, user: null, isAuthenticated: false });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);