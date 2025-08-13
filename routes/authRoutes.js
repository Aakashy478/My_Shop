const express = require('express');
const router = express.Router();
const User = require('../models/userModel');

// Middlewares
const { upload } = require('../middlewares/uploadImage');
const  {authorize}  = require('../middlewares/authentication');
const { validate } = require('express-validation');

// Controllers
const authController = require('../controllers/authController');

// Validations
const authValidation = require('../validations/auth/registerValidate');
const loginValidate = require('../validations/auth/loginValidate');
const updateProfileValidate = require('../validations/auth/updateProfileValidate');
const forgotPasswordValidate = require('../validations/auth/forgotPassword');
const resetPasswordValidate = require('../validations/auth/resetPassword');

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
