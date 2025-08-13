require('dotenv').config();
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const options = {
    definition: {  // ✅ Fixed typo (was "defination")
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
                        firstName: { type: "string" ,example:'Ram'},
                        lastName: { type: "string",example:'Ganwani' },
                        email: { type: "string", format: "email" ,example:'ram@gmail.com'},
                        password: { type: "string" ,example:"Ram@1234"},
                        role: { type: "string", enum: ["user", "merchant"] ,example:'user'}
                    },
                    required: ["firstName", "lastName", "email", "password"],
                },
                Login: {
                    type: "object",
                    properties: {
                        email: { type: "string", format: "email" },
                        password: { type: "string" },
                    },
                    required: ["email", "password"],
                },
                Profile: {
                    type: "object",
                    properties: {
                        firstName: { type: "string" },
                        lastName: { type: "string" },
                        email: { type: "string", format: "email" },
                        profileImage: { type: "string" },
                        role: { type: "string", enum: ["user", "merchant"] }
                    },
                },
                EditProfile: {
                    type: "object",
                    properties: {
                        firstName: { type: "string" },
                        lastName: { type: "string" },
                        password: { type: "string" },
                        profileImage: { type: "string" }
                    },
                },
                Product: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        price: { type: "number" },
                        image: { type: "string" },
                    },
                    required: ["name", "price"],
                },
                Cart: {
                    type: "object",
                    properties: {
                        productId: { type: "string" },
                        quantity: { type: "integer", minimum: 1 },
                    },
                    required: ["productId", "quantity"],
                },
            }
        },
        security: [{ CookieAuth: [] }],
        paths: {  // ✅ Fixed typo (was "path")
            "/api/user/register": {
                post: {
                    summary: "Register a new user",
                    tags: ["Auth"],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {  // ✅ Fixed typo (was "application/josn")
                                schema: { $ref: "#/components/schemas/Register" } // ✅ Fixed reference
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
                            "application/json": {  // ✅ Fixed typo (was "application/josn")
                                schema: { $ref: "#/components/schemas/Login" } // ✅ Fixed reference
                            }
                        }
                    },
                    responses: {
                        "200": { description: "User logged in successfully" },
                        "400": { description: "Invalid credentials" }
                    }
                }
            },
            "/api/user/profile": {  // ✅ Changed duplicate login endpoint to profile retrieval
                get: {
                    summary: "Get user profile",
                    tags: ["User"],
                    security: [{ CookieAuth: [] }],
                    responses: {
                        "200": { description: "User profile retrieved" },
                        "400": { description: "Error fetching profile" }
                    }
                }
            },
            "/api/product/viewProducts": {
                get: {
                    summary: "View all products",
                    tags: ["Products"],
                    responses: {
                        "200": { description: "List of products" },
                        "400": { description: "Error fetching products" }
                    }
                }
            },
            "/home": {
                get: {
                    summary: "Show all products on the home page",
                    tags: ["Products"],
                    responses: {
                        "200": { description: "List of products displayed on home page" },
                        "400": { description: "Error fetching products" }
                    }
                }
            },
            "/api/cart/viewCart": {
                get: {
                    summary: "View user cart",
                    tags: ["Cart"],
                    responses: {
                        "200": { description: "Cart details retrieved" },
                        "400": { description: "Error fetching cart" }
                    }
                },
            },
            "/api/cart/removeCart": {
                delete: {
                    summary: "Remove item from cart",
                    tags: ["Cart"],
                    security: [{ CookieAuth: [] }],
                    responses: {
                        "200": { description: "Item removed from cart" },
                        "400": { description: "Error removing item" }
                    }
                }
            }
        }
    },
    apis: ["./routes/*.js"]
}

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec, swaggerUI }
