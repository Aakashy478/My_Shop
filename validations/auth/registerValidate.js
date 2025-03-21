// const { Joi } = require("express-validation");
// const { errorMessages } = require("../../utility/errorMessages");

// exports.validateRegister = {
//     body: Joi.object({
//         firstName: Joi.string().trim().min(2).max(20).messages(errorMessages("First Name", 2, 20)),
//         lastName: Joi.string().trim().min(2).max(20).messages(errorMessages("Last Name", 2, 20)),
//         email: Joi.string().trim().email().required().messages(errorMessages("Email")),
//         password: Joi.string().trim().min(8).max(20).required().messages(errorMessages("Password", 8, 20)),
//     }),
// };





const { Joi } = require("express-validation");

const authValidate = {
    body: Joi.object({
        firstName: Joi.string().trim().required().messages({
            "any.required": "First name is required",
            "string.empty": "First name cannot be empty"
        }),
        lastName: Joi.string().trim().required().messages({
            "any.required": "Last name is required",
            "string.empty": "Last name cannot be empty"
        }),
        email: Joi.string().trim().email().required().messages({
            "any.required": "Email is required",
            "string.empty": "Email cannot be empty",
            "string.email": "Please enter a valid email address"
        }),
        password: Joi.string().min(8).max(20).required().messages({
            "any.required": "Password is required",
            "string.empty": "Password cannot be empty",
            "string.min": "Password must be at least 8 characters long",
            "string.max": "Password cannot exceed 20 characters"
        }),
        role: Joi.string().valid("user", "merchant").required().messages({
            "any.required": "Role is required",
            "any.only": "Role must be either 'user' or 'merchant'"
        })
    })
};

module.exports = authValidate;