
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface SigninResponse {
  token: string;
  refreshToken: string;
  role: string;
}

export interface SignupResponse {
  message: string;
}

export interface UserProfileResponse {
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
