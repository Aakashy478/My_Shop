const { Joi } = require("express-validation");

const resetPasswordValidate = {
    body: Joi.object({
        email: Joi.string().trim().email().required().messages({
            "string.empty": "Email cannot be empty",
            "string.email": "Invalid email format",
            "any.required": "Email is required"
        }),

        otp: Joi.string().trim().length(4).required().messages({
            "string.empty": "OTP cannot be empty",
            "string.length": "OTP must be 4 digits",
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
