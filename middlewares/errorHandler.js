const { ValidationError } = require('express-validation');

exports.errorHandler = (error, req, res, next) => {
    let status = error.status || 500;
    let message = error.message || "Something went wrong! Please try again later";
    let data = [];

    if (error instanceof ValidationError) {
        status = 400; // bad request
        message = "Validation failed";
        Object.keys(error.details).forEach(key => {
            error.details[key].forEach(item => data.push(item.message));
        });
    }

    return res.status(status).json({ message, data });
};
