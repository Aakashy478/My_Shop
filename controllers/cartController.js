const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

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
                items: [{ productId, quantity: 1 }]
            });
        } else {
            //Check product is already exist
            const existItem = cart.items.find(item => item.productId.toString() === productId.toString())

            if (existItem) {
                existItem.quantity += 1; // Increase quantity;
            } else {
                cart.items.push({ productId, quantity: 1 });
            }
        }
        
        // Save the cart in database
        await cart.save();

        res.status(201).json({message: "Cart added successfully!"})
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
        const cart = await Cart.findOne({ userId })
        // IF cart does not exist or is empty
        if (!cart) {
            return res.status(404).json({ message: "Your cart is empty" });
        }

        // Get all Products 
        const products = await Product.find();

        // Get Cart including its details
        const viewCart = cart.items.reduce((acc, items) => {
            const product = products.find(product => product._id.toString() === items.productId.toString())
            const cart = {
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.image.replace('public/images/','/'),
                quantity: items.quantity
            }
            acc.push(cart);
            return acc;
        }, [])

        res.render('cart/viewCart', { viewCart });
        // res.status(201).json({ data: viewCart });
    } catch (error) {
        console.log("Error in fetching cart:- ", error.message);
        res.status(500).json({ message: "Somthing went wrong. Please try again later" })
    }
}

// const removeCart = async (req, res) => {
//     try {
//         console.log(res.body);
//         res.status(201).
        
//     } catch (error) {
//         console.log("Error in Remove Cart :- ", error.message);
//         res.status(500).json({ message: "Something went wrong.please try again later" });
//     }
// }

module.exports = { addCart, viewCart };