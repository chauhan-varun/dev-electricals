import { useState, useEffect } from 'react';
import { fetchUsedProducts, approveUsedProduct, denyUsedProduct } from '../services/api';
import { toast } from 'react-hot-toast';

const UsedProductsManagement = () => {
  const [usedProducts, setUsedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Status colors for badges
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'approved': 'bg-green-100 text-green-800 border-green-200',
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
      await approveUsedProduct(productId);
      // Update local state
      setUsedProducts(usedProducts.map(product => 
        product._id === productId ? { ...product, status: 'approved' } : product
      ));
      
      if (selectedProduct && selectedProduct._id === productId) {
        setSelectedProduct({ ...selectedProduct, status: 'approved' });
      }
      
      toast.success('Product approved and added to refurbished items');
    } catch (err) {
      console.error('Error approving product:', err);
      toast.error('Failed to approve product');
    }
  };

  const handleDeny = async (productId) => {
    try {
      await denyUsedProduct(productId);
      // Update local state
      setUsedProducts(usedProducts.map(product => 
        product._id === productId ? { ...product, status: 'denied' } : product
      ));
      
      if (selectedProduct && selectedProduct._id === productId) {
        setSelectedProduct({ ...selectedProduct, status: 'denied' });
      }
      
      toast.success('Product has been denied');
    } catch (err) {
      console.error('Error denying product:', err);
      toast.error('Failed to deny product');
    }
  };

  const filteredProducts = statusFilter === 'all' 
    ? usedProducts 
    : usedProducts.filter(product => product.status === statusFilter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
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
          >
            Refresh
          </button>
        </div>
      </div>

      {usedProducts.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-500 mb-4">No used products found</p>
          <button
            onClick={loadUsedProducts}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Refresh
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
                        ₹{product.price?.toFixed(2)}
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
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDeny(selectedProduct._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Deny
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
                        <div key={index} className="relative aspect-square">
                          <img 
                            src={image} 
                            alt={`${selectedProduct.title} - image ${index + 1}`}
                            className="w-full h-full object-cover rounded-md"
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
                      <p className="text-sm text-gray-500">Original Price</p>
                      <p className="font-medium">₹{selectedProduct.originalPrice?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Asking Price</p>
                      <p className="font-medium">₹{selectedProduct.price?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium">{selectedProduct.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Condition</p>
                      <p className="font-medium">{selectedProduct.condition}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium">{selectedProduct.age} {selectedProduct.ageUnit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Brand</p>
                      <p className="font-medium">{selectedProduct.brand}</p>
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
                        <p className="font-medium">{selectedProduct.seller?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedProduct.seller?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{selectedProduct.seller?.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{selectedProduct.seller?.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-line">{selectedProduct.description}</p>
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
