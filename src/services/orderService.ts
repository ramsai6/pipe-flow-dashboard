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
  shippingAddress: string;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
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

interface BackendOrder {
  orderId: number;
  status: string;
  shippingAddress: string;
  orderDate: string;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
  }>;
}

interface BackendOrderRequest {
  shippingAddress: string;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}

interface CreateOrderResponse {
  id: number;
  status: string;
  orderDate: string;
  shippingAddress: string;
  items: Array<{
    productId: number;
    name: string;
    quantity: number;
  }>;
}

const mapBackendOrder = (backendOrder: BackendOrder): Order => ({
  id: backendOrder.orderId.toString(),
  vendorEmail: 'current@user.com', // Default since backend doesn't return this
  vendorName: 'Current User',
  items: backendOrder.items.map(item => ({
    productId: item.productId.toString(),
    productName: item.productName,
    quantity: item.quantity,
    price: 25.99 // Default price since backend doesn't return this
  })),
  status: backendOrder.status.toLowerCase() as Order['status'],
  orderDate: backendOrder.orderDate.split('T')[0], // Convert to date string
  deliveryDate: '', // Not provided by backend
  address: backendOrder.shippingAddress
});

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

    try {
      const backendOrders = await apiClient.get<BackendOrder[]>(API_ENDPOINTS.ORDERS.LIST);
      const mappedOrders = backendOrders.map(mapBackendOrder);
      
      // Apply client-side filtering since backend doesn't support it yet
      let filteredData = mappedOrders;
      if (filters) {
        filteredData = filterOrders(mappedOrders, filters);
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
    } catch (error) {
      console.error('Failed to fetch orders from backend:', error);
      throw error;
    }
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

    // For now, get all orders and find the specific one
    // In a real implementation, you'd have a GET /api/orders/{id} endpoint
    const response = await this.getOrders();
    const order = response.data.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    return order;
  },

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    if (API_CONFIG.IS_MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock order
      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        vendorEmail: 'current@user.com',
        vendorName: 'Current User',
        items: orderData.items.map(item => ({
          productId: item.productId.toString(),
          productName: `Product ${item.productId}`,
          quantity: item.quantity,
          price: 25.99
        })),
        status: 'pending',
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: '',
        address: orderData.shippingAddress
      };
      
      return newOrder;
    }

    const backendRequest: BackendOrderRequest = {
      shippingAddress: orderData.shippingAddress,
      items: orderData.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    const backendOrder = await apiClient.post<CreateOrderResponse>(API_ENDPOINTS.ORDERS.CREATE, backendRequest);
    return mapBackendOrder(backendOrder);
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    // Validate ID
    if (!id || typeof id !== 'string' || id.length > 50) {
      throw new Error('Invalid order ID');
    }

    if (API_CONFIG.IS_MOCK_ENABLED) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      const order = mockOrders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      return { ...order, ...updates };
    }

    // Backend doesn't support order updates yet, so we'll return the current order
    return this.getOrder(id);
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
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
    // For guest orders, we'll use the same create order endpoint for now
    // In a real implementation, you might have a separate guest order endpoint
    const orderRequest: CreateOrderRequest = {
      shippingAddress: `${orderData.name}\n${orderData.address}\nPhone: ${orderData.phone}\nEmail: ${orderData.email}`,
      items: orderData.items.map(item => ({
        productId: parseInt(item.productId),
        quantity: item.quantity
      }))
    };

    if (API_CONFIG.IS_MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { 
        success: true, 
        orderId: `GUEST-ORD-${Date.now()}` 
      };
    }

    try {
      const order = await this.createOrder(orderRequest);
      return { 
        success: true, 
        orderId: order.id 
      };
    } catch (error) {
      console.error('Failed to create guest order:', error);
      throw error;
    }
  }
};
