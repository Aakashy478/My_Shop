const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        createdBy: {
            type: String,
            required: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },{ timestamps: true }); // Enables createdAt & updatedAt auto-update


module.exports  = mongoose.model("Product", ProductSchema);
