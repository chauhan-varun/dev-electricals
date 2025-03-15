const router = require('express').Router();
const UsedProduct = require('../models/UsedProduct');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync('./uploads')) {
      fs.mkdirSync('./uploads');
    }
    // Create dedicated directory for used product images
    if (!fs.existsSync('./uploads/used-products')) {
      fs.mkdirSync('./uploads/used-products');
    }
    cb(null, './uploads/used-products/');
  },
  filename: function(req, file, cb) {
    // Generate a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'used-product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images Only!'));
  }
}

// Add this test route at the top of your routes
router.get('/test', (req, res) => {
  res.json({ message: 'Sell route is working!' });
});

// Submit used product listing
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    console.log('Received used product submission');
    console.log('Files received:', req.files?.length || 0);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }
    
    // Process image paths for storage in the database
    const images = req.files.map(file => file.path.replace(/\\/g, '/'));
    
    console.log('Processed image paths:', images);
    console.log('Form data:', req.body);
    
    const usedProduct = new UsedProduct({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      condition: req.body.condition,
      images: images,
      askingPrice: req.body.requestQuote === 'true' ? undefined : Number(req.body.askingPrice),
      requestQuote: req.body.requestQuote === 'true',
      seller: {
        name: req.body['seller.name'],
        email: req.body['seller.email'],
        phone: req.body['seller.phone']
      },
      status: 'pending'
    });

    const savedProduct = await usedProduct.save();
    console.log('Product saved:', savedProduct);
    
    res.status(201).json({ 
      message: 'Product listing submitted successfully', 
      product: savedProduct 
    });
  } catch (error) {
    console.error('Error submitting used product:', error);
    res.status(400).json({ message: error.message || 'Failed to submit product listing' });
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