
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const initialProducts = [
  { id: '1', name: 'PVC Pipe 4 inch - Schedule 40', price: 25.50, category: 'Pipes' },
  { id: '2', name: 'PVC Pipe 6 inch - Schedule 40', price: 42.75, category: 'Pipes' },
  { id: '3', name: 'PVC Pipe 8 inch - Schedule 40', price: 68.20, category: 'Pipes' },
  { id: '4', name: 'PVC Fitting - 90° Elbow 4 inch', price: 8.95, category: 'Fittings' },
  { id: '5', name: 'PVC Fitting - T-Joint 6 inch', price: 15.40, category: 'Fittings' },
  { id: '6', name: 'PVC Coupling 4 inch', price: 6.25, category: 'Fittings' },
];

const ProductManagement = () => {
  const [products, setProducts] = useState(initialProducts);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simulate Excel file processing
    const reader = new FileReader();
    reader.onload = (e) => {
      // In a real app, you would parse the Excel file here
      toast({
        title: "File uploaded successfully!",
        description: "Product list has been updated from Excel file.",
      });
      
      // Mock adding some products from "Excel"
      const mockNewProducts = [
        { id: Date.now().toString(), name: 'PVC Pipe 10 inch - Schedule 40', price: 95.50, category: 'Pipes' },
        { id: (Date.now() + 1).toString(), name: 'PVC Valve 6 inch', price: 78.90, category: 'Valves' },
      ];
      
      setProducts(prev => [...prev, ...mockNewProducts]);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    // Create CSV template
    const csvContent = "Name,Price,Category\nPVC Pipe Example,25.50,Pipes\nPVC Fitting Example,8.95,Fittings";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'product_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const product = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      category: newProduct.category
    };

    setProducts(prev => [...prev, product]);
    setNewProduct({ name: '', price: '', category: '' });
    setShowAddForm(false);
    
    toast({
      title: "Product added successfully!",
      description: `${product.name} has been added to the catalog.`,
    });
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct({ ...product });
  };

  const handleUpdateProduct = () => {
    setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
    setEditingProduct(null);
    
    toast({
      title: "Product updated successfully!",
      description: `${editingProduct.name} has been updated.`,
    });
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    
    toast({
      title: "Product deleted",
      description: "Product has been removed from the catalog.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Product List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              accept=".xlsx,.xls,.csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Excel/CSV File
            </Button>
            <span className="text-sm text-gray-500">
              Supported formats: .xlsx, .xls, .csv
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Add Product Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                />
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Enter price"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={newProduct.category}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Enter category"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddProduct}>Add Product</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {editingProduct?.id === product.id ? (
                        <Input
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                        />
                      ) : (
                        product.name
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {editingProduct?.id === product.id ? (
                        <Input
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct(prev => ({ ...prev, category: e.target.value }))}
                        />
                      ) : (
                        product.category
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {editingProduct?.id === product.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                        />
                      ) : (
                        `$${product.price.toFixed(2)}`
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex gap-2">
                        {editingProduct?.id === product.id ? (
                          <>
                            <Button size="sm" onClick={handleUpdateProduct}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManagement;
