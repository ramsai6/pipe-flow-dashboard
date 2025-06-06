
export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  vendorEmail: string;
  vendorName: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'placed' | 'cancelled';
  orderDate: string;
  deliveryDate: string;
  address: string;
}

export interface OrderFilters {
  vendor: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}
