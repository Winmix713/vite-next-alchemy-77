
import { UserProfile, UserPreferences } from '@/types/conversion';

// Mock authentication service - in a real app, this would connect to a backend API
export class AuthService {
  private static instance: AuthService;
  private currentUser: UserProfile | null = null;
  private listeners: Array<(user: UserProfile | null) => void> = [];

  private constructor() {
    // Load user from local storage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('user');
      }
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Register a new user
  public async register(email: string, password: string, displayName: string): Promise<UserProfile> {
    // In a real app, this would call a backend API
    const newUser: UserProfile = {
      id: `user_${Math.random().toString(36).substring(2, 11)}`,
      email,
      displayName,
      createdAt: Date.now(),
      lastLogin: Date.now(),
      preferences: this.getDefaultPreferences()
    };
    
    // Save to local storage for demo purposes
    this.currentUser = newUser;
    localStorage.setItem('user', JSON.stringify(newUser));
    this.notifyListeners();
    
    return newUser;
  }

  // Login an existing user
  public async login(email: string, password: string): Promise<UserProfile> {
    // In a real app, this would verify credentials with a backend API
    // Mock implementation for demo
    if (email && password) {
      const user: UserProfile = {
        id: `user_${Math.random().toString(36).substring(2, 11)}`,
        email,
        displayName: email.split('@')[0],
        createdAt: Date.now() - 86400000, // 1 day ago
        lastLogin: Date.now(),
        preferences: this.getDefaultPreferences()
      };
      
      this.currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
      this.notifyListeners();
      return user;
    }
    
    throw new Error('Invalid credentials');
  }

  // Logout the current user
  public logout(): void {
    this.currentUser = null;
    localStorage.removeItem('user');
    this.notifyListeners();
  }

  // Get the current user
  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  // Update user profile
  public async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.currentUser) {
      throw new Error('No user is logged in');
    }
    
    const updatedUser = {
      ...this.currentUser,
      ...updates,
      updatedAt: Date.now()
    };
    
    this.currentUser = updatedUser;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    this.notifyListeners();
    
    return updatedUser;
  }

  // Update user preferences
  public async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserProfile> {
    if (!this.currentUser) {
      throw new Error('No user is logged in');
    }
    
    const updatedUser = {
      ...this.currentUser,
      preferences: {
        ...this.currentUser.preferences,
        ...preferences
      }
    };
    
    this.currentUser = updatedUser;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    this.notifyListeners();
    
    return updatedUser;
  }

  // Listen for authentication changes
  public addAuthListener(listener: (user: UserProfile | null) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Get default user preferences
  private getDefaultPreferences(): UserPreferences {
    return {
      defaultConversionOptions: {
        useReactRouter: true,
        convertApiRoutes: true,
        transformDataFetching: true,
        replaceComponents: true,
        updateDependencies: true,
        preserveTypeScript: true,
        handleMiddleware: true
      },
      defaultTheme: 'system',
      notificationsEnabled: true,
      experimentalFeaturesEnabled: false
    };
  }

  // Notify all listeners of authentication changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener(this.currentUser);
    });
  }
}

// Create an auth hook for React components
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const authService = AuthService.getInstance();
  const [user, setUser] = useState<UserProfile | null>(authService.getCurrentUser());

  useEffect(() => {
    const unsubscribe = authService.addAuthListener(setUser);
    return unsubscribe;
  }, []);

  return {
    user,
    register: authService.register.bind(authService),
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    updateProfile: authService.updateProfile.bind(authService),
    updatePreferences: authService.updatePreferences.bind(authService),
    isAuthenticated: !!user
  };
};
