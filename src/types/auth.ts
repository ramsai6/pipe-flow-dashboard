
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  success: boolean;
  timestamp: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface ProfileResponse {
  email: string;
  message: string;
  timestamp: string;
}

export interface ProfileUpdateRequest {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: string;
}

export interface ProfileUpdateResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  timestamp: string;
}

export interface UsersListResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface VerificationRequest {
  email: string;
  code: string;
  type: 'email' | 'phone';
}

export interface VerificationResponse {
  success: boolean;
  message: string;
}
