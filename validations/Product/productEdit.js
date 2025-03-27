const { Joi } = require('express-validation');

exports.productEdit = {
    body: Joi.object({
        name: Joi.string().trim().optional().allow("").messages({
            "string.empty": "Name cannot be empty"
        }),
        price: Joi.number().positive().optional().allow("").messages({
            "number.base": "Price must be a valid number",
            "number.positive": "Price must be greater than zero"
        })
    })
};
