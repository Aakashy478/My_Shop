const express = require('express');
const passport = require("passport");
const Product = require('../models/productModel');

const router = express.Router();

// Middleware Imports
const { upload } = require('../middlewares/uploadImage');
const { validate } = require('express-validation');
const  {authorize}  = require('../middlewares/authentication');
const { productRegister } = require('../validations/Product/productRegister');
const { productEdit } = require('../validations/Product/productEdit');

// Controller Imports
const productController = require('../controllers/productController');

//=========================== GET Routes =================================

// Render Add Product Page (Only Merchants)
router.get(
    '/addProduct', authorize(['merchant']), (req, res) => {
        try {
            res.render('product/addProduct');
        } catch (error) {
            console.error("Error fetching product:", error.message);
            res.status(500).send("Something went wrong");
        }
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
router.post('/addProduct', upload.single('image'), authorize(["merchant"]), validate(productRegister), productController.productRegister);

// List All Products (Authenticated Users)
router.get('/viewProducts', authorize(["merchant"]), productController.viewProducts);

// Get Product by ID
router.get('/:id', authorize(["merchant"]) ,productController.getProduct);

// Update Product Details
router.post('/editProduct/:id', upload.single("image"), authorize(["merchant"]) ,validate(productEdit), productController.editProduct);

module.exports = router;
