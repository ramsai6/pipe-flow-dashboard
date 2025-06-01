
import { Order, OrderFilters } from '../types/order';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'confirmed': return 'bg-blue-100 text-blue-800';
    case 'shipped': return 'bg-purple-100 text-purple-800';
    case 'delivered': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const filterOrders = (orders: Order[], filters: OrderFilters): Order[] => {
  let filtered = orders;

  if (filters.vendor) {
    filtered = filtered.filter(order => 
      order.vendorName.toLowerCase().includes(filters.vendor.toLowerCase()) ||
      order.vendorEmail.toLowerCase().includes(filters.vendor.toLowerCase())
    );
  }

  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(order => order.status === filters.status);
  }

  if (filters.dateFrom) {
    filtered = filtered.filter(order => order.orderDate >= filters.dateFrom);
  }

  if (filters.dateTo) {
    filtered = filtered.filter(order => order.orderDate <= filters.dateTo);
  }

  return filtered;
};
