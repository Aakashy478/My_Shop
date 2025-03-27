const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const moment = require('moment');

const addCart = async (req, res) => {
    try {
        const productId = req.body.productId;
        const userId = req.user.id;

        // Check if product exists
        const product = await Product.findOne({ _id: productId });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Get cart using userId
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // Create new cart
            cart = new Cart({
                userId,
                items: [{ productId, quantity: 1}]
            });
        } else {
            //Check product is already exist
            const existItem = cart.items.find(item => item.productId.toString() === productId.toString())

            if (existItem) {
                existItem.quantity += 1; // Increase quantity;
                existItem.addedTime = moment().format('YYYY-MM-DD HH:mm:ss');
            } else {
                cart.items.push({ productId, quantity: 1 });
            }
        }

        // Save the cart in database
        await cart.save();

        res.status(201).json({ message: "Cart added successfully!" })
    } catch (error) {
        console.log("Error in add to cart:- ", error.message);
        res.status(500).json({ message: "Something went wrong. Please try again later" })
    }
}

// View Cart
const viewCart = async (req, res) => {
    try {
        // Get userId
        const userId = req.user.id;

        // Find the cart
        const cart = await Cart.findOne({ userId });

        // If cart does not exist or is empty
        if (!cart || cart.items.length === 0) {
            return res.render('cart/viewCart', { viewCart: [] });
        }

        // Get all Products 
        const products = await Product.find();

        // Process cart details
        const viewCart = cart.items.map(item => {
            const product = products.find(product => product._id.toString() === item.productId.toString());
            return {
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: item.quantity,
                addedTime: item.addedTime
            };
        });

        // res.status(200).json({ viewCart });
        res.render('cart/viewCart', { viewCart });
    } catch (error) {
        console.log("Error in fetching cart:", error.message);
        res.status(500).json({ message: "Something went wrong. Please try again later" });
    }
};


const removeCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const updateCart = await Cart.updateOne(
            { userId },
            { $pull: { items: { productId: productId } } }
        );


        if (updateCart.modifiedCount === 0) {
            return res.status(404).json({message:"Product not found in cart."})
        }

        res.status(200).json({ message: "Item removed successfully" });
    } catch (error) {
        console.log("Error in Remove Cart :- ", error.message);
        res.status(500).json({ message: "Something went wrong.please try again later" });
    }
}


module.exports = { addCart, viewCart, removeCart };