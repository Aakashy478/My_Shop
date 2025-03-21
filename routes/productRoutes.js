const express = require('express');
const passport = require("passport");
const Product = require('../models/productModel');

const router = express.Router();

// Middleware Imports
const { upload } = require('../middlewares/uploadImage');
const { validate } = require('express-validation');
const { productRegister } = require('../validations/products');
const { authorize } = require('../middlewares/authentication');

// Controller Imports
const productController = require('../controllers/productController');

// ------------------- GET Routes -------------------

// Render Product Management Page (Authenticated Users)
router.get(
    '/productMenagement',
    passport.authenticate("jwt", { session: false }), authorize(["merchant"]),
    (req, res) => {
        res.render('product/productMenagement');
    }
);

// Render Add Product Page (Only Merchants)
router.get(
    '/addProduct',
    passport.authenticate("jwt", { session: false }),
    authorize(['merchant']),
    (req, res) => {
        res.render('product/addProduct');
    }
);

// Render Edit Product Page
router.get('/editProduct/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).send("Product not found");
        }

        res.render('product/editProduct', { product });
    } catch (error) {
        console.error("Error fetching product:", error.message);
        res.status(500).send("Something went wrong");
    }
});

// ------------------- POST Routes -------------------

// Register a New Product (Only Merchants)
router.post(
    '/addProduct',
    upload.single('image'),
    passport.authenticate("jwt", { session: false }),
    validate(productRegister),
    productController.productRegister
);

// List All Products (Authenticated Users)
router.get(
    '/viewProducts',
    passport.authenticate("jwt", { session: false }),authorize(["merchant"]),
    productController.listAllProducts
);

// Get Product by ID
router.get('/:id', productController.getProduct);

// Update Product Details
router.post('/editProduct/:id', upload.single("image"), productController.editProduct);

module.exports = router;
