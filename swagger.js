require('dotenv').config();
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "My_Shop API",
            version: "1.0.0",
            description: "My_Shop is an online shopping platform like Amazon, built with Node.js, Express.js.",
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: "Local Development Server",
            },
        ],
        components: {
            securitySchemes: {
                CookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "authToken",
                    description: "Session authentication using a secure cookie.",
                },
            },
            schemas: {
                Register: {
                    type: "object",
                    properties: {
                        firstName: { type: "string", example: "Aakash" },
                        lastName: { type: "string", example: "Yadav" },
                        email: { type: "string", format: "email", example: "user@gmail.com" },
                        password: { type: "string", example: "12345678" },
                        role: { type: "string", enum: ["user", "merchant"], example: "user" },
                    },
                    required: ["firstName", "lastName", "email", "password"],
                },
                Login: {
                    type: "object",
                    properties: {
                        email: { type: "string", format: "email", example: "user@gmail.com" },
                        password: { type: "string", example: "12345678" },
                    },
                    required: ["email", "password"],
                },
                EditProfile: {
                    type: "object",
                    properties: {
                        firstName: { type: "string", example: "Aakash" },
                        lastName: { type: "string", example: "yadav" },
                        password: { type: "string", example: "12345678" },
                    },
                },
                AddProduct: {
                    type: "object",
                    properties: {
                        name: { type: "string", example:"Laptop"},
                        price: { type: "number", example: "35000" },
                    },
                    required: ["name", "price"],
                },
                AddToCart: {
                    type: "object",
                    properties: {
                        productId: { type: "string", example:"j0w80rw4543t342u3r23"},
                    },
                    required: ["productId"],
                },
                RemoveCart: {
                    type: "object",
                    properties: {
                        productId: { type: "string", example:"hdi8rw98r9uhf4y9u9"},
                    },
                    required: ["productId"],
                },
            }
        },
        security: [{ CookieAuth: [] }],
        paths: {
            "/api/user/register": {
                post: {
                    summary: "Register a new user",
                    tags: ["Auth"],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Register" }
                            }
                        }
                    },
                    responses: {
                        "200": { description: "User registered successfully" },
                        "400": { description: "Bad request" }
                    }
                }
            },
            "/api/user/login": {
                post: {
                    summary: "Login user",
                    tags: ["Auth"],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Login" }
                            }
                        }
                    },
                    responses: {
                        "200": { description: "User logged in successfully" },
                        "400": { description: "Invalid credentials" }
                    }
                }
            },
            "/api/user/updateProfile": {
                put: {
                    summary: "User profile update",
                    tags: ["Auth"],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/EditProfile" }
                            }
                        }
                    },
                    responses: {
                        "200": { description: "Profile updated successfully" },
                        "400": { description: "Bad request" }
                    }
                }
            },
            "/api/product/addProduct": {
                post: {
                    summary: "Add a new product",
                    tags: ["Product"],
                    security: [{ CookieAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/AddProduct" }
                            }
                        }
                    },
                    responses: {
                        "200": { description: "Product added successfully!" },
                        "400": { description: "Error in adding product" }
                    }
                }
            },
            "/api/product/editProduct": {
                post: {
                    summary: "Update Product details",
                    tags: ["Product"],
                    security: [{ CookieAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/AddProduct" }
                            }
                        }
                    },
                    responses: {
                        "200": { description: "Product updated successfully!" },
                        "400": { description: "Error in product updating" }
                    }
                }
            },
            "/api/cart/addCart": {
                post: {
                    summary: "Add to cart",
                    tags: ["Cart"],
                    security: [{ CookieAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/AddToCart" }
                            }
                        }
                    },
                    responses: {
                        "200": { description: "Item added successfully" },
                        "400": { description: "Error in adding to cart" }
                    }
                }
            },
            "/api/cart/removeCart/:productId": {
                delete: {
                    summary: "Remove item from cart",
                    tags: ["Cart"],
                    security: [{ CookieAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/RemoveCart" }
                            }
                        }
                    },
                    responses: {
                        "200": { description: "Item removed from cart" },
                        "400": { description: "Error removing item" }
                    }
                }
            }
        },
    },
    apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec, swaggerUI };
