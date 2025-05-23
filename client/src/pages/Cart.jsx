import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import { useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import Loader from '../components/UI/Loader';
import { isCloudinaryUrl, optimizeCloudinaryUrl, getPlaceholderImage } from '../utils/cloudinary';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useContext(CartContext);
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const { showSuccess, showError } = useNotification();
  
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      showError('Please sign in to view your cart', 3000);
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  const handleQuantityChange = (id, quantity) => {
    if (quantity < 1) return;
    updateQuantity(id, quantity);
  };

  const handleRemoveItem = (id) => {
    removeFromCart(id);
    showSuccess('Item removed from cart');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="mt-4 text-gray-500">Browse our products and add items to your cart.</p>
          <Link
            to="/products"
            className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow">
            <ul className="divide-y divide-gray-200">
              {cart.map((item) => (
                <li key={item._id} className="p-6">
                  <div className="flex items-center">
                    <div className="w-24 h-24 bg-white border border-gray-200 rounded flex items-center justify-center overflow-hidden">
                      <img
                        src={isCloudinaryUrl(item.imageUrl) ? optimizeCloudinaryUrl(item.imageUrl, { width: 120, height: 120 }) : item.imageUrl || getPlaceholderImage()}
                        alt={item.title}
                        className="max-h-20 max-w-20 object-contain"
                        onError={(e) => {
                          e.target.src = getPlaceholderImage();
                        }}
                      />
                    </div>
                    <div className="ml-6 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="mt-1 text-gray-500 line-clamp-1">{item.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            className="text-gray-500 hover:text-gray-700 px-2 py-1 border rounded-l"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 border-t border-b">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            className="text-gray-500 hover:text-gray-700 px-2 py-1 border rounded-r"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-lg font-medium text-blue-600">
                        ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">₹{(cartTotal > 0 ? 49.00 : 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">₹{(cartTotal * 0.18).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-medium text-gray-900">Total</span>
                  <span className="text-lg font-medium text-blue-600">
                    ₹{(cartTotal + (cartTotal > 0 ? 49.00 : 0) + cartTotal * 0.18).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || isProcessing}
                className={`w-full bg-blue-600 py-3 px-6 text-white font-medium rounded-md transition-colors
                  ${cart.length === 0 || isProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                {isProcessing ? (
                  <div className="flex justify-center items-center">
                    <Loader size={24} className="mr-2" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>
            </div>
            <Link
              to="/products"
              className="mt-4 w-full block text-center text-blue-600 hover:text-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;