const express = require('express');
const router = express.Router();
const multer = require("multer"); // Import multer
const upload = multer();

// Medileware
const  {authorize}  = require('../middlewares/authentication');

// Controller
const cartController = require('../controllers/cartController');

// Add to Cart
router.post('/addCart', authorize(['user']) ,upload.none(), cartController.addCart);

// View Carts
router.get('/viewCart', authorize(["user"]), cartController.viewCart);

// Remove Cart
router.delete('/removeCart/:productId', authorize(["user"]), cartController.removeCart);

module.exports = router;