import { useState, useEffect } from 'react';
import { fetchListings, fetchServices, fetchRepairs, fetchUsers, updateListingStatus, updateRepairStatus, deleteRepair, deleteUser } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ProductManager from './ProductManager';

const Dashboard = ({ view }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(view || 'listings');
  const navigate = useNavigate();
  
  // Use the view prop to determine active tab or fallback to path
  const location = useLocation();

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemTypeToDelete, setItemTypeToDelete] = useState('');

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
      
      alert('Status updated successfully');
      
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
  };

  const renderContent = () => {
    if (loading && activeTab !== 'products') {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      );
    }

    if (error && activeTab !== 'products') {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong> <span className="block sm:inline">{error}</span>
        </div>
      );
    }
    
    // Check for products tab first, before checking data length
    if (activeTab === 'products') {
      return <ProductManager />;
    }

    if (!data.length) {
      return (
        <div className="text-center py-8 text-gray-500">
          No data available for {activeTab}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
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
                    <button 
                      onClick={() => handleDeleteClick(item._id, 'repair')}
                      className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    >
                      Delete Repair
                    </button>
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
                        <button 
                          onClick={() => handleDeleteClick(item._id, 'user')}
                          className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                        >
                          Delete User
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex border-b mb-8">
        <button 
          onClick={() => handleTabClick('listings')}
          className={`pb-4 px-6 ${activeTab === 'listings' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Listings
        </button>
        <button 
          onClick={() => handleTabClick('services')}
          className={`pb-4 px-6 ${activeTab === 'services' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Services
        </button>
        <button 
          onClick={() => handleTabClick('repairs')}
          className={`pb-4 px-6 ${activeTab === 'repairs' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Repairs
        </button>
        <button 
          onClick={() => handleTabClick('users')}
          className={`pb-4 px-6 ${activeTab === 'users' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Users
        </button>
        <button 
          onClick={() => handleTabClick('products')}
          className={`pb-4 px-6 ${activeTab === 'products' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Products
        </button>
      </nav>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {activeTab === 'listings' && 'User Listings'}
        {activeTab === 'services' && 'Service Requests'}
        {activeTab === 'repairs' && 'Repair Requests'}
        {activeTab === 'users' && 'Users'}
        {activeTab === 'products' && 'Products'}
      </h1>
      {renderContent()}
      
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