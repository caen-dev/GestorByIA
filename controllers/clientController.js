const Client = require('../models/Client');

exports.getClients = async (req, res) => {
    try {
        const clients = await Client.find({ userId: req.params.userId });
        res.json(clients);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.addClient = async (req, res) => {
    const { name, phone, street, number } = req.body;
    try {
        const client = new Client({ userId: req.params.userId, name, phone, street, number });
        await client.save();
        res.status(201).json(client);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.addTransaction = async (req, res) => {
    const { type, amount, paymentMethod } = req.body;
    try {
        const client = await Client.findOne({ userId: req.params.userId, name: req.params.clientName });
        client.transactions.push({ type, amount, paymentMethod });
        client.balance += type === 'purchase' ? amount : -amount;
        await client.save();
        res.json(client);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};