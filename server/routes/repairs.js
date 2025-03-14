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
  const { name, contact, address, repairType, date, time } = req.body;
  try {
    const newBooking = new RepairBooking({ name, contact, address, repairType, date, time });
    await newBooking.save();
    res.status(201).json({ message: 'Service scheduled successfully!', booking: newBooking });
  } catch (error) {
    res.status(400).json({ message: 'Error scheduling repair', error: error.message });
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