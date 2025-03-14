const router = require('express').Router();
const UsedProduct = require('../models/UsedProduct');
const Product = require('../models/Product');
const mongoose = require('mongoose');

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

// Approve a used product
router.patch('/:id/approve', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
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
    
    // Update the used product status
    usedProduct.status = 'approved';
    await usedProduct.save({ session });
    
    // Create a new product in the products collection
    const newProduct = new Product({
      name: usedProduct.title,
      description: usedProduct.description,
      price: usedProduct.askingPrice || 0, // Use asking price or set to 0 if not provided
      category: usedProduct.category,
      brand: usedProduct.brand || 'Unknown',
      imageUrls: usedProduct.images,
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
    
    await newProduct.save({ session });
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    res.json({ 
      message: 'Used product approved and added to product listings',
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

// Deny a used product
router.patch('/:id/deny', async (req, res) => {
  try {
    const usedProduct = await UsedProduct.findById(req.params.id);
    
    if (!usedProduct) {
      return res.status(404).json({ message: 'Used product not found' });
    }
    
    if (usedProduct.status !== 'pending') {
      return res.status(400).json({ 
        message: `This product is already ${usedProduct.status}. Can't deny.` 
      });
    }
    
    // Update the used product status
    usedProduct.status = 'rejected';
    if (req.body.adminNotes) {
      usedProduct.adminNotes = req.body.adminNotes;
    }
    
    await usedProduct.save();
    
    res.json({ message: 'Used product has been denied', usedProduct });
  } catch (error) {
    console.error('Error denying used product:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
