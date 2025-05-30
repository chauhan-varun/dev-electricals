const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// Helper function for common fetch operations
const fetchData = async (url, method = 'GET', body = null) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include credentials for CORS requests
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`Making ${method} request to: ${url}`);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      console.error(`Request failed with status ${response.status}: ${response.statusText}`);
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Response data from ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
};

// Helper function for FormData uploads (files)
const uploadData = async (url, method = 'POST', formData) => {
  try {
    const options = {
      method,
      credentials: 'include', // Include credentials for CORS requests
      body: formData, // No Content-Type header needed - browser sets it with boundary
    };

    console.log(`Making ${method} FormData upload request to: ${url}`);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      console.error(`Upload failed with status ${response.status}: ${response.statusText}`);
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Upload failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Upload response data from ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`Error uploading to ${url}:`, error);
    throw error;
  }
};

export const fetchListings = async () => {
  return fetchData(`${API_BASE_URL}/listings`);
};

export const fetchServices = async () => {
  return fetchData(`${API_BASE_URL}/services/bookings`);
};

export const fetchRepairs = async () => {
  return fetchData(`${API_BASE_URL}/repairs`);
};

export const fetchUsers = async () => {
  // Direct implementation to debug issues
  try {
    console.log('Fetching users with direct implementation');
    const response = await fetch(`${API_BASE_URL}/auth/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Users data:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    throw error;
  }
};

export const updateRepairStatus = async (repairId, status) => {
  return fetchData(`${API_BASE_URL}/repairs/${repairId}`, 'PATCH', { status });
};

export const updateListingStatus = async (listingId, status) => {
  return fetchData(`${API_BASE_URL}/listings/${listingId}`, 'PATCH', { status });
};

// Add function to get user details
export const getUserDetails = async (userId) => {
  return fetchData(`${API_BASE_URL}/auth/users/${userId}`);
};

// Add function to toggle user active status
export const toggleUserStatus = async (userId, isActive) => {
  return fetchData(`${API_BASE_URL}/auth/users/${userId}/status`, 'PATCH', { active: isActive });
};

// Delete a repair booking
export const deleteRepair = async (repairId) => {
  return fetchData(`${API_BASE_URL}/repairs/${repairId}`, 'DELETE');
};

// Delete a user
export const deleteUser = async (userId) => {
  return fetchData(`${API_BASE_URL}/auth/users/${userId}`, 'DELETE');
};

// Delete a service booking
export const deleteService = async (serviceId) => {
  return fetchData(`${API_BASE_URL}/services/book/${serviceId}`, 'DELETE');
};

// Orders API
export const fetchOrders = async () => {
  console.log('Fetching all orders');
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    console.log('Orders response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Orders data:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchOrders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  return fetchData(`${API_BASE_URL}/orders/${orderId}`, 'PATCH', { status });
};

export const getOrderById = async (orderId) => {
  return fetchData(`${API_BASE_URL}/orders/${orderId}`);
};

// Used Products API
export const fetchUsedProducts = async () => {
  console.log('Fetching all used products');
  try {
    const response = await fetch(`${API_BASE_URL}/used-products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    console.log('Used products response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch used products: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Used products data:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchUsedProducts:', error);
    throw error;
  }
};

export const approveUsedProduct = async (productId) => {
  try {
    console.log(`Approving used product ${productId}`);
    const response = await fetch(`${API_BASE_URL}/used-products/${productId}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error approving product:', errorText);
      throw new Error(`Failed to approve product: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Approval response:', data);
    return data;
  } catch (error) {
    console.error('Error in approveUsedProduct:', error);
    throw error;
  }
};

export const denyUsedProduct = async (productId, notes = '') => {
  try {
    console.log(`Denying used product ${productId}`);
    const response = await fetch(`${API_BASE_URL}/used-products/${productId}/deny`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ adminNotes: notes }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error denying product:', errorText);
      throw new Error(`Failed to deny product: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Denial response:', data);
    return data;
  } catch (error) {
    console.error('Error in denyUsedProduct:', error);
    throw error;
  }
};

// Products API

// Get all products
export const fetchProducts = async () => {
  return fetchData(`${API_BASE_URL}/products`);
};

// Get a single product by ID
export const getProductById = async (productId) => {
  return fetchData(`${API_BASE_URL}/products/${productId}`);
};

// Create a new product
export const createProduct = async (productData) => {
  // Check if productData is FormData (for file uploads)
  if (productData instanceof FormData) {
    return uploadData(`${API_BASE_URL}/products`, 'POST', productData);
  }
  return fetchData(`${API_BASE_URL}/products`, 'POST', productData);
};

// Update a product
export const updateProduct = async (productId, productData) => {
  // Check if productData is FormData (for file uploads)
  if (productData instanceof FormData) {
    return uploadData(`${API_BASE_URL}/products/${productId}`, 'PUT', productData);
  }
  return fetchData(`${API_BASE_URL}/products/${productId}`, 'PUT', productData);
};

// Delete a product
export const deleteProduct = async (productId) => {
  return fetchData(`${API_BASE_URL}/products/${productId}`, 'DELETE');
};