const router = require('express').Router();
const ServiceBooking = require('../models/ServiceBooking'); // Create a ServiceBooking model

router.get('/', (req, res) => {
  res.json({ message: 'Services route' });
});

// Book a service
router.post('/book', async (req, res) => {
  const { name, contact, address, serviceType, date, time } = req.body;
  try {
    const newBooking = new ServiceBooking({ name, contact, address, serviceType, date, time });
    await newBooking.save();
    res.status(201).json({ message: 'Service booked successfully!' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 