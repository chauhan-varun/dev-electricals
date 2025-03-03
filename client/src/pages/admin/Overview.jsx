import { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline';

const Overview = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    activeServices: 0,
    totalCustomers: 0,
  });

  useEffect(() => {
    // TODO: Fetch actual stats from API
    setStats({
      totalSales: 25000,
      totalOrders: 150,
      activeServices: 45,
      totalCustomers: 200,
    });
  }, []);

  const cards = [
    {
      title: 'Total Sales',
      value: `$${stats.totalSales.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBagIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Services',
      value: stats.activeServices,
      icon: WrenchIcon,
      color: 'bg-yellow-500',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className={`rounded-full p-3 ${card.color}`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {card.title}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        {/* Add recent activity list here */}
      </div>
    </div>
  );
};

export default Overview; 