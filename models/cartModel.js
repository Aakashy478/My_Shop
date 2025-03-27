const mongoose = require('mongoose');
const moment = require('moment');

const cartSchema = mongoose.Schema(
    {
        userId: { type: String, required: true },
        items: [
            {
                productId: { type: String, required: true },
                quantity: { type: Number, required: true },
                addedTime: {
                    type: String,
                    default: () => moment().format('YYYY-MM-DD HH:mm:ss')
                }, // Store date and time when item is added
            }
        ]
    },
);

module.exports = mongoose.model('Cart', cartSchema);
