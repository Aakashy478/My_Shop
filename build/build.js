/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 20:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const User = __webpack_require__(709);
const { generateToken } = __webpack_require__(626)
const { comparePassword } = __webpack_require__(612);
const { encrypt, decrypt } = __webpack_require__(160);


// Register users
const authRegister = async (req, res, next) => {
    try {
        // Extract data user data from req body
        const { firstName, lastName, email, password, role } = req.body;

        let profileImage = req.file ? req.file.path : '';

        // check if the user already exists 
        const existingUser = await User.findOne({ email: encrypt(email) })

        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered. Pleas log in.' })
        }

        // Create a new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            profileImage: profileImage,
            role,
            isDeleted: false,
            deletedAt: null
        })
        await User.create(newUser);

        res.status(201).json({ message: "Register Successfully" });
    } catch (error) {
        console.log('Error in authRegister:- ', error);
        res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
}

const authLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // check user exists
        const user = await User.findOne({ email: encrypt(email), isDeleted: false });

        if (!user) {
            return res.status(400).json({ message: "User not found. Please register first." });
        }

        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invailid creadentials. Please try again."
            });
        }

        // Generate token
        generateToken(user, res);
        req.user = user;

        res.status(201).json({ message: "Login Successfully!" });
    } catch (error) {
        console.log('Error in Login:- ', error.message);
        res.status(500).json({ message: "Failed to log in. Please try again later." })
    }
}

// Views Profile
const authProfile = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch the user profile from the database
        const userProfile = await User.findOne({ _id: user.id, isDeleted: false })

        if (!userProfile) {
            return res.status(404).json({ message: "User profile not found" });
        }

        // Prepare user profile data
        const profile = {
            // profileImage: userProfile.profileImage.replace('public/images/', '/'),
            profileImage: userProfile.profileImage,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            email: decrypt(userProfile.email), // Decrypt email if necessary
            role: userProfile.role,
        };

        res.render('auth/profile', { user: profile });
    } catch (error) {
        console.log("Error in fetching Profile:- ", error.message);
        res.status(500).json({ message: "Error in fetching the profile" });
    }
}

// Update Auth details/Info
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        // console.log("userId :-", userId);
        const { firstName, lastName, password } = req.body;

        // Check if User exist
        const user = await User.findOne({ _id: userId, isDeleted: false });
        // console.log(user);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.firstName = firstName || user.firstName;  // Update firstName

        user.lastName = lastName || user.lastName;  // Update lastName

        user.password = password || user.password;   // Update password

        user.profileImage = req.file ? req.file.path : user.profileImage;  // Update profileImage

        // Save updated User in database
        await user.save();

        res.status(201).json({ message: "Profile Update Successfully" })
    } catch (error) {
        console.log("Error in update auth Info :- ", error.message);
        res.status(500).json({ message: "Somthing went wrong. Please try again later." });
    }
}


// Forgot Password
const forgot_password = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: encrypt(email), isDeleted: false });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Generate 4 digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // Store OTP in the database
        user.otp = otp;
        await user.save();

        res.status(201).json({
            message: "OTP sent successfully! " + "\n\n" + "OTP : " + otp
        })
    } catch (error) {
        console.log('Error in forgot_password:- ', error.message);
        res.status(500).json({ message: "Somthing went wrong. Please try again later." })
    }
}

// Reset Password
const reset_password = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // check if user exists
        const user = await User.findOne({ email: encrypt(email), isDeleted: false });

        if (!user) {
            return res.status(400).json({ message: "Invailid email" });
        }

        // Check if OTP is valid
        if (parseInt(user.otp) !== parseInt(otp)) {
            return res.status(400).json({ message: "Invalid  OTP!" });
        }

        // Reset password
        user.password = newPassword;
        user.otp = null; // Clear OTP after use
        await user.save();

        res.status(201).json({ message: "Reset Password successfull!" });
    } catch (error) {
        console.log('Error in forgot_password:- ', error.message);
        res.status(500).json({ message: "Somthing went wrong. Please try again later." })
    }
}

