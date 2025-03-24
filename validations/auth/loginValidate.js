const { Joi } = require("express-validation");

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
