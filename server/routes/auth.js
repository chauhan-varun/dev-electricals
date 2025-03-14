const router = require('express').Router();
const User = require('../models/User'); // Assuming you have a User model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Get all users (protected route for admin)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

// Google OAuth client - with no audience check in development
const isDevelopment = process.env.NODE_ENV !== 'production';
const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET
});

// Sign Up
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  console.log('Signup request received for:', email);
  
  // Input validation
  if (!name || !email || !password) {
    console.log('Missing required fields');
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  
  if (password.length < 6) {
    console.log('Password too short');
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    console.log('Creating new user:', email);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name, 
      email, 
      password: hashedPassword,
      authProvider: 'local'
    });
    
    // Save the new user
    await newUser.save();
    console.log('User created successfully:', email);
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    
    // Check for MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: validationErrors.join(', ') });
    }
    
    // Check for MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    res.status(500).json({ message: 'Error creating user. Please try again.' });
  }
});

// Sign In
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Incorrect credentials' });

    // If user was created with Google, don't allow password login
    if (user.authProvider === 'google' && !user.password) {
      return res.status(401).json({ message: 'Please sign in with Google' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'develectricals_secret', { expiresIn: '1h' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        profilePicture: user.profilePicture 
      } 
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Error signing in. Please try again.' });
  }
});

// Google Authentication - works with both Google One Tap and OAuth2 tokens
router.post('/google', async (req, res) => {
  const { token } = req.body;
  
  try {
    let userData;
    
    // Handle development mode with mock token
    if (isDevelopment && token === 'mock-token-for-development') {
      userData = {
        sub: 'google-user-123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://ui-avatars.com/api/?name=Test+User&background=0D8ABC&color=fff'
      };
    } else {
      // Try to verify as ID token first (Google One Tap)
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID
        });
        userData = ticket.getPayload();
      } catch (error) {
        // If not an ID token, try as access token (OAuth2)
        try {
          const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
          });
          userData = response.data;
        } catch (tokenError) {
          console.error('Failed to verify token:', tokenError);
          return res.status(401).json({ message: 'Invalid token' });
        }
      }
    }
    
    // Extract user data
    const { sub: googleId, email, name, picture: profilePicture } = userData;
    
    // Find existing user or create new one
    let user = await User.findOne({ googleId });
    
    if (!user) {
      // Check if user exists with this email
      user = await User.findOne({ email });
      
      if (user) {
        // Update existing user with Google info
        user.googleId = googleId;
        user.authProvider = 'google';
        if (!user.profilePicture) {
          user.profilePicture = profilePicture;
        }
      } else {
        // Create new user
        user = new User({
          name,
          email,
          googleId,
          profilePicture,
          authProvider: 'google'
        });
      }
      
      await user.save();
    }
    
    // Generate JWT token
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'develectricals_secret', { expiresIn: '1h' });
    
    res.json({ 
      token: jwtToken,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        profilePicture: user.profilePicture 
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Error with Google authentication. Please try again.' });
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  // Extract the token from "Bearer <token>"
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'develectricals_secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get current user (protected route)
router.get('/user', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Delete a user (admin route)
router.delete('/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: 'User deleted successfully',
      deletedId: req.params.id 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting user', 
      error: error.message 
    });
  }
});

module.exports = router;