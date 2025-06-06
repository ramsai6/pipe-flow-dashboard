
import { apiClient } from './apiClient';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

export interface Product {
  id: string;
  name: string;
  active?: boolean;
  description?: string;
  category?: string;
  price?: number;
  stockQuantity?: number;
}

interface BackendProduct {
  id: number;
  name: string;
  active: boolean;
}

// Mock products data (fallback)
const mockProducts: Product[] = [
  { id: '1', name: 'PVC Pipe 4 inch - Schedule 40', category: 'Pipes', price: 25.99, stockQuantity: 100, active: true },
  { id: '2', name: 'PVC Pipe 6 inch - Schedule 40', category: 'Pipes', price: 35.99, stockQuantity: 50, active: true },
  { id: '3', name: 'PVC Pipe 8 inch - Schedule 40', category: 'Pipes', price: 45.99, stockQuantity: 25, active: true },
  { id: '4', name: 'PVC Fitting - 90° Elbow 4 inch', category: 'Fittings', price: 12.99, stockQuantity: 200, active: true },
  { id: '5', name: 'PVC Fitting - T-Joint 6 inch', category: 'Fittings', price: 18.99, stockQuantity: 150, active: true },
  { id: '6', name: 'PVC Coupling 4 inch', category: 'Fittings', price: 8.99, stockQuantity: 300, active: true },
];

const mapBackendProduct = (backendProduct: BackendProduct): Product => ({
  id: backendProduct.id.toString(),
  name: backendProduct.name,
  active: backendProduct.active,
  // Set default values for fields not provided by API
  category: 'General',
  price: 0,
  stockQuantity: 0,
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

  async createProduct(productData: { name: string }): Promise<Product> {
    if (API_CONFIG.IS_MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newProduct: Product = {
        id: Date.now().toString(),
        name: productData.name,
        active: true,
      };
      return newProduct;
    }

    const backendProduct = await apiClient.post<BackendProduct>(API_ENDPOINTS.PRODUCTS.CREATE, {
      name: productData.name,
    });
    
    return mapBackendProduct(backendProduct);
  },

  async updateProduct(id: string, productData: { name: string }): Promise<void> {
    if (API_CONFIG.IS_MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    await apiClient.put(API_ENDPOINTS.PRODUCTS.UPDATE(id), productData);
  },

  async deleteProduct(id: string): Promise<void> {
    if (API_CONFIG.IS_MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  },

  async uploadProducts(file: File): Promise<void> {
    if (API_CONFIG.IS_MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // Use fetch directly for file upload
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.PRODUCTS.UPLOAD}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload products');
    }
  }
};
