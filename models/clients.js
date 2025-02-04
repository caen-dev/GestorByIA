const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

const clientSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    phone: { type: String },
    street: { type: String },
    number: { type: String },
    balance: { type: Number, default: 0 },
    transactions: [transactionSchema],
});

module.exports = mongoose.model('Client', clientSchema);