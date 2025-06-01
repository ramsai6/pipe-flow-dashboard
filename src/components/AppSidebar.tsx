
import { User, Package, ShoppingCart, Upload, LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuth } from '../contexts/AuthContext';

interface AppSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export function AppSidebar({ activeView, setActiveView }: AppSidebarProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      title: 'Order Management',
      icon: Package,
      id: 'orders',
      roles: ['vendor', 'admin']
    },
    {
      title: 'Place Order',
      icon: ShoppingCart,
      id: 'place-order',
      roles: ['vendor', 'admin']
    },
    ...(user?.role === 'admin' ? [{
      title: 'Product Management',
      icon: Upload,
      id: 'products',
      roles: ['admin'] as const
    }] : [])
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">PVC Manufacturing</h2>
            <p className="text-sm text-gray-500 capitalize">{user?.role} Portal</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveView(item.id)}
                    isActive={activeView === item.id}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-2">
            <User className="w-5 h-5 text-gray-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
