
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';
import { productService, Product } from '../services/productService';
import { orderService } from '../services/orderService';

interface OrderItem {
  productId: string;
  quantity: string;
}

const PlaceOrder = () => {
  const { user } = useAuth();
  const [orderData, setOrderData] = useState({
    address: '',
    deliveryDate: '',
    notes: '',
    vendorEmail: '' // For admin placing orders on behalf of vendors
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
        items: validItems.map(item => ({
          productId: parseInt(item.productId), // Convert string to number for API
          quantity: parseInt(item.quantity)
        })),
        shippingAddress: orderData.address,
      };

      await orderService.createOrder(orderRequest);
      
      toast({
        title: "Order placed successfully!",
        description: "You will receive a confirmation email shortly.",
      });
      
      // Reset form
      setOrderData({
        address: '',
        deliveryDate: '',
        notes: '',
        vendorEmail: ''
      });
      setOrderItems([{ productId: '', quantity: '' }]);
    } catch (error) {
      console.error('Order creation failed:', error);
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
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Products</Label>
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
