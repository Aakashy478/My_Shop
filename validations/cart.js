const Joi = require("joi");

exports.cartValidation = {
    body: Joi.object({
        productId: Joi.string().trim().required().messages({
            "any.required": "Product ID is required",
            "string.empty": "Product ID cannot be empty",
        })
    })
};