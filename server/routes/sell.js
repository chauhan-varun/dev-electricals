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
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, 'used-product-' + Date.now() + path.extname(file.originalname));
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
    cb('Error: Images Only!');
  }
}

// Add this test route at the top of your routes
router.get('/test', (req, res) => {
  res.json({ message: 'Sell route is working!' });
});

// Submit used product listing
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const images = req.files.map(file => file.path);
    
    const usedProduct = new UsedProduct({
      ...req.body,
      images,
      askingPrice: req.body.requestQuote ? undefined : Number(req.body.askingPrice)
    });

    await usedProduct.save();
    res.status(201).json({ message: 'Product listing submitted successfully', product: usedProduct });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's submissions
router.get('/my-submissions/:email', async (req, res) => {
  try {
    const submissions = await UsedProduct.find({ 'seller.email': req.params.email });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 