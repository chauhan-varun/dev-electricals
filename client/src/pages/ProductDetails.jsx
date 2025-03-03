import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { products } from '../data/products'; // Import the products data

const ProductDetails = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === parseInt(id));
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    alert(`${product.name} has been added to your cart!`);
  };

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
      <img src={product.image} alt={product.name} className="w-full h-64 object-cover mb-4" />
      <p className="text-lg text-gray-700 mb-4">{product.description}</p>
      <p className="text-xl font-bold text-primary">₹{product.price}</p>
      <button
        onClick={handleAddToCart}
        className="mt-4 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductDetails; 