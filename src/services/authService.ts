import { User, Role } from '../types';
import { DEMO_USER } from '../constants/mockData';
import { storageService } from './storageService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface RegisterParams {
  email: string;
  password: string;
  fullName?: string;
  studentId?: string;
}

export const authService = {
  /**
   * Restores the active user session.
   * Checks Supabase Auth session first, then falls back to cached session.
   */
  async getCurrentUser(): Promise<User | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          return await storageService.getUser();
        }

        const authUser = session.user;

        // Fetch corresponding profile from Supabase profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (profileError) {
          console.warn('Could not fetch user profile from Supabase:', profileError.message);
        }

        const user: User = {
          id: authUser.id,
          name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'VKU Student',
          email: authUser.email || '',
          studentId: authUser.user_metadata?.student_id || '21IT001',
          role: (profile?.role as Role) || 'student',
          avatar: authUser.user_metadata?.avatar || DEMO_USER.avatar,
          major: authUser.user_metadata?.major || 'Information Technology (VKU)',
        };

        // Cache session locally for instant launch
        await storageService.saveUser(user);
        return user;
      } catch (err) {
        console.warn('Error fetching Supabase session, using cached user:', err);
        return await storageService.getUser();
      }
    }

    return await storageService.getUser();
  },

  /**
   * Signs in a student with email and password via Supabase Auth.
   * Falls back to mock authentication if Supabase is not configured.
   */
  async login(email: string, password?: string): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.includes('@vku.edu.vn') && !normalizedEmail.includes('vku')) {
      throw new Error('Please enter a valid VKU institutional email (@vku.edu.vn).');
    }

    if (isSupabaseConfigured()) {
      const authPassword = password && password !== '••••••••' ? password : 'student123';
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: authPassword,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Sign-in failed. No user returned by authentication service.');
      }

      // Query profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      const user: User = {
        id: data.user.id,
        name: profile?.full_name || data.user.user_metadata?.full_name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        studentId: data.user.user_metadata?.student_id || '21IT001',
        role: (profile?.role as Role) || 'student',
        avatar: data.user.user_metadata?.avatar || DEMO_USER.avatar,
        major: data.user.user_metadata?.major || 'Information Technology (VKU)',
      };

      await storageService.saveUser(user);
      return user;
    }

    // Mock fallback when Supabase credentials are not yet configured
    await new Promise((resolve) => setTimeout(resolve, 300));
    const user: User = {
      ...DEMO_USER,
      email: normalizedEmail,
    };

    await storageService.saveUser(user);
    return user;
  },

  /**
   * Registers a new student account in Supabase Auth & creates their profile record.
   */
  async register(params: RegisterParams): Promise<User> {
    const { email, password, fullName, studentId } = params;
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.includes('@vku.edu.vn') && !normalizedEmail.includes('vku')) {
      throw new Error('Please register with your official VKU institutional email.');
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName || normalizedEmail.split('@')[0],
            student_id: studentId || '21IT001',
            role: 'student',
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Registration failed. Unable to create account.');
      }

      // Ensure profile row exists in public.profiles table
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          role: 'student',
        });
      } catch (profileErr) {
        console.warn('Profile upsert note:', profileErr);
      }

      const user: User = {
        id: data.user.id,
        name: fullName || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        studentId: studentId || '21IT001',
        role: 'student',
        avatar: DEMO_USER.avatar,
        major: 'Information Technology (VKU)',
      };

      await storageService.saveUser(user);
      return user;
    }

    // Mock fallback
    const user: User = {
      ...DEMO_USER,
      email: normalizedEmail,
      name: fullName || DEMO_USER.name,
      studentId: studentId || DEMO_USER.studentId,
    };
    await storageService.saveUser(user);
    return user;
  },

  /**
   * Signs in with the seeded demo student account.
   */
  async loginDemoUser(): Promise<User> {
    if (isSupabaseConfigured()) {
      try {
        return await this.login(DEMO_USER.email, 'student123');
      } catch {
        // Fallback gracefully to demo user session
        console.info('Using local demo credentials for preview session.');
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
    await storageService.saveUser(DEMO_USER);
    return DEMO_USER;
  },

  /**
   * Signs out from Supabase Auth and clears the cached session.
   */
  async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase sign-out error:', e);
      }
    }
    await storageService.clearUser();
  },

  /**
   * Subscribes to Supabase Auth state changes.
   */
  onAuthStateChange(callback: (event: string, session: any) => void): () => void {
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
      return () => {
        subscription.unsubscribe();
      };
    }
    return () => {};
  },
};
