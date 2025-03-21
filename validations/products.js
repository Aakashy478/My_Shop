const { Joi } = require('express-validation');

exports.productRegister = {
    body: Joi.object({
        name: Joi.string().trim().required().messages({
            "any.required": "Name is required",
            "string.empty": "Name cannot be empty"
        }),
        price: Joi.number().positive().required().messages({
            "any.required": "Price is required",
            "number.base": "Price must be a valid number",
            "number.positive": "Price must be greater than zero"
        })
    })
};


