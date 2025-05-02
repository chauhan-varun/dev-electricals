import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const statusIcons = {
  'Pending': ClockIcon,
  'Processing': ClockIcon,
  'Shipped': TruckIcon,
  'Delivered': CheckCircleIcon,
  'Cancelled': XCircleIcon,
};

const statusColors = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Processing': 'bg-blue-100 text-blue-800',
  'Shipped': 'bg-purple-100 text-purple-800',
  'Delivered': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Use direct axios call as a fallback if the regular method fails
      let data;
      try {
        data = await getOrders();
        console.log("Fetched orders via API service:", data);
      } catch (serviceError) {
        console.error("Error using API service:", serviceError);
        
        // Direct axios call as fallback
        const response = await axios.get(`${API_URL}/api/orders`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        data = response.data;
        console.log("Fetched orders via direct axios:", data);
      }
      
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showError('Failed to load orders. Please check server connection.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Directly use axios to update status as a fallback
      let updatedOrder;
      try {
        updatedOrder = await updateOrderStatus(orderId, newStatus);
      } catch (serviceError) {
        console.error("Error using API service for status update:", serviceError);
        
        const response = await axios.patch(
          `${API_URL}/api/orders/${orderId}`, 
          { status: newStatus },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        updatedOrder = response.data;
      }
      
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      showSuccess(`Order status updated to ${newStatus}`);
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Failed to update order status. Please try again.');
    }
  };

  const filteredOrders = statusFilter === 'all' || statusFilter === 'All'
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-gray-700">No orders found. Check if any orders have been placed or try refreshing the page.</p>
          <button
            onClick={fetchOrders}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Refresh Orders
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Left Side - Order List */}
          <div className="md:col-span-1 bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Orders</h2>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="All">All Orders</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <button
              onClick={fetchOrders}
              className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Refresh Orders
            </button>
            
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {filteredOrders.map((order) => {
                const StatusIcon = statusIcons[order.status] || ClockIcon;
                
                return (
                  <div
                    key={order._id}
                    className={`p-3 border rounded cursor-pointer ${
                      selectedOrder && selectedOrder._id === order._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium truncate">
                          <p className="font-medium text-blue-600 truncate">Order #{order._id.substring(order._id.length - 8)}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {order.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-900 font-medium">
                        {order.customer?.name || 'Customer'}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{order.total?.toFixed(2) || '0.00'} • {order.items?.length || 0} item(s)
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Order Details */}
          <div className="md:col-span-3 p-0">
            {selectedOrder ? (
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-medium text-gray-900">
                      Order #{selectedOrder._id.substring(selectedOrder._id.length - 8)}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Placed on {new Date(selectedOrder.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm text-gray-700">Status:</span>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                      <p className="mt-2 text-sm text-gray-900">{selectedOrder.customer?.name}</p>
                      <p className="text-sm text-gray-900">{selectedOrder.customer?.email}</p>
                      <p className="text-sm text-gray-900">{selectedOrder.customer?.phone}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Shipping Address</h4>
                      <p className="mt-2 text-sm text-gray-900">{selectedOrder.customer?.address}</p>
                      <p className="text-sm text-gray-900">
                        {selectedOrder.customer?.city}, {selectedOrder.customer?.state} {selectedOrder.customer?.pincode}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
                  <div className="mt-3">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Method:</span> {selectedOrder.paymentMethod}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
                  <div className="mt-3">
                    <ul className="divide-y divide-gray-200">
                      {selectedOrder.items?.map((item, index) => (
                        <li key={index} className="py-3 flex justify-between">
                          <div className="flex items-center">
                            {item.imageUrl && (
                              <img 
                                src={item.imageUrl} 
                                alt={item.title} 
                                className="h-16 w-16 object-contain rounded border border-gray-200 mr-4"
                              />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.title}</p>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-500">Subtotal</p>
                    <p className="text-gray-900">₹{selectedOrder.subtotal?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <p className="text-gray-500">Shipping</p>
                    <p className="text-gray-900">₹{selectedOrder.shipping?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <p className="text-gray-500">Tax</p>
                    <p className="text-gray-900">₹{selectedOrder.tax?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="flex justify-between mt-4 border-t border-gray-200 pt-4">
                    <p className="text-lg font-medium text-gray-900">Total</p>
                    <p className="text-lg font-medium text-blue-600">₹{selectedOrder.total?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-24">
                <div className="rounded-full p-6 bg-blue-50">
                  <ClockIcon className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Select an order</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Click on an order from the list to view its details
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
