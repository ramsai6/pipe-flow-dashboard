
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

const products = [
  { id: '1', name: 'PVC Pipe 4 inch - Schedule 40', price: 25.50 },
  { id: '2', name: 'PVC Pipe 6 inch - Schedule 40', price: 42.75 },
  { id: '3', name: 'PVC Pipe 8 inch - Schedule 40', price: 68.20 },
  { id: '4', name: 'PVC Fitting - 90° Elbow 4 inch', price: 8.95 },
  { id: '5', name: 'PVC Fitting - T-Joint 6 inch', price: 15.40 },
  { id: '6', name: 'PVC Coupling 4 inch', price: 6.25 },
];

const PlaceOrder = () => {
  const { user } = useAuth();
  const [orderData, setOrderData] = useState({
    productId: '',
    quantity: '',
    address: '',
    deliveryDate: '',
    notes: '',
    vendorEmail: '' // For admin placing orders on behalf of vendors
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const selectedProduct = products.find(p => p.id === orderData.productId);
      const total = selectedProduct ? selectedProduct.price * parseInt(orderData.quantity) : 0;
      
      toast({
        title: "Order placed successfully!",
        description: `Order total: $${total.toFixed(2)}. You will receive a confirmation email shortly.`,
      });
      
      // Reset form
      setOrderData({
        productId: '',
        quantity: '',
        address: '',
        deliveryDate: '',
        notes: '',
        vendorEmail: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setOrderData(prev => ({ ...prev, [field]: value }));
  };

  const selectedProduct = products.find(p => p.id === orderData.productId);
  const estimatedTotal = selectedProduct && orderData.quantity 
    ? selectedProduct.price * parseInt(orderData.quantity) 
    : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {user?.role === 'admin' ? 'Place Order (On Behalf of Vendor)' : 'Place New Order'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {user?.role === 'admin' && (
              <div className="space-y-2">
                <Label htmlFor="vendorEmail">Vendor Email</Label>
                <Input
                  id="vendorEmail"
                  type="email"
                  value={orderData.vendorEmail}
                  onChange={(e) => handleChange('vendorEmail', e.target.value)}
                  placeholder="Enter vendor's email address"
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select value={orderData.productId} onValueChange={(value) => handleChange('productId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - ${product.price}/unit
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={orderData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                placeholder="Enter quantity"
                required
              />
            </div>
            
            {estimatedTotal > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-lg font-semibold text-blue-900">
                  Estimated Total: ${estimatedTotal.toFixed(2)}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address</Label>
              <Textarea
                id="address"
                value={orderData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Enter complete delivery address"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Preferred Delivery Date</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={orderData.deliveryDate}
                onChange={(e) => handleChange('deliveryDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={orderData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any special instructions or requirements"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Placing Order...' : 'Place Order'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceOrder;
