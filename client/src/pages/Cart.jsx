import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';
import { removeFromCart, updateQuantity } from '../store/cartSlice';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const Cart = () => {
  const { items, total } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error('Please sign in to view your cart', {
        position: 'top-center',
        duration: 4000,
        style: { background: '#EF4444', color: 'white' }
      });
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  const handleQuantityChange = (id, quantity) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="mt-4 text-gray-500">Browse our products and add items to your cart.</p>
          <Link
            to="/products"
            className="mt-6 inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow">
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.id} className="p-6">
                  <div className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="ml-6 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="mt-1 text-gray-500">{item.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="text-gray-500 hover:text-gray-700 px-2 py-1 border rounded-l"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 border-t border-b">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="text-gray-500 hover:text-gray-700 px-2 py-1 border rounded-r"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-lg font-medium text-gray-900">
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
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{(total * 0.1).toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>₹{(total + (total * 0.1)).toFixed(2)}</span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark flex items-center justify-center"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;