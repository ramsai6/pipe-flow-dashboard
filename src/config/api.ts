
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://your-backend-domain.com/api',
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
  // Order endpoints
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE: (id: string) => `/orders/${id}`,
    DELETE: (id: string) => `/orders/${id}`,
  },
  // Guest orders
  GUEST: {
    ORDERS: '/guest/orders',
  },
  // Products
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
  },
  // Sensors and measurements
  SENSORS: {
    LIST: '/sensors',
  },
  MEASUREMENTS: {
    LIST: '/measurements',
    CREATE: '/measurements',
  },
  // Alerts
  ALERTS: {
    LIST: '/alerts',
    CREATE: '/alerts',
    RESOLVE: (id: string) => `/alerts/${id}/resolve`,
  },
};
