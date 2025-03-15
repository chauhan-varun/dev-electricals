// Cloudinary configuration for the admin panel
const cloudConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY
};

// Function to format Cloudinary URLs for optimization if needed
export const optimizeCloudinaryUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // Example optimization: resize images to 500px width while maintaining aspect ratio
  return url.replace('/upload/', '/upload/w_500,q_auto,f_auto/');
};

// Function to check if a URL is a Cloudinary URL
export const isCloudinaryUrl = (url) => {
  return url && url.includes('cloudinary.com');
};

export default cloudConfig;
