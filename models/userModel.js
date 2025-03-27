const mongoose = require('mongoose');
const { encrypt } = require('../utility/encrypt')
const { hashPassword } = require('../utility/password');

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
}, { timestamps: true }); // ✅ Enables createdAt & updatedAt auto-update

// Pre -save hook:  Encrypt the email and hash the password before save the database
userSchema.pre('save', async function (next) {
    if (this.isModified('email')) {
        this.email = encrypt(this.email);
    }

    if (this.isModified('password')) {
        this.password = await hashPassword(this.password);
    }

    if (this.profileImage) {
    const filename = this.profileImage.split('/').pop(); 
    this.profileImage = `/${filename}`;
  }

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;