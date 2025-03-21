
const { Joi } = require("express-validation");

const updateProfileValidate = {
    body: Joi.object({
        firstName: Joi.string().trim().min(2).optional().messages({
            "string.empty": "First name cannot be empty",
            "string.min": "First name must be at least 2 characters long"
        }),
        lastName: Joi.string().trim().min(2).optional().messages({
            "string.empty": "Last name cannot be empty",
            "string.min": "Last name must be at least 2 characters long"
        }),
        password: Joi.string().min(8).max(20).optional().messages({
            "string.min": "Password must be at least 8 characters long",
            "string.max": "Password cannot exceed 20 characters"
        })
    })
};

module.exports = updateProfileValidate;
