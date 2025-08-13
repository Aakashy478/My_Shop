const express = require('express');
const router = express.Router();
const multer = require("multer"); // Import multer
const upload = multer();

// Medileware
const { authorize } = require('../middlewares/authentication');
const {validate} = require('express-validation')

// Controller
const cartController = require('../controllers/cartController');
const { addCartValidatinon } = require('../validations/Cart/addCart');

// Add to Cart
router.post('/addCart', authorize(['user']) ,upload.none(), validate(addCartValidatinon),cartController.addCart);

// View Carts
router.get('/viewCart', authorize(["user"]), cartController.viewCart);

// Remove Cart
router.delete('/removeCart/:productId', authorize(["user"]), cartController.removeCart);

module.exports = router;