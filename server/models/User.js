const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password is required only if not using Google auth
    },
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
  },
  profilePicture: {
    type: String,
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);