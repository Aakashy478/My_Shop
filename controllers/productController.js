const Product = require('../models/productModel');
const User = require('../models/userModel');

// Register Products
const productRegister = async (req, res) => {
    try {
        const { name, price } = req.body;

        // In case of User is delete or isDeleted: true
        const user = await User.findOne({ _id: req.user.id, isDeleted: false });

        if (!user) {
            return res.status(404).json({
                message: "User does not exist or has been deleted"
            });
        }

        const image = req.file ? req.file.path : '';

        // Check of product already exists
        const existUser = await Product.findOne({ name });
        if (existUser) {
            return res.status(400).json({
                message: "Product already exists."
            })
        }

        // Create new product
        const newProduct = new Product({
            name,
            price,
            image,
            createdBy: req.user.id,
            isDeleted: false,
            deletedAt: null
        })

        // Save the product to the database
        await Product.create(newProduct);

        res.status(201).json({ message: "Product Added Successfully" });
    } catch (error) {
        console.log(error);
        console.error("Error in productRegister:", error.message);
        res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};

// List All Products
const viewProducts = async (req, res) => {
    try {
        // In case of User is delete or isDeleted: true
        const user = await User.findOne({ _id: req.user.id, isDeleted: false });

        if (!user) {
            return res.status(404).json({
                message: "User does not exist or has been deleted"
            });
        }

        // Fetch all produccts that are not deleted
        let products = await Product.find({ createdBy: user._id });

        // Products are available 
        if (products.length === 0) {
            return res.render('product/viewProducts', { products: [] });
        }

        products = products.map(product => {
            product.image = product.image;
            return product;
        })

        res.render('product/viewProducts', { products });
    } catch (error) {
        console.log("Error in listing  products:- ", error.message);
        res.status(500).json({
            message: "Something went wrong. Please try again later"
        })
    }
}

// View Product Details
const getProduct = async (req, res) => {
    try {
        const id = req.params.id;

        // Check if ID is provided
        if (!id) {
            return res.status(400).json({ message: "Product ID is requiews" })
        }

        //  Get the User data using id
        const user = await User.findOne({ _id: req.user.id, isDeleted: false });

        if (!user) {
            return res.status(404).json({
                message: "User does not exist or has been deleted"
            });
        }

        // Get the Product using by ID
        const product = await Product.findOne({ _id: id });

        // If product not found
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Modify product details included merchant information
        const modifyProduct = [product].map(product => {
            return {
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                merchantDetails: {
                    id: user._id,
                    fullname: user.firstName + " " + user.lastName,
                    profileImage: user.profileImage
                }
            }
        })

        // Send response with product details
        res.status(201).json({
            message: "Product retrieved successfully",
            product: modifyProduct
        })
    } catch (error) {
        console.log("Error in fetching product details:- ", error.message);
        res.status(500).json({ message: "Something went wrong. Please try again later" })
    }
}

// Update Product
const editProduct = async (req, res) => {
    try {
        const productId = req.params.productId; // Get product ID from request parameter
        const { name, price } = req.body; // Get updated data from request body

        // Get the Product using ID
        const product = await Product.findOne({ _id: productId });
        console.log(product);
        

        // Check product is exist
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Update product name
        product.name = name || product.name;

        // Update product price
        product.price = price || product.price;

        // Check if an image is uploaded
        product.image = req.file ? req.file.path : product.image

        // Save the updated product
        await product.save();

        res.status(200).json({message:"Product updated successfully"})
    } catch (error) {
        console.log("Error in updating product:- ", error.message);
        res.status(500).json({ message: "Something went wrong. Please try again later" })
    }
}

// pending
const deleteProduct = async (req, res) => {
    try {
        console.log("Inside delete");
        // const {id} = req.body;
        // // const { id } = req.params;


        // // Find the product by ID and delete it
        // const deletedProduct = await Product.findByIdAndDelete(id);

        // if (!deletedProduct) {
        //     return res.status(404).json({ message: "Product not found" });
        // }

        res.json({ message: "Product deleted successfully!" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = { productRegister, viewProducts, getProduct, editProduct, deleteProduct };