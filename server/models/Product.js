const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  // Changed from single imageUrl to array of imageUrls for multiple images
  imageUrls: [{ 
    type: String, 
    required: true,
    get: function(value) {
      // Handle relative paths by prepending server URL when needed
      if (value && !value.startsWith('http')) {
        return `${process.env.SERVER_URL || 'http://localhost:5000'}/${value}`;
      }
      return value;
    }
  }],
  stock: { 
    type: Number, 
    default: 0 
  },
  featured: { 
    type: Boolean, 
    default: false 
  },
  // Added fields for refurbished products
  isRefurbished: {
    type: Boolean,
    default: false
  },
  condition: {
    type: String,
    enum: ['Like New', 'Good', 'Fair', 'Poor'],
    required: function() { return this.isRefurbished; }
  },
  // Store original seller information
  sellerInfo: {
    name: { type: String },
    email: { type: String },
    phone: { type: String }
  },
  // Reference to original used product
  originalUsedProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UsedProduct'
  },
  brand: {
    type: String,
    default: 'Unknown'
  }
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model('Product', productSchema);
