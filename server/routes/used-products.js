const router = require('express').Router();
const UsedProduct = require('../models/UsedProduct');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Get all used products (for admin)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all used products for admin');
    const usedProducts = await UsedProduct.find().sort({ createdAt: -1 });
    res.json(usedProducts);
  } catch (error) {
    console.error('Error fetching used products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific used product by ID
router.get('/:id', async (req, res) => {
  try {
    const usedProduct = await UsedProduct.findById(req.params.id);
    if (!usedProduct) {
      return res.status(404).json({ message: 'Used product not found' });
    }
    res.json(usedProduct);
  } catch (error) {
    console.error('Error fetching used product details:', error);
    res.status(500).json({ message: error.message });
  }
});

// Approve a used product - adds to products collection as refurbished
router.patch('/:id/approve', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    console.log(`Approving used product with ID: ${req.params.id}`);
    
    // Find the used product
    const usedProduct = await UsedProduct.findById(req.params.id).session(session);
    
    if (!usedProduct) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Used product not found' });
    }
    
    if (usedProduct.status !== 'pending') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: `This product is already ${usedProduct.status}. Can't approve.` 
      });
    }
    
    console.log('Used product found:', usedProduct);
    
    // Update the used product status
    usedProduct.status = 'approved';
    await usedProduct.save({ session });
    
    // Create a new product in the products collection as refurbished
    const newProduct = new Product({
      title: usedProduct.title,
      description: usedProduct.description,
      price: usedProduct.askingPrice || 0, // Use asking price or set to 0 if not provided
      category: usedProduct.category,
      brand: usedProduct.brand || 'Unknown',
      // Ensure image paths are absolute with server URL
      imageUrls: usedProduct.images.map(imagePath => {
        // If the path already starts with http or https, keep it as is
        if (imagePath.startsWith('http')) {
          return imagePath;
        }
        // Otherwise, make sure it's a proper path with server URL
        return `${process.env.SERVER_URL || 'http://localhost:5000'}/${imagePath.replace(/^\/+/, '')}`;
      }),
      stock: 1, // Only one available since it's a used product
      isRefurbished: true, // Mark as refurbished
      condition: usedProduct.condition,
      sellerInfo: {
        name: usedProduct.seller.name,
        email: usedProduct.seller.email,
        phone: usedProduct.seller.phone
      },
      originalUsedProductId: usedProduct._id // Reference to original used product
    });
    
    console.log('Creating new refurbished product:', newProduct);
    
    await newProduct.save({ session });
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    console.log('Used product approved and added to products collection as refurbished');
    
    res.json({ 
      message: 'Used product approved and added to product listings as refurbished',
      usedProduct,
      newProduct 
    });
  } catch (error) {
    // If an error occurred, abort the transaction
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error approving used product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Deny a used product - removes from database
router.patch('/:id/deny', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    console.log(`Denying used product with ID: ${req.params.id}`);
    
    const usedProduct = await UsedProduct.findById(req.params.id).session(session);
    
    if (!usedProduct) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Used product not found' });
    }
    
    if (usedProduct.status !== 'pending') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: `This product is already ${usedProduct.status}. Can't deny.` 
      });
    }
    
    // Store the product details for response
    const productDetails = { ...usedProduct.toObject() };
    
    // Delete images associated with the product
    if (usedProduct.images && usedProduct.images.length > 0) {
      for (const imagePath of usedProduct.images) {
        try {
          // Make sure we're only deleting files from the uploads directory for security
          if (imagePath.includes('uploads')) {
            // Get absolute path
            const fullPath = path.resolve(imagePath);
            console.log(`Attempting to delete image: ${fullPath}`);
            
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
              console.log(`Successfully deleted image: ${fullPath}`);
            } else {
              console.log(`Image not found: ${fullPath}`);
            }
          } else {
            console.log(`Skipping deletion of image outside uploads directory: ${imagePath}`);
          }
        } catch (err) {
          console.error(`Error deleting image ${imagePath}:`, err);
          // Continue with other images even if one fails
        }
      }
    }
    
    // Delete the used product from database
    await UsedProduct.findByIdAndDelete(req.params.id).session(session);
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    console.log('Used product denied and removed from database');
    
    res.json({ 
      message: 'Used product has been denied and removed from database',
      usedProduct: productDetails
    });
  } catch (error) {
    // If an error occurred, abort the transaction
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error denying used product:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
