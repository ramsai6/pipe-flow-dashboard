
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../contexts/AuthContext';

// Mock data
const mockOrders = [
  {
    id: 'ORD-001',
    vendorEmail: 'vendor1@example.com',
    vendorName: 'ABC Construction',
    product: 'PVC Pipe 4 inch - Schedule 40',
    quantity: 50,
    total: 1275.00,
    status: 'pending',
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-25',
    address: '123 Construction Ave, City, State 12345'
  },
  {
    id: 'ORD-002',
    vendorEmail: 'vendor2@example.com',
    vendorName: 'XYZ Builders',
    product: 'PVC Pipe 6 inch - Schedule 40',
    quantity: 25,
    total: 1068.75,
    status: 'confirmed',
    orderDate: '2024-01-14',
    deliveryDate: '2024-01-24',
    address: '456 Builder St, City, State 12345'
  },
  {
    id: 'ORD-003',
    vendorEmail: 'guest@example.com',
    vendorName: 'John Smith (Guest)',
    product: 'PVC Fitting - 90° Elbow 4 inch',
    quantity: 10,
    total: 89.50,
    status: 'shipped',
    orderDate: '2024-01-13',
    deliveryDate: '2024-01-23',
    address: '789 Guest Lane, City, State 12345'
  },
  {
    id: 'ORD-004',
    vendorEmail: 'vendor1@example.com',
    vendorName: 'ABC Construction',
    product: 'PVC Coupling 4 inch',
    quantity: 20,
    total: 125.00,
    status: 'delivered',
    orderDate: '2024-01-12',
    deliveryDate: '2024-01-22',
    address: '123 Construction Ave, City, State 12345'
  }
];

const OrderManagement = () => {
  const { user } = useAuth();
  const [orders] = useState(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState(mockOrders);
  const [filters, setFilters] = useState({
    vendor: '',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // Filter orders based on user role
  const displayOrders = user?.role === 'admin' 
    ? filteredOrders 
    : filteredOrders.filter(order => order.vendorEmail === user?.email);

  const applyFilters = () => {
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

    setFilteredOrders(filtered);
  };

  const clearFilters = () => {
    setFilters({
      vendor: '',
      status: 'all',
      dateFrom: '',
      dateTo: ''
    });
    setFilteredOrders(orders);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.role === 'admin' ? 'All Orders' : 'My Orders'}
        </h1>
        <div className="text-sm text-gray-500">
          Total: {displayOrders.length} orders
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {user?.role === 'admin' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Vendor</label>
                <Input
                  placeholder="Search vendor..."
                  value={filters.vendor}
                  onChange={(e) => setFilters(prev => ({ ...prev, vendor: e.target.value }))}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={applyFilters}>Apply Filters</Button>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  {user?.role === 'admin' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    {user?.role === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{order.vendorName}</div>
                          <div className="text-gray-500">{order.vendorEmail}</div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.orderDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.deliveryDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {displayOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagement;
