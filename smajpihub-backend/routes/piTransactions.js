const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const piController = require('../controllers/piTransactionController');

router.post('/pi/transactions', auth, piController.createTransaction);
router.get('/pi/transactions', auth, piController.listTransactions);
router.delete('/pi/transactions', auth, piController.clearTransactions);

module.exports = router;
