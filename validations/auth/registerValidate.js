const { Joi } = require("express-validation");

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
