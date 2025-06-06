
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://pv-pipe-repo.onrender.com/api',
  IS_MOCK_ENABLED: import.meta.env.VITE_IS_MOCK_ENABLED === 'true' || false,
};

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SIGNUP: '/auth/signup',
    SIGNIN: '/auth/signin',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  // Product endpoints
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    UPLOAD: '/products/upload',
  },
  // Order endpoints
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    UPDATE: (id: string) => `/orders/${id}`,
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    RESEND: (id: string) => `/orders/${id}/resend`,
  },
  // Monitoring endpoints
  SENSORS: {
    LIST: '/sensors',
  },
  MEASUREMENTS: {
    LIST: '/measurements',
    CREATE: '/measurements',
  },
  ALERTS: {
    LIST: '/alerts',
  },
  // Email endpoint
  EMAIL: {
    SEND: '/email/send',
  },
};
