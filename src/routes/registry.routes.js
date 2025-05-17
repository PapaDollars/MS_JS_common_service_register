const express = require('express');
const registryController = require('../controllers/registry.controller');

const router = express.Router();

// Enregistrer un service
router.post('/apps', registryController.registerService);

// Désenregistrer un service
router.delete('/apps/:name/:instanceId', registryController.deregisterService);

// Heartbeat
router.put('/apps/:name/:instanceId/heartbeat', registryController.heartbeat);

// Mettre à jour le statut
router.put('/apps/:name/:instanceId/status', registryController.updateStatus);

// Obtenir tous les services
router.get('/apps', registryController.getAllServices);

// Obtenir les instances d'un service
router.get('/apps/:name', registryController.getServiceInstances);

module.exports = router;