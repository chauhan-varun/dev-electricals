const mongoose = require('mongoose');

const usedProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['New', 'Excellent', 'Good', 'Fair']
  },
  images: [{
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
  askingPrice: {
    type: Number,
    required: false // Optional if user wants a quote
  },
  requestQuote: {
    type: Boolean,
    default: false
  },
  seller: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { getters: true }, // Enable getters when converting to JSON
  toObject: { getters: true } // Enable getters when converting to objects
});

module.exports = mongoose.model('UsedProduct', usedProductSchema); 