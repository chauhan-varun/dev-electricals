const router = require('express').Router();
const Product = require('../models/Product');

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

// Create a new product
router.post('/', async (req, res) => {
  try {
    const { title, description, category, price, imageUrl, stock, featured } = req.body;
    
    const newProduct = new Product({
      title,
      description,
      category,
      price,
      imageUrl,
      stock: stock || 0,
      featured: featured || false
    });
    
    const savedProduct = await newProduct.save();
    res.status(201).json({ 
      message: 'Product created successfully', 
      product: savedProduct 
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error: error.message });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  try {
    const { title, description, category, price, imageUrl, stock, featured } = req.body;
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        price,
        imageUrl,
        stock,
        featured
      },
      { new: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ 
      message: 'Product updated successfully', 
      product: updatedProduct 
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ 
      message: 'Product deleted successfully', 
      deletedId: req.params.id 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router;