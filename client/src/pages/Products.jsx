import { products } from '../data/products';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Our Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <motion.div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden transform-gpu"
            whileHover={{
              scale: 1.02,
              rotateY: 5,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
            <motion.img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover transition-transform duration-300"
              whileHover={{ scale: 1.1 }}
            />
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
              <p className="text-gray-500 mt-2">{product.description}</p>
              <p className="text-primary font-bold mt-4">₹{product.price}</p>
              <motion.button
                onClick={() => handleAddToCart(product)}
                className="mt-4 inline-block bg-primary text-white py-2 px-4 rounded-md"
                whileHover={{
                  scale: 1.05,
                  background: 'linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))'
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                Add to Cart
              </motion.button>
            </div>
          </motion.div>
        ))}      
      </div>

      {/* Notification Popup */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 bg-green-500 text-white p-2 rounded-md shadow-md"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Products;