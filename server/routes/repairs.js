const router = require('express').Router();
const RepairBooking = require('../models/RepairBooking');

// Get all repair requests
router.get('/', async (req, res) => {
  try {
    const repairs = await RepairBooking.find().sort({ date: -1 });
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching repair requests', error: error.message });
  }
});

// Schedule a repair
router.post('/schedule', async (req, res) => {
  try {
    console.log('Received repair booking request:', req.body);
    const { name, contact, address, repairType, description, date, time } = req.body;
    
    // Validate required fields
    if (!name || !contact || !address || !repairType || !description || !date || !time) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        missingFields: Object.entries({ name, contact, address, repairType, description, date, time })
          .filter(([_, value]) => !value)
          .map(([key]) => key)
      });
    }
    
    // Create new booking
    const newBooking = new RepairBooking({
      name,
      contact,
      address,
      repairType,
      description,
      date: new Date(date),
      time
    });
    
    await newBooking.save();
    
    res.status(201).json({ 
      message: 'Repair service scheduled successfully! We will get back to you soon.', 
      booking: newBooking 
    });
  } catch (error) {
    console.error('Error scheduling repair:', error);
    res.status(400).json({ 
      message: 'Error scheduling repair', 
      error: error.message 
    });
  }
});

// Get a specific repair request
router.get('/:id', async (req, res) => {
  try {
    const repair = await RepairBooking.findById(req.params.id);
    if (!repair) {
      return res.status(404).json({ message: 'Repair request not found' });
    }
    res.json(repair);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching repair request', error: error.message });
  }
});

// Update repair status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate the status value
    if (!['pending', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const updatedRepair = await RepairBooking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!updatedRepair) {
      return res.status(404).json({ message: 'Repair request not found' });
    }
    
    res.json({ 
      message: 'Repair status updated successfully', 
      repair: updatedRepair 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating repair status', 
      error: error.message 
    });
  }
});

// Delete a repair booking
router.delete('/:id', async (req, res) => {
  try {
    const deletedRepair = await RepairBooking.findByIdAndDelete(req.params.id);
    
    if (!deletedRepair) {
      return res.status(404).json({ message: 'Repair booking not found' });
    }
    
    res.json({ 
      message: 'Repair booking deleted successfully',
      deletedId: req.params.id 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting repair booking', 
      error: error.message 
    });
  }
});

module.exports = router;