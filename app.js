require('dotenv').config(); // Load enviroment variables
const express = require('express');
const passport = require('passport')
const path = require('path');
const connectDB = require('./config/db')
const cookieParser = require("cookie-parser");
const methodOverride = require('method-override');

// Import routes
const routes = require('./routes/index.Route');
const { ValidationError } = require('express-validation');
const Product = require('./models/productModel');
const User = require('./models/userModel');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middleware
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
                product.image = product.image.replace('public/images/', '/');
                return product;
            })

            let user;
            if (req.user) {
                user = await User.findOne({ _id: req.user.id });
                user.profileImage = user.profileImage.replace('public/images/', '/')
            }
            
            res.render('index', { user:user, products });
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

const port = process.env.PORT || 8081;
app.listen(port, () => {
    console.log(`server listen on http://localhost:${port}`);
});