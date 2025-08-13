const { Joi } = require('express-validation');

exports.addCartValidatinon = {
    body: Joi.object({
        productId: Joi.string().required().messages({
            "string.base": "Product ID must be a string",
            "string.empty": "Product ID is required",
            "any.required": "Product ID is required",
        })
    })
}