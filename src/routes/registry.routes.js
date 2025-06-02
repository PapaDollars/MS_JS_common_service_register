const express = require('express');
const router = express.Router();

// Stockage en mémoire des services enregistrés
const services = new Map();

// Route de santé
router.get('/health', (req, res) => {
    res.json({ status: 'UP' });
});

// Route pour obtenir la liste des services enregistrés
router.get('/', (req, res) => {
    res.status(200).json({
        service: 'registry-service',
        version: '1.0.0',
        status: 'UP'
    });
});

// Route pour enregistrer un service
router.post('/register', (req, res) => {
    const { name, host, port, healthUrl } = req.body;
    
    if (!name || !host || !port || !healthUrl) {
        return res.status(400).json({
            message: 'Tous les champs sont requis (name, host, port, healthUrl)'
        });
    }
    
    const serviceId = `${name}-${Date.now()}`;
    const service = {
        id: serviceId,
        name,
        host,
        port,
        healthUrl,
        status: 'UP',
        lastHeartbeat: new Date(),
        registeredAt: new Date()
    };
    
    services.set(serviceId, service);
    
    console.log(`Service enregistré: ${name} (${host}:${port})`);
    
    res.status(201).json({
        message: 'Service enregistré avec succès',
        service
    });
});

// Route pour désenregistrer un service
router.delete('/deregister/:name/:instanceId', (req, res) => {
    const { name, instanceId } = req.params;
    const serviceId = `${name}-${instanceId}`;
    
    if (services.has(serviceId)) {
        services.delete(serviceId);
        console.log(`Service désenregistré: ${name}`);
        res.json({ message: 'Service désenregistré avec succès' });
    } else {
        res.status(404).json({ message: 'Service non trouvé' });
    }
});

// Route pour le heartbeat
router.put('/heartbeat/:name/:instanceId', (req, res) => {
    const { name, instanceId } = req.params;
    const serviceId = `${name}-${instanceId}`;
    
    if (services.has(serviceId)) {
        const service = services.get(serviceId);
        service.lastHeartbeat = new Date();
        service.status = 'UP';
        services.set(serviceId, service);
        res.json({ message: 'Heartbeat reçu' });
    } else {
        res.status(404).json({ message: 'Service non trouvé' });
    }
});

// Route pour obtenir toutes les instances d'un service
router.get('/instances/:serviceName', (req, res) => {
    const { serviceName } = req.params;
    const instances = Array.from(services.values())
        .filter(service => service.name === serviceName);
    
    res.json({ instances });
});

// Route pour obtenir tous les services
router.get('/instances', (req, res) => {
    const instances = Array.from(services.values());
    res.json({ instances });
});

module.exports = router;
