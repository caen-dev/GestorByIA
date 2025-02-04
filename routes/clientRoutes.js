const express = require('express');
const { getClients, addClient, addTransaction } = require('../controllers/clientController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:userId', authMiddleware, getClients);
router.post('/:userId', authMiddleware, addClient);
router.post('/:userId/:clientName/transactions', authMiddleware, addTransaction);

module.exports = router;