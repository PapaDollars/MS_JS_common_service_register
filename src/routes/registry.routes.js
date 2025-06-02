const express = require('express');
const router = express.Router();

// Route de santé
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

// Route pour obtenir la liste des services enregistrés
router.get('/', (req, res) => {
    res.status(200).json({
        service: 'registry-service',
        version: '1.0.0',
        status: 'UP'
    });
});

module.exports = router;
