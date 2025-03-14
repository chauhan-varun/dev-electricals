import api from '../utils/axios';

// Product API functions
export const fetchProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchFeaturedProducts = async () => {
  try {
    const response = await api.get('/products?featured=true');
    return response.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
};

// Repair API functions
export const scheduleRepair = async (repairData) => {
  try {
    const response = await api.post('/repairs', repairData);
    return response.data;
  } catch (error) {
    console.error('Error scheduling repair:', error);
    throw error;
  }
};

export const getUserRepairs = async () => {
  try {
    const response = await api.get('/repairs/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user repairs:', error);
    throw error;
  }
};

// Service API functions
export const requestService = async (serviceData) => {
  try {
    const response = await api.post('/services', serviceData);
    return response.data;
  } catch (error) {
    console.error('Error requesting service:', error);
    throw error;
  }
};

export const getUserServices = async () => {
  try {
    const response = await api.get('/services/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user services:', error);
    throw error;
  }
};

// Order API functions
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getUserOrders = async () => {
  try {
    const response = await api.get('/orders/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    console.log(`Updating order ${orderId} status to ${status}`);
    const response = await api.patch(`/orders/${orderId}`, { status });
    console.log('Order status update response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error);
    throw error;
  }
};
