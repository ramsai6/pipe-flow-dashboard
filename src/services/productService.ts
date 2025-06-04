
import { apiClient } from './apiClient';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

export interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  stockQuantity?: number;
}

interface BackendProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
}

// Mock products data (fallback)
const mockProducts: Product[] = [
  { id: '1', name: 'PVC Pipe 4 inch - Schedule 40', category: 'Pipes', price: 25.99, stockQuantity: 100 },
  { id: '2', name: 'PVC Pipe 6 inch - Schedule 40', category: 'Pipes', price: 35.99, stockQuantity: 50 },
  { id: '3', name: 'PVC Pipe 8 inch - Schedule 40', category: 'Pipes', price: 45.99, stockQuantity: 25 },
  { id: '4', name: 'PVC Fitting - 90° Elbow 4 inch', category: 'Fittings', price: 12.99, stockQuantity: 200 },
  { id: '5', name: 'PVC Fitting - T-Joint 6 inch', category: 'Fittings', price: 18.99, stockQuantity: 150 },
  { id: '6', name: 'PVC Coupling 4 inch', category: 'Fittings', price: 8.99, stockQuantity: 300 },
];

const mapBackendProduct = (backendProduct: BackendProduct): Product => ({
  id: backendProduct.id.toString(),
  name: backendProduct.name,
  description: backendProduct.description,
  category: backendProduct.category,
  price: backendProduct.price,
  stockQuantity: backendProduct.stockQuantity,
});

export const productService = {
  async getProducts(): Promise<Product[]> {
    if (API_CONFIG.IS_MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockProducts;
    }

    try {
      const backendProducts = await apiClient.get<BackendProduct[]>(API_ENDPOINTS.PRODUCTS.LIST);
      return backendProducts.map(mapBackendProduct);
    } catch (error) {
      console.error('Failed to fetch products from backend, using mock data:', error);
      return mockProducts;
    }
  },

  async getProduct(id: string): Promise<Product> {
    if (API_CONFIG.IS_MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const product = mockProducts.find(p => p.id === id);
      if (!product) throw new Error('Product not found');
      return product;
    }

    try {
      const backendProduct = await apiClient.get<BackendProduct>(API_ENDPOINTS.PRODUCTS.DETAIL(id));
      return mapBackendProduct(backendProduct);
    } catch (error) {
      console.error('Failed to fetch product from backend:', error);
      throw new Error('Product not found');
    }
  },

  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    if (API_CONFIG.IS_MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newProduct: Product = {
        id: Date.now().toString(),
        ...productData,
      };
      return newProduct;
    }

    const backendProduct = await apiClient.post<BackendProduct>(API_ENDPOINTS.PRODUCTS.CREATE, {
      name: productData.name,
      description: productData.description || '',
      price: productData.price || 0,
      stockQuantity: productData.stockQuantity || 0,
      category: productData.category || '',
    });
    
    return mapBackendProduct(backendProduct);
  }
};
