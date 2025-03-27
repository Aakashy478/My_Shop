const { Joi } = require("express-validation");

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
