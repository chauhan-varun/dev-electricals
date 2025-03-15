const router = require('express').Router();
const ServiceBooking = require('../models/ServiceBooking');
const mongoose = require('mongoose');

// Define Service schema and model if it doesn't exist
let Service;
try {
  Service = mongoose.model('Service');
} catch (error) {
  const ServiceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: String, required: true },
    features: [{ type: String }],
    image: { type: String }
  });
  Service = mongoose.model('Service', ServiceSchema);
}

// Get all services (for client)
router.get('/', async (req, res) => {
  try {
    // Get service offerings from database
    const dbServices = await Service.find();
    
    // If there are no service offerings in the database, initialize the default services
    if (dbServices.length === 0) {
      // Initialize with default services
      const defaultServices = [
        {
          title: 'Home Wiring',
          description: 'Complete electrical wiring solutions for your home, including new installations and rewiring of existing systems.',
          price: 'From ₹299',
          features: [
            'Circuit installation and testing',
            'Electrical outlet installation',
            'Safety inspection and certification',
            'Emergency backup system setup'
          ],
          image: 'https://5.imimg.com/data5/ZZ/VS/HA/SELLER-2656676/house-wiring.png'
        },
        {
          title: 'Appliances Installation',
          description: 'Professional appliance installation for all electricals. Safe, efficient, and hassle-free service by experts. Get your appliances up and running in no time!',
          price: 'From ₹1,499',
          features: [
            'High-voltage system installation',
            'Industrial machinery wiring',
            'Power distribution setup',
            'Safety compliance verification'
          ],
          image: 'https://5.imimg.com/data5/SELLER/Default/2023/2/EZ/MM/GU/2952059/industrial-electrical-installation-work-service.jpg'
        },
        {
          title: 'Solar Panel Installation',
          description: 'Eco-friendly solar power solutions for residential and commercial properties.',
          price: 'From ₹4,999',
          features: [
            'Solar panel mounting and wiring',
            'Inverter installation',
            'Battery backup setup',
            'System monitoring installation'
          ],
          image: 'https://5.imimg.com/data5/SELLER/Default/2021/8/MW/TK/UY/26900875/solar-rooftop-power-project-1000x1000.jpeg'
        }
      ];
      
      // Save default services to database
      await Service.insertMany(defaultServices);
      
      // Return the default services
      return res.json(defaultServices);
    }
    
    res.json(dbServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Error fetching services', error: error.message });
  }
});

// Get service bookings (for admin)
router.get('/bookings', async (req, res) => {
  try {
    // Get service bookings
    const serviceBookings = await ServiceBooking.find();
    res.json(serviceBookings);
  } catch (error) {
    console.error('Error fetching service bookings:', error);
    res.status(500).json({ message: 'Error fetching service bookings', error: error.message });
  }
});

// Add a new service
router.post('/', async (req, res) => {
  try {
    const { title, description, price, features, image } = req.body;
    
    const newService = new Service({
      title,
      description,
      price,
      features,
      image
    });
    
    const savedService = await newService.save();
    res.status(201).json({ message: 'Service added successfully', service: savedService });
  } catch (error) {
    res.status(400).json({ message: 'Error adding service', error: error.message });
  }
});

// Book a service
router.post('/book', async (req, res) => {
  const { name, contact, address, serviceType, date, time } = req.body;
  try {
    const newBooking = new ServiceBooking({ name, contact, address, serviceType, date, time });
    await newBooking.save();
    res.status(201).json({ message: 'Service booked successfully! We will get back to you soon.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a service booking
router.delete('/book/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBooking = await ServiceBooking.findByIdAndDelete(id);
    
    if (!deletedBooking) {
      return res.status(404).json({ message: 'Service booking not found' });
    }
    
    res.json({ message: 'Service booking deleted successfully', deletedId: id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service booking', error: error.message });
  }
});

module.exports = router;