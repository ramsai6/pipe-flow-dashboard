
import { Order } from '../types/order';

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    vendorEmail: 'vendor1@example.com',
    vendorName: 'ABC Construction',
    items: [
      {
        productId: '1',
        productName: 'PVC Pipe 4 inch - Schedule 40',
        price: 25.50,
        quantity: 50
      }
    ],
    status: 'pending',
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-25',
    address: '123 Construction Ave, City, State 12345'
  },
  {
    id: 'ORD-002',
    vendorEmail: 'vendor2@example.com',
    vendorName: 'XYZ Builders',
    items: [
      {
        productId: '2',
        productName: 'PVC Pipe 6 inch - Schedule 40',
        price: 42.75,
        quantity: 25
      }
    ],
    status: 'confirmed',
    orderDate: '2024-01-14',
    deliveryDate: '2024-01-24',
    address: '456 Builder St, City, State 12345'
  },
  {
    id: 'ORD-003',
    vendorEmail: 'guest@example.com',
    vendorName: 'John Smith (Guest)',
    items: [
      {
        productId: '4',
        productName: 'PVC Fitting - 90° Elbow 4 inch',
        price: 8.95,
        quantity: 10
      }
    ],
    status: 'shipped',
    orderDate: '2024-01-13',
    deliveryDate: '2024-01-23',
    address: '789 Guest Lane, City, State 12345'
  },
  {
    id: 'ORD-004',
    vendorEmail: 'vendor1@example.com',
    vendorName: 'ABC Construction',
    items: [
      {
        productId: '6',
        productName: 'PVC Coupling 4 inch',
        price: 6.25,
        quantity: 20
      },
      {
        productId: '1',
        productName: 'PVC Pipe 4 inch - Schedule 40',
        price: 25.50,
        quantity: 10
      }
    ],
    status: 'delivered',
    orderDate: '2024-01-12',
    deliveryDate: '2024-01-22',
    address: '123 Construction Ave, City, State 12345'
  }
];
