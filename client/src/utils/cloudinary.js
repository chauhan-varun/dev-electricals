/**
 * Utility functions for working with Cloudinary images
 */

// Cloudinary configuration for client-side uploads
const cloudConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY
};

/**
 * Checks if a URL is a Cloudinary URL
 * @param {string} url - The URL to check
 * @returns {boolean} - True if the URL is a Cloudinary URL
 */
export const isCloudinaryUrl = (url) => {
  return typeof url === 'string' && url.includes('cloudinary.com');
};

/**
 * Optimizes a Cloudinary URL for different use cases
 * @param {string} url - Cloudinary URL to optimize
 * @param {Object} options - Optimization options
 * @returns {string} - Optimized URL
 */
export const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  const {
    width = 800,
    height = 800,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    effect = '',
  } = options;

  // Find the upload/ part of the URL
  const uploadIndex = url.indexOf('upload/');
  if (uploadIndex === -1) {
    return url;
  }

  // Insert transformation parameters after upload/
  const transformationString = `c_${crop},w_${width},h_${height},q_${quality},f_${format}${
    effect ? `,e_${effect}` : ''
  }`;

  return `${url.substring(0, uploadIndex + 7)}${transformationString}/${url.substring(
    uploadIndex + 7
  )}`;
};

/**
 * Optimizes a Cloudinary URL for product cards
 * @param {string} url - The Cloudinary URL to optimize
 * @returns {string} - The optimized URL
 */
export const optimizeCloudinaryUrlForProductCards = (url, options = {}) => {
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  const { width = 300, height = 300, quality = 'auto', format = 'auto', crop = 'fill' } = options;
  
  // Find the upload part in the URL and insert our transformation
  return url.replace('/upload/', `/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}/`);
};

/**
 * Optimizes a Cloudinary URL for product details (larger image)
 * @param {string} url - The Cloudinary URL to optimize
 * @returns {string} - The optimized URL
 */
export const optimizeCloudinaryDetailUrl = (url) => {
  return optimizeCloudinaryUrlForProductCards(url, { 
    width: 600, 
    height: 600, 
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  });
};

/**
 * Get a placeholder image URL
 * @param {string} category - Product category for contextual placeholder
 * @returns {string} - Placeholder image URL
 */
export const getPlaceholderImage = (category = 'electronics') => {
  const placeholders = {
    electronics: '/images/placeholders/electronics.jpg',
    appliances: '/images/placeholders/appliance.jpg',
    default: '/images/placeholders/product.jpg',
  };

  return placeholders[category] || placeholders.default;
};

/**
 * Validate image file before upload
 * @param {File} file - Image file to validate
 * @returns {boolean} - Whether the file is valid
 */
export const validateImageFile = (file) => {
  // Check if it's an image file
  if (!file.type.startsWith('image/')) {
    return false;
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return false;
  }

  return true;
};

/**
 * Uploads a single image directly to Cloudinary from the client side
 * Using only cloud name and API key (no upload preset)
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - A promise that resolves to the Cloudinary URL
 */
export const uploadImageToCloudinary = async (file) => {
  try {
    // Check if we have the required configuration
    if (!cloudConfig.cloudName || !cloudConfig.apiKey) {
      throw new Error('Cloudinary configuration is incomplete');
    }

    // Get the current timestamp and generate a signature
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Create a form data object
    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', timestamp);
    formData.append('api_key', cloudConfig.apiKey);
    
    // No signature needed - we'll use unsigned uploads which just require the API key
    // This relies on your Cloudinary account allowing unsigned uploads
    
    // Additional parameters for the upload
    formData.append('folder', 'develectricals-products');  // Store in a specific folder
    formData.append('resource_type', 'image');

    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudConfig.cloudName}/auto/upload`;
    
    console.log('Uploading to Cloudinary:', {
      url: uploadUrl,
      apiKey: cloudConfig.apiKey,
      cloudName: cloudConfig.cloudName
    });
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary error response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error?.message || 'Failed to upload to Cloudinary');
      } catch (e) {
        throw new Error(`Failed to upload to Cloudinary: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('Cloudinary upload successful:', data);
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Uploads multiple images to Cloudinary in parallel
 * @param {File[]} files - Array of files to upload
 * @param {Function} progressCallback - Optional callback for upload progress (index, total)
 * @returns {Promise<string[]>} - A promise that resolves to an array of Cloudinary URLs
 */
export const uploadMultipleImagesToCloudinary = async (files, progressCallback) => {
  try {
    // Process files one by one to track progress more accurately
    const urls = [];
    let completed = 0;
    const total = files.length;
    
    for (const file of files) {
      const url = await uploadImageToCloudinary(file);
      urls.push(url);
      completed++;
      
      if (progressCallback) {
        progressCallback(completed, total);
      }
    }
    
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

export default cloudConfig;
