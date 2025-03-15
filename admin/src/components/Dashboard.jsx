import { useState, useEffect } from 'react';
import { fetchListings, fetchServices, fetchRepairs, fetchUsers, updateListingStatus, updateRepairStatus, deleteRepair, deleteUser, deleteService } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ProductManager from './ProductManager';
import Loader from './UI/Loader';

const Dashboard = ({ view }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(view || 'listings');
  const [mobileTabsOpen, setMobileTabsOpen] = useState(false);
  const navigate = useNavigate();
  
  // Use the view prop to determine active tab or fallback to path
  const location = useLocation();

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemTypeToDelete, setItemTypeToDelete] = useState('');

  // Animation variants
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
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const tabContentVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5,
        ease: 'easeInOut'
      }
    },
    exit: { 
      opacity: 0, 
      x: 20,
      transition: { 
        duration: 0.3 
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        let response;
        switch (activeTab) {
          case 'listings':
            response = await fetchListings();
            break;
          case 'services':
            response = await fetchServices();
            break;
          case 'repairs':
            response = await fetchRepairs();
            break;
          case 'users':
            response = await fetchUsers();
            break;
          case 'products':
            response = [];
            break;
          default:
            response = [];
        }
        setData(response);
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  useEffect(() => {
    // Update activeTab when view prop changes
    if (view) {
      setActiveTab(view);
    } else {
      // Extract tab from URL if view prop is not provided
      const path = location.pathname;
      if (path.includes('listings')) setActiveTab('listings');
      else if (path.includes('services')) setActiveTab('services');
      else if (path.includes('repairs')) setActiveTab('repairs');
      else if (path.includes('users')) setActiveTab('users');
      else if (path.includes('products')) setActiveTab('products');
    }
  }, [view, location.pathname]);

  const handleStatusUpdate = async (itemId, status, type) => {
    try {
      if (type === 'listing') {
        await updateListingStatus(itemId, status);
      } else if (type === 'repair') {
        await updateRepairStatus(itemId, status);
      }
      
      toast.success('Status updated successfully');
      
      // Refresh the data
      const fetchData = async () => {
        setLoading(true);
        try {
          let response;
          if (activeTab === 'listings') {
            response = await fetchListings();
          } else if (activeTab === 'repairs') {
            response = await fetchRepairs();
          }
          setData(response);
        } catch (err) {
          setError('Error refreshing data');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteClick = (itemId, type) => {
    setItemToDelete(itemId);
    setItemTypeToDelete(type);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      if (itemTypeToDelete === 'repair') {
        await deleteRepair(itemToDelete);
        toast.success('Repair booking deleted successfully');
      } else if (itemTypeToDelete === 'user') {
        await deleteUser(itemToDelete);
        toast.success('User deleted successfully');
      } else if (itemTypeToDelete === 'service') {
        await deleteService(itemToDelete);
        toast.success('Service booking deleted successfully');
      }
      
      // Refresh the data after deletion
      const fetchData = async () => {
        setLoading(true);
        try {
          let response;
          switch (activeTab) {
            case 'listings':
              response = await fetchListings();
              break;
            case 'repairs':
              response = await fetchRepairs();
              break;
            case 'users':
              response = await fetchUsers();
              break;
            case 'services':
              response = await fetchServices();
              break;
            default:
              response = [];
          }
          setData(response);
        } catch (err) {
          setError('Failed to refresh data');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } catch (error) {
      console.error(`Error deleting ${itemTypeToDelete}:`, error);
      toast.error(`Failed to delete ${itemTypeToDelete}: ${error.message}`);
    } finally {
      // Close the modal
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setItemTypeToDelete('');
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    setItemTypeToDelete('');
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setMobileTabsOpen(false); // Close mobile dropdown after selection
  };

  const toggleMobileTabs = () => {
    setMobileTabsOpen(!mobileTabsOpen);
  };

  const renderContent = () => {
    if (loading && activeTab !== 'products') {
      return (
        <motion.div 
          className="flex flex-col justify-center items-center h-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Loader size={30} />
          <p className="mt-4 text-red-600 font-medium">Loading {activeTab}...</p>
        </motion.div>
      );
    }

    if (error && activeTab !== 'products') {
      return (
        <motion.div 
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <strong className="font-bold">Error!</strong> <span className="block sm:inline">{error}</span>
        </motion.div>
      );
    }
    
    // Check for products tab first, before checking data length
    if (activeTab === 'products') {
      return <ProductManager />;
    }

    if (!data.length) {
      return (
        <motion.div 
          className="text-center py-8 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          No data available for {activeTab}
        </motion.div>
      );
    }

    return (
      <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <motion.div 
              key={item._id} 
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-all"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              {activeTab === 'repairs' ? (
                <>
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-lg">{item.name}</h4>
                   
                  </div>
                  <div className="border-t border-gray-100 pt-3 space-y-2 mb-3">
                    <p className="text-sm text-gray-700"><span className="font-medium">Contact:</span> {item.contact}</p>
                    <p className="text-sm text-gray-700"><span className="font-medium">Address:</span> {item.address}</p>
                    <p className="text-sm text-gray-700 capitalize"><span className="font-medium">Repair Type:</span> {item.repairType}</p>
                    <div className="bg-gray-50 p-2 rounded-md mt-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Date:</span> {' '}
                        {new Date(item.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Time:</span> {item.time}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <motion.button 
                      onClick={() => handleDeleteClick(item._id, 'repair')}
                      className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Delete Repair
                    </motion.button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-lg">{item.title || item.productName || item.name}</h4>
                    
                  </div>
                  
                  {activeTab === 'listings' && (
                    <>
                      <p className="text-sm text-gray-600">Price: ₹{item.price}</p>
                      <p className="text-sm text-gray-600">Seller: {item.seller}</p>
                    </>
                  )}
                  {activeTab === 'users' && (
                    <>
                      <p className="text-sm text-gray-600">Email: {item.email}</p>
                      <p className="text-sm text-gray-600">Provider: {item.authProvider || 'local'}</p>
                      <div className="mt-4">
                        <motion.button 
                          onClick={() => handleDeleteClick(item._id, 'user')}
                          className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Delete User
                        </motion.button>
                      </div>
                    </>
                  )}
                  {activeTab === 'services' && (
                    <>
                      <div className="border-t border-gray-100 pt-3 space-y-2 mb-3">
                        <p className="text-sm text-gray-700"><span className="font-medium">Contact:</span> {item.contact}</p>
                        <p className="text-sm text-gray-700"><span className="font-medium">Address:</span> {item.address}</p>
                        <p className="text-sm text-gray-700 capitalize"><span className="font-medium">Service Type:</span> {item.serviceType}</p>
                        <div className="bg-gray-50 p-2 rounded-md mt-2">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Date:</span> {' '}
                            {new Date(item.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Time:</span> {item.time}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <motion.button 
                          onClick={() => handleDeleteClick(item._id, 'service')}
                          className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Delete Service Booking
                        </motion.button>
                      </div>
                    </>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mobile Tab Menu Button */}
      <div className="md:hidden mb-6">
        <motion.button
          onClick={toggleMobileTabs}
          className="flex items-center justify-between w-full px-4 py-3 bg-red-900 text-white rounded-md shadow"
          whileTap={{ scale: 0.98 }}
        >
          <span className="font-medium">
            {activeTab === 'listings' && 'User Listings'}
            {activeTab === 'services' && 'Service Requests'}
            {activeTab === 'repairs' && 'Repair Requests'}
            {activeTab === 'users' && 'Users'}
            {activeTab === 'products' && 'Products'}
          </span>
          <svg className={`w-5 h-5 transition-transform ${mobileTabsOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.button>
        
        <AnimatePresence>
          {mobileTabsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 bg-white rounded-md shadow-lg overflow-hidden"
            >
              <div className="flex flex-col">
                
                <motion.button 
                  onClick={() => handleTabClick('services')}
                  className={`py-3 px-4 text-left ${activeTab === 'services' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'}`}
                  whileTap={{ scale: 0.98 }}
                >
                  Services
                </motion.button>
                <motion.button 
                  onClick={() => handleTabClick('repairs')}
                  className={`py-3 px-4 text-left ${activeTab === 'repairs' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'}`}
                  whileTap={{ scale: 0.98 }}
                >
                  Repairs
                </motion.button>
                <motion.button 
                  onClick={() => handleTabClick('users')}
                  className={`py-3 px-4 text-left ${activeTab === 'users' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'}`}
                  whileTap={{ scale: 0.98 }}
                >
                  Users
                </motion.button>
                <motion.button 
                  onClick={() => handleTabClick('products')}
                  className={`py-3 px-4 text-left ${activeTab === 'products' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'}`}
                  whileTap={{ scale: 0.98 }}
                >
                  Products
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex border-b mb-8">
        
        <motion.button 
          onClick={() => handleTabClick('services')}
          className={`pb-4 px-6 ${activeTab === 'services' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          Services
        </motion.button>
        <motion.button 
          onClick={() => handleTabClick('repairs')}
          className={`pb-4 px-6 ${activeTab === 'repairs' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          Repairs
        </motion.button>
        <motion.button 
          onClick={() => handleTabClick('users')}
          className={`pb-4 px-6 ${activeTab === 'users' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          Users
        </motion.button>
        <motion.button 
          onClick={() => handleTabClick('products')}
          className={`pb-4 px-6 ${activeTab === 'products' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          Products
        </motion.button>
      </nav>

      <motion.h1 
        className="text-2xl font-bold mb-6 text-gray-800"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {activeTab === 'listings' && 'User Listings'}
        {activeTab === 'services' && 'Service Requests'}
        {activeTab === 'repairs' && 'Repair Requests'}
        {activeTab === 'users' && 'Users'}
        {activeTab === 'products' && 'Products'}
      </motion.h1>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabContentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
      
      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemType={itemTypeToDelete}
      />
    </div>
  );
};

export default Dashboard;