// Logout
const logout = async (req, res) => {
    try {
        // Clear the authentication token from cookies
        res.clearCookie("authToken");

        // Redirect to the login page or send a response
        res.redirect("/home");
    } catch (error) {
        console.error("Logout Error:", error.message);
        res.status(500).json({ message: "Something went wrong. Try again later." });
    }
};


module.exports = { authRegister, authLogin, authProfile, updateProfile, forgot_password, reset_password, logout };

/***/ }),

/***/ 30:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { Joi } = __webpack_require__(572);

const resetPasswordValidate = {
    body: Joi.object({
        email: Joi.string().trim().email().required().messages({
            "string.empty": "Email cannot be empty",
            "string.email": "Invalid email format",
            "any.required": "Email is required"
        }),

        otp: Joi.number().integer().min(1000).max(9999).required().messages({
            "number.base": "OTP must be a number",
            "number.min": "OTP must be a 4-digit number",
            "number.max": "OTP must be a 4-digit number",
            "any.required": "OTP is required"
        }),

        newPassword: Joi.string().min(8).max(20).required().messages({
            "string.empty": "Password cannot be empty",
            "string.min": "Password must be at least 8 characters long",
            "string.max": "Password cannot exceed 20 characters",
            "any.required": "Password is required"
        })
    })
};

module.exports = resetPasswordValidate;


/***/ }),

/***/ 37:
/***/ ((module) => {

"use strict";
module.exports = require("mongoose");

/***/ }),

/***/ 96:
/***/ ((module) => {

"use strict";
module.exports = require("morgan");

/***/ }),

/***/ 160:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const crypto = __webpack_require__(982);

const ENC_SECRET_KEY = process.env.ENC_SECRET_KEY;
const ENC_IV = process.env.ENC_IV;
const ALGORITHM = process.env.ALGORITHM;

function encrypt(text) {
    const iv = Buffer.from(ENC_IV, "hex");
    const key = Buffer.from(ENC_SECRET_KEY, "hex");
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let cipherText = cipher.update(text, "utf8", "hex");
    cipherText += cipher.final("hex");

    return `${iv.toString("hex")}:${cipherText}`;
}

function decrypt(text) {
    const iv = Buffer.from(text.split(":")[0], "hex");
    const key = Buffer.from(ENC_SECRET_KEY, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(text.split(":")[1], "hex", "utf-8");
    decrypted += decipher.final("utf8");

    return decrypted;
}

module.exports = { encrypt, decrypt };


/***/ }),

/***/ 173:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const express = __webpack_require__(252);
const router = express.Router();
const User = __webpack_require__(709);

// Middlewares
const { upload } = __webpack_require__(442);
const  {authorize}  = __webpack_require__(626);
const { validate } = __webpack_require__(572);

// Controllers
const authController = __webpack_require__(20);

// Validations
const authValidation = __webpack_require__(989);
const loginValidate = __webpack_require__(751);
const updateProfileValidate = __webpack_require__(672);
const forgotPasswordValidate = __webpack_require__(620);
const resetPasswordValidate = __webpack_require__(30);

// ===================== GET Methods =====================

// Render Register Page
router.get('/register', (req, res) => {
    res.render('auth/register');
});

// Render Login Page
router.get('/login', (req, res) => {
    res.render('auth/login');
});

// Render Update Profile Page (Protected)
router.get('/updateProfile', authorize([]), async (req, res) => {
    let user = await User.findById(req.user.id);
    user.profileImage = user.profileImage.replace('public/images/', '/');
    
    res.render('auth/update', { user });
});

// Render Forgot Password Page
router.get('/forgotPassword', (req, res) => {
    res.render('auth/forgotPassword');
});

// Render Reset Password Page
router.get('/resetPassword', (req, res) => {
    res.render('auth/resetPassword');
});

router.get('/payment', (req, res) => {
    const product = { name: "Smartphone", price: 14999 };
    res.render('payment', { product });
});


// ===================== POST Methods =====================

// Register New User
router.post('/register', upload.single('profileImage'), validate(authValidation),  authController.authRegister);

// Login User
router.post('/login', validate(loginValidate), authController.authLogin);

