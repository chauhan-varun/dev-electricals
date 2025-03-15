import { useState, useEffect } from 'react';
import { fetchUsedProducts, approveUsedProduct, denyUsedProduct } from '../services/api';
import { toast } from 'react-hot-toast';
import Loader from './UI/Loader';

const UsedProductsManagement = () => {
  const [usedProducts, setUsedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [denyReason, setDenyReason] = useState('');
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [productToDeny, setProductToDeny] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);

  // Status colors for badges
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'approved': 'bg-green-100 text-green-800 border-green-200',
    'rejected': 'bg-red-100 text-red-800 border-red-200',
    'denied': 'bg-red-100 text-red-800 border-red-200',
  };

  useEffect(() => {
    loadUsedProducts();
  }, []);

  const loadUsedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUsedProducts();
      setUsedProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading used products:', err);
      setError('Failed to load used products. Please try again.');
      setUsedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId) => {
    try {
      setProcessingAction(true);
      const response = await approveUsedProduct(productId);
      console.log('Approval response:', response);
      
      // Remove the approved product from the list
      setUsedProducts(usedProducts.filter(product => product._id !== productId));
      
      if (selectedProduct && selectedProduct._id === productId) {
        setSelectedProduct(null);
      }
      
      toast.success('Product approved and added to refurbished items');
    } catch (err) {
      console.error('Error approving product:', err);
      toast.error('Failed to approve product');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeny = async (productId, notes = '') => {
    try {
      setProcessingAction(true);
      const response = await denyUsedProduct(productId, notes);
      console.log('Denial response:', response);
      
      // Remove the denied product from the list
      setUsedProducts(usedProducts.filter(product => product._id !== productId));
      
      if (selectedProduct && selectedProduct._id === productId) {
        setSelectedProduct(null);
      }
      
      toast.success('Product has been denied and removed');
      setDenyReason('');
      setShowDenyModal(false);
      setProductToDeny(null);
    } catch (err) {
      console.error('Error denying product:', err);
      toast.error('Failed to deny product');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDenyModalSubmit = () => {
    if (!productToDeny) return;
    handleDeny(productToDeny._id, denyReason);
  };

  const handleDenyModalCancel = () => {
    setShowDenyModal(false);
    setDenyReason('');
    setProductToDeny(null);
  };

  const filteredProducts = statusFilter === 'all' 
    ? usedProducts 
    : usedProducts.filter(product => product.status === statusFilter);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Loader size={30} />
        <p className="mt-4 text-red-600 font-medium">Loading used products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-red-800">{error}</div>
        <button 
          onClick={loadUsedProducts}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Deny Confirmation Modal */}
      {showDenyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Deny Used Product</h3>
            <p className="mb-4">
              Are you sure you want to deny this product? This will permanently remove it from the database.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for denial (optional):
              </label>
              <textarea
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                rows="3"
                placeholder="Enter reason for denial (optional)"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDenyModalCancel}
                disabled={processingAction}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDenyModalSubmit}
                disabled={processingAction}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 flex items-center"
              >
                {processingAction ? (
                  <>
                    <Loader size={14} className="mr-2" />
                    <span>Processing...</span>
                  </>
                ) : (
                  'Confirm Denial'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Used Products Management</h1>
        <div className="flex items-center space-x-2">
          <label htmlFor="status-filter" className="text-sm font-medium">Filter:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="all">All Products</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
          <button
            onClick={loadUsedProducts}
            className="bg-red-600 text-white px-4 py-1 rounded text-sm hover:bg-red-700"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {usedProducts.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-500 mb-4">No used products found</p>
          <button
            onClick={loadUsedProducts}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b">
              <h2 className="font-medium">Used Products ({filteredProducts.length})</h2>
            </div>
            <div className="overflow-y-auto max-h-[600px]">
              {filteredProducts.map(product => (
                <div 
                  key={product._id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedProduct?._id === product._id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium truncate max-w-[200px]">
                        {product.title || 'Unnamed Product'}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(product.createdAt).toLocaleDateString()} • 
                        ₹{product.askingPrice?.toFixed(2) || 'Quote Requested'}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[product.status] || 'bg-gray-100'}`}>
                      {product.status?.charAt(0).toUpperCase() + product.status?.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-2 bg-white shadow rounded-lg">
            {selectedProduct ? (
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold">{selectedProduct.title}</h2>
                    <p className="text-gray-500">
                      Added on {new Date(selectedProduct.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {selectedProduct.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(selectedProduct._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        disabled={processingAction}
                      >
                        {processingAction ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => {
                          setProductToDeny(selectedProduct);
                          setShowDenyModal(true);
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        disabled={processingAction}
                      >
                        {processingAction ? 'Processing...' : 'Deny'}
                      </button>
                    </div>
                  )}
                  {selectedProduct.status !== 'pending' && (
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[selectedProduct.status]}`}>
                      {selectedProduct.status?.charAt(0).toUpperCase() + selectedProduct.status?.slice(1)}
                    </span>
                  )}
                </div>

                {/* Product Images */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Product Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                      selectedProduct.images.map((image, index) => (
                        <div key={index} className="relative aspect-square border border-gray-200 rounded-md overflow-hidden shadow-sm">
                          <img 
                            src={image.startsWith('http') ? image : `${import.meta.env.VITE_API_URL}/${image}`} 
                            alt={`${selectedProduct.title} - image ${index + 1}`}
                            className="w-full h-full object-cover rounded-md"
                            onError={(e) => {
                              console.error(`Error loading image: ${image}`);
                              e.target.src = '/placeholder-image.jpg';
                              e.target.classList.add('opacity-50');
                            }}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full p-4 bg-gray-50 rounded-md text-center text-gray-500">
                        No images available
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Product Details</h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Asking Price</p>
                      <p className="font-medium">
                        {selectedProduct.requestQuote 
                          ? 'Quote Requested' 
                          : `₹${selectedProduct.askingPrice?.toFixed(2) || '0.00'}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium">{selectedProduct.category || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Condition</p>
                      <p className="font-medium">{selectedProduct.condition || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Brand</p>
                      <p className="font-medium">{selectedProduct.brand || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Seller Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Seller Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{selectedProduct.seller?.name || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedProduct.seller?.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{selectedProduct.seller?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-line">{selectedProduct.description || 'No description provided'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Select a used product from the list to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsedProductsManagement;
