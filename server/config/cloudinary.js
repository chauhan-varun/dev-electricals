const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Log configuration to debug
console.log('CLOUDINARY CONFIG CHECK:');
console.log('Cloud Name Set:', !!process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key Set:', !!process.env.CLOUDINARY_API_KEY);
console.log('API Secret Set:', !!process.env.CLOUDINARY_API_SECRET);

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up CloudinaryStorage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'develectricals-products',
    format: async (req, file) => 'png', // Force PNG format for all uploads
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `product-${uniqueSuffix}`;
    },
    transformation: [{ width: 800, height: 800, crop: 'limit' }] // Optional transformation
  }
});

// Set up Multer with CloudinaryStorage
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: fileFilter
});

module.exports = {
  cloudinary,
  upload
};