// Get User Profile (Protected)
router.get('/profile', authorize([]), authController.authProfile);

// Update Profile (Protected)
router.put('/updateProfile', authorize([]), upload.single("profileImage"), validate(updateProfileValidate),  authController.updateProfile);

// Forgot Password
router.post('/forgotPassword',validate(forgotPasswordValidate), authController.forgot_password);

// Reset Password
router.post('/resetPassword', validate(resetPasswordValidate), authController.reset_password);

// Logout User
router.post('/logout', authController.logout);

module.exports = router;


/***/ }),

/***/ 252:
/***/ ((module) => {

"use strict";
module.exports = require("express");

/***/ }),

/***/ 268:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Cart = __webpack_require__(398);
const Product = __webpack_require__(937);
const moment = __webpack_require__(716);

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

/***/ }),

/***/ 278:
/***/ ((module) => {

"use strict";
module.exports = require("passport");

/***/ }),

/***/ 287:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Product = __webpack_require__(937);
const User = __webpack_require__(709);

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
        });

        console.log("product :-", products)

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

        res.status(200).json({ message: "Product updated successfully" })
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

/***/ }),

/***/ 320:
/***/ ((module) => {

"use strict";
module.exports = require("swagger-ui-express");

/***/ }),

/***/ 322:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

const { Joi } = __webpack_require__(572);

exports.productEdit = {
    body: Joi.object({
        productId: Joi.string().trim().required().messages({
            "string.empty": "Product ID cannot be empty",
            "any.required": "Product ID is required"
        }),
        name: Joi.string().trim().optional().allow("").messages({
            "string.empty": "Name cannot be empty"
        }),
        price: Joi.number().positive().optional().allow("").messages({
            "number.base": "Price must be a valid number",
            "number.positive": "Price must be greater than zero"
        })
    })
};


/***/ }),

/***/ 343:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

const { Joi } = __webpack_require__(572);

exports.productRegister = {
    body: Joi.object({
        name: Joi.string().trim().required().messages({
            "any.required": "Name is required",
            "string.empty": "Name cannot be empty"
        }),
        price: Joi.number().positive().required().messages({
            "any.required": "Price is required",
            "number.base": "Price must be a valid number",
            "number.positive": "Price must be greater than zero"
        })
    })
};




/***/ }),

/***/ 391:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const mongoose = __webpack_require__(37);

const url = process.env.MONGO_URL;
console.log('url:- ', url);

const connectDB = async () => {
    try {
        await mongoose.connect(url);
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.log('MongoDB Connection Failed: ', error);
    }
}

module.exports = connectDB;

/***/ }),

/***/ 398:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const mongoose = __webpack_require__(37);
const moment = __webpack_require__(716);

const cartSchema = mongoose.Schema(
    {
        userId: { type: String, required: true },
        items: [
            {
                productId: { type: String, required: true },
                quantity: { type: Number, required: true },
                addedTime: {
                    type: String,
                    default: () => moment().format('YYYY-MM-DD HH:mm:ss')
                }, // Store date and time when item is added
            }
        ]
    },
);

module.exports = mongoose.model('Cart', cartSchema);


/***/ }),

/***/ 414:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

