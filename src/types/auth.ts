
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  phone?: string; // Add phone field
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  role: string;
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
