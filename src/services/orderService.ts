import { apiClient } from './apiClient';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import { Order, OrderFilters } from '../types/order';
import { mockOrders } from '../data/mockOrders';
import { filterOrders } from '../utils/orderUtils';
import { validateAndSanitize, orderSchema, guestOrderSchema } from './validationService';

export interface OrderListResponse {
  data: Order[];
  pagination: {
    page: number;
    size: number;
    total: number;
  };
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  address: string;
  deliveryDate: string;
  notes?: string;
  vendorEmail?: string; // For admin placing orders on behalf of vendors
}

export interface GuestOrderRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export const orderService = {
  async getOrders(page = 1, size = 10, filters?: OrderFilters): Promise<OrderListResponse> {
    // Validate pagination parameters
    if (page < 1 || size < 1 || size > 100) {
      throw new Error('Invalid pagination parameters');
    }

    if (API_CONFIG.IS_MOCK_ENABLED) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredData = mockOrders;
      if (filters) {
        filteredData = filterOrders(mockOrders, filters);
      }
      
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      return {
        data: paginatedData,
        pagination: {
          page,
          size,
          total: filteredData.length
        }
      };
    }

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters?.vendor) queryParams.append('vendor', filters.vendor);
    if (filters?.status && filters.status !== 'all') queryParams.append('status', filters.status);
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);

    return apiClient.get<OrderListResponse>(`${API_ENDPOINTS.ORDERS.LIST}?${queryParams.toString()}`);
  },

  async getOrder(id: string): Promise<Order> {
    // Validate ID format
    if (!id || typeof id !== 'string' || id.length > 50) {
      throw new Error('Invalid order ID');
    }

    if (API_CONFIG.IS_MOCK_ENABLED) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      const order = mockOrders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      return order;
    }

    return apiClient.get<Order>(API_ENDPOINTS.ORDERS.DETAIL(id));
  },

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    // Validate and sanitize order data
    const validatedData = validateAndSanitize(orderSchema, orderData);

    if (API_CONFIG.IS_MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock order
      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        vendorEmail: validatedData.vendorEmail || 'current@user.com',
        vendorName: 'Current User',
        items: validatedData.items.map(item => ({
          productId: item.productId,
          productName: `Product ${item.productId}`,
          quantity: item.quantity,
          price: 25.99
        })),
        status: 'pending',
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: validatedData.deliveryDate,
        address: validatedData.address
      };
      
      return newOrder;
    }

    return apiClient.post<Order>(API_ENDPOINTS.ORDERS.CREATE, validatedData);
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    // Validate ID
    if (!id || typeof id !== 'string' || id.length > 50) {
      throw new Error('Invalid order ID');
    }

    // Sanitize updates object
    const sanitizedUpdates = validateAndSanitize(
      orderSchema.partial(),
      updates
    );

    if (API_CONFIG.IS_MOCK_ENABLED) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      const order = mockOrders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      return { ...order, ...updates };
    }

    return apiClient.put<Order>(API_ENDPOINTS.ORDERS.UPDATE(id), sanitizedUpdates);
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid order status');
    }

    return this.updateOrder(id, { status: status as Order['status'] });
  },

  async deleteOrder(id: string): Promise<void> {
    // Validate ID
    if (!id || typeof id !== 'string' || id.length > 50) {
      throw new Error('Invalid order ID');
    }

    if (API_CONFIG.IS_MOCK_ENABLED) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    await apiClient.delete(API_ENDPOINTS.ORDERS.DELETE(id));
  },

  async createGuestOrder(orderData: GuestOrderRequest): Promise<{ success: boolean; orderId?: string }> {
    // Validate and sanitize guest order data
    const validatedData = validateAndSanitize(guestOrderSchema, orderData);

    if (API_CONFIG.IS_MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { 
        success: true, 
        orderId: `GUEST-ORD-${Date.now()}` 
      };
    }

    const response = await apiClient.post<{ success: boolean; orderId: string }>(
      API_ENDPOINTS.GUEST.ORDERS, 
      validatedData, 
      false // No auth required for guest orders
    );
    
    return response;
  }
};
