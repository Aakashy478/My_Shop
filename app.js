require('dotenv').config();
const express = require('express');
const passport = require('passport');
const path = require('path');
const connectDB = require('./config/db');
const cookieParser = require("cookie-parser");
const methodOverride = require('method-override');
const { swaggerSpec, swaggerUI } = require("./swagger");
const morgan = require("morgan");
const cors = require("cors");

const fs = require("fs");

const routes = require('./routes/index.Route');
const Product = require('./models/productModel');
const User = require('./models/userModel');
const { errorHandler } = require('./middlewares/errorHandler');

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