(__webpack_require__(818).config)();
const swaggerJSDoc = __webpack_require__(450);
const swaggerUI = __webpack_require__(320);

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "My_Shop API",
            version: "1.0.0",
            description: "My_Shop is an online shopping platform like Amazon, built with Node.js, Express.js.",
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: "Local Development Server",
            },
        ],
        components: {
            securitySchemes: {
                CookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "authToken",
                    description: "Session authentication using a secure cookie.",
                },
            },
            schemas: {
                Register: {
                    type: "object",
                    properties: {
                        firstName: { type: "string", example: "Aakash" },
                        lastName: { type: "string", example: "Yadav" },
                        email: { type: "string", format: "email", example: "user@gmail.com" },
                        password: { type: "string", example: "12345678" },
                        role: { type: "string", enum: ["user", "merchant"], example: "user" },
                    },
                    required: ["firstName", "lastName", "email", "password"],
                },
                Login: {
                    type: "object",
                    properties: {
                        email: { type: "string", format: "email", example: "user@gmail.com" },
                        password: { type: "string", example: "12345678" },
                    },
                    required: ["email", "password"],
                },
                EditProfile: {
                    type: "object",
                    properties: {
                        firstName: { type: "string", example: "Aakash" },
                        lastName: { type: "string", example: "yadav" },
                        password: { type: "string", example: "12345678" },
                    },
                },
                AddProduct: {
                    type: "object",
                    properties: {
                        name: { type: "string", example:"Laptop"},
                        price: { type: "number", example: "35000" },
                    },
                    required: ["name", "price"],
                },
                AddToCart: {
                    type: "object",
                    properties: {
                        productId: { type: "string", example:"j0w80rw4543t342u3r23"},
                    },
                    required: ["productId"],
                },
                RemoveCart: {
                    type: "object",
                    properties: {
                        productId: { type: "string", example:"hdi8rw98r9uhf4y9u9"},
                    },
                    required: ["productId"],
                },
            }
        },
        security: [{ CookieAuth: [] }],
        paths: {
            "/api/user/register": {
                post: {
                    summary: "Register a new user",
                    tags: ["Auth"],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Register" }
                            }
                        }
                    },
                    responses: {
                        "200": { description: "User registered successfully" },
                        "400": { description: "Bad request" }
                    }
                }
            },
            "/api/user/login": {
                post: {
                    summary: "Login user",
                    tags: ["Auth"],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Login" }
                            }
                        }
                    },
                    responses: {
                        "200": { description: "User logged in successfully" },
                        "400": { description: "Invalid credentials" }
                    }
                }
            },
            "/api/user/updateProfile": {
                put: {
                    summary: "User profile update",
                    tags: ["Auth"],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/EditProfile" }
                            }
                        }
                    },
                    responses: {
                        "200": { description: "Profile updated successfully" },
                        "400": { description: "Bad request" }
                    }
                }
            },
            "/api/product/addProduct": {
                post: {
                    summary: "Add a new product",
                    tags: ["Product"],
                    security: [{ CookieAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/AddProduct" }
                            }
                        }
                    },
                    responses: {
                        "200": { description: "Product added successfully!" },
                        "400": { description: "Error in adding product" }
                    }
                }
            },
            "/api/product/editProduct": {
                post: {
                    summary: "Update Product details",
                    tags: ["Product"],
                    security: [{ CookieAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/AddProduct" }
                            }
                        }
                    },
                    responses: {
                        "200": { description: "Product updated successfully!" },
                        "400": { description: "Error in product updating" }
                    }
                }
            },
            "/api/cart/addCart": {
                post: {
                    summary: "Add to cart",
                    tags: ["Cart"],
                    security: [{ CookieAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/AddToCart" }
                            }
                        }
                    },
                    responses: {
                        "200": { description: "Item added successfully" },
                        "400": { description: "Error in adding to cart" }
                    }
                }
            },
            "/api/cart/removeCart/:productId": {
                delete: {
                    summary: "Remove item from cart",
                    tags: ["Cart"],
                    security: [{ CookieAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/RemoveCart" }
                            }
                        }
                    },
                    responses: {
                        "200": { description: "Item removed from cart" },
                        "400": { description: "Error removing item" }
                    }
                }
            }
        },
    },
    apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec, swaggerUI };


/***/ }),

/***/ 442:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const multer = __webpack_require__(461);
const path = __webpack_require__(928);

function randomString() {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let str = "";
    for (let i = 1; i <= 5; i++) {
        str += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return str;
}

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, res, next) => {
            next(null, 'public/images');
        },
        filename: (req, file, next) => {            
            next(null, file.mimetype.split('/')[0].toLowerCase() + '_' + randomString() + '_' + Date.now() + path.extname(file.originalname).toLowerCase());
        }
    }),
    limits: { fileSize: 104857600 }
})

module.exports = { upload };

/***/ }),

/***/ 450:
/***/ ((module) => {

"use strict";
module.exports = require("swagger-jsdoc");

/***/ }),

/***/ 461:
/***/ ((module) => {

"use strict";
module.exports = require("multer");

/***/ }),

