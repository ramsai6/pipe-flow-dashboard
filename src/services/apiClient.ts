
import { API_CONFIG } from '../config/api';
import { tokenService } from './tokenService';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // Basic CSRF protection
    };

    if (includeAuth) {
      const token = tokenService.getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // Generic error handling - don't expose internal details
      let errorMessage = 'An error occurred';
      
      if (response.status === 401) {
        errorMessage = 'Authentication required';
        tokenService.clearTokens();
      } else if (response.status === 403) {
        errorMessage = 'Access denied';
      } else if (response.status === 404) {
        errorMessage = 'Resource not found';
      } else if (response.status >= 500) {
        errorMessage = 'Server error occurred';
      }
      
      throw new Error(errorMessage);
    }

    try {
      return await response.json();
    } catch {
      throw new Error('Invalid response format');
    }
  }

  async get<T>(endpoint: string, includeAuth = true): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(includeAuth),
      credentials: 'same-origin', // Include cookies for CSRF protection
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any, includeAuth = true): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(includeAuth),
      credentials: 'same-origin',
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any, includeAuth = true): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(includeAuth),
      credentials: 'same-origin',
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, includeAuth = true): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(includeAuth),
      credentials: 'same-origin',
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();
