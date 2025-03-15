const router = require('express').Router();
const Product = require('../models/Product');
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
    // Create dedicated directory for product images
    if (!fs.existsSync('./uploads/products')) {
      fs.mkdirSync('./uploads/products');
    }
    cb(null, './uploads/products/');
  },
  filename: function(req, file, cb) {
    // Generate a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
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

// Get all products
router.get('/', async (req, res) => {
  try {
    const { featured } = req.query;
    
    // Create filter object based on query parameters
    const filter = {};
    
    // Add featured filter if specified
    if (featured === 'true') {
      filter.featured = true;
      console.log('Filtering for featured products:', filter);
    }
    
    const products = await Product.find(filter).sort({ createdAt: -1 });
    console.log(`Found ${products.length} products with filter:`, filter);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// Create a new product with image upload
router.post('/', upload.array('productImages', 5), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      price, 
      stock, 
      featured,
      isRefurbished,
      condition,
      brand
    } = req.body;
    
    // Process image files
    let imageUrls = [];
    
    // Add uploaded files
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `uploads/products/${file.filename}`);
    }
    
    // Add existing image URLs if provided
    if (req.body.existingImageUrls) {
      const existingUrls = Array.isArray(req.body.existingImageUrls) 
        ? req.body.existingImageUrls
        : [req.body.existingImageUrls];
      
      imageUrls = [...imageUrls, ...existingUrls];
    }
    
    // Create product
    const newProduct = new Product({
      title,
      description,
      category,
      price,
      imageUrls, // Use the array of image URLs
      stock: stock || 0,
      featured: featured === 'true' || featured === true,
      isRefurbished: isRefurbished === 'true' || isRefurbished === true,
      condition,
      brand
    });
    
    const savedProduct = await newProduct.save();
    res.status(201).json({ 
      message: 'Product created successfully', 
      product: savedProduct 
    });
  } catch (error) {
    // Delete uploaded files if there was an error
    if (req.files) {
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
    
    res.status(400).json({ message: 'Error creating product', error: error.message });
  }
});

// Update a product with image upload
router.put('/:id', upload.array('productImages', 5), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      price, 
      stock, 
      featured,
      isRefurbished,
      condition,
      brand
    } = req.body;
    
    // First get the existing product to handle image updates
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Process images
    let imageUrls = [];
    
    // Add uploaded new files
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `uploads/products/${file.filename}`);
      imageUrls = [...imageUrls, ...newImageUrls];
    }
    
    // Add existing image URLs if provided
    if (req.body.existingImageUrls) {
      const existingUrls = Array.isArray(req.body.existingImageUrls) 
        ? req.body.existingImageUrls
        : [req.body.existingImageUrls];
      
      imageUrls = [...imageUrls, ...existingUrls];
    }
    
    // Determine which images were removed
    const oldImages = existingProduct.imageUrls || [];
    
    // Find paths that were on the old product but not included in existingImageUrls
    const removedImages = oldImages.filter(oldUrl => {
      // Only consider local files, not external URLs
      if (!oldUrl.startsWith('uploads/')) return false;
      
      // If it's not in the current imageUrls, it was removed
      return !imageUrls.includes(oldUrl);
    });
    
    // Delete the removed image files
    removedImages.forEach(imgPath => {
      const fullPath = path.join(__dirname, '..', imgPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`Deleted removed image: ${fullPath}`);
      }
    });
    
    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        price,
        imageUrls, // Use the array of image URLs
        stock,
        featured: featured === 'true' || featured === true,
        isRefurbished: isRefurbished === 'true' || isRefurbished === true,
        condition,
        brand
      },
      { new: true }
    );
    
    res.json({ 
      message: 'Product updated successfully', 
      product: updatedProduct 
    });
  } catch (error) {
    // Delete uploaded files if there was an error
    if (req.files) {
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
    
    res.status(400).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete associated image files
    if (product.imageUrls && product.imageUrls.length > 0) {
      product.imageUrls.forEach(imgUrl => {
        // Only delete local files, not external URLs
        if (imgUrl.startsWith('uploads/')) {
          const filePath = path.join(__dirname, '..', imgUrl);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted image: ${filePath}`);
          }
        }
      });
    }
    
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'Product deleted successfully', 
      deletedId: req.params.id 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router;