import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { products } from '../data/products'; // Import the products data

const Home = () => {
  const featuredProducts = products.slice(0, 4); // Get the first 4 products as featured

  const popularServices = [
    {
      id: 1,
      name: 'Electrical Installation',
      description: 'Professional installation services for your home or office',
      price: 'From $99',
    },
    // Add more services...
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-24">
      {/* Hero Section */}
      <div className="text-center py-8 sm:py-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl text-white mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight font-extrabold px-4">
          <span className="block">Your Trusted Partner for</span>
          <span className="block mt-2">Electrical Solutions</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-sm sm:text-base md:text-lg lg:text-xl px-4 md:mt-5 md:max-w-3xl">
          Shop quality electrical products, sell your used equipment, and get professional repair services - all in one place.
        </p>
        <div className="mt-5 max-w-md mx-auto px-4 flex flex-col sm:flex-row sm:justify-center md:mt-8 space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="rounded-md shadow">
            <Link
              to="/products"
              className="w-full flex items-center justify-center px-6 sm:px-8 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
            >
              Shop Now
            </Link>
          </div>
          <div>
            <Link
              to="/services"
              className="w-full flex items-center justify-center px-6 sm:px-8 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-900 md:py-4 md:text-lg md:px-10"
            >
              Our Services
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <section className="mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-primary hover:text-primary-dark flex items-center text-sm sm:text-base">
            View All <ArrowRightIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-40 sm:h-48 object-cover" />
              <div className="p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">{product.name}</h3>
                <p className="text-primary font-bold mt-1 sm:mt-2">₹{product.price}</p>
                <Link
                  to={`/products/${product.id}`}
                  className="mt-3 sm:mt-4 w-full inline-block bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark text-center text-sm sm:text-base"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Services */}
      <section className="mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Popular Services</h2>
          <Link to="/services" className="text-primary hover:text-primary-dark flex items-center text-sm sm:text-base">
            View All <ArrowRightIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {popularServices.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">{service.name}</h3>
              <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">{service.description}</p>
              <p className="text-primary font-bold mt-3 sm:mt-4">{service.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Special Offers */}
      <section className="mb-8 sm:mb-12 bg-gray-50 rounded-xl p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Special Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Trade-In Offer</h3>
            <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">Get up to 30% extra value when you trade in your old electrical appliances</p>
            <Link to="/sell" className="text-primary hover:text-primary-dark mt-3 sm:mt-4 inline-block text-sm sm:text-base">
              Learn More
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Repair Service Special</h3>
            <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">20% off on all repair services this month</p>
            <Link to="/repairs" className="text-primary hover:text-primary-dark mt-3 sm:mt-4 inline-block text-sm sm:text-base">
              Book Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
