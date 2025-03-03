import { products } from '../data/products';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { useState } from 'react';

const Products = () => {
  const dispatch = useDispatch();
  const [notification, setNotification] = useState('');

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    setNotification(`${product.name} has been added to your cart!`);
    setTimeout(() => {
      setNotification('');
    }, 2000); // Hide notification after 2 seconds
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Our Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
              <p className="text-gray-500 mt-2">{product.description}</p>
              <p className="text-primary font-bold mt-4">₹{product.price}</p>
              <button
                onClick={() => handleAddToCart(product)}
                className="mt-4 inline-block bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Notification Popup */}
      {notification && (
        <div className="fixed bottom-4 left-4 bg-green-500 text-white p-2 rounded-md shadow-md">
          {notification}
        </div>
      )}
    </div>
  );
};

export default Products; 