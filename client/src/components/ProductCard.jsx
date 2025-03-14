import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import { toast } from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.title} added to cart!`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 flex flex-col h-full">
      {/* Product Badge */}
      <div className="relative">
        {product.featured && (
          <span className="absolute top-2 right-2 z-10 bg-blue-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
            Featured
          </span>
        )}
        
        {/* Product Image */}
        <div className="h-48 sm:h-56 overflow-hidden bg-gray-50 flex items-center justify-center p-4">
          <img 
            src={product.imageUrl} 
            alt={product.title} 
            className="w-full h-full object-contain transition-transform hover:scale-110"
            onError={(e) => {
              e.target.src = '/images/placeholder.png';
            }}
          />
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 line-clamp-1">{product.title}</h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2 flex-grow">{product.description}</p>
        
        {/* Price */}
        <div className="mt-auto">
          <span className="text-blue-600 text-lg font-bold block mb-3">₹{product.price?.toFixed(2) || '0.00'}</span>
          
          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={handleAddToCart}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors w-full flex justify-center items-center"
            >
              Add to Cart
            </button>
            <Link 
              to={`/products/${product._id}`} 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-md text-sm font-medium transition-colors w-full flex justify-center items-center"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
