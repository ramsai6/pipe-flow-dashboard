
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getStatusColor } from '../utils/orderUtils';
import { orderService, OrderListResponse } from '../services/orderService';
import { Order, OrderFilters } from '../types/order';

const OrderManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<OrderFilters>({
    vendor: '',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });

  const loadOrders = async (page = 1) => {
    try {
      setLoading(true);
      console.log('Loading orders with filters:', filters);
      const response: OrderListResponse = await orderService.getOrders(page, 10, filters);
      console.log('Orders response:', response);
      setOrders(response.data);
      setTotalOrders(response.pagination.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(1);
  }, []);

  // Filter orders based on user role
  const displayOrders = user?.role === 'admin' 
    ? orders 
    : orders.filter(order => order.vendorEmail === user?.email);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
        )
      );

      toast({
        title: "Status Updated",
        description: `Order ${orderId} status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const applyFilters = () => {
    loadOrders(1);
  };

  const clearFilters = () => {
    setFilters({
      vendor: '',
      status: 'all',
      dateFrom: '',
      dateTo: ''
    });
    // Reload without filters
    setTimeout(() => loadOrders(1), 100);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {user?.role === 'admin' ? 'All Orders' : 'My Orders'}
        </h1>
        <div className="text-sm text-gray-500">
          Total: {totalOrders} orders
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <SelectItem value="placed">Placed</SelectItem>
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
          
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button onClick={applyFilters} disabled={loading}>
              {loading ? 'Applying...' : 'Apply Filters'}
            </Button>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List - Mobile Friendly Cards */}
      <div className="space-y-4">
        {displayOrders.map((order) => (
          <Card key={order.id} className="w-full">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600">{order.orderDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {user?.role === 'admin' ? (
                      <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="placed">Placed</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Vendor Info - Only for Admin */}
                {user?.role === 'admin' && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Vendor</h4>
                    <div className="text-sm">
                      <div className="font-medium">{order.vendorName}</div>
                      <div className="text-gray-500">{order.vendorEmail}</div>
                    </div>
                  </div>
                )}

                {/* Products */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Products</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                        <div>
                          <div className="font-medium text-sm">{item.productName}</div>
                          <div className="text-xs text-gray-500">ID: {item.productId}</div>
                        </div>
                        <div className="text-sm font-medium">Qty: {item.quantity}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Shipping Address</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{order.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {displayOrders.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No orders found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderManagement;
