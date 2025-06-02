
class TokenService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  
  setTokens(accessToken: string, refreshToken?: string): void {
    // For now using localStorage with additional security measures
    // In production, should use httpOnly cookies
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  generateSecureGuestToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return 'guest_' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

export const tokenService = new TokenService();
