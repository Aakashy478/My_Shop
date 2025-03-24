const { Joi } = require("express-validation");

const forgotPasswordValidate = {
    body: Joi.object({
        email: Joi.string().trim().email().required().messages({
            "string.empty": "Email cannot be empty",
            "string.email": "Invalid email format",
            "any.required": "Email is required"
        })
    })
};

module.exports = forgotPasswordValidate;
