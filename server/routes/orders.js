const router = require('express').Router();
const Order = require('../models/Order');

// Get all orders (admin only)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user orders (requires authentication)
router.get('/user', async (req, res) => {
  try {
    // This will be updated to use authentication later
    const userId = req.query.userId || req.user?._id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  try {
    const {
      customer,
      items,
      paymentMethod,
      subtotal,
      shipping,
      tax,
      total,
      status,
      userId
    } = req.body;

    console.log('Received order data:', req.body);

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    const newOrder = new Order({
      customer,
      items,
      paymentMethod,
      subtotal,
      shipping,
      tax,
      total,
      status: status || 'Pending',
      userId
    });

    const savedOrder = await newOrder.save();
    console.log('Order saved successfully:', savedOrder._id);
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;