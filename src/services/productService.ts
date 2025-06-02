
import { apiClient } from './apiClient';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

export interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
}

// Mock products data
const mockProducts: Product[] = [
  { id: '1', name: 'PVC Pipe 4 inch - Schedule 40', category: 'Pipes' },
  { id: '2', name: 'PVC Pipe 6 inch - Schedule 40', category: 'Pipes' },
  { id: '3', name: 'PVC Pipe 8 inch - Schedule 40', category: 'Pipes' },
  { id: '4', name: 'PVC Fitting - 90° Elbow 4 inch', category: 'Fittings' },
  { id: '5', name: 'PVC Fitting - T-Joint 6 inch', category: 'Fittings' },
  { id: '6', name: 'PVC Coupling 4 inch', category: 'Fittings' },
];

export const productService = {
  async getProducts(): Promise<Product[]> {
    if (API_CONFIG.IS_MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockProducts;
    }

    return apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.LIST);
  },

  async getProduct(id: string): Promise<Product> {
    if (API_CONFIG.IS_MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const product = mockProducts.find(p => p.id === id);
      if (!product) throw new Error('Product not found');
      return product;
    }

    return apiClient.get<Product>(API_ENDPOINTS.PRODUCTS.DETAIL(id));
  }
};
