
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  IS_MOCK_ENABLED: import.meta.env.VITE_IS_MOCK_ENABLED === 'true' || false,
};

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile',
  },
  // Product endpoints
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    DETAIL: (id: string) => `/products/${id}`,
  },
  // Order endpoints
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DELETE: (id: string) => `/orders/${id}`,
  },
};
