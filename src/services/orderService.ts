
import { apiClient } from './apiClient';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import { Order, OrderFilters } from '../types/order';
import { mockOrders } from '../data/mockOrders';
import { filterOrders } from '../utils/orderUtils';

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

interface BackendOrderResponse {
  orderId: number;
  status: string;
  shippingAddress: string;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
  createdAt: string;
}

interface CreateOrderResponse {
  orderId: number;
  status: string;
}

const mapBackendOrder = (backendOrder: BackendOrderResponse): Order => ({
  id: backendOrder.orderId.toString(),
  vendorEmail: 'current@user.com',
  vendorName: 'Current User',
  items: backendOrder.items.map(item => ({
    productId: item.productId.toString(),
    productName: `Product ${item.productId}`,
    quantity: item.quantity,
    price: 25.99
  })),
  status: backendOrder.status.toLowerCase() as Order['status'],
  orderDate: backendOrder.createdAt.split('T')[0],
  deliveryDate: '',
  address: backendOrder.shippingAddress
});

export const orderService = {
  async getOrders(page = 1, size = 10, filters?: OrderFilters): Promise<OrderListResponse> {
    if (page < 1 || size < 1 || size > 100) {
      throw new Error('Invalid pagination parameters');
    }

    if (API_CONFIG.IS_MOCK_ENABLED) {
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
      const backendOrders = await apiClient.get<BackendOrderResponse[]>(API_ENDPOINTS.ORDERS.LIST);
      const mappedOrders = backendOrders.map(mapBackendOrder);
      
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
    if (!id || typeof id !== 'string' || id.length > 50) {
      throw new Error('Invalid order ID');
    }

    if (API_CONFIG.IS_MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const order = mockOrders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      return order;
    }

    const backendOrder = await apiClient.get<BackendOrderResponse>(API_ENDPOINTS.ORDERS.DETAIL(id));
    return mapBackendOrder(backendOrder);
  },

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    if (API_CONFIG.IS_MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

    const response = await apiClient.post<CreateOrderResponse>(API_ENDPOINTS.ORDERS.CREATE, orderData);
    
    // Create a mock order with the response data
    const newOrder: Order = {
      id: response.orderId.toString(),
      vendorEmail: 'current@user.com',
      vendorName: 'Current User',
      items: orderData.items.map(item => ({
        productId: item.productId.toString(),
        productName: `Product ${item.productId}`,
        quantity: item.quantity,
        price: 25.99
      })),
      status: response.status.toLowerCase() as Order['status'],
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      address: orderData.shippingAddress
    };
    
    return newOrder;
  },

  async updateOrder(id: string, updates: Partial<CreateOrderRequest>): Promise<Order> {
    if (!id || typeof id !== 'string' || id.length > 50) {
      throw new Error('Invalid order ID');
    }

    if (API_CONFIG.IS_MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const order = mockOrders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      return { ...order };
    }

    await apiClient.put(API_ENDPOINTS.ORDERS.UPDATE(id), updates);
    return this.getOrder(id);
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    if (!id || typeof id !== 'string' || id.length > 50) {
      throw new Error('Invalid order ID');
    }

    if (API_CONFIG.IS_MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const order = mockOrders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      return { ...order, status: status as Order['status'] };
    }

    await apiClient.put(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), { status });
    return this.getOrder(id);
  },

  async cancelOrder(id: string): Promise<void> {
    if (!id || typeof id !== 'string' || id.length > 50) {
      throw new Error('Invalid order ID');
    }

    if (API_CONFIG.IS_MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    await apiClient.delete(API_ENDPOINTS.ORDERS.CANCEL(id));
  },

  async createGuestOrder(orderData: GuestOrderRequest): Promise<{ success: boolean; orderId?: string }> {
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
