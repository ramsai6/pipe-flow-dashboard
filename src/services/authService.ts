
import { apiClient } from './apiClient';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import { User } from '../contexts/AuthContext';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

// Role mapping from backend to frontend
const mapRole = (backendRole: string): 'vendor' | 'admin' | 'guest' => {
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

export const authService = {
  async login(credentials: LoginRequest): Promise<User> {
    if (API_CONFIG.IS_MOCK_ENABLED) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (credentials.email === 'admin@pvc.com' && credentials.password === 'admin123') {
        const user: User = {
          id: '1',
          email: 'admin@pvc.com',
          name: 'System Administrator',
          role: 'admin'
        };
        localStorage.setItem('authToken', 'mock-admin-token');
        return user;
      } else if (credentials.email && credentials.password) {
        const user: User = {
          id: '2',
          email: credentials.email,
          name: 'Vendor User',
          role: 'vendor',
          company: 'ABC Construction',
          phone: '+1234567890'
        };
        localStorage.setItem('authToken', 'mock-vendor-token');
        return user;
      }
      throw new Error('Invalid credentials');
    }

    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNIN, credentials, false);
    localStorage.setItem('authToken', response.token);
    
    return {
      id: response.user.id,
      email: response.user.email,
      name: response.user.username,
      role: mapRole(response.user.role),
    };
  },

  async signup(userData: SignupRequest): Promise<User> {
    if (API_CONFIG.IS_MOCK_ENABLED) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        id: Math.random().toString(36),
        email: userData.email,
        name: userData.username,
        role: 'vendor',
      };
      localStorage.setItem('authToken', 'mock-new-user-token');
      return user;
    }

    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNUP, userData, false);
    localStorage.setItem('authToken', response.token);
    
    return {
      id: response.user.id,
      email: response.user.email,
      name: response.user.username,
      role: mapRole(response.user.role),
    };
  },

  async getCurrentUser(): Promise<User> {
    if (API_CONFIG.IS_MOCK_ENABLED) {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No token found');
      
      // Return mock user based on token
      if (token === 'mock-admin-token') {
        return {
          id: '1',
          email: 'admin@pvc.com',
          name: 'System Administrator',
          role: 'admin'
        };
      }
      return {
        id: '2',
        email: 'vendor@example.com',
        name: 'Vendor User',
        role: 'vendor',
      };
    }

    const response = await apiClient.get<{ id: string; username: string; email: string; role: string }>(API_ENDPOINTS.AUTH.ME);
    
    return {
      id: response.id,
      email: response.email,
      name: response.username,
      role: mapRole(response.role),
    };
  },

  async logout(): Promise<void> {
    if (API_CONFIG.IS_MOCK_ENABLED) {
      localStorage.removeItem('authToken');
      return;
    }

    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    localStorage.removeItem('authToken');
  },

  loginAsGuest(): User {
    const user: User = {
      id: '3',
      email: 'guest@example.com',
      name: 'Guest User',
      role: 'guest'
    };
    localStorage.setItem('authToken', 'guest-token');
    return user;
  }
};
