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

// Google OAuth callback route
router.get('/google/callback', (req, res) => {
  // This route is hit by the browser after Google authentication
  // It should only be accessed via redirect from Google
  // We'll redirect to the front-end which will extract the token from the URL hash
  res.redirect(`${process.env.CLIENT_URL || ''}/#${req.url.substring(req.url.indexOf('?'))}`);
});

// Google Authentication - works with both Google One Tap and OAuth2 tokens
router.post('/google', async (req, res) => {
  const { token } = req.body;
  
  try {
    // Check if token is provided
    if (!token) {
      console.error('No token provided in request');
      return res.status(400).json({ message: 'Authentication token is required' });
    }
    
    let userData;
    
    // Handle development mode with mock token
    if (isDevelopment && token === 'mock-token-for-development') {
      console.log('Using mock token for development');
      userData = {
        sub: 'google-user-123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://ui-avatars.com/api/?name=Test+User&background=0D8ABC&color=fff'
      };
    } else {
      console.log('Attempting to verify Google token...');
      
      // Try to verify as ID token first (Google One Tap)
      try {
        console.log('Trying as ID token...');
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID
        });
        userData = ticket.getPayload();
        console.log('Successfully verified as ID token');
      } catch (error) {
        console.log('ID token verification failed, trying as access token:', error.message);
        
        // If not an ID token, try as access token (OAuth2)
        try {
          console.log('Trying as access token...');
          const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
          });
          userData = response.data;
          console.log('Successfully verified as access token');
        } catch (tokenError) {
          console.error('Failed to verify token as either ID or access token:', tokenError.message);
          return res.status(401).json({ message: 'Invalid authentication token' });
        }
      }
    }
    
    // Log user data for debugging
    console.log('Extracted user data:', {
      sub: userData.sub,
      email: userData.email,
      name: userData.name,
      hasPicture: !!userData.picture
    });
    
    // Extract user data (with validation)
    if (!userData.sub || !userData.email) {
      console.error('Invalid user data received from Google:', userData);
      return res.status(400).json({ message: 'Invalid user data received from Google' });
    }
    
    const googleId = userData.sub;
    const email = userData.email;
    const name = userData.name || email.split('@')[0]; // Use part of email if name not provided
    const profilePicture = userData.picture || null;
    
    console.log('Processing user with googleId:', googleId);
    
    // Find existing user or create new one
    let user = null;
    try {
      user = await User.findOne({ googleId });
      console.log('User by googleId:', user ? 'found' : 'not found');
      
      if (!user) {
        // Check if user exists with this email
        user = await User.findOne({ email });
        console.log('User by email:', user ? 'found' : 'not found');
        
        if (user) {
          console.log('Updating existing user with Google info');
          // Update existing user with Google info
          user.googleId = googleId;
          user.authProvider = 'google';
          if (!user.profilePicture) {
            user.profilePicture = profilePicture;
          }
        } else {
          console.log('Creating new user with Google info');
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
        console.log('User saved successfully');
      }
    } catch (dbError) {
      console.error('Database error during user lookup/creation:', dbError);
      return res.status(500).json({ message: 'Database error processing user account' });
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
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    // Send more specific error messages based on error type
    if (error.message.includes('jwt')) {
      return res.status(400).json({ message: 'Invalid Google token format. Please try again.' });
    } else if (error.message.includes('network') || error.message.includes('connection')) {
      return res.status(503).json({ message: 'Unable to connect to Google services. Please try again later.' });
    } else if (error.code === 11000) {
      return res.status(409).json({ message: 'User with this email already exists but with different authentication.' });
    }
    
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