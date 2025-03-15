const router = require('express').Router();
const UsedProduct = require('../models/UsedProduct');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Check if Cloudinary is properly configured
let upload, cloudinary, productImagesUpload;

try {
  // Try to load Cloudinary configuration
  const cloudinaryConfig = require('../config/cloudinary');
  cloudinary = cloudinaryConfig.cloudinary;
  upload = cloudinaryConfig.upload;
  productImagesUpload = upload.array('images', 5);
  console.log('Cloudinary configuration loaded successfully');
} catch (error) {
  console.error('Error loading Cloudinary configuration:', error.message);
  
  // Fallback to local storage if Cloudinary is not configured
  console.log('Using local storage fallback for file uploads');
  
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, '../uploads/used-products');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Configure local storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  // Set up multer with local storage
  upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      // Accept only image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Not an image! Please upload only images.'), false);
      }
    }
  });
  
  productImagesUpload = upload.array('images', 5);
}

// Add this test route at the top of your routes
router.get('/test', (req, res) => {
  res.json({ message: 'Sell route is working!' });
});

// This route handles direct Cloudinary uploads from the client
router.post('/cloudinary', async (req, res) => {
  try {
    // Validate request body
    if (!req.body.imageUrls || !req.body.imageUrls.length) {
      return res.status(400).json({ message: 'Please upload at least one image' });
    }
    
    console.log('Received Cloudinary URLs:', req.body.imageUrls);
    console.log('Form data:', req.body);
    
    // Handle the askingPrice or requestQuote logic
    let price = null;
    let requestQuote = req.body.requestQuote;
    
    if (!requestQuote && req.body.askingPrice) {
      price = parseFloat(req.body.askingPrice);
    }
    
    const newUsedProduct = new UsedProduct({
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      price: price,
      requestQuote: requestQuote,
      condition: req.body.condition,
      images: req.body.imageUrls, // Use the Cloudinary URLs directly
      seller: req.body.seller // Use the seller object directly
    });
    
    await newUsedProduct.save();
    res.status(201).json({ 
      message: 'Product listing submitted successfully',
      product: newUsedProduct
    });
  } catch (error) {
    console.error('Error submitting used product with Cloudinary URLs:', error);
    res.status(500).json({ message: error.message || 'Failed to submit product listing' });
  }
});

// Submit used product listing with image upload
router.post('/', (req, res) => {
  // Use the configured upload middleware
  productImagesUpload(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message || 'Error uploading images' });
    }
    
    try {
      console.log('Processing sell request with images...');
      console.log('Request files:', req.files ? req.files.length : 'No files');
      console.log('Request body:', req.body);
      
      // Check for files
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Please upload at least one image' });
      }
      
      // Process image URLs (either from Cloudinary or local storage)
      console.log('Processing uploaded images...');
      const images = req.files.map(file => {
        console.log('File:', file);
        // If using Cloudinary, get the path or secure_url
        // If using local storage, construct the URL
        if (file.path && (file.path.includes('cloudinary') || file.secure_url)) {
          return file.path || file.secure_url;
        } else {
          // For local storage, construct a URL
          const relativePath = file.path.split('uploads')[1].replace(/\\/g, '/');
          return `${process.env.SERVER_URL}/uploads${relativePath}`;
        }
      });
      
      console.log('Image URLs:', images);
      
      // Handle nested seller data structure from the form
      const sellerName = req.body['seller.name'] || req.body.sellerName;
      const sellerEmail = req.body['seller.email'] || req.body.sellerEmail;
      const sellerPhone = req.body['seller.phone'] || req.body.sellerPhone;
      
      if (!sellerName || !sellerEmail || !sellerPhone) {
        return res.status(400).json({ message: 'Seller information is required' });
      }
      
      if (!req.body.title || !req.body.category || !req.body.condition) {
        return res.status(400).json({ message: 'Product details are incomplete' });
      }
      
      // Handle the askingPrice or requestQuote logic
      let price = null;
      let requestQuote = req.body.requestQuote === 'true';
      
      if (!requestQuote && req.body.askingPrice) {
        price = parseFloat(req.body.askingPrice);
      }
      
      const newUsedProduct = new UsedProduct({
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        price: price,
        requestQuote: requestQuote,
        condition: req.body.condition,
        images: images,
        seller: {
          name: sellerName,
          email: sellerEmail,
          phone: sellerPhone
        }
      });
      
      console.log('Saving used product to database...');
      const savedProduct = await newUsedProduct.save();
      console.log('Product saved successfully:', savedProduct._id);
      
      res.status(201).json({ 
        message: 'Product listing submitted successfully',
        imageUrls: images,
        product: savedProduct
      });
    } catch (error) {
      console.error('Error submitting used product:', error);
      
      // Delete uploaded images if there was an error
      // Only attempt this for Cloudinary uploads
      if (cloudinary && req.files && req.files.length > 0) {
        try {
          for (const file of req.files) {
            if (file.public_id) {
              await cloudinary.uploader.destroy(file.public_id);
              console.log(`Deleted image from Cloudinary: ${file.public_id}`);
            }
          }
        } catch (cloudinaryError) {
          console.error('Error deleting images from Cloudinary:', cloudinaryError);
        }
      }
      
      res.status(500).json({ message: error.message || 'Failed to submit product listing' });
    }
  });
});

// Get all used products
router.get('/', async (req, res) => {
  try {
    const usedProducts = await UsedProduct.find().sort({ createdAt: -1 });
    res.json(usedProducts);
  } catch (error) {
    console.error('Error getting used products:', error);
    res.status(500).json({ message: 'Failed to get used products' });
  }
});

// Get user's submissions
router.get('/my-submissions/:email', async (req, res) => {
  try {
    const submissions = await UsedProduct.find({ 'seller.email': req.params.email });
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;