const express = require('express');
const passport = require("passport");
const router = express.Router();

// Medileware
const { authorize } = require('../middlewares/authentication');


// Controller
const cartController = require('../controllers/cartController');

// Add to Cart
router.post('/addCart', passport.authenticate("jwt", { session: false }), authorize(["user"]), cartController.addCart);

// View Carts
router.get('/viewCart', passport.authenticate("jwt", { session: false }), authorize(["user"]), cartController.viewCart);

router.post('/removeCart', passport.authenticate('jwt', { session: false }),);

module.exports = router;