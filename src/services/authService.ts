
import { apiClient } from './apiClient';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import { User } from '../contexts/AuthContext';
import { tokenService } from './tokenService';
import { validateAndSanitize, loginSchema, signupSchema, sanitizeEmail } from './validationService';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  timestamp?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface ProfileResponse {
  id: number;
  username: string;
  email: string;
}

// Role mapping from backend to frontend
const mapRole = (backendRole?: string): 'vendor' | 'admin' | 'guest' => {
  if (!backendRole) return 'vendor';
  switch (backendRole.toUpperCase()) {
    case 'ADMIN':
      return 'admin';
    case 'USER':
      return 'vendor';
    case 'GUEST':
      return 'guest';
    default:
      return 'vendor';
  }
};

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const checkRateLimit = (email: string): boolean => {
  const now = Date.now();
  const attempts = loginAttempts.get(email);
  
  if (!attempts) {
    return true;
  }
  
  // Reset if lockout period has passed
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(email);
    return true;
  }
  
  return attempts.count < MAX_LOGIN_ATTEMPTS;
};

const recordLoginAttempt = (email: string, success: boolean): void => {
  const now = Date.now();
  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: now };
  
  if (success) {
    // Clear attempts on successful login
    loginAttempts.delete(email);
  } else {
    // Increment failed attempts
    attempts.count += 1;
    attempts.lastAttempt = now;
    loginAttempts.set(email, attempts);
  }
};

export const authService = {
  async login(credentials: LoginRequest): Promise<User> {
    // Validate and sanitize input
    const validatedData = validateAndSanitize(loginSchema, {
      email: sanitizeEmail(credentials.email),
      password: credentials.password,
    });
    
    // Check rate limiting
    if (!checkRateLimit(validatedData.email)) {
      recordLoginAttempt(validatedData.email, false);
      throw new Error('Too many login attempts. Please try again in 15 minutes.');
    }

    if (API_CONFIG.IS_MOCK_ENABLED) {
      // Mock implementation with secure demo credentials
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Only allow demo credentials in development/demo mode
      const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
      
      if (isDemoMode && validatedData.email === 'admin@pvc.com' && validatedData.password === 'AdminDemo123!') {
        const user: User = {
          id: '1',
          email: 'admin@pvc.com',
          name: 'System Administrator',
          role: 'admin'
        };
        const token = tokenService.generateSecureGuestToken().replace('guest_', 'admin_');
        tokenService.setTokens(token);
        recordLoginAttempt(validatedData.email, true);
        return user;
      } else if (validatedData.email && validatedData.password.length >= 8) {
        const user: User = {
          id: '2',
          email: validatedData.email,
          name: 'Vendor User',
          role: 'vendor',
          company: 'ABC Construction',
          phone: '+1234567890'
        };
        const token = tokenService.generateSecureGuestToken().replace('guest_', 'vendor_');
        tokenService.setTokens(token);
        recordLoginAttempt(validatedData.email, true);
        return user;
      }
      
      recordLoginAttempt(validatedData.email, false);
      throw new Error('Invalid credentials');
    }

    try {
      const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, validatedData, false);
      
      // Check if login was successful
      if (!response.success) {
        recordLoginAttempt(validatedData.email, false);
        throw new Error('Invalid credentials');
      }
      
      // Extract token from response
      const token = response.token;
      tokenService.setTokens(token);
      
      // Get user profile after successful login
      const profileResponse = await apiClient.get<ProfileResponse>(API_ENDPOINTS.AUTH.PROFILE);
      
      recordLoginAttempt(validatedData.email, true);
      
      return {
        id: profileResponse.id.toString(),
        email: profileResponse.email,
        name: profileResponse.username,
        role: 'vendor', // Default role for now
      };
    } catch (error) {
      recordLoginAttempt(validatedData.email, false);
      throw error;
    }
  },

  async signup(userData: SignupRequest): Promise<User> {
    // Validate and sanitize input
    const validatedData = validateAndSanitize(signupSchema, {
      username: userData.username,
      email: sanitizeEmail(userData.email),
      password: userData.password,
    });

    if (API_CONFIG.IS_MOCK_ENABLED) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        id: Math.random().toString(36),
        email: validatedData.email,
        name: validatedData.username,
        role: 'vendor',
      };
      const token = tokenService.generateSecureGuestToken().replace('guest_', 'vendor_');
      tokenService.setTokens(token);
      return user;
    }

    try {
      // Register user
      const registerResponse = await apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, {
        username: validatedData.username,
        email: validatedData.email,
        password: validatedData.password,
      }, false);
      
      // Check if registration was successful
      if (!registerResponse.success) {
        throw new Error(registerResponse.message || 'Registration failed');
      }
      
      // Login after successful registration
      return this.login({ email: validatedData.email, password: validatedData.password });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    if (API_CONFIG.IS_MOCK_ENABLED) {
      const token = tokenService.getAccessToken();
      if (!token) throw new Error('No token found');
      
      // Check if token is expired (for mock tokens, just check format)
      if (token.startsWith('guest_') && token.length < 20) {
        throw new Error('Invalid token format');
      }
      
      // Return mock user based on token prefix
      if (token.startsWith('admin_')) {
        return {
          id: '1',
          email: 'admin@pvc.com',
          name: 'System Administrator',
          role: 'admin'
        };
      }
      
      if (token.startsWith('guest_')) {
        return {
          id: '3',
          email: 'guest@example.com',
          name: 'Guest User',
          role: 'guest'
        };
      }
      
      return {
        id: '2',
        email: 'vendor@example.com',
        name: 'Vendor User',
        role: 'vendor',
      };
    }

    const response = await apiClient.get<ProfileResponse>(API_ENDPOINTS.AUTH.PROFILE);
    
    return {
      id: response.id.toString(),
      email: response.email,
      name: response.username,
      role: 'vendor', // Default role for now
    };
  },

  async logout(): Promise<void> {
    tokenService.clearTokens();
  },

  loginAsGuest(): User {
    const user: User = {
      id: '3',
      email: 'guest@example.com',
      name: 'Guest User',
      role: 'guest'
    };
    
    // Generate secure guest token
    const guestToken = tokenService.generateSecureGuestToken();
    tokenService.setTokens(guestToken);
    
    return user;
  }
};
