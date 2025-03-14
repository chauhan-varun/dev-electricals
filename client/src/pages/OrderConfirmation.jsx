import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const OrderConfirmation = () => {
  const location = useLocation();
  const order = location.state?.order;

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
      <div className="text-center">
        <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Order Confirmed!</h1>
        <p className="mt-2 text-lg text-gray-500">
          Thank you for your purchase. We'll send you an email with your order details.
        </p>
        
        {order && (
          <div className="mt-8 bg-white rounded-lg shadow p-6 max-w-2xl mx-auto text-left">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Order Details</h2>
            <p className="text-gray-700 mb-2"><span className="font-medium">Order ID:</span> {order._id}</p>
            <p className="text-gray-700 mb-2"><span className="font-medium">Date:</span> {new Date().toLocaleDateString()}</p>
            <p className="text-gray-700 mb-2"><span className="font-medium">Payment Method:</span> {order.paymentMethod}</p>
            <p className="text-gray-700 mb-4"><span className="font-medium">Status:</span> <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Pending</span></p>
            
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Items</h3>
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.title} className="w-12 h-12 object-contain rounded-md mr-3" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">₹{order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">₹{order.tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-medium text-gray-900">Total</span>
                  <span className="text-lg font-medium text-blue-600">₹{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8">
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 mr-4"
          >
            Back to Home
          </Link>
          <Link
            to="/products"
            className="inline-block bg-gray-100 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;