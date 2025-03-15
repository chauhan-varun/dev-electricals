const router = require('express').Router();
const Product = require('../models/Product');
const { upload, cloudinary } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

// We're now using Cloudinary for image uploads instead of local storage
// The old multer diskStorage configuration has been replaced

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
      imageUrls = req.files.map(file => file.path);
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
        cloudinary.uploader.destroy(file.public_id);
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
      const newImageUrls = req.files.map(file => file.path);
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
      if (!oldUrl.startsWith('https://res.cloudinary.com/')) return false;
      
      // If it's not in the current imageUrls, it was removed
      return !imageUrls.includes(oldUrl);
    });
    
    // Delete the removed image files
    removedImages.forEach(imgUrl => {
      const publicId = imgUrl.split('/').pop().split('.')[0];
      cloudinary.uploader.destroy(publicId);
      console.log(`Deleted removed image: ${imgUrl}`);
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
        cloudinary.uploader.destroy(file.public_id);
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
        if (imgUrl.startsWith('https://res.cloudinary.com/')) {
          const publicId = imgUrl.split('/').pop().split('.')[0];
          cloudinary.uploader.destroy(publicId);
          console.log(`Deleted image: ${imgUrl}`);
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