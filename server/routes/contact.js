const router = require('express').Router();
const Contact = require('../models/Contact');

// Submit a contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        message: 'All fields are required' 
      });
    }

    // Create new contact message
    const newContact = new Contact({
      name,
      email,
      subject,
      message
    });
    
    await newContact.save();
    
    res.status(201).json({ 
      message: 'Message sent successfully! We will get back to you soon.',
      contact: newContact 
    });
  } catch (error) {
    console.error('Error submitting contact message:', error);
    res.status(500).json({ 
      message: 'Failed to send message. Please try again.',
      error: error.message 
    });
  }
});

// Get all contact messages (admin only)
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching contact messages', 
      error: error.message 
    });
  }
});

// Get a specific contact message by ID (admin only)
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching contact message', 
      error: error.message 
    });
  }
});

// Update contact message status (admin only)
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['unread', 'read', 'responded'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!updatedContact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }
    
    res.json({ 
      message: 'Contact status updated successfully', 
      contact: updatedContact 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating contact status', 
      error: error.message 
    });
  }
});

// Delete a contact message (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!deletedContact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }
    
    res.json({ 
      message: 'Contact message deleted successfully',
      deletedId: req.params.id 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting contact message', 
      error: error.message 
    });
  }
});

module.exports = router;
