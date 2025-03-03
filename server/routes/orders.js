const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({ message: 'Orders route' });
});

module.exports = router; 