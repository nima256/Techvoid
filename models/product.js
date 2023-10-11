const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['sofa', 'desk', 'lamp']
    },
    img: {
        type: String
    },
});

const model = mongoose.model('Product', productSchema);

module.exports = model;