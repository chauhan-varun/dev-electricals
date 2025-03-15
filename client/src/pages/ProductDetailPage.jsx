import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../services/api';
import { CartContext } from '../contexts/CartContext';
import { toast } from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock || 10)) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < (product?.stock || 10)) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} ${product.title} added to cart!`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error || 'Product not found'}</span>
          <Link to="/products" className="block mt-2 text-blue-700 underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-12">
      <div className="mb-4">
        <Link to="/products" className="text-blue-500 hover:text-blue-700 flex items-center text-sm sm:text-base">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Products
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="w-full md:w-1/2 bg-gray-50">
            <div className="h-[300px] sm:h-[400px] md:h-[500px] flex items-center justify-center p-4">
              <img 
                src={product.imageUrls ? product.imageUrls[0] : product.imageUrl} 
                alt={product.title} 
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.target.src = '/images/placeholder.png';
                }}
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full md:w-1/2 p-5 sm:p-8">            
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{product.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {product.featured && (
                <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Featured
                </span>
              )}
              
              {product.isRefurbished && (
                <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Refurbished
                </span>
              )}
            </div>
            
            <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-4 sm:mb-6">₹{product.price.toFixed(2)}</p>
            
            <div className="bg-gray-50 p-3 sm:p-4 rounded-md mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">Description</h3>
              <p className="text-sm sm:text-base text-gray-600">{product.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4 sm:mb-6">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">Category</h3>
                <p className="text-sm sm:text-base text-gray-600">{product.category}</p>
              </div>
              
              <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">Availability</h3>
                <p className={`text-sm sm:text-base ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </p>
              </div>

              {product.isRefurbished && product.condition && (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">Condition</h3>
                  <p className="text-sm sm:text-base text-gray-600">{product.condition}</p>
                </div>
              )}

              {product.brand && (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">Brand</h3>
                  <p className="text-sm sm:text-base text-gray-600">{product.brand}</p>
                </div>
              )}
            </div>
            
            {product.stock > 0 && (
              <div className="mb-5 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Quantity</h3>
                <div className="flex items-center">
                  <button 
                    onClick={decrementQuantity}
                    className="w-10 h-10 bg-gray-200 rounded-l-md flex items-center justify-center hover:bg-gray-300 active:bg-gray-400"
                    aria-label="Decrease quantity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 h-10 text-center border-t border-b border-gray-300"
                    aria-label="Quantity"
                  />
                  <button 
                    onClick={incrementQuantity}
                    className="w-10 h-10 bg-gray-200 rounded-r-md flex items-center justify-center hover:bg-gray-300 active:bg-gray-400"
                    aria-label="Increase quantity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            <button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`w-full py-3 px-6 rounded-md text-white font-medium transition-colors mb-3 sm:mb-4
                ${product.stock > 0 
                  ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800' 
                  : 'bg-gray-400 cursor-not-allowed'}`}
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            
            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
