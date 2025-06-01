
import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import OrderManagement from './OrderManagement';
import ProductManagement from './ProductManagement';
import PlaceOrder from './PlaceOrder';
import GuestOrder from './GuestOrder';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('orders');
  const { user } = useAuth();

  const renderContent = () => {
    if (user?.role === 'guest') {
      return <GuestOrder />;
    }

    switch (activeView) {
      case 'orders':
        return <OrderManagement />;
      case 'place-order':
        return <PlaceOrder />;
      case 'products':
        return user?.role === 'admin' ? <ProductManagement /> : <PlaceOrder />;
      default:
        return <OrderManagement />;
    }
  };

  if (user?.role === 'guest') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">PVC Manufacturing - Guest Order</h1>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 bg-gray-50">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
