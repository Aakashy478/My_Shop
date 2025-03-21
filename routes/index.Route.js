const router = require('express').Router();

// import route files
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');

// Use Routes
router.use('/user', authRoutes);
router.use('/product', productRoutes);
router.use('/cart', cartRoutes);

module.exports = router;