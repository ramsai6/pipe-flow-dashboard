import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { productService, Product } from '../services/productService';
import { orderService } from '../services/orderService';

interface OrderItem {
  productId: string;
  quantity: string;
}

const products = [
  { id: '1', name: 'PVC Pipe 4 inch - Schedule 40' },
  { id: '2', name: 'PVC Pipe 6 inch - Schedule 40' },
  { id: '3', name: 'PVC Pipe 8 inch - Schedule 40' },
  { id: '4', name: 'PVC Fitting - 90° Elbow 4 inch' },
  { id: '5', name: 'PVC Fitting - T-Joint 6 inch' },
  { id: '6', name: 'PVC Coupling 4 inch' },
];

const GuestOrder = () => {
  const [orderData, setOrderData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([{ productId: '', quantity: '' }]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productList = await productService.getProducts();
        setProducts(productList);
      } catch (error) {
        console.error('Failed to load products:', error);
        toast({
          title: "Error",
          description: "Failed to load products. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    loadProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validItems = orderItems.filter(item => item.productId && item.quantity);
      
      if (validItems.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one product to your order.",
          variant: "destructive",
        });
        return;
      }

      const orderRequest = {
        name: orderData.name,
        email: orderData.email,
        phone: orderData.phone,
        address: orderData.address,
        items: validItems.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity)
        }))
      };

      const result = await orderService.createGuestOrder(orderRequest);
      
      if (result.success) {
        toast({
          title: "Order submitted successfully!",
          description: `Thank you ${orderData.name}! Order ID: ${result.orderId}. We'll contact you within 24 hours.`,
        });
        
        // Reset form
        setOrderData({
          name: '',
          email: '',
          phone: '',
          address: ''
        });
        setOrderItems([{ productId: '', quantity: '' }]);
      }
    } catch (error) {
      console.error('Order submission failed:', error);
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

  const addProduct = () => {
    setOrderItems([...orderItems, { productId: '', quantity: '' }]);
  };

  const removeProduct = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const updateOrderItem = (index: number, field: keyof OrderItem, value: string) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setOrderItems(updatedItems);
  };

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
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Products *</Label>
                <Button type="button" onClick={addProduct} variant="outline" size="sm">
                  Add Product
                </Button>
              </div>
              
              {orderItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Product {index + 1}</h4>
                    {orderItems.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeProduct(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Product</Label>
                      <Select 
                        value={item.productId} 
                        onValueChange={(value) => updateOrderItem(index, 'productId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
                        placeholder="Enter quantity"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
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
