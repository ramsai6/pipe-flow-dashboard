
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const products = [
  { id: '1', name: 'PVC Pipe 4 inch - Schedule 40', price: 25.50 },
  { id: '2', name: 'PVC Pipe 6 inch - Schedule 40', price: 42.75 },
  { id: '3', name: 'PVC Pipe 8 inch - Schedule 40', price: 68.20 },
  { id: '4', name: 'PVC Fitting - 90° Elbow 4 inch', price: 8.95 },
  { id: '5', name: 'PVC Fitting - T-Joint 6 inch', price: 15.40 },
  { id: '6', name: 'PVC Coupling 4 inch', price: 6.25 },
];

const GuestOrder = () => {
  const [orderData, setOrderData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    productId: '',
    quantity: ''
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
        title: "Order submitted successfully!",
        description: `Thank you ${orderData.name}! Your order total is $${total.toFixed(2)}. We'll contact you within 24 hours.`,
      });
      
      // Reset form
      setOrderData({
        name: '',
        email: '',
        phone: '',
        address: '',
        productId: '',
        quantity: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit order. Please try again.",
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
          <CardTitle className="text-2xl font-bold">Quick Order - No Registration Required</CardTitle>
          <p className="text-gray-600">Place your order as a guest. We'll contact you for confirmation and payment.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={orderData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={orderData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={orderData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address *</Label>
              <Textarea
                id="address"
                value={orderData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Enter complete delivery address"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product">Product *</Label>
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
              <Label htmlFor="quantity">Quantity *</Label>
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
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-lg font-semibold text-green-900">
                  Estimated Total: ${estimatedTotal.toFixed(2)}
                </p>
                <p className="text-sm text-green-700">Final pricing will be confirmed when we contact you</p>
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting Order...' : 'Submit Order'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestOrder;