/***/ 486:
/***/ ((module) => {

"use strict";
module.exports = require("bcrypt");

/***/ }),

/***/ 500:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

const { ValidationError } = __webpack_require__(572);

exports.errorHandler = (error, req, res, next) => {
    let status = error.status || 500;
    let message = error.message || "Something went wrong! Please try again later";
    let data = [];

    if (error instanceof ValidationError) {
        status = 400; // bad request
        message = "Validation failed";
        Object.keys(error.details).forEach(key => {
            error.details[key].forEach(item => data.push(item.message));
        });
    }

    return res.status(status).json({ message, data });
};


/***/ }),

/***/ 572:
/***/ ((module) => {

"use strict";
module.exports = require("express-validation");

/***/ }),

/***/ 577:
/***/ ((module) => {

"use strict";
module.exports = require("cors");

/***/ }),

/***/ 612:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const bcrypt = __webpack_require__(486);

// Function to hash a password
async function hashPassword(password) {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        throw new Error('Error hashing password');
    }
}

// Function to compare a password with a hashed password
async function comparePassword(plainPassword, hashedPassword) {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
}

module.exports = { hashPassword, comparePassword };


/***/ }),

/***/ 620:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { Joi } = __webpack_require__(572);

const forgotPasswordValidate = {
    body: Joi.object({
        email: Joi.string().trim().email().required().messages({
            "string.empty": "Email cannot be empty",
            "string.email": "Invalid email format",
            "any.required": "Email is required"
        })
    })
};

module.exports = forgotPasswordValidate;


/***/ }),

/***/ 626:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const jwt = __webpack_require__(829);
const passport = __webpack_require__(278);
const { Strategy: JwtStrategy, ExtractJwt } = __webpack_require__(714);
const User = __webpack_require__(709)

// Secret Key
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

const generateToken = (user, res) => {
	const token = jwt.sign(
		{ id: user._id, role: user.role },
		SECRET_KEY,
		{ expiresIn: "1h" }      // Token expires in 1 hour
	);

	// Set the cookie
	res.cookie("authToken", token, {
		httpOnly: true,     // Prevents client-side JavaScript access
		secure: "production" === "production", // Set secure in production
		sameSite: "strict", // Helps against CSRF attacks
		maxAge: 3600000     // 1 hour expiration in milliseconds
	});

	return token;
};

// authentication 
const options = {
	jwtFromRequest: ExtractJwt.fromExtractors([
		(req) => req?.cookies?.authToken // Extract JWT from cookies
	]),
	secretOrKey: SECRET_KEY
};

passport.use(
	new JwtStrategy(options, async (jwt_payload, done) => {
		try {
			const user = await User.findById(jwt_payload.id);
			if (user) {
				return done(null, user);
			} else {
				return done(null, false);
			}
		} catch (error) {
			return done(error, false);
		}
	})
);


const authorize = (roles = []) => (req, res, next) => {
	passport.authenticate('jwt', { session: false }, async (err, user, info) => {
		if (err) return res.render('404');
		if (!user) return res.status(401).render('401');

		if (!roles.length) {
			req.user = user;
			return next(null);
		} else {
			if (roles.includes(user.role)) {
				req.user = user;

				// req.user.isAdmin = true

				return next(null);
			} else {
				return res.status(403).render('403');
			}
		}
	})(req, res, next);
}

module.exports = { generateToken, authorize };

/***/ }),

/***/ 640:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const express = __webpack_require__(252);
const passport = __webpack_require__(278);
const Product = __webpack_require__(937);

const router = express.Router();

// Middleware Imports
const { upload } = __webpack_require__(442);
const { validate } = __webpack_require__(572);
const  {authorize}  = __webpack_require__(626);
const { productRegister } = __webpack_require__(343);
const { productEdit } = __webpack_require__(322);

// Controller Imports
const productController = __webpack_require__(287);

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
router.put('/editProduct/:productId', upload.single("image"), authorize(["merchant"]), validate(productEdit), productController.editProduct);

router.delete('/deleteProduct/:productId', authorize(['merchant'], productController.deleteProduct));

