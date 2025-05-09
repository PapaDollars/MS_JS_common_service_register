
// service-register/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const schedule = require('node-schedule');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8761;

// Middleware
app.use(cors());
app.use(express.json());

// Stockage des services enregistrés
const registeredServices = {};

// Route pour l'enregistrement d'un service
app.post('/register', (req, res) => {
  const { name, host, port, healthCheckUrl } = req.body;
  
  if (!name || !host || !port) {
    return res.status(400).json({ error: 'Nom, hôte et port sont requis' });
  }
  
  const serviceId = uuidv4();
  const serviceUrl = `http://${host}:${port}`;
  
  registeredServices[serviceId] = {
    id: serviceId,
    name,
    url: serviceUrl,
    healthCheckUrl: healthCheckUrl || `${serviceUrl}/health`,
    status: 'UP',
    lastHeartbeat: Date.now()
  };
  
  console.log(`Service enregistré: ${name} (${serviceUrl})`);
  res.status(201).json({ id: serviceId, message: 'Service enregistré avec succès' });
});

// Route pour la désinscription d'un service
app.delete('/unregister/:serviceId', (req, res) => {
  const { serviceId } = req.params;
  
  if (registeredServices[serviceId]) {
    const serviceName = registeredServices[serviceId].name;
    delete registeredServices[serviceId];
    console.log(`Service désinscrit: ${serviceName}`);
    res.json({ message: 'Service désinscrit avec succès' });
  } else {
    res.status(404).json({ error: 'Service non trouvé' });
  }
});

// Route pour la mise à jour du statut d'un service (heartbeat)
app.put('/heartbeat/:serviceId', (req, res) => {
  const { serviceId } = req.params;
  
  if (registeredServices[serviceId]) {
    registeredServices[serviceId].lastHeartbeat = Date.now();
    registeredServices[serviceId].status = 'UP';
    res.json({ message: 'Heartbeat reçu' });
  } else {
    res.status(404).json({ error: 'Service non trouvé' });
  }
});

// Route pour obtenir tous les services enregistrés
app.get('/services', (req, res) => {
  res.json(Object.values(registeredServices));
});

// Route pour obtenir toutes les instances d'un service par nom
app.get('/services/:name', (req, res) => {
  const { name } = req.params;
  const instances = Object.values(registeredServices).filter(service => service.name === name);
  
  if (instances.length > 0) {
    res.json(instances);
  } else {
    res.status(404).json({ error: `Aucune instance trouvée pour le service ${name}` });
  }
});

// Vérification périodique de l'état des services
schedule.scheduleJob('*/30 * * * * *', async () => {
  console.log('Vérification de l\'état des services...');
  const now = Date.now();
  const timeout = 60000; // 60 secondes
  
  for (const serviceId in registeredServices) {
    const service = registeredServices[serviceId];
    
    // Vérifier le temps écoulé depuis le dernier heartbeat
    if (now - service.lastHeartbeat > timeout) {
      service.status = 'DOWN';
      console.log(`Service ${service.name} marqué comme DOWN (timeout de heartbeat)`);
      continue;
    }
    
    // Vérifier l'état du service via son endpoint de santé
    try {
      const response = await axios.get(service.healthCheckUrl, { timeout: 5000 });
      if (response.status === 200) {
        service.status = 'UP';
      } else {
        service.status = 'DOWN';
        console.log(`Service ${service.name} marqué comme DOWN (réponse non-200)`);
      }
    } catch (error) {
      service.status = 'DOWN';
      console.log(`Service ${service.name} marqué comme DOWN (erreur: ${error.message})`);
    }
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Service de découverte démarré sur le port ${PORT}`);
});

