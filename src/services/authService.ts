import { User } from '../types';
import { DEMO_USER } from '../constants/mockData';
import { storageService } from './storageService';

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    return await storageService.getUser();
  },

  async login(email: string, _password?: string): Promise<User> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes('@vku.edu.vn') && !normalizedEmail.includes('vku')) {
      throw new Error('Please enter a valid VKU institutional email (@vku.edu.vn).');
    }

    const user: User = {
      ...DEMO_USER,
      email: normalizedEmail,
    };

    await storageService.saveUser(user);
    return user;
  },

  async loginDemoUser(): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await storageService.saveUser(DEMO_USER);
    return DEMO_USER;
  },

  async logout(): Promise<void> {
    await storageService.clearUser();
  },
};
