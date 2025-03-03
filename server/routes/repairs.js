const router = require('express').Router();
const RepairBooking = require('../models/RepairBooking'); // Create a RepairBooking model

router.get('/', (req, res) => {
  res.json({ message: 'Repairs route' });
});

// Schedule a repair
router.post('/schedule', async (req, res) => {
  const { name, contact, address, repairType, date, time } = req.body;
  try {
    const newBooking = new RepairBooking({ name, contact, address, repairType, date, time });
    await newBooking.save();
    res.status(201).json({ message: 'Service scheduled successfully!' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 