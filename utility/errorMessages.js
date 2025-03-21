exports.errorMessages = (field, min = null, max = null) => {
    return {
        "any.required": `${field} is required.`,
        "string.empty": `${field} cannot be empty.`,
        "string.min": `${field} must be at least ${min} characters long`,
        "string.max": `${field} must be under ${max} characters long`,
    };
};
