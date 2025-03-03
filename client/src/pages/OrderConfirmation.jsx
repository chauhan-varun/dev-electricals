import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { clearCart } from '../store/cartSlice';

const OrderConfirmation = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Clear the cart after successful order
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Order Confirmed!</h1>
        <p className="mt-2 text-lg text-gray-500">
          Thank you for your purchase. We'll send you an email with your order details.
        </p>
        <div className="mt-8">
          <Link
            to="/products"
            className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 