import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import {
  ChartBarIcon,
  CubeIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const navigation = [
    { name: 'Overview', href: '/admin', icon: ChartBarIcon, id: 'overview' },
    { name: 'Products', href: '/admin/products', icon: CubeIcon, id: 'products' },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBagIcon, id: 'orders' },
    { name: 'Services', href: '/admin/services', icon: WrenchIcon, id: 'services' },
    { name: 'Customers', href: '/admin/customers', icon: UserGroupIcon, id: 'customers' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 bg-primary">
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === item.id
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 