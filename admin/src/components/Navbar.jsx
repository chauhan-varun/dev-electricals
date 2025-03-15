import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'repairs', label: 'Repairs', path: '/repairs' },
    { id: 'orders', label: 'Orders', path: '/orders' },
    { id: 'used-products', label: 'Used Products', path: '/used-products' },
    { id: 'contact', label: 'Contact Messages', path: '/contact' }
  ];

  // Animation variants
  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        when: "afterChildren"
      }
    },
    open: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    }
  };

  const mobileNavItemVariants = {
    closed: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.nav 
      className="bg-white/10 backdrop-blur-md shadow-lg sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <motion.div 
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/" className="text-xl font-bold text-red-600">DevElectricals Admin</Link>
          </motion.div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-red-600 hover:text-red-300 focus:outline-none"
              whileTap={{ scale: 0.95 }}
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </motion.button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <motion.div key={item.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to={item.path}
                  className={`text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    location.pathname === item.path || (item.path === '/services' && location.pathname === '/') 
                      ? 'bg-white/10 backdrop-blur-sm border border-red-600' 
                      : 'hover:text-red-300 hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
            <motion.button
              onClick={logout}
              className="px-4 py-2 rounded-md bg-white/10 backdrop-blur-sm border border-red-600 text-red-600 hover:text-red-300 hover:bg-white/20 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          </div>
        </div>

        {/* Mobile menu with animation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden overflow-hidden bg-white shadow-lg rounded-b-md"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navItems.map((item) => (
                  <motion.div key={item.id} variants={mobileNavItemVariants}>
                    <Link
                      to={item.path}
                      className={`block text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                        location.pathname === item.path || (item.path === '/services' && location.pathname === '/') 
                          ? 'bg-red-50 rounded-md' 
                          : 'hover:bg-red-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div variants={mobileNavItemVariants}>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-3 py-2 rounded-md text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-300"
                  >
                    Logout
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;