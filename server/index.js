const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();

// Import passport configuration
require('./config/passport');

const app = express();

// Middleware 
// Specific CORS configuration to fix preflight and credential issues
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CLIENT_URL]
    : ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-auth-token'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Handle preflight OPTIONS requests explicitly
app.options('*', cors(corsOptions));

// Apply CORS to all routes
app.use(cors(corsOptions));
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.error('Please ensure MongoDB is running and connection string is correct');
    process.exit(1); // Exit if cannot connect to database
  });

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/services', require('./routes/services'));
app.use('/api/repairs', require('./routes/repairs'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/sell', require('./routes/sell'));
// Make sure the auth routes have CORS enabled
app.use('/auth', cors(corsOptions), require('./routes/auth')); // Changed from /api/auth to /auth to match client expectations

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});