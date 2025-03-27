const { ValidationError } = require('express-validation');
exports.errorHandler = (error, req, res, next) => {
    let status = 500;
    let message = "Something went wrong! Please try again later";
    let data = [];
    if (error instanceof ValidationError) {
        message = "Validation failed";
        Object.keys(error.details).map(key => { error.details[key].map(item => data.push(item.message)) });
    }

    return res.status(status).json({ message, data })
}