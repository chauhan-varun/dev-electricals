import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { fetchFeaturedProducts, fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import img from '../assets/img.png';
import serviceImg from '../assets/service.png';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get featured products first
        let products = await fetchFeaturedProducts();
        console.log("Featured products loaded:", products);
        
        // If no featured products found, fetch regular products as fallback
        if (!products || products.length === 0) {
          console.log("No featured products found, fetching regular products");
          const allProducts = await fetchProducts();
          // Take the first 4 products as featured
          products = allProducts.slice(0, 4);
        }
        
        setFeaturedProducts(products);
      } catch (err) {
        console.error("Error loading featured products:", err);
        setError("Failed to load featured products");
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12 md:pt-24">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-10 sm:py-16 md:py-24 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl sm:rounded-2xl text-white mb-6 sm:mb-8 md:mb-12 relative overflow-hidden"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-tight font-extrabold px-4 relative z-10">
          <span className="block bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 text-transparent bg-clip-text animate-gradient">Your Trusted Partner for</span>
          <span className="block mt-2 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 text-transparent bg-clip-text animate-gradient">Electrical Solutions</span>
        </h1>
        <div className="absolute inset-0 z-0">
          <div className="wave"></div>
          <div className="wave"></div>
        </div>
        <p className="mt-4 sm:mt-6 max-w-xs sm:max-w-sm md:max-w-md mx-auto text-sm sm:text-base md:text-lg px-4 md:mt-8">
          Shop quality electrical products, sell your used equipment, and get professional repair services - all in one place.
        </p>
      </motion.div>

      {/* High-Quality Electricals & Appliances */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-10 text-gray-800 mb-6 sm:mb-8 md:mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="md:w-3/5 md:pr-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">High-Quality Electricals & Appliances</h2>
            <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
              Shop a wide range of electrical supplies and appliances at unbeatable prices. Reliable, efficient, and built to last!
            </p>
            <Link
              to="/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base py-2 px-5 sm:px-6 rounded-md transition-colors"
            >
              Shop Now
            </Link>
          </div>
          <div className="mt-5 md:mt-0 md:w-2/5 flex justify-center">
            <img
              src="https://cdni.iconscout.com/illustration/premium/thumb/home-appliance-product-illustration-download-in-svg-png-gif-file-formats--washing-machine-electronic-shop-shopping-store-microwave-electronics-and-pack-buildings-illustrations-4171462.png"
              alt="Electrical appliances"
              className="h-48 sm:h-56 md:h-60 lg:h-64 object-contain transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </motion.section>

      {/* Home Electrical Services */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-10 text-gray-800 mb-6 sm:mb-8 md:mb-12"
      >
        <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between">
          <div className="mt-5 md:mt-0 md:w-2/5 flex justify-center">
            <img
              src={serviceImg}
              alt="Electrical services"
              className="h-48 sm:h-56 md:h-60 lg:h-64 object-contain transform hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="md:w-3/5 md:pl-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Reliable Electrical Services for Your Home</h2>
            <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
              Expert home wiring, appliance installation, and electrical repairs. Safe, fast, and hassle-free service you can trust!
            </p>
            <Link
              to="/services"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base py-2 px-5 sm:px-6 rounded-md transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Sell Your Devices */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-10 text-gray-800 mb-6 sm:mb-8 md:mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="md:w-3/5 md:pr-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Sell Your Used Devices to Us</h2>
            <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
              Got old electrical devices? We offer competitive prices for your used equipment. 
              Free evaluation, instant quote, and hassle-free pickup.
            </p>
            <Link
              to="/sell"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base py-2 px-5 sm:px-6 rounded-md transition-colors"
            >
              Get a Quote
            </Link>
          </div>
          <div className="mt-5 md:mt-0 md:w-2/5 flex justify-center">
            <img
              src={img}
              alt="Sell your devices"
              className="h-48 sm:h-56 md:h-60 lg:h-64 object-contain transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
