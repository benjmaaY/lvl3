var mongoose = require('mongoose');

var orderSchema = mongoose.Schema({
    fName: {
        type: String,
        required: true,
    },
    lName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    address: {
        type: String,
        required: true
    },
    address2: {
        type: String
    },
    number: {
        type: Number,
        required: true
    },
    submit: {
        type: Date,
        default: Date.now
    },
    payment: {
        type: String,
        required: true
    },
    order: {
        type: Object
    },
    notes: {
        type: String
    },
    order_id: {
        type: String,
        required: true
    }
});

var Order = module.exports = mongoose.model('Order', orderSchema);
