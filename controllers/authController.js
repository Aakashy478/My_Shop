const User = require('../models/userModel');
const { generateToken } = require('../middlewares/authentication')
const { comparePassword } = require('../utility/password');
const { encrypt, decrypt } = require('../utility/encrypt');


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

        console.log('Saved OTP:- ', user.otp);

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
        console.log("Reset password successfully");

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