module.exports = router;


/***/ }),

/***/ 672:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { Joi } = __webpack_require__(572);

const updateProfileValidate = {
    body: Joi.object({
        firstName: Joi.string().trim().min(3).optional().allow("").messages({
            "string.empty": "First name cannot be empty",
            "string.min": "First name must be at least 3 characters long"
        }),
        lastName: Joi.string().trim().min(3).optional().allow("").messages({
            "string.empty": "Last name cannot be empty",
            "string.min": "Last name must be at least 3 characters long"
        }),
        password: Joi.string().min(8).max(20).optional().allow("").messages({
            "string.empty": "Password cannot be empty",
            "string.min": "Password must be at least 8 characters long",
            "string.max": "Password cannot exceed 20 characters"
        })
    })
};

module.exports = updateProfileValidate;


/***/ }),

/***/ 692:
/***/ ((module) => {

"use strict";
module.exports = require("method-override");

/***/ }),

/***/ 709:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const mongoose = __webpack_require__(37);
const { encrypt } = __webpack_require__(160)
const { hashPassword } = __webpack_require__(612);

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: '' }, 
    role: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },

    // Add OTP fields
    otp: { type: String, default: null }
}, { timestamps: true });

// Pre -save hook:  Encrypt the email and hash the password before save the database
userSchema.pre('save', async function (next) {
    if (this.isModified('email')) {
        this.email = encrypt(this.email);
    }

    if (this.isModified('password')) {
        this.password = await hashPassword(this.password);
    }

    if (this.profileImage) {
        console.log(this.profileImage);
        
        const filename = this.profileImage.split('images').pop(); 
        console.log(filename);
        
        this.profileImage = `${filename}`;
        console.log(this.profileImage);
  }

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;

/***/ }),

/***/ 714:
/***/ ((module) => {

"use strict";
module.exports = require("passport-jwt");

/***/ }),

/***/ 716:
/***/ ((module) => {

"use strict";
module.exports = require("moment");

/***/ }),

/***/ 751:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { Joi } = __webpack_require__(572);

module.exports = {
    body: Joi.object({
        email: Joi.string().trim().email().pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/).required().messages({
                "any.required": "Email is required",
                "string.empty": "Email cannot be empty",
                "string.email": "Please enter a valid email address",
                "string.pattern.base": "Email must end with .com or .in"
            }),
        password: Joi.string().min(8).max(20).required().messages({
                "any.required": "Password is required",
                "string.empty": "Password cannot be empty",
                "string.min": "Password must be at least 8 characters long",
                "string.max": "Password cannot exceed 20 characters"
            })
    })
};


/***/ }),

/***/ 793:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

const { Joi } = __webpack_require__(572);

exports.addCartValidatinon = {
    body: Joi.object({
        productId: Joi.string().required().messages({
            "string.base": "Product ID must be a string",
            "string.empty": "Product ID is required",
            "any.required": "Product ID is required",
        })
    })
}

/***/ }),

/***/ 818:
/***/ ((module) => {

"use strict";
module.exports = require("dotenv");

/***/ }),

/***/ 829:
/***/ ((module) => {

"use strict";
module.exports = require("jsonwebtoken");

/***/ }),

/***/ 845:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const express = __webpack_require__(252);
const router = express.Router();
const multer = __webpack_require__(461); // Import multer
const upload = multer();

// Medileware
const { authorize } = __webpack_require__(626);
const {validate} = __webpack_require__(572)

// Controller
const cartController = __webpack_require__(268);
const { addCartValidatinon } = __webpack_require__(793);

// Add to Cart
router.post('/addCart', authorize(['user']) ,upload.none(), validate(addCartValidatinon),cartController.addCart);

// View Carts
router.get('/viewCart', authorize(["user"]), cartController.viewCart);

// Remove Cart
router.delete('/removeCart/:productId', authorize(["user"]), cartController.removeCart);

module.exports = router;

/***/ }),

/***/ 894:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const router = (__webpack_require__(252).Router)();

// import route files
const authRoutes = __webpack_require__(173);
const productRoutes = __webpack_require__(640);
const cartRoutes = __webpack_require__(845);

