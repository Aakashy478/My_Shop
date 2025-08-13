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
            default: ""
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
    },{ timestamps: true }); 

// Pre-save hook to modify the image path
ProductSchema.pre("save", function (next) {
    if (this.image) {
        const filename = this.image.split('images').pop(); 
        this.image = `${filename}`; 
    }
    next();
});

module.exports  = mongoose.model("Product", ProductSchema);