// Use Routes
router.use('/user', authRoutes);
router.use('/product', productRoutes);
router.use('/cart', cartRoutes);

module.exports = router;

/***/ }),

/***/ 896:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 898:
/***/ ((module) => {

"use strict";
module.exports = require("cookie-parser");

/***/ }),

/***/ 928:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 937:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const mongoose = __webpack_require__(37);

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true
        },
        image: {
            type: String,
            default: ""
        },
        createdBy: {
            type: String,
            required: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },{ timestamps: true }); 

// Pre-save hook to modify the image path
ProductSchema.pre("save", function (next) {
    if (this.image) {
        const filename = this.image.split('images').pop(); 
        this.image = `${filename}`; 
    }
    next();
});

module.exports  = mongoose.model("Product", ProductSchema);


/***/ }),

/***/ 982:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 989:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { Joi } = __webpack_require__(572);

const authValidate = {
    body: Joi.object({
        firstName: Joi.string().trim().min(3).max(20).required().messages({
            "any.required": "First name is required",
            "string.empty": "First name cannot be empty",
            "string.min": "First name must be at least 2 characters long",
            "string.max": "First name cannot exceed 20 characters"
        }),
        lastName: Joi.string().trim().min(3).max(20).required().messages({
            "any.required": "Last name is required",
            "string.empty": "Last name cannot be empty",
            "string.min": "Last name must be at least 2 characters long",
            "string.max": "Last name cannot exceed 20 characters"
        }),
        email: Joi.string().trim().email().required().messages({
            "any.required": "Email is required",
            "string.empty": "Email cannot be empty",
            "string.email": "Please enter a valid email address"
        }),
        password: Joi.string().trim().min(8).max(20).required().messages({
            "any.required": "Password is required",
            "string.empty": "Password cannot be empty",
            "string.min": "Password must be at least 8 characters long",
            "string.max": "Password cannot exceed 20 characters"
        }),
        role: Joi.string().valid("user", "merchant").required().messages({
            "any.required": "Role is required",
            "any.only": "Invalid role. Role must be either 'user' or 'merchant'."
        })
    })
};

module.exports = authValidate;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
(__webpack_require__(818).config)();
const express = __webpack_require__(252);
const passport = __webpack_require__(278);
const path = __webpack_require__(928);
const connectDB = __webpack_require__(391);
const cookieParser = __webpack_require__(898);
const methodOverride = __webpack_require__(692);
const { swaggerSpec, swaggerUI } = __webpack_require__(414);
const morgan = __webpack_require__(96);
const cors = __webpack_require__(577);

const fs = __webpack_require__(896);

const routes = __webpack_require__(894);
const Product = __webpack_require__(937);
const User = __webpack_require__(709);
const { errorHandler } = __webpack_require__(500);

const app = express();

// ================== Logging Setup ==================
const logDirectory = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(path.join(logDirectory, "app.log"), { flags: "a" });

// Log detailed info into file
app.use(morgan("combined", { stream: accessLogStream }));

// Log short colored output into console
app.use(morgan("dev"));
// ===================================================


// Static files
app.use(cors({ origin: "*" }));
app.use(express.static(path.join(process.cwd(), 'public/images')));

// Middleware
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static('public/images'));

// Connect to MongoDB
connectDB();

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Use Routes
app.get('/home', (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
        if (err) return next(err); // Handle errors properly
        req.user = user;
        next();
    })(req, res, next);
},
    async (req, res) => {
        try {
            let products = await Product.find();
            products = products.map(product => {
                product.image = product.image;
                return product;
            });


            let user;
            if (req.user) {
                user = await User.findOne({ _id: req.user.id });
                user.profileImage = user.profileImage

            }

            res.render('index', { user: user, products });
        } catch (error) {
            console.error("Error loading home page:", error.message);
            res.status(500).send("Something went wrong");
        }
    });


app.use('/api', routes);

// 404 Page Not Found
app.use((req, res, next) => {
    res.status(404).render('404');
});

// Handle validation Error
app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`server listen on http://localhost:${port}`);
});
/******/ })